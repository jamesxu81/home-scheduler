// Weather API integration using Open-Meteo (free, no API key needed)

export interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

interface LocationCoords {
  latitude: number;
  longitude: number;
}

// Default location (can be enhanced to use geolocation)
const DEFAULT_LOCATION: LocationCoords = {
  latitude: -37.7749, // Auckland
  longitude: 174.8860,
};

// Weather condition icons mapping
const weatherIcons: Record<string, string> = {
  "clear sky": "☀️",
  "mainly clear": "☀️",
  "partly cloudy": "⛅",
  "overcast": "☁️",
  "foggy": "🌫️",
  "drizzle": "🌦️",
  "light rain": "🌦️",
  "moderate rain": "🌧️",
  "heavy rain": "⛈️",
  "freezing rain": "🧊",
  "rain and snow": "🌨️",
  "snow": "❄️",
  "rain showers": "🌧️",
  "snow showers": "🌨️",
  "thunderstorm": "⚡",
};

// Map WMO weather codes to descriptions
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

// Cache for weather data to avoid excessive API calls
const weatherCache = new Map<
  string,
  { data: WeatherData; timestamp: number }
>();

// Store cached month weather separately for persistence
const monthWeatherCache = new Map<
  string,
  { data: Record<string, WeatherData | null>; timestamp: number }
>();

const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

// Track last bulk fetch time to avoid fetching all month days repeatedly
const lastBulkFetchMap = new Map<string, number>();
const BULK_FETCH_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

function getCacheKey(date: string, location: LocationCoords): string {
  return `${date}-${location.latitude},${location.longitude}`;
}

function getBulkFetchKey(yearMonth: string, location: LocationCoords): string {
  return `bulk-${yearMonth}-${location.latitude},${location.longitude}`;
}

export function shouldFetchMonthWeather(
  year: number,
  month: number,
  location: LocationCoords = DEFAULT_LOCATION
): boolean {
  const yearMonth = `${year}-${String(month + 1).padStart(2, "0")}`;
  const key = getBulkFetchKey(yearMonth, location);
  const lastFetch = lastBulkFetchMap.get(key);

  if (!lastFetch) {
    return true; // Never fetched before
  }

  const timeSinceLastFetch = Date.now() - lastFetch;
  return timeSinceLastFetch >= BULK_FETCH_COOLDOWN_MS; // Fetch if more than 1 hour
}

export function recordMonthFetchTime(
  year: number,
  month: number,
  location: LocationCoords = DEFAULT_LOCATION
): void {
  const yearMonth = `${year}-${String(month + 1).padStart(2, "0")}`;
  const key = getBulkFetchKey(yearMonth, location);
  lastBulkFetchMap.set(key, Date.now());
}

export function getMonthWeatherFromCache(
  year: number,
  month: number,
  location: LocationCoords = DEFAULT_LOCATION
): Record<string, WeatherData | null> | null {
  const yearMonth = `${year}-${String(month + 1).padStart(2, "0")}`;
  const key = getBulkFetchKey(yearMonth, location);
  const cached = monthWeatherCache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
    return cached.data;
  }
  
  return null;
}

export function cacheMonthWeather(
  year: number,
  month: number,
  weatherData: Record<string, WeatherData | null>,
  location: LocationCoords = DEFAULT_LOCATION
): void {
  const yearMonth = `${year}-${String(month + 1).padStart(2, "0")}`;
  const key = getBulkFetchKey(yearMonth, location);
  monthWeatherCache.set(key, { data: weatherData, timestamp: Date.now() });
}

function getWeatherIcon(code: number): string {
  const description = wmoCodeToDescription[code] || "clear sky";
  return weatherIcons[description] || "🌡️";
}

export async function fetchWeather(
  date: string,
  location: LocationCoords = DEFAULT_LOCATION
): Promise<WeatherData> {
  const cacheKey = getCacheKey(date, location);

  // Check cache
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
    return cached.data;
  }

  try {
    // Use backend API route to avoid CORS issues
    const response = await fetch(
      `/api/weather?date=${date}&lat=${location.latitude}&lon=${location.longitude}`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }

    const weatherData: WeatherData = await response.json();

    // Cache the result
    weatherCache.set(cacheKey, { data: weatherData, timestamp: Date.now() });

    return weatherData;
  } catch (error) {
    console.error("Error fetching weather:", error);
    // Return a default/error state
    return {
      temperature: 0,
      condition: "N/A",
      icon: "❓",
      humidity: 0,
      windSpeed: 0,
    };
  }
}

export function setUserLocation(latitude: number, longitude: number): void {
  // This can be called after geolocating the user
  DEFAULT_LOCATION.latitude = latitude;
  DEFAULT_LOCATION.longitude = longitude;
  // Clear cache when location changes
  weatherCache.clear();
}

export function clearWeatherCache(): void {
  weatherCache.clear();
}
