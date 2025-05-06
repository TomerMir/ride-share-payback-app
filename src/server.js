
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs/promises';
import path from 'path';
import { Mutex } from 'async-mutex';

// Storage utility functions
const STORAGE_FILE = path.resolve('./data.json');

// Secret access key for minimal authentication
const SECRET_ACCESS_KEY = 'ridesecret'; // This will be part of the URL

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

// Middleware to check secret access key
const checkSecretKey = (req, res, next) => {
  // Skip auth check for API routes, we only authenticate the main app access
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // For all other routes (serving the frontend), check the secret
  const urlKey = req.path.split('/')[1]; // Get the first part of the URL path
  if (urlKey === SECRET_ACCESS_KEY) {
    next(); // Allow access if the secret key matches
  } else {
    res.status(403).send('Access denied. Invalid access key.');
  }
};

// Apply authentication middleware
app.use(checkSecretKey);

// Serve static files from the root path
app.use(`/${SECRET_ACCESS_KEY}`, express.static('dist'));

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

// Catch-all route for the app to handle client-side routing
app.get(`/${SECRET_ACCESS_KEY}/*`, (req, res) => {
  res.sendFile(path.resolve('dist', 'index.html'));
});

// Redirect root to the secret URL path
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Same Hour Tomorrow</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
          }
          .container {
            text-align: center;
            background-color: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            max-width: 500px;
            width: 100%;
          }
          h1 {
            color: #3b82f6;
          }
          p {
            margin: 1rem 0;
          }
          .secret-link {
            display: block;
            margin-top: 1rem;
            padding: 0.75rem 1rem;
            background-color: #3b82f6;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-weight: 500;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Same Hour Tomorrow</h1>
          <p>To access the ride sharing app, use the secret link below:</p>
          <a href="/${SECRET_ACCESS_KEY}" class="secret-link">Access App</a>
        </div>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`App available at http://localhost:${PORT}/${SECRET_ACCESS_KEY}`);
  console.log(`API available at http://localhost:${PORT}/api/data`);
});
