import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

// Types
export type User = {
  id: string;
  name: string;
};

export type Ride = {
  id: string;
  driverId: string;
  passengers: string[];
  distance: number;
  date: string;
};

export type Debt = {
  fromUserId: string;
  toUserId: string;
  amount: number;
};

type SettingsType = {
  pricePerKm: number;
  defaultDistance: number;
};

type RideShareContextType = {
  users: User[];
  rides: Ride[];
  settings: SettingsType;
  currentUser: User | null;
  debts: Debt[];
  rawDebts: Debt[];
  addUser: (name: string) => void;
  deleteUser: (userId: string) => void;
  addRide: (driverId: string, passengers: string[], distance: number) => void;
  updateCurrentUser: (userId: string) => void;
  setPricePerKm: (price: number) => void;
  setDefaultDistance: (distance: number) => void;
  calculateDebts: () => void;
  settleDebts: () => void;
};

const defaultSettings: SettingsType = {
  pricePerKm: 1.0, // Default price per km in shekels
  defaultDistance: 10.0, // Default ride distance in km
};

const RideShareContext = createContext<RideShareContextType | undefined>(undefined);

export const useRideShare = () => {
  const context = useContext(RideShareContext);
  if (!context) {
    throw new Error('useRideShare must be used within a RideShareProvider');
  }
  return context;
};

export const RideShareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const savedUsers = localStorage.getItem('rideShareUsers');
    return savedUsers ? JSON.parse(savedUsers) : [];
  });
  
  const [rides, setRides] = useState<Ride[]>(() => {
    const savedRides = localStorage.getItem('rideShareRides');
    return savedRides ? JSON.parse(savedRides) : [];
  });
  
  const [settings, setSettings] = useState<SettingsType>(() => {
    const savedSettings = localStorage.getItem('rideShareSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });
  
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedCurrentUser = localStorage.getItem('rideShareCurrentUser');
    return savedCurrentUser ? JSON.parse(savedCurrentUser) : null;
  });

  const [debts, setDebts] = useState<Debt[]>([]);
  const [rawDebts, setRawDebts] = useState<Debt[]>([]);

  // Save to localStorage whenever states change
  useEffect(() => {
    localStorage.setItem('rideShareUsers', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('rideShareRides', JSON.stringify(rides));
  }, [rides]);

  useEffect(() => {
    localStorage.setItem('rideShareSettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('rideShareCurrentUser', JSON.stringify(currentUser));
    }
  }, [currentUser]);

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

  // Renamed from setCurrentUser to updateCurrentUser to avoid conflict
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

  // Calculate raw debts (direct debts from rides)
  const calculateRawDebts = (): Debt[] => {
    const rawDebts: Debt[] = [];
    
    // Calculate debts from rides
    rides.forEach(ride => {
      const driver = ride.driverId;
      const totalCost = ride.distance * settings.pricePerKm;
      const peopleInRide = ride.passengers.length + 1; // +1 for the driver
      const costPerPerson = totalCost / peopleInRide;
      
      // Each passenger owes the driver
      ride.passengers.forEach(passengerId => {
        rawDebts.push({
          fromUserId: passengerId,
          toUserId: driver,
          amount: parseFloat(costPerPerson.toFixed(2)), // Round to 2 decimal places
        });
      });
    });
    
    return rawDebts;
  };

  // Simplify the debts to minimize transactions
  const simplifyDebts = (rawDebts: Debt[]): Debt[] => {
    // Create a net balance for each user
    const netBalances: Record<string, number> = {};
    
    // Initialize all balances to 0
    users.forEach(user => {
      netBalances[user.id] = 0;
    });
    
    // Calculate net balance for each user
    rawDebts.forEach(debt => {
      netBalances[debt.fromUserId] -= debt.amount;
      netBalances[debt.toUserId] += debt.amount;
    });
    
    // Separate users who owe money (negative balance) and users who are owed money (positive balance)
    const debtors = Object.entries(netBalances)
      .filter(([_, balance]) => balance < 0)
      .map(([id, balance]) => ({ id, balance: Math.abs(balance) }));
      
    const creditors = Object.entries(netBalances)
      .filter(([_, balance]) => balance > 0)
      .map(([id, balance]) => ({ id, balance }));
    
    const optimizedDebts: Debt[] = [];
    
    // For each debtor
    for (const debtor of debtors) {
      let remainingDebt = parseFloat(debtor.balance.toFixed(2));
      
      // Match with creditors until this debtor's debt is fully allocated
      for (let i = 0; i < creditors.length && remainingDebt > 0; i++) {
        const creditor = creditors[i];
        if (creditor.balance <= 0) continue;
        
        const paymentAmount = Math.min(remainingDebt, creditor.balance);
        
        if (paymentAmount > 0) {
          optimizedDebts.push({
            fromUserId: debtor.id,
            toUserId: creditor.id,
            amount: parseFloat(paymentAmount.toFixed(2)),
          });
          
          creditor.balance = parseFloat((creditor.balance - paymentAmount).toFixed(2));
          remainingDebt = parseFloat((remainingDebt - paymentAmount).toFixed(2));
        }
      }
    }
    
    return optimizedDebts;
  };

  const calculateDebts = () => {
    const calculatedRawDebts = calculateRawDebts();
    setRawDebts(calculatedRawDebts);
    
    const optimizedDebts = simplifyDebts(calculatedRawDebts);
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
