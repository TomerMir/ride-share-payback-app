
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRideShare } from '@/context/RideShareContext';
import { DollarSign } from 'lucide-react';

const GasSettings = () => {
  const { settings, setPricePerKm } = useRideShare();
  const [priceInput, setPriceInput] = useState(settings.pricePerKm.toString());

  const handleSavePrice = () => {
    const price = parseFloat(priceInput);
    if (!isNaN(price) && price > 0) {
      setPricePerKm(price);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSavePrice();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-ride-blue flex items-center gap-2">
          <DollarSign className="h-6 w-6" />
          Gas Price Settings
        </CardTitle>
        <CardDescription>
          Set the current gas price per kilometer
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Price per km"
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <span className="text-md whitespace-nowrap">₪/km</span>
          <Button 
            onClick={handleSavePrice}
            className="bg-ride-blue hover:bg-ride-darkBlue"
          >
            Save
          </Button>
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground">
          Current price: <span className="font-medium text-foreground">{settings.pricePerKm.toFixed(2)} ₪/km</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default GasSettings;
