// weather_app.js
import readline from 'readline/promises';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const API_KEY = process.env.WEATHER_API_KEY;
const BASE_URL = `http://api.openweathermap.org/data/2.5/weather`;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const getWeather = async (city) => {
  try {
    // Step 1: Get coordinates from city name
    console.log(`🔍 Fetching coordinates for city: ${city}`);
    console.log(`📡 URL: http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`);

    const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`;
    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();

    if (!geoData.length) {
      throw new Error("City not found");
    }

    const { lat, lon, name, country, state } = geoData[0];

    // Step 2: Get weather using coordinates
    const weatherUrl = `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) {
      throw new Error("Weather data not available");
    }

    const weatherData = await weatherResponse.json();

    // Output
    console.log('\nWeather Information');
    console.log(`City: ${name}, ${state || ""}, ${country}`);
    console.log(`Temperature: ${weatherData.main.temp} °C`);
    console.log(`Description: ${weatherData.weather[0].description}`);
    console.log(`Humidity: ${weatherData.main.humidity}%`);
    console.log(`Wind Speed: ${weatherData.wind.speed} m/s\n`);
  } catch (error) {
    console.log("Error:", error.message);
  }
};

// ✅ Wrap in async main function
const main = async () => {
  console.log("🌦️ Welcome to Weather App!");
  const city = await rl.question("Enter a city to get its weather: ");
  await getWeather(city);
  rl.close();
};

main();
