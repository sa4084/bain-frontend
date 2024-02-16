import { NextResponse } from "next/server";

export async function GET(request, response) {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    console.log(lat, lon, 'server side ----')
    const apiKey = process.env.API_KEY;
    const apiUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=hourly,daily,minutely,alerts&appid=${apiKey}`;
    try {
        const apiResponse = await fetch(apiUrl);
        const data = await apiResponse.json();
        console.log(data, 'srverside =======')
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return NextResponse.json({ error: 'Error fetching weather data' }, { status: 500 });
    }
}
