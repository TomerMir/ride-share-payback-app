
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRideShare } from '@/context/RideShareContext';
import { DollarSign, Route } from 'lucide-react';

const GasSettings = () => {
  const { settings, setPricePerKm, setDefaultDistance } = useRideShare();
  
  // Ensure we have default values if settings properties are undefined
  const defaultPricePerKm = settings?.pricePerKm || 1.0;
  const defaultDistance = settings?.defaultDistance || 30.0;
  
  const [priceInput, setPriceInput] = useState(defaultPricePerKm.toString());
  const [distanceInput, setDistanceInput] = useState(defaultDistance.toString());

  const handleSavePrice = () => {
    const price = parseFloat(priceInput);
    if (!isNaN(price) && price > 0) {
      setPricePerKm(price);
    }
  };

  const handleSaveDistance = () => {
    const distance = parseFloat(distanceInput);
    if (!isNaN(distance) && distance > 0) {
      setDefaultDistance(distance);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, saveFunction: () => void) => {
    if (e.key === 'Enter') {
      saveFunction();
    }
  };

  return (
    <Card className="w-full dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-ride-blue dark:text-blue-400 flex items-center gap-2">
          <DollarSign className="h-6 w-6" />
          Settings
        </CardTitle>
        <CardDescription className="dark:text-gray-400">
          Set gas price and default ride distance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-2 dark:text-gray-300">Gas Price Settings</h3>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Price per km"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, handleSavePrice)}
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            <span className="text-md whitespace-nowrap dark:text-gray-300">₪/km</span>
            <Button 
              onClick={handleSavePrice}
              className="bg-ride-blue hover:bg-ride-darkBlue"
            >
              Save
            </Button>
          </div>
          <div className="mt-2 text-sm text-muted-foreground dark:text-gray-400">
            Current price: <span className="font-medium text-foreground dark:text-gray-300">{defaultPricePerKm.toFixed(2)} ₪/km</span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center gap-1 dark:text-gray-300">
            <Route className="h-4 w-4" />
            Default Distance
          </h3>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0.1"
              step="0.1"
              placeholder="Default distance"
              value={distanceInput}
              onChange={(e) => setDistanceInput(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, handleSaveDistance)}
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            <span className="text-md whitespace-nowrap dark:text-gray-300">km</span>
            <Button 
              onClick={handleSaveDistance}
              className="bg-ride-green hover:bg-green-600"
            >
              Save
            </Button>
          </div>
          <div className="mt-2 text-sm text-muted-foreground dark:text-gray-400">
            Current default: <span className="font-medium text-foreground dark:text-gray-300">{defaultDistance.toFixed(1)} km</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GasSettings;
