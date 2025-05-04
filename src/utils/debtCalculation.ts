
import { Debt, User } from "../types/rideShare";

// Calculate raw debts (direct debts from rides)
export const calculateRawDebts = (
  rides: {
    driverId: string;
    passengers: string[];
    distance: number;
  }[],
  defaultPricePerKm: number,
  users: User[]
): Debt[] => {
  const rawDebts: Debt[] = [];
  
  // Calculate debts from rides
  rides.forEach(ride => {
    const driver = ride.driverId;
    // Use driver specific price if available, otherwise use default
    const driverUser = users.find(user => user.id === driver);
    const pricePerKm = driverUser?.pricePerKm !== undefined 
      ? driverUser.pricePerKm 
      : defaultPricePerKm;
    
    const totalCost = ride.distance * pricePerKm;
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
export const simplifyDebts = (rawDebts: Debt[], users: User[]): Debt[] => {
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
