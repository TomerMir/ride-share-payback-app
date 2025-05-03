
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRideShare } from '@/context/RideShareContext';
import { Wallet } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PaybackCalculator = () => {
  const { users, rides, debts, calculateDebts, settleDebts, rawDebts } = useRideShare();
  const [showRawDebts, setShowRawDebts] = useState(false);

  const getUserName = (id: string): string => {
    const user = users.find(u => u.id === id);
    return user ? user.name : 'Unknown';
  };

  const handleCalculateDebts = () => {
    calculateDebts();
  };

  const handleSettleDebts = () => {
    settleDebts();
  };

  const toggleDebtView = () => {
    setShowRawDebts(!showRawDebts);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-ride-blue flex items-center gap-2">
          <Wallet className="h-6 w-6" />
          Payback Day
        </CardTitle>
        <CardDescription>
          Calculate and settle debts between friends
        </CardDescription>
      </CardHeader>

      <CardContent>
        {rides.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No rides to calculate. Log some rides first!
          </div>
        ) : debts.length === 0 ? (
          <div className="text-center py-4">
            <p className="mb-4 text-muted-foreground">
              {rides.length} {rides.length === 1 ? 'ride' : 'rides'} ready to be calculated
            </p>
            <Button 
              onClick={handleCalculateDebts} 
              className="bg-ride-blue hover:bg-ride-darkBlue"
            >
              Calculate Debts
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Payment Summary:</h3>
                {rawDebts && rawDebts.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={toggleDebtView} 
                    className="text-xs"
                  >
                    {showRawDebts ? "Show Simplified" : "Show Raw Debts"}
                  </Button>
                )}
              </div>

              {showRawDebts && rawDebts && rawDebts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead className="text-right">Amount (₪)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rawDebts.map((debt, index) => (
                      <TableRow key={`raw-${index}`}>
                        <TableCell>{getUserName(debt.fromUserId)}</TableCell>
                        <TableCell>{getUserName(debt.toUserId)}</TableCell>
                        <TableCell className="text-right font-medium text-ride-green">
                          {debt.amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : debts.length > 0 ? (
                <div className="space-y-2">
                  {debts.map((debt, index) => (
                    <div key={index} className="bg-muted/30 rounded-md p-3 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{getUserName(debt.fromUserId)}</span>
                        <span className="text-muted-foreground">pays</span>
                        <span className="font-medium">{getUserName(debt.toUserId)}</span>
                      </div>
                      <div className="font-medium text-ride-green">
                        {debt.amount.toFixed(2)} ₪
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">No debts to settle</p>
              )}
            </div>
            
            <div className="text-center pt-2">
              <Button 
                onClick={handleSettleDebts}
                className="bg-ride-green hover:bg-green-600"
              >
                Settle All Debts
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {debts.length > 0 && (
        <CardFooter className="border-t pt-4 text-sm text-muted-foreground">
          <p>
            After settling, all ride history will be cleared and debts will be reset.
          </p>
        </CardFooter>
      )}
    </Card>
  );
};

export default PaybackCalculator;
