const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Path to the sleep data JSON file
const sleepDataFile = path.join(__dirname, '../data/sleep_data.json');

// Serve static files (frontend HTML, CSS, etc.)
app.use(express.static(path.join(__dirname, '../public')));


// Helper function to read sleep data from the JSON file
const readSleepData = () => {
    try {
      const data = fs.readFileSync(sleepDataFile, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.error('Error reading sleep data:', err);
      return { sleepEntries: [] };
    }
  };
  
  // Helper function to write sleep data to the JSON file
  const writeSleepData = (data) => {
    try {
      fs.writeFileSync(sleepDataFile, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.error('Error writing sleep data:', err);
    }
  };
  
  // Route to GET all sleep entries
  app.get('/api/sleep', (req, res) => {
    const sleepData = readSleepData();
    res.json(sleepData);
  });
  
  // Route to POST a new sleep entry
  app.post('/api/sleep', (req, res) => {
    const { bedtime, wakeupTime } = req.body;
  
    if (!bedtime || !wakeupTime) {
      return res.status(400).json({ message: 'Missing required fields: bedtime or wakeupTime' });
    }
  
    // Convert bedtime and wakeupTime to Date objects
    const bedtimeDate = new Date(bedtime);
    const wakeupDate = new Date(wakeupTime);
  
    // Calculate the difference in hours between bedtime and wakeup time
    const hoursSlept = (wakeupDate - bedtimeDate) / (1000 * 60 * 60); // Convert milliseconds to hours
  
    // Ensure the hours slept is a positive number
    if (hoursSlept < 0) {
      return res.status(400).json({ message: 'Wake-up time must be after bedtime.' });
    }
  
    const newEntry = {
      bedtime: bedtimeDate.toISOString(),
      wakeupTime: wakeupDate.toISOString(),
      hoursSlept: hoursSlept.toFixed(2), // Round to two decimal places
      date: new Date().toISOString() // Current date for the entry
    };
  
    const sleepData = readSleepData();
    sleepData.sleepEntries.push(newEntry);
  
    writeSleepData(sleepData);
  
    res.status(201).json({ message: 'Sleep entry added successfully', entry: newEntry });
  });
  
  // Start the server
  app.listen(port, () => {
    console.log(`Sleep Tracker app running at http://localhost:${port}`);
  });