
import React from 'react';
import { RideShareProvider } from '@/context/RideShareContext';
import UserRegistration from '@/components/UserRegistration';
import GasSettings from '@/components/GasSettings';
import RideForm from '@/components/RideForm';
import RideHistory from '@/components/RideHistory';
import PaybackCalculator from '@/components/PaybackCalculator';
import ThemeToggle from '@/components/ThemeToggle';

const Index = () => {
  return (
    <RideShareProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-ride-blue text-white py-4 px-6 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Same Hour Tomorrow</h1>
              <p className="text-sm opacity-80">Track rides and split costs fairly</p>
            </div>
            <ThemeToggle />
          </div>
        </header>
        
        <main className="container mx-auto py-8 px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="md:col-span-2 lg:col-span-3">
              <UserRegistration />
            </div>
            
            <div>
              <div className="grid gap-8">
                <GasSettings />
                <RideForm />
              </div>
            </div>
            
            <div>
              <RideHistory />
            </div>
            
            <div>
              <PaybackCalculator />
            </div>
          </div>
        </main>
        
        <footer className="bg-gray-100 border-t py-6 mt-8 dark:bg-gray-800 dark:border-gray-700">
          <div className="container mx-auto text-center text-gray-500 dark:text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Same Hour Tomorrow | Made with love
          </div>
        </footer>
      </div>
    </RideShareProvider>
  );
};

export default Index;
