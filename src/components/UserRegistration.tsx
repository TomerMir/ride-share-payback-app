
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRideShare } from '@/context/RideShareContext';
import { UserIcon, UserMinus } from 'lucide-react';

const UserRegistration = () => {
  const { users, addUser, deleteUser, currentUser, updateCurrentUser } = useRideShare();
  const [name, setName] = useState('');

  const handleAddUser = () => {
    if (name.trim()) {
      addUser(name);
      setName('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddUser();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-ride-blue flex items-center gap-2">
          <UserIcon className="h-6 w-6" />
          Add New Friend
        </CardTitle>
        <CardDescription>
          Add your friends to the ride group
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button 
            onClick={handleAddUser}
            className="bg-ride-green hover:bg-green-600"
          >
            Add
          </Button>
        </div>

        {users.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Friends in this group:</h3>
            <div className="flex flex-wrap gap-2">
              {users.map((user) => (
                <div key={user.id} className="flex items-center gap-1">
                  <Button
                    variant={currentUser?.id === user.id ? "default" : "outline"}
                    className={`
                      ${currentUser?.id === user.id ? 'bg-ride-blue hover:bg-ride-darkBlue' : ''}
                    `}
                    onClick={() => updateCurrentUser(user.id)}
                  >
                    {user.name}
                  </Button>
                  <Button 
                    variant="outline"
                    size="icon" 
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => deleteUser(user.id)}
                    title="Remove user"
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      {users.length > 0 && currentUser && (
        <CardFooter className="border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Current user: <span className="font-medium text-foreground">{currentUser.name}</span>
          </p>
        </CardFooter>
      )}
    </Card>
  );
};

export default UserRegistration;
