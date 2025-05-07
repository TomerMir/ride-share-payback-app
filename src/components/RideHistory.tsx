
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRideShare } from '@/context/RideShareContext';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Car, Clock, Navigation, User } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const RideHistory = () => {
  const { sortedRides, users } = useRideShare();
  
  // Get user name by ID
  const getUserName = (id: string): string => {
    const user = users.find(u => u.id === id);
    return user ? user.name : 'Unknown';
  };
  
  if (sortedRides.length === 0) {
    return (
      <Card className="w-full shadow-md border border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold text-ride-blue flex items-center gap-2">
            <Car className="h-5 w-5" />
            Recent Rides
          </CardTitle>
          <CardDescription>No rides recorded yet</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          Add a ride to get started
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full shadow-md border border-border/40 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold text-ride-blue flex items-center gap-2">
          <Car className="h-5 w-5" />
          Recent Rides
        </CardTitle>
        <CardDescription>
          {sortedRides.length} {sortedRides.length === 1 ? 'ride' : 'rides'} recorded
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="p-0">
        <div className="overflow-auto max-h-96">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="font-medium text-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-ride-blue" />
                    Date & Time
                  </div>
                </TableHead>
                <TableHead className="font-medium text-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-ride-green" />
                    Driver
                  </div>
                </TableHead>
                <TableHead className="font-medium text-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-ride-blue" />
                    Passengers
                  </div>
                </TableHead>
                <TableHead className="text-right font-medium text-foreground">
                  <div className="flex items-center justify-end gap-2">
                    <Navigation className="h-4 w-4 text-ride-darkBlue" />
                    Distance
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRides.map((ride, index) => (
                <TableRow 
                  key={ride.id}
                  className={index % 2 === 0 ? 'bg-background' : 'bg-muted/10 hover:bg-muted/20'}
                >
                  <TableCell className="font-medium">
                    {format(new Date(ride.date), 'PP')} 
                    <span className="text-muted-foreground ml-1">
                      at {format(new Date(ride.date), 'p')}
                    </span>
                  </TableCell>
                  <TableCell>{getUserName(ride.driverId)}</TableCell>
                  <TableCell>
                    {ride.passengers.length > 0 
                      ? ride.passengers.map(id => getUserName(id)).join(', ')
                      : <span className="text-muted-foreground italic">No passengers</span>
                    }
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {ride.distance} <span className="text-xs font-normal text-muted-foreground">km</span>
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

export default RideHistory;
