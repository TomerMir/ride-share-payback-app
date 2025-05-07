
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRideShare } from '@/context/RideShareContext';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const RideHistory = () => {
  const { sortedRides, users } = useRideShare();
  
  // Get user name by ID
  const getUserName = (id: string): string => {
    const user = users.find(u => u.id === id);
    return user ? user.name : 'Unknown';
  };
  
  if (sortedRides.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-ride-blue">Recent Rides</CardTitle>
          <CardDescription>No rides recorded yet</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          Add a ride to get started
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-ride-blue">Recent Rides</CardTitle>
        <CardDescription>
          {sortedRides.length} {sortedRides.length === 1 ? 'ride' : 'rides'} recorded
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RideHistory;
