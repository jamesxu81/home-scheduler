import { Event, FamilyMember } from "@/types";
import React, { useState, useEffect, useMemo } from "react";
import { fetchWeather, WeatherData } from "@/lib/weather";

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6am to 10pm
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOUR_HEIGHT_MOBILE = 45; // pixels per hour on mobile
const HOUR_HEIGHT_DESKTOP = 60; // pixels per hour on desktop

function getWeekStart(date: Date) {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
  const weekStart = new Date(date.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

interface EventPosition {
  event: Event;
  top: number; // pixels from top
  height: number; // pixels height
  member: FamilyMember | undefined;
}

export default function WeeklyCalendar({ events, members, onEditEvent, onDeleteEvent, onAddEvent }: {
  events: Event[];
  members: FamilyMember[];
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (eventId: string) => void;
  onAddEvent?: (date: string, time: string) => void;
}) {
  const [currentWeek, setCurrentWeek] = useState(getWeekStart(new Date()));
  const [weatherData, setWeatherData] = useState<Record<string, WeatherData | null>>({});
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const HOUR_HEIGHT = isMobile ? HOUR_HEIGHT_MOBILE : HOUR_HEIGHT_DESKTOP;

  // Get all days in current week
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentWeek);
    d.setDate(currentWeek.getDate() + i);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Create a stable week identifier as a string
  const weekIdentifier = useMemo(() => {
    return `${currentWeek.getFullYear()}-${String(currentWeek.getMonth() + 1).padStart(2, "0")}-${String(currentWeek.getDate()).padStart(2, "0")}`;
  }, [currentWeek]);

  // Fetch weather for all days in the week (max 15 days from today)
  useEffect(() => {
    const fetchWeekWeather = async () => {
      const weatherMap: Record<string, WeatherData | null> = {};
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      const fifteenDaysFromNow = new Date(todayDate);
      fifteenDaysFromNow.setDate(fifteenDaysFromNow.getDate() + 15);

      for (const day of days) {
        // Only fetch weather for dates within 15 days from today
        if (day > fifteenDaysFromNow) {
          continue;
        }
        
        const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
        try {
          const weather = await fetchWeather(dateStr);
          weatherMap[dateStr] = weather;
        } catch (error) {
          console.error(`Error fetching weather for ${dateStr}:`, error);
          weatherMap[dateStr] = null;
        }
      }

      setWeatherData(weatherMap);
    };

    fetchWeekWeather();
    // Use stable week identifier as dependency
  }, [weekIdentifier]);

  // Get events for a specific day with positioning info
  function getEventPositionsForDay(day: Date): EventPosition[] {
    const dayDateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
    const dayEvents = events.filter(e => e.date === dayDateStr);
    
    return dayEvents.map(ev => {
      const timeStr = ev.time || "00:00";
      const [hour, minute] = timeStr.split(":").map(Number);
      const startMinutesFromStart = (hour - HOURS[0]) * 60 + minute; // minutes from 6am
      const duration = ev.duration || 30; // default 30 minutes
      
      const top = startMinutesFromStart * (HOUR_HEIGHT / 60);
      const height = duration * (HOUR_HEIGHT / 60);
      
      return {
        event: ev,
        top,
        height,
        member: members.find(m => m.id === ev.kidId),
      };
    });
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-2 md:p-4">
      <div className="flex flex-col gap-2 mb-3 md:mb-4">
        <div className="flex justify-between items-center gap-2">
          <button onClick={() => {
            const prevWeek = new Date(currentWeek.getFullYear(), currentWeek.getMonth(), currentWeek.getDate() - 7);
            setCurrentWeek(getWeekStart(prevWeek));
          }} className="px-2 md:px-3 py-1 bg-gray-200 rounded text-sm md:text-base">Prev</button>
          <span className="font-bold text-sm md:text-lg text-center flex-1">{isMobile ? `${days[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${days[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : `Week of ${days[0].toLocaleDateString()} - ${days[6].toLocaleDateString()}`}</span>
          <button onClick={() => {
            const nextWeek = new Date(currentWeek.getFullYear(), currentWeek.getMonth(), currentWeek.getDate() + 7);
            setCurrentWeek(getWeekStart(nextWeek));
          }} className="px-2 md:px-3 py-1 bg-gray-200 rounded text-sm md:text-base">Next</button>
        </div>
        <div className="flex justify-center">
          <button onClick={() => setCurrentWeek(getWeekStart(new Date()))} className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-xs md:text-sm">Today</button>
        </div>
      </div>
      
      <div className="overflow-x-auto -mx-2 md:mx-0 px-2 md:px-0">
        {/* Day Headers */}
        <div className="flex">
          <div className="w-10 md:w-16 border-r flex-shrink-0"></div>
          <div className="flex">
            {days.map((d, i) => {
              const isToday = d.getTime() === today.getTime();
              const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
              const weather = weatherData[dateStr];
              return (
                <div key={i} className={`border-r flex-1 text-center py-2 px-1 ${isToday ? 'bg-blue-100' : ''}`} style={{ minWidth: isMobile ? '60px' : '100px' }}>
                  <div className="font-bold text-xs md:text-base">{WEEKDAYS[i]}</div>
                  {!isMobile && <div className="text-xs text-gray-600">{d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>}
                  {weather && (
                    <div className="flex flex-col items-center justify-center gap-0.5 mt-1">
                      <span className="text-base md:text-lg">{weather.icon}</span>
                      <span className="text-xs font-semibold text-gray-700">{weather.temperature}°</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Time Grid */}
        <div className="flex border-t">
          {/* Time Column */}
          <div className="w-10 md:w-16 border-r flex-shrink-0">
            {HOURS.map(hour => (
              <div key={hour} className="border-b text-right text-xs px-1 md:px-2 py-1" style={{ height: HOUR_HEIGHT }}>
                <div>{hour}:00</div>
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="flex">
            {days.map((day, dayIdx) => {
              const isToday = day.getTime() === today.getTime();
              const eventPositions = getEventPositionsForDay(day);
              
              return (
                <div key={dayIdx} className={`border-r relative ${isToday ? 'bg-blue-50' : ''}`} style={{ minWidth: isMobile ? '60px' : '100px' }}>
                  {/* Hour rows for click areas */}
                  {HOURS.map(hour => (
                    <div
                      key={hour}
                      className="border-b hover:bg-indigo-50 cursor-pointer transition text-xs text-gray-400"
                      style={{ height: HOUR_HEIGHT }}
                      onClick={() => {
                        if (onAddEvent) {
                          const dateStr = day.toISOString().split('T')[0];
                          const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                          onAddEvent(dateStr, timeStr);
                        }
                      }}
                    />
                  ))}

                  {/* Events (absolutely positioned) */}
                  <div className="absolute inset-0">
                    {eventPositions.map(({ event: ev, top, height, member }) => (
                      <div
                        key={ev.id}
                        className="absolute left-0.5 right-0.5 md:left-1 md:right-1 p-0.5 md:p-1 rounded text-white text-xs overflow-hidden cursor-pointer hover:opacity-100 hover:shadow-lg transition-all"
                        style={{
                          top: `${top}px`,
                          height: `${Math.max(height, 25)}px`, // minimum height for visibility
                          backgroundColor: member?.color || '#6366f1',
                          opacity: 0.9,
                        }}
                        title={`${ev.title} • ${ev.time || '00:00'} (${ev.duration || 30}m)`}
                        onClick={() => onEditEvent(ev)}
                      >
                        <div className="font-semibold truncate text-xs">{ev.title}</div>
                        {!isMobile && <div className="text-xs flex justify-between gap-1">
                          <span>{ev.time || '00:00'}</span>
                          <span>({ev.duration || 30}m)</span>
                        </div>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
