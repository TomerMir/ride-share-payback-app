
import { promises as fs } from 'fs';
import AsyncLock from 'async-lock';

// Initialize a mutex lock
const lock = new AsyncLock();

// Path to the storage file
const STORAGE_FILE_PATH = './rideShareData.json';

// Default data structure
const DEFAULT_DATA = {
  users: [],
  rides: [],
  settings: {
    pricePerKm: 1.0,
    defaultDistance: 10.0,
  }
};

// Type for the stored data
export interface StoredData {
  users: any[];
  rides: any[];
  settings: {
    pricePerKm: number;
    defaultDistance: number;
  };
}

// Initialize the storage file if it doesn't exist
export const initStorage = async (): Promise<void> => {
  try {
    await fs.access(STORAGE_FILE_PATH);
  } catch (error) {
    // File doesn't exist, create it with default data
    await fs.writeFile(STORAGE_FILE_PATH, JSON.stringify(DEFAULT_DATA, null, 2));
  }
};

// Read data from the storage file with mutex lock
export const readData = async (): Promise<StoredData> => {
  return lock.acquire('storage', async () => {
    try {
      await initStorage();
      const data = await fs.readFile(STORAGE_FILE_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading from storage file:', error);
      return DEFAULT_DATA;
    }
  });
};

// Write data to the storage file with mutex lock
export const writeData = async (data: StoredData): Promise<void> => {
  return lock.acquire('storage', async () => {
    try {
      await fs.writeFile(STORAGE_FILE_PATH, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error writing to storage file:', error);
    }
  });
};

// Update specific parts of the data with mutex lock
export const updateData = async (
  key: keyof StoredData,
  value: any
): Promise<void> => {
  return lock.acquire('storage', async () => {
    try {
      const data = await readData();
      data[key] = value;
      await writeData(data);
    } catch (error) {
      console.error(`Error updating ${key} in storage:`, error);
    }
  });
};
