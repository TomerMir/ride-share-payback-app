
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRideShare } from '@/context/RideShareContext';
import { Ride, User } from '@/types/rideShare';
import { format } from 'date-fns';
import { Button } from './ui/button';

const RideHistory = () => {
  const { rides, users, settings } = useRideShare();
  const [showAllRides, setShowAllRides] = useState(false);
  
  // Sort rides by date (newest first)
  const sortedRides = [...rides].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Limit visible rides
  const visibleRides = showAllRides ? sortedRides : sortedRides.slice(0, 5);
  const hasMoreRides = sortedRides.length > 5;

  // Get user name by ID
  const getUserName = (id: string): string => {
    const user = users.find(u => u.id === id);
    return user ? user.name : 'Unknown';
  };

  // Calculate the total cost of a ride
  const calculateRideCost = (ride: Ride): number => {
    const driverUser = users.find(u => u.id === ride.driverId);
    const pricePerKm = driverUser?.pricePerKm ?? settings.pricePerKm;
    return ride.distance * pricePerKm;
  };

  // Calculate cost per person for a ride
  const costPerPerson = (ride: Ride): number => {
    const totalPeople = ride.passengers.length + 1; // +1 for driver
    return calculateRideCost(ride) / totalPeople;
  };

  if (rides.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-ride-blue">Ride History</CardTitle>
          <CardDescription>No rides recorded yet</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          Start logging rides to see them here
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-ride-blue">Ride History</CardTitle>
        <CardDescription>
          {rides.length} {rides.length === 1 ? 'ride' : 'rides'} recorded
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {visibleRides.map((ride) => (
            <Card key={ride.id} className="overflow-hidden">
              <div className="p-4 bg-muted/50">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Driver: {getUserName(ride.driverId)}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(ride.date), 'PP')} at {format(new Date(ride.date), 'p')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{ride.distance} km</p>
                    <p className="text-sm text-muted-foreground">
                      {calculateRideCost(ride).toFixed(2)} ₪ total
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm mb-2">
                  {ride.passengers.length} {ride.passengers.length === 1 ? 'passenger' : 'passengers'}
                </p>
                <div className="flex flex-wrap gap-1">
                  {ride.passengers.map((passengerId) => (
                    <span 
                      key={passengerId}
                      className="inline-flex bg-gray-100 px-2 py-1 rounded-md text-xs"
                    >
                      {getUserName(passengerId)}
                      <span className="text-muted-foreground ml-1">
                        ({costPerPerson(ride).toFixed(2)} ₪)
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
          
          {hasMoreRides && (
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => setShowAllRides(!showAllRides)}
            >
              {showAllRides ? "Show Less" : "Show More"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RideHistory;
