
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/data';

export function useServerStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  // Initial load from server
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_URL}/${key}`);
        if (response.data) {
          setStoredValue(response.data as T);
        }
      } catch (error) {
        console.error(`Error fetching ${key} from server:`, error);
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
      
      // Update server state
      axios.post(`${API_URL}/${key}`, valueToStore)
        .catch(error => console.error(`Error updating ${key} on server:`, error));
    } catch (error) {
      console.error(`Error updating ${key}:`, error);
    }
  };

  return [storedValue, setValue];
}
