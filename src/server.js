const express = require('express');
const axios = require('axios');
const cors = require('cors');  // Optional: Allows all CORS requests

const app = express();
const port = 3001;

// Enable CORS (optional for debugging)
app.use(cors());

// Proxy endpoint to fetch NBA stats
app.get('/nba-stats', async (req, res) => {
  try {
    const response = await axios.get('https://stats.nba.com/js/data/leaders/00_daily_lineups_20250304.json');
    res.json(response.data);  // Forward the response from the NBA API to the frontend
  } catch (error) {
    console.error('Error fetching NBA data:', error);
    res.status(500).json({ error: 'Error fetching data' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Proxy server is running at http://localhost:${port}`);
});
