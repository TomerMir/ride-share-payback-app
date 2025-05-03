
import { useState, useEffect } from 'react';
import axios from 'axios';

// API URL - make configurable for different environments
const API_URL = import.meta.env.VITE_API_URL || 'https://tommorowsamehour.duckdns.org/api/data';

export function useServerStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  // Initial load from server
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log(`Fetching ${key} from server...`);
        const response = await axios.get(`${API_URL}/${key}`);
        if (response.data) {
          setStoredValue(response.data as T);
          console.log(`Received ${key} data:`, response.data);
        }
      } catch (error) {
        console.error(`Error fetching ${key} from server:`, error);
        // Fall back to initial value if server fetch fails
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [key]);

  // Setter function that updates both local state and server
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Update local state
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      console.log(`Updating ${key} on server with:`, valueToStore);
      
      // Update server state
      axios.post(`${API_URL}/${key}`, valueToStore)
        .then(response => {
          console.log(`Successfully updated ${key} on server:`, response.data);
        })
        .catch(error => {
          console.error(`Error updating ${key} on server:`, error);
        });
    } catch (error) {
      console.error(`Error in setValue for ${key}:`, error);
    }
  };

  return [storedValue, setValue];
}
