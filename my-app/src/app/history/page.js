'use client'
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Card, CardContent, Typography, CardMedia } from '@mui/material';

export default function Home() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [historicalWeather, setHistoricalWeather] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false); 
  const [isDownloaded, setIsDownloaded] = useState(false); 


  useEffect(() => {
    fetchWeatherData();
  }, [lat, lon]);

  const handleChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length >= 3) {
      try {
        const response = await fetch(`/api/weather?city=${query}`);
        const data = await response.json();

        if (data.length === 0) {
          setSearchResults([{ name: 'No results found', state: '', country: '' }]);
        } else {
          setSearchResults(data);
        }
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleFetchData = async () => {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates = getDatesBetween(start, end);

    try {
      const dataPromises = dates.map(date => fetchWeatherData(date));
      const results = await Promise.all(dataPromises);
      setHistoricalWeather(results.flat());

      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: searchQuery, 
          startDate: start, 
          endDate: end,
          isDownloading: false 
        })
      };

      await fetch('http://localhost:8000/pastWeather', requestOptions);

    } catch (error) {
      console.error('Error fetching historical weather data:', error);
      setStatus('Error fetching historical weather data');
    }
  };

  const handleFetchDownloadData = async () => {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates = getDatesBetween(start, end);

    try {
      const dataPromises = dates.map(date => fetchWeatherData(date));
      const results = await Promise.all(dataPromises);
      setHistoricalWeather(results.flat());
      if (!isDownloaded) {
        downloadExcel(results.flat());
        setIsDownloaded(true); 
      }


      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: searchQuery, 
          startDate: start, 
          endDate: end,
          isDownloading: true 
        })
      };

      await fetch('http://localhost:8000/pastWeather', requestOptions);
    } catch (error) {
      console.error('Error fetching historical weather data:', error);
      setStatus('Error fetching historical weather data');
    }
  };

  const getDatesBetween = (startDate, endDate) => {
    const dates = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  const handleItemClick = async (result) => {
    if (result.name === 'No results found') {
      return; 
    }

    try {
      setLat(result.lat);
      setLon(result.lon);
    } catch (error) {
      console.error('Error fetching current weather data:', error);
    }

    setDropdownOpen(false);
    setSearchQuery(`${result.name}, ${result.state}, ${result.country}`);
  };

  const convertTemperature = (temperature) => {
      return ((temperature - 273.15) * 9/5 + 32).toFixed(2); 
  };

  const fetchWeatherData = async (date) => {
    if (!lat || !lon || !date) return;

    const formattedDate = Math.floor(date.getTime() / 1000); 

    try {
      const response = await fetch(`/api/history?lat=${lat}&lon=${lon}&formattedDate=${formattedDate}`)
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return [];
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toISOString().split('T')[0]; 
  };

  const downloadExcel = (data) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Historical Weather");
    XLSX.writeFile(wb, "historical_weather.xlsx");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 relative">
      <div className="flex">
        <div className="w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={handleChange}
            onClick={() => setDropdownOpen(true)}
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
        </div>
        <div>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className=" ml-5 border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:border-blue-500 mr-4"
        />
        </div>
        <div>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:border-blue-500"
        />
        </div>
        <div>
        <button onClick={handleFetchData} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-4">
          Fetch
        </button>
        </div>
        <div>
        <button onClick={handleFetchDownloadData} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-4">
          downloadExcel
        </button>
        </div>
      </div>
      <div className='flex flex-row m-3 rounded-2xl'>
      {historicalWeather.length > 0 ? (
        historicalWeather.map((data, index) => (
          <Card key={index} sx={{ maxWidth:'80%', marginBottom: 2, borderRadius: 10, backgroundColor: '#6699ff', color: 'white', margin: 5,}}>
                      <CardMedia
            sx={{ height: 140, }}
            marginTop={2}
            className='p-3'
            image={`http://openweathermap.org/img/w/${data.weather[0].icon}.png`}
            title="Weather Icon"
          />
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {formatDate(data.dt)}
              </Typography>
              <Typography gutterBottom>
                Main Weather: {data.weather[0].main}
              </Typography>
              <Typography gutterBottom>
                Description: {data.weather[0].description}
              </Typography>
              <Typography>
                Temperature: {convertTemperature(data.temp)} °F
              </Typography>
            </CardContent>
          </Card>
        ))
      ) : (
        <Typography variant="body1" align="center">
          No historical weather data available
        </Typography>
      )}
    </div>
      <div className="">

      </div>
    </main>
  );
}
