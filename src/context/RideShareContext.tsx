
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
};

type RideShareContextType = {
  users: User[];
  rides: Ride[];
  settings: SettingsType;
  currentUser: User | null;
  debts: Debt[];
  addUser: (name: string) => void;
  addRide: (driverId: string, passengers: string[], distance: number) => void;
  setCurrentUser: (userId: string) => void;
  setPricePerKm: (price: number) => void;
  calculateDebts: () => void;
  settleDebts: () => void;
};

const defaultSettings: SettingsType = {
  pricePerKm: 1.0, // Default price per km in shekels
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

  const setCurrentUser = (userId: string) => {
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

  // Calculate raw debts before optimization
  const calculateRawDebts = (): Debt[] => {
    const debts: Record<string, Record<string, number>> = {};
    
    // Initialize debt tracking
    users.forEach(fromUser => {
      debts[fromUser.id] = {};
      users.forEach(toUser => {
        if (fromUser.id !== toUser.id) {
          debts[fromUser.id][toUser.id] = 0;
        }
      });
    });
    
    // Calculate debts from rides
    rides.forEach(ride => {
      const driver = ride.driverId;
      const totalCost = ride.distance * settings.pricePerKm;
      const peopleInRide = ride.passengers.length + 1; // +1 for the driver
      const costPerPerson = totalCost / peopleInRide;
      
      // Each passenger owes the driver
      ride.passengers.forEach(passengerId => {
        debts[passengerId][driver] = (debts[passengerId][driver] || 0) + costPerPerson;
      });
    });
    
    // Convert to array format
    const debtArray: Debt[] = [];
    
    Object.entries(debts).forEach(([fromUserId, toUsers]) => {
      Object.entries(toUsers).forEach(([toUserId, amount]) => {
        if (amount > 0) {
          debtArray.push({
            fromUserId,
            toUserId,
            amount: parseFloat(amount.toFixed(2)), // Round to 2 decimal places
          });
        }
      });
    });
    
    return debtArray;
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
      .map(([id, balance]) => ({ id, balance: Math.abs(balance) }))
      .sort((a, b) => b.balance - a.balance);
      
    const creditors = Object.entries(netBalances)
      .filter(([_, balance]) => balance > 0)
      .map(([id, balance]) => ({ id, balance }))
      .sort((a, b) => b.balance - a.balance);
    
    const optimizedDebts: Debt[] = [];
    
    // Match debtors with creditors to create simplified transactions
    let debtorIndex = 0;
    let creditorIndex = 0;
    
    while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
      const debtor = debtors[debtorIndex];
      const creditor = creditors[creditorIndex];
      
      const amount = Math.min(debtor.balance, creditor.balance);
      
      if (amount > 0) {
        optimizedDebts.push({
          fromUserId: debtor.id,
          toUserId: creditor.id,
          amount: parseFloat(amount.toFixed(2)),
        });
      }
      
      debtor.balance -= amount;
      creditor.balance -= amount;
      
      if (debtor.balance < 0.01) debtorIndex++;
      if (creditor.balance < 0.01) creditorIndex++;
    }
    
    return optimizedDebts;
  };

  const calculateDebts = () => {
    const rawDebts = calculateRawDebts();
    const optimizedDebts = simplifyDebts(rawDebts);
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
        addUser,
        addRide,
        setCurrentUser,
        setPricePerKm,
        calculateDebts,
        settleDebts,
      }}
    >
      {children}
    </RideShareContext.Provider>
  );
};
