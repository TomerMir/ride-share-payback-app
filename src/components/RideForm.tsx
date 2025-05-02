
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useRideShare } from '@/context/RideShareContext';
import { toast } from 'sonner';
import { Users } from 'lucide-react';

const RideForm = () => {
  const { users, settings, addRide } = useRideShare();
  const [driverId, setDriverId] = useState('');
  const [distance, setDistance] = useState('');
  const [selectedPassengers, setSelectedPassengers] = useState<string[]>([]);

  // Set default distance when driver is selected or default distance changes
  useEffect(() => {
    if (driverId) {
      setDistance(settings.defaultDistance.toString());
    }
  }, [driverId, settings.defaultDistance]);

  const handleAddRide = () => {
    if (!driverId) {
      toast.error('Please select a driver');
      return;
    }

    if (selectedPassengers.length === 0) {
      toast.error('Please select at least one passenger');
      return;
    }

    const parsedDistance = parseFloat(distance);
    if (isNaN(parsedDistance) || parsedDistance <= 0) {
      toast.error('Please enter a valid distance');
      return;
    }

    addRide(driverId, selectedPassengers, parsedDistance);
    
    // Reset form
    setDistance(settings.defaultDistance.toString());
    setSelectedPassengers([]);
  };

  const togglePassenger = (userId: string) => {
    setSelectedPassengers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const filteredPassengers = users.filter(user => user.id !== driverId);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-ride-blue flex items-center gap-2">
          <Users className="h-6 w-6" />
          Log a Ride
        </CardTitle>
        <CardDescription>
          Record a new ride with your friends
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="driver">Driver</Label>
            <Select 
              onValueChange={setDriverId} 
              value={driverId}
            >
              <SelectTrigger id="driver">
                <SelectValue placeholder="Select a driver" />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {driverId && (
            <>
              <div>
                <Label htmlFor="distance">Distance (km)</Label>
                <Input
                  id="distance"
                  type="number"
                  min="0.1"
                  step="0.1"
                  placeholder="Enter distance in kilometers"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                />
              </div>

              <div>
                <Label className="mb-2 block">Passengers</Label>
                {filteredPassengers.length > 0 ? (
                  <div className="space-y-2">
                    {filteredPassengers.map(user => (
                      <div key={user.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`passenger-${user.id}`}
                          checked={selectedPassengers.includes(user.id)}
                          onCheckedChange={() => togglePassenger(user.id)}
                        />
                        <Label htmlFor={`passenger-${user.id}`}>{user.name}</Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No other users available as passengers</p>
                )}
              </div>

              <Button 
                onClick={handleAddRide} 
                className="w-full bg-ride-green hover:bg-green-600"
              >
                Add Ride
              </Button>
            </>
          )}

          {!driverId && users.length === 0 && (
            <p className="text-center text-muted-foreground">Add users to start logging rides</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RideForm;
