
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRideShare } from '@/context/RideShareContext';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const AllRidesHistory = () => {
  const { historicRides, users, unsettleRide } = useRideShare();

  // Get user name by ID
  const getUserName = (id: string): string => {
    const user = users.find(u => u.id === id);
    return user ? user.name : 'Unknown';
  };

  const handleUnsettleRide = (rideId: string) => {
    unsettleRide(rideId);
  };

  // Sort rides by date, newest first
  const sortedRides = [...historicRides].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (historicRides.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-ride-blue">All Rides History</CardTitle>
          <CardDescription>No historic rides available</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          Settled rides will appear here
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-ride-blue">All Rides History</CardTitle>
        <CardDescription>
          {historicRides.length} {historicRides.length === 1 ? 'ride' : 'rides'} settled
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Passengers</TableHead>
                <TableHead className="text-right">Distance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRides.map((ride) => (
                <TableRow key={ride.id}>
                  <TableCell className="font-medium">
                    {format(new Date(ride.date), 'PP')} at {format(new Date(ride.date), 'p')}
                  </TableCell>
                  <TableCell>{getUserName(ride.driverId)}</TableCell>
                  <TableCell>
                    {ride.passengers.map(id => getUserName(id)).join(', ')}
                  </TableCell>
                  <TableCell className="text-right">{ride.distance} km</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleUnsettleRide(ride.id)}
                      title="Move back to active rides"
                    >
                      <ArrowLeft size={16} className="mr-1" /> Unsettle
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AllRidesHistory;
