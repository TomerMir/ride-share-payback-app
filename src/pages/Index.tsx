
import React from 'react';
import { RideShareProvider } from '@/context/RideShareContext';
import UserRegistration from '@/components/UserRegistration';
import GasSettings from '@/components/GasSettings';
import RideForm from '@/components/RideForm';
import RideHistory from '@/components/RideHistory';
import PaybackCalculator from '@/components/PaybackCalculator';
import AllRidesHistory from '@/components/AllRidesHistory';

const Index = () => {
  return (
    <RideShareProvider>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-ride-blue text-white py-4 px-6 shadow-md">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold">Same Hour Tomorrow</h1>
            <p className="text-sm opacity-80">Track rides and split costs fairly</p>
          </div>
        </header>
        
        <main className="container mx-auto py-8 px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Log a Ride */}
            <div>
              <div className="grid gap-8">
                <RideForm />
              </div>
            </div>
            
            {/* Ride History */}
            <div>
              <RideHistory />
            </div>
            
            {/* Payback Day */}
            <div>
              <PaybackCalculator />
            </div>
            
            {/* Settings */}
            <div>
              <GasSettings />
            </div>
            
            {/* Add New Friend */}
            <div>
              <UserRegistration />
            </div>
            
            {/* All Rides History */}
            <div className="md:col-span-2 lg:col-span-3">
              <AllRidesHistory />
            </div>
          </div>
        </main>
        
        <footer className="bg-gray-100 border-t py-6 mt-8">
          <div className="container mx-auto text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Same Hour Tomorrow | Made with love
          </div>
        </footer>
      </div>
    </RideShareProvider>
  );
};

export default Index;
