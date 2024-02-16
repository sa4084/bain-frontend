'use client';

import { useState } from 'react';
import { Card, CardContent, Typography, CardMedia } from '@mui/material';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [tempUnit, setTempUnit] = useState('K');
  const [dropdownOpen, setDropdownOpen] = useState(false); 

  const handleChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length >= 3) {
      try {
        const response = await fetch(`/api/weather?city=${query}`);
        const data = await response.json();
        console.log(data,'----===')
        if (data.length === 0) {
          setSearchResults([{ name: 'No results found', state: '', country: '' }]);
        } else {
          setSearchResults(data);
        }
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    } else {
      // Clear search results if query length is less than 3
      setSearchResults([]);
    }
  };

  const handleItemClick = async (result) => {
    if (result.name === 'No results found') {
      return; // Do nothing if "No results found" is clicked
    }
    console.log(result,' test')
    try {
      const response = await fetch(`/api/currentWeather?lat=${result.lat}&lon=${result.lon}`);
      const data = await response.json();
      setCurrentWeather(data);

      // Send a separate POST request to FastAPI backend
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }) 
      };
      await fetch('http://localhost:8000/currentWeather', requestOptions);
    } catch (error) {
      console.error('Error fetching current weather data:', error);
    }

    setDropdownOpen(false);
    setSearchQuery(`${result.name}, ${result.state}, ${result.country}`);
  };

  const convertTemperature = (temperature) => {
    if (tempUnit === 'C') {
      return ((temperature - 273.15) * 9/5 + 32).toFixed(2); 
    } else if (tempUnit === 'F') {
      return temperature; 
    } else {
      return (temperature - 273.15).toFixed(2); 
    }
  };
  

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="w-full max-w-md">
        <input
          type="text"
          value={searchQuery}
          onChange={handleChange}
          onClick={() => setDropdownOpen(true)} // Open dropdown on input click
          className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:border-blue-500"
          placeholder="Enter city name..."
        />
        {dropdownOpen && (
          <ul className="mt-2 border border-gray-300 rounded-md overflow-hidden">
            {searchResults.length > 0 ? searchResults.map((result, index) => (
              <li key={index} onClick={() => handleItemClick(result)} className={`cursor-pointer px-4 py-2 hover:bg-gray-100 ${result.name === 'No results found' ? 'text-red-500' : ''}`}>{`${result.name}, ${result.state}, ${result.country}`}</li>
            ))
              : <li> No results found</li>
            }
          </ul>
        )}



<div className='flex w-full justify-center items-center mt-10'>

      {currentWeather && (

        <Card sx={{ width: '80%', borderRadius: 10, backgroundColor: '#6699ff', color: 'white', padding: '20px',}}>
          <CardMedia
            sx={{ height: 140, }}
            marginTop={2}
            className="mt-5 mb-5 ml-3"
            image={`http://openweathermap.org/img/w/${currentWeather.current.weather[0].icon}.png`}
            title="Weather Icon"
          />
          <CardContent>
            <Typography variant="h6" component="h2" marginTop={2}>
              {searchQuery} <br/> {convertTemperature(currentWeather.current.temp)} °C
            </Typography>
            <Typography variant="body2" component="p" marginTop={2}>
              {currentWeather && `Main: ${currentWeather.current.weather[0].main}`}
            </Typography>
            <Typography variant="body2" component="p" marginTop={2}>
              {currentWeather && `Description: ${currentWeather.current.weather[0].description}`}
            </Typography>
          </CardContent>
        </Card>
      )}
    </div>

      </div>





    
    </main>
  );
}