
export async function GET(request) {
  console.log("checking")
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
  
    const apiKey = process.env.API_KEY;
    const apiUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${apiKey}`;
  
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      res.status(500).json({ error: 'Error fetching weather data' });
    }
  }
  