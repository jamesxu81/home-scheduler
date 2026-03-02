import { Event, FamilyMember } from "@/types";
import React, { useState, useEffect } from "react";
import { fetchWeather, WeatherData, shouldFetchMonthWeather, recordMonthFetchTime, getMonthWeatherFromCache, cacheMonthWeather } from "@/lib/weather";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function Calendar({ events, members, onEditEvent, onDeleteEvent }: {
  events: Event[];
  members: FamilyMember[];
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (eventId: string) => void;
}) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [weatherData, setWeatherData] = useState<Record<string, WeatherData | null>>({});

  // Fetch weather for all days in the current month (only once per hour)
  useEffect(() => {
    const fetchMonthWeather = async () => {
      // Check if we have cached weather for this month
      const cachedWeather = getMonthWeatherFromCache(currentYear, currentMonth);
      if (cachedWeather) {
        setWeatherData(cachedWeather);
        return;
      }

      // Only fetch if we haven't fetched this month's weather in the last hour
      if (!shouldFetchMonthWeather(currentYear, currentMonth)) {
        return;
      }

      const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth);
      const weatherMap: Record<string, WeatherData | null> = {};
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const fifteenDaysFromNow = new Date(today);
      fifteenDaysFromNow.setDate(fifteenDaysFromNow.getDate() + 15);

      for (let day = 1; day <= daysInCurrentMonth; day++) {
        const currentDate = new Date(currentYear, currentMonth, day);
        currentDate.setHours(0, 0, 0, 0);
        
        // Only fetch weather for dates within 15 days from today
        if (currentDate > fifteenDaysFromNow) {
          continue;
        }
        
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        try {
          const weather = await fetchWeather(dateStr);
          weatherMap[dateStr] = weather;
        } catch (error) {
          console.error(`Error fetching weather for ${dateStr}:`, error);
          weatherMap[dateStr] = null;
        }
      }

      setWeatherData(weatherMap);
      cacheMonthWeather(currentYear, currentMonth, weatherMap);
      recordMonthFetchTime(currentYear, currentMonth);
    };

    fetchMonthWeather();
  }, [currentMonth, currentYear]);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  function eventsForDay(day: number) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter(e => e.date === dateStr);
  }

  const previousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <button onClick={previousMonth} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Prev</button>
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold">{MONTHS[currentMonth]} {currentYear}</h2>
          <button onClick={() => { setCurrentMonth(today.getMonth()); setCurrentYear(today.getFullYear()); }} className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm">Today</button>
        </div>
        <button onClick={nextMonth} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Next</button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {WEEKDAYS.map(day => (
          <div key={day} className="text-center font-bold text-gray-600 py-2">{day}</div>
        ))}
        
        {Array.from({ length: firstDay }, (_, i) => (
          <div key={`empty-${i}`} className="aspect-square bg-gray-50 rounded"></div>
        ))}

        {days.map(day => {
          const dayEvents = eventsForDay(day);
          const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const weather = weatherData[dateStr];
          
          return (
            <div 
              key={day} 
              className={`aspect-square border rounded p-1 overflow-y-auto ${isToday ? 'bg-blue-50 border-blue-300 border-2' : 'bg-white border-gray-200'}`}
            >
              <div className="flex items-start justify-between">
                <div className={`font-semibold text-sm ${isToday ? 'text-blue-600' : 'text-gray-600'}`}>{day}</div>
                {weather && (
                  <div className="flex flex-col items-end justify-start gap-0.5">
                    <span className="text-lg leading-none">{weather.icon}</span>
                    <span className="text-xs font-semibold text-gray-700">{weather.temperature}°</span>
                  </div>
                )}
              </div>
              <div className="space-y-1 mt-1">
                {dayEvents.slice(0, 3).map(ev => {
                  const member = members.find(m => m.id === ev.kidId);
                  return (
                    <div 
                      key={ev.id} 
                      className="text-xs p-1 rounded truncate text-white cursor-pointer hover:opacity-80"
                      style={{ backgroundColor: member?.color || '#6366f1' }}
                      title={ev.title}
                    >
                      <span>{ev.title}</span>
                      <button 
                        className="ml-1 text-white hover:text-yellow-300" 
                        onClick={(e) => { e.stopPropagation(); onEditEvent(ev); }}
                      >
                        ✏️
                      </button>
                      <button 
                        className="ml-1 text-white hover:text-red-300" 
                        onClick={(e) => { e.stopPropagation(); onDeleteEvent(ev.id); }}
                      >
                        ❌
                      </button>
                    </div>
                  );
                })}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500">+{dayEvents.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
