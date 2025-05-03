
import React, { createContext, useContext, useState } from 'react';
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
  const [users, setUsers] = useLocalStorage<User[]>('rideShareUsers', []);
  const [rides, setRides] = useLocalStorage<Ride[]>('rideShareRides', []);
  const [settings, setSettings] = useLocalStorage<SettingsType>('rideShareSettings', defaultSettings);
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('rideShareCurrentUser', null);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [rawDebts, setRawDebts] = useState<Debt[]>([]);

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

  const deleteUser = (userId: string) => {
    // Check if user exists
    const userToDelete = users.find(user => user.id === userId);
    if (!userToDelete) {
      toast.error('User not found');
      return;
    }

    // Update current user if it's the one being deleted
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(users.length > 1 ? users.find(user => user.id !== userId) || null : null);
    }

    // Remove user from users list
    setUsers(prev => prev.filter(user => user.id !== userId));
    
    // Remove rides where the user was the driver
    setRides(prev => prev.filter(ride => ride.driverId !== userId));
    
    // Remove user from passengers in existing rides
    setRides(prev => prev.map(ride => ({
      ...ride,
      passengers: ride.passengers.filter(passengerId => passengerId !== userId)
    })));
    
    // Remove any debts associated with this user
    setDebts(prev => prev.filter(debt => 
      debt.fromUserId !== userId && debt.toUserId !== userId
    ));

    toast.success(`${userToDelete.name} has been removed from the group`);
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
    const calculatedRawDebts = calculateRawDebts(rides, settings.pricePerKm);
    setRawDebts(calculatedRawDebts);
    
    const optimizedDebts = simplifyDebts(calculatedRawDebts, users);
    setDebts(optimizedDebts);
  };

  const settleDebts = () => {
    if (debts.length === 0) {
      toast.error('No debts to settle');
      return;
    }
    
    // Clear rides after settlement
    setRides([]);
    setDebts([]);
    setRawDebts([]);
    toast.success('All debts have been settled!');
  };

  return (
    <RideShareContext.Provider
      value={{
        users,
        rides,
        settings,
        currentUser,
        debts,
        rawDebts,
        addUser,
        deleteUser,
        addRide,
        updateCurrentUser,
        setPricePerKm,
        setDefaultDistance,
        calculateDebts,
        settleDebts,
      }}
    >
      {children}
    </RideShareContext.Provider>
  );
};
