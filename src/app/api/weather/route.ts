import { NextRequest, NextResponse } from "next/server";

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

const wmoCodeToDescription: Record<number, string> = {
  0: "clear sky",
  1: "mainly clear",
  2: "partly cloudy",
  3: "overcast",
  45: "foggy",
  48: "foggy",
  51: "drizzle",
  53: "drizzle",
  55: "drizzle",
  61: "light rain",
  63: "moderate rain",
  65: "heavy rain",
  71: "snow",
  73: "snow",
  75: "snow",
  77: "snow",
  80: "rain showers",
  81: "rain showers",
  82: "rain showers",
  85: "snow showers",
  86: "snow showers",
  95: "thunderstorm",
  96: "thunderstorm",
  99: "thunderstorm",
};

const weatherIcons: Record<string, string> = {
  "clear sky": "☀️",
  "mainly clear": "☀️",
  "partly cloudy": "⛅",
  overcast: "☁️",
  foggy: "🌫️",
  drizzle: "🌦️",
  "light rain": "🌦️",
  "moderate rain": "🌧️",
  "heavy rain": "⛈️",
  "freezing rain": "🧊",
  "rain and snow": "🌨️",
  snow: "❄️",
  "rain showers": "🌧️",
  "snow showers": "🌨️",
  thunderstorm: "⚡",
};

function getWeatherIcon(code: number): string {
  const description = wmoCodeToDescription[code] || "clear sky";
  return weatherIcons[description] || "🌡️";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const lat = searchParams.get("lat") || "-37.7749"; // Default to Auckland
  const lon = searchParams.get("lon") || "174.8860";

  if (!date) {
    return NextResponse.json(
      { error: "Date parameter is required" },
      { status: 400 }
    );
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    console.error(`Invalid date format: ${date}`);
    return NextResponse.json(
      { error: "Date must be in YYYY-MM-DD format" },
      { status: 400 }
    );
  }

  // Validate latitude and longitude are valid numbers
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);
  
  if (isNaN(latitude) || isNaN(longitude)) {
    console.error(`Invalid coordinates: lat=${lat}, lon=${lon}`);
    return NextResponse.json(
      { error: "Latitude and longitude must be valid numbers" },
      { status: 400 }
    );
  }

  if (latitude < -90 || latitude > 90) {
    console.error(`Latitude out of range: ${latitude}`);
    return NextResponse.json(
      { error: "Latitude must be between -90 and 90" },
      { status: 400 }
    );
  }

  if (longitude < -180 || longitude > 180) {
    console.error(`Longitude out of range: ${longitude}`);
    return NextResponse.json(
      { error: "Longitude must be between -180 and 180" },
      { status: 400 }
    );
  }

  try {
    // Build the URL with proper parameter encoding
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.append("latitude", latitude.toString());
    url.searchParams.append("longitude", longitude.toString());
    url.searchParams.append("start_date", date);
    url.searchParams.append("end_date", date);
    url.searchParams.append("daily", "temperature_2m_max,temperature_2m_min,weather_code,relative_humidity_2m_max,wind_speed_10m_max");
    url.searchParams.append("timezone", "auto");

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "Kimberly-Scheduler",
      },
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      console.error(`Open-Meteo API error: Status ${response.status}, Body: ${responseText}`);
      throw new Error(`Weather API error: ${response.statusText}`);
    }

    const data = JSON.parse(responseText);

    if (!data.daily || data.daily.time.length === 0) {
      throw new Error("No weather data available");
    }

    const dayIndex = 0;
    const weatherCode = data.daily.weather_code[dayIndex];
    const maxTemp = Math.round(data.daily.temperature_2m_max[dayIndex]);
    const minTemp = Math.round(data.daily.temperature_2m_min[dayIndex]);
    const humidity = data.daily.relative_humidity_2m_max[dayIndex];
    const windSpeed = Math.round(data.daily.wind_speed_10m_max[dayIndex]);

    const weatherData: WeatherData = {
      temperature: maxTemp,
      condition: wmoCodeToDescription[weatherCode] || "Unknown",
      icon: getWeatherIcon(weatherCode),
      humidity,
      windSpeed,
    };

    return NextResponse.json(weatherData);
  } catch (error) {
    console.error("Error fetching weather:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}
