import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs/promises';
import path from 'path';
import { Mutex } from 'async-mutex';

// Storage utility functions
const STORAGE_FILE = path.resolve('./data.json');

async function initStorage() {
  try {
    await fs.access(STORAGE_FILE);
  } catch {
    await fs.writeFile(STORAGE_FILE, JSON.stringify({}));
  }
}

async function readData() {
  try {
    const data = await fs.readFile(STORAGE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading storage file:', error);
    throw error;
  }
}

async function writeData(data) {
  try {
    await fs.writeFile(STORAGE_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing to storage file:', error);
    throw error;
  }
}

// Initialize the storage
initStorage().catch(console.error);

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS to allow requests from the client
app.use(cors({
  origin: '*', // Allow requests from any origin
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json());

const mutex = new Mutex();

// API endpoint to get all data
app.get('/api/data', async (req, res) => {
  try {
    const data = await readData();
    res.json(data);
    console.log('Sent all data to client');
  } catch (error) {
    console.error('Error reading data:', error);
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// API endpoint to get specific data by key
app.get('/api/data/:key', async (req, res) => {
  try {
    const data = await readData();
    const key = req.params.key;
    if (key in data) {
      res.json(data[key]);
      console.log(`Sent ${key} data to client:`, data[key]);
    } else {
      console.log(`Key ${key} not found`);
      res.status(404).json({ error: 'Key not found' });
    }
  } catch (error) {
    console.error(`Error reading ${req.params.key} data:`, error);
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// API endpoint to update specific data by key
app.post('/api/data/:key', async (req, res) => {
  const release = await mutex.acquire(); // Acquire the mutex
  try {
    const key = req.params.key;
    const value = req.body;

    console.log(`Updating ${key} with:`, value);

    const data = await readData();
    data[key] = value;
    await writeData(data);

    res.json({ success: true, message: `${key} updated successfully` });
  } catch (error) {
    console.error(`Error updating ${req.params.key}:`, error);
    res.status(500).json({ error: 'Failed to update data' });
  } finally {
    release(); // Release the mutex
  }
});

// Simple health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/data`);
});
