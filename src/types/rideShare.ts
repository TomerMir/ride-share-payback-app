
// Types for the ride share application
export type User = {
  id: string;
  name: string;
  pricePerKm?: number; // Driver-specific price per km
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

export type SettingsType = {
  pricePerKm: number;
  defaultDistance: number;
};

export const defaultSettings: SettingsType = {
  pricePerKm: 1.0, // Default price per km in shekels
  defaultDistance: 30.0, // Default ride distance in km
};

export type RideShareContextType = {
  users: User[];
  rides: Ride[];
  historicRides: Ride[];
  sortedRides: Ride[];
  sortedHistoricRides: Ride[];
  settings: SettingsType;
  currentUser: User | null;
  debts: Debt[];
  rawDebts: Debt[];
  addUser: (name: string) => void;
  addRide: (driverId: string, passengers: string[], distance: number) => void;
  updateCurrentUser: (userId: string) => void;
  setPricePerKm: (price: number) => void;
  setDefaultDistance: (distance: number) => void;
  setDriverPricePerKm: (userId: string, price: number) => void;
  calculateDebts: () => void;
  settleDebts: () => void;
  unsettleRide: (rideId: string) => void;
};
