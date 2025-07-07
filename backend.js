// backend/index.js
import dotenv from 'dotenv';
dotenv.config(); // ✅ this reads from `.env` in the same folder
import express from 'express';
import fetch from 'node-fetch';




const app = express();
const PORT = 3000;
import cors from 'cors';
app.use(cors());
const API_KEY = process.env.WEATHER_API_KEY;
app.get('/nearby-rain', async (req, res) => {
  const city = req.query.city;
  if (!city) return res.status(400).json({ error: "City is required" });

  try {
    // Step 1: Get coordinates of base city
    const geoResp = await fetch(`${GEO_URL}?q=${city}&limit=1&appid=${API_KEY}`);
    const geoData = await geoResp.json();
    if (!geoData.length) return res.status(404).json({ error: 'City not found' });

    const { lat, lon } = geoData[0];

    // Step 2: Manually define nearby cities (you can expand this later)
    const nearbyCities = ["Lucknow", "Sitapur", "Kanpur", "Unnao"];

    // Step 3: Check if it’s raining in any nearby cities
    const results = [];
    for (const nearby of nearbyCities) {
      const res2 = await fetch(`${WEATHER_URL}?q=${nearby}&appid=${API_KEY}&units=metric`);
      const weather = await res2.json();

      const isRain = weather.weather[0].main.toLowerCase().includes('rain');
      if (isRain) {
        results.push(nearby);
      }
    }

    // Step 4: Respond with results
    if (results.length) {
      return res.json({ nearbyRain: results });
    } else {
      return res.json({ nearbyRain: [] });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

const GEO_URL = 'http://api.openweathermap.org/geo/1.0/direct';
const WEATHER_URL = 'http://api.openweathermap.org/data/2.5/weather';

// Enable CORS (so frontend can talk to backend)
app.use(cors());

// Route: GET /weather?city=hardoi
app.get('/weather', async (req, res) => {
  const city = req.query.city;

  if (!city) {
    return res.status(400).json({ error: 'City is required' });
  }

  try {
    // Step 1: Get coordinates
    const geoResp = await fetch(`${GEO_URL}?q=${city}&limit=1&appid=${API_KEY}`);
    const geoData = await geoResp.json();

    if (!geoData.length) {
      return res.status(404).json({ error: 'City not found' });
    }

    const { lat, lon, name, country, state } = geoData[0];

    // Step 2: Get weather
    const weatherResp = await fetch(`${WEATHER_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
    const weatherData = await weatherResp.json();

    return res.json({
      city: `${name}, ${state || ''}, ${country}`,
      temperature: `${weatherData.main.temp} °C`,
      description: weatherData.weather[0].description,
      humidity: `${weatherData.main.humidity}%`,
      windSpeed: `${weatherData.wind.speed} m/s`
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Weather API running on http://localhost:${PORT}`);
});
