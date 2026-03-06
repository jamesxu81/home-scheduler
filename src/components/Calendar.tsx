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

export default function Calendar({ events, members, onDayClick }: {
  events: Event[];
  members: FamilyMember[];
  onDayClick: (date: string) => void;
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
    <div className="bg-white rounded-lg shadow-lg p-3 md:p-6">
      <div className="flex flex-col gap-3 mb-4 md:mb-6">
        <div className="flex justify-between items-center gap-2">
          <button onClick={previousMonth} className="px-3 md:px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm md:text-base">Prev</button>
          <h2 className="text-xl md:text-2xl font-bold text-center flex-1">{MONTHS[currentMonth]} {currentYear}</h2>
          <button onClick={nextMonth} className="px-3 md:px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm md:text-base">Next</button>
        </div>
        <div className="flex justify-center">
          <button onClick={() => { setCurrentMonth(today.getMonth()); setCurrentYear(today.getFullYear()); }} className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-xs md:text-sm">Today</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {WEEKDAYS.map(day => (
          <div key={day} className="text-center font-bold text-gray-600 py-2 text-xs md:text-sm">{day}</div>
        ))}
        
        {Array.from({ length: firstDay }, (_, i) => (
          <div key={`empty-${i}`} className="min-h-20 md:min-h-24 bg-gray-50 rounded"></div>
        ))}

        {days.map(day => {
          const dayEvents = eventsForDay(day);
          const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const weather = weatherData[dateStr];
          
          return (
            <div 
              key={day} 
              className={`min-h-20 md:min-h-24 border rounded p-2 md:p-3 overflow-y-auto cursor-pointer transition hover:shadow-lg ${isToday ? 'bg-blue-50 border-blue-300 border-2' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
              onClick={() => onDayClick(dateStr)}
            >
              <div className="flex items-start justify-between gap-1">
                <div className={`font-semibold text-sm md:text-base ${isToday ? 'text-blue-600' : 'text-gray-600'}`}>{day}</div>
                {weather && (
                  <div className="flex flex-col items-end justify-start gap-0.5">
                    <span className="text-xl md:text-2xl leading-none">{weather.icon}</span>
                    <span className="text-xs font-semibold text-gray-700">{weather.temperature}°</span>
                  </div>
                )}
              </div>
              <div className="space-y-1 mt-2">
                {dayEvents.slice(0, 3).map(ev => {
                  const member = members.find(m => m.id === ev.kidId);
                  return (
                    <div 
                      key={ev.id} 
                      className="text-xs md:text-sm p-1 rounded truncate text-white"
                      style={{ backgroundColor: member?.color || '#6366f1' }}
                      title={ev.title}
                    >
                      <span>{ev.title}</span>
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
