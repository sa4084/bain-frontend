import { NextResponse } from "next/server";

export async function GET(request, response) {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const apiKey = process.env.API_KEY;

    const apiUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${apiKey}`;

    try {
        const apiResponse = await fetch(apiUrl);
        const data = await apiResponse.json();

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return NextResponse.json({ error: 'Error fetching weather data' }, { status: 500 });
    }
}
