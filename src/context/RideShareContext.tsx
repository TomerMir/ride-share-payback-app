import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  User, 
  Ride, 
  Debt, 
  SettingsType, 
  defaultSettings,
  RideShareContextType 
} from '../types/rideShare';
import { calculateRawDebts, simplifyDebts } from '../utils/debtCalculation';
import { useServerStorage } from '../hooks/useServerStorage';
import { useLocalStorage } from '../hooks/useLocalStorage';

const RideShareContext = createContext<RideShareContextType | undefined>(undefined);

export const useRideShare = () => {
  const context = useContext(RideShareContext);
  if (!context) {
    throw new Error('useRideShare must be used within a RideShareProvider');
  }
  return context;
};

export const RideShareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use server storage for shared state
  const [users, setUsers] = useServerStorage<User[]>('users', []);
  const [rides, setRides] = useServerStorage<Ride[]>('rides', []);
  const [historicRides, setHistoricRides] = useServerStorage<Ride[]>('historicRides', []);
  const [settings, setSettings] = useServerStorage<SettingsType>('settings', defaultSettings);
  
  // Keep current user in local storage (this is user-specific)
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('rideShareCurrentUser', null);
  
  const [debts, setDebts] = useState<Debt[]>([]);
  const [rawDebts, setRawDebts] = useState<Debt[]>([]);

  // Effect to ensure current user is valid based on available users
  useEffect(() => {
    if (currentUser && users.length > 0) {
      const userExists = users.some(user => user.id === currentUser.id);
      if (!userExists && users.length > 0) {
        setCurrentUser(users[0]);
      }
    } else if (!currentUser && users.length > 0) {
      setCurrentUser(users[0]);
    }
  }, [users, currentUser]);

  // Function to sort rides by date, newest first
  const sortRidesByDate = (ridesToSort: Ride[]) => {
    return [...ridesToSort].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  // Get sorted rides
  const getSortedRides = () => {
    return sortRidesByDate(rides);
  };

  // Get sorted historic rides
  const getSortedHistoricRides = () => {
    return sortRidesByDate(historicRides);
  };

  const addUser = (name: string) => {
    if (!name.trim()) {
      toast.error('Please enter a valid name');
      return;
    }
    
    const newUser: User = {
      id: crypto.randomUUID(),
      name,
    };
    
    setUsers(prev => [...prev, newUser]);
    
    // If this is the first user, set as current user
    if (users.length === 0) {
      setCurrentUser(newUser);
    }
    
    toast.success(`${name} joined the ride group!`);
  };

  const updateCurrentUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const setPricePerKm = (price: number) => {
    if (price <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }
    
    setSettings(prev => ({
      ...prev,
      pricePerKm: price,
    }));
    
    toast.success(`Gas price updated to ${price.toFixed(2)} ₪/km`);
  };

  const setDriverPricePerKm = (userId: string, price: number) => {
    if (price <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }

    const user = users.find(u => u.id === userId);
    if (!user) {
      toast.error('User not found');
      return;
    }

    setUsers(prev => 
      prev.map(u => 
        u.id === userId 
          ? { ...u, pricePerKm: price } 
          : u
      )
    );
    
    // Update current user if it's the one being modified
    if (currentUser && currentUser.id === userId) {
      setCurrentUser({ ...currentUser, pricePerKm: price });
    }
    
    toast.success(`${user.name}'s gas price updated to ${price.toFixed(2)} ₪/km`);
  };

  const setDefaultDistance = (distance: number) => {
    if (distance <= 0) {
      toast.error('Default distance must be greater than 0');
      return;
    }
    
    setSettings(prev => ({
      ...prev,
      defaultDistance: distance,
    }));
    
    toast.success(`Default ride distance set to ${distance.toFixed(1)} km`);
  };

  const addRide = (driverId: string, passengers: string[], distance: number) => {
    if (!driverId) {
      toast.error('Please select a driver');
      return;
    }
    
    if (passengers.length === 0) {
      toast.error('Please select at least one passenger');
      return;
    }
    
    if (distance <= 0) {
      toast.error('Distance must be greater than 0');
      return;
    }
    
    const newRide: Ride = {
      id: crypto.randomUUID(),
      driverId,
      passengers,
      distance,
      date: new Date().toISOString(),
    };
    
    setRides(prev => [...prev, newRide]);
    toast.success('Ride added successfully!');
  };

  const calculateDebts = () => {
    const calculatedRawDebts = calculateRawDebts(rides, settings.pricePerKm, users);
    setRawDebts(calculatedRawDebts);
    
    const optimizedDebts = simplifyDebts(calculatedRawDebts, users);
    setDebts(optimizedDebts);
  };

  const settleDebts = () => {
    if (debts.length === 0) {
      toast.error('No debts to settle');
      return;
    }
    
    // Move current rides to historic rides
    setHistoricRides(prev => [...prev, ...rides]);
    
    // Clear current rides after settlement
    setRides([]);
    setDebts([]);
    setRawDebts([]);
    toast.success('All debts have been settled!');
  };

  // New function to move a ride from historic rides back to active rides
  const unsettleRide = (rideId: string) => {
    // Find the ride in historic rides
    const rideToUnsettle = historicRides.find(ride => ride.id === rideId);
    
    if (!rideToUnsettle) {
      toast.error('Ride not found');
      return;
    }
    
    // Add to active rides
    setRides(prevRides => [...prevRides, rideToUnsettle]);
    
    // Remove from historic rides
    setHistoricRides(prevHistoric => 
      prevHistoric.filter(ride => ride.id !== rideId)
    );
    
    toast.success('Ride moved back to active rides');
    
    // Reset debts calculation
    setDebts([]);
    setRawDebts([]);
  };

  return (
    <RideShareContext.Provider
      value={{
        users,
        rides,
        historicRides,
        settings,
        currentUser,
        debts,
        rawDebts,
        sortedRides: getSortedRides(),
        sortedHistoricRides: getSortedHistoricRides(),
        addUser,
        addRide,
        updateCurrentUser,
        setPricePerKm,
        setDefaultDistance,
        setDriverPricePerKm,
        calculateDebts,
        settleDebts,
        unsettleRide,
      }}
    >
      {children}
    </RideShareContext.Provider>
  );
};
