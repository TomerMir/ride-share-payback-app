
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { readData, writeData, initStorage, StoredData } from './utils/serverStorage';

// Initialize the storage
initStorage().catch(console.error);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// API endpoint to get all data
app.get('/api/data', async (req, res) => {
  try {
    const data = await readData();
    res.json(data);
  } catch (error) {
    console.error('Error reading data:', error);
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// API endpoint to get specific data by key
app.get('/api/data/:key', async (req, res) => {
  try {
    const data = await readData();
    const key = req.params.key as keyof StoredData;
    if (key in data) {
      res.json(data[key]);
    } else {
      res.status(404).json({ error: 'Key not found' });
    }
  } catch (error) {
    console.error('Error reading data:', error);
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// API endpoint to update specific data by key
app.post('/api/data/:key', async (req, res) => {
  try {
    const key = req.params.key as keyof StoredData;
    const value = req.body;
    const data = await readData();
    
    data[key] = value;
    await writeData(data);
    
    res.json({ success: true, message: `${key} updated successfully` });
  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).json({ error: 'Failed to update data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
