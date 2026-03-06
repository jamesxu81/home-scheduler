"use client";

import { Event, FamilyMember } from "@/types";
import React, { useState, useEffect } from "react";
import { fetchWeather, WeatherData } from "@/lib/weather";

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6am to 10pm
const HOUR_HEIGHT_MOBILE = 60; // pixels per hour on mobile
const HOUR_HEIGHT_DESKTOP = 80; // pixels per hour on desktop

interface EventPosition {
  event: Event;
  top: number; // pixels from top
  height: number; // pixels height
  member: FamilyMember | undefined;
}

export default function DailyCalendar({ 
  date, 
  events, 
  members, 
  onEditEvent, 
  onDeleteEvent,
  onBack 
}: {
  date: string; // YYYY-MM-DD format
  events: Event[];
  members: FamilyMember[];
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (eventId: string) => void;
  onBack: () => void;
}) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const HOUR_HEIGHT = isMobile ? HOUR_HEIGHT_MOBILE : HOUR_HEIGHT_DESKTOP;

  // Parse the date
  const [year, month, day] = date.split("-").map(Number);
  const dateObj = new Date(year, month - 1, day);
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Fetch weather for this day
  useEffect(() => {
    const fetchDayWeather = async () => {
      try {
        const weatherData = await fetchWeather(date);
        setWeather(weatherData);
      } catch (error) {
        console.error(`Error fetching weather for ${date}:`, error);
        setWeather(null);
      }
    };

    fetchDayWeather();
  }, [date]);

  // Filter events for this day
  const dayEvents = events.filter(e => e.date === date);

  // Calculate event positions on the timeline
  const eventPositions: EventPosition[] = dayEvents.map(event => {
    const [hours, minutes] = event.time.split(":").map(Number);
    const top = (hours - 6) * HOUR_HEIGHT + (minutes / 60) * HOUR_HEIGHT;
    const height = Math.max((event.duration || 30) / 60 * HOUR_HEIGHT, 30); // minimum height of 30px
    const member = members.find(m => m.id === event.kidId);

    return { event, top, height, member };
  });

  return (
    <div className="bg-white rounded-lg shadow-lg p-3 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4 md:mb-6">
        <button
          onClick={onBack}
          className="px-3 md:px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition text-sm md:text-base"
        >
          ← Back to Month
        </button>
        <div className="flex-1 text-center">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            {dateFormatter.format(dateObj)}
          </h2>
          {weather && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-2xl md:text-3xl">{weather.icon}</span>
              <span className="text-base md:text-lg font-semibold text-gray-700">
                {weather.temperature}°C
              </span>
              <span className="text-xs md:text-base text-gray-600">{weather.condition}</span>
            </div>
          )}
        </div>
        <div className="w-24"></div>
      </div>

      {/* Timeline */}
      <div className="border rounded-lg overflow-hidden">
        {/* Hour labels and timeline */}
        <div className="flex">
          {/* Time column */}
          <div className="w-12 md:w-20 bg-gray-100 border-r flex-shrink-0">
            {HOURS.map(hour => (
              <div
                key={hour}
                className="border-b text-xs md:text-sm font-semibold text-gray-600 text-center flex items-center justify-center"
                style={{ height: HOUR_HEIGHT }}
              >
                {isMobile ? hour : `${String(hour).padStart(2, "0")}:00`}
              </div>
            ))}
          </div>

          {/* Events column */}
          <div className="flex-1 relative bg-white min-h-96">
            {/* Hour dividers */}
            {HOURS.map(hour => (
              <div
                key={`line-${hour}`}
                className="border-b"
                style={{ height: HOUR_HEIGHT }}
              ></div>
            ))}

            {/* Events */}
            {eventPositions.length > 0 ? (
              <div className="absolute inset-0 w-full">
                {eventPositions.map(({ event, top, height, member }) => (
                  <div
                    key={event.id}
                    className="absolute left-1 right-1 md:left-2 md:right-2 rounded shadow-md p-1 md:p-2 text-white text-xs overflow-hidden hover:shadow-lg transition cursor-pointer group"
                    style={{
                      backgroundColor: member?.color || "#6366f1",
                      top: `${top}px`,
                      height: `${height}px`,
                    }}
                    onClick={() => onEditEvent(event)}
                  >
                    <div className="font-semibold truncate text-xs md:text-sm">{event.title}</div>
                    {!isMobile && <div className="text-xs opacity-90">
                      {event.time} ({event.duration}m)
                    </div>}
                    {member && (
                      <div className="text-xs opacity-90">{member.name}</div>
                    )}
                    {event.description && !isMobile && (
                      <div className="text-xs opacity-75 mt-1 truncate">
                        {event.description}
                      </div>
                    )}
                    
                    {/* Action buttons */}
                    <div className="absolute top-0.5 right-0.5 md:top-1 md:right-1 opacity-0 group-hover:opacity-100 transition flex gap-0.5 md:gap-1">
                      <button
                        className="bg-yellow-500 hover:bg-yellow-600 text-white rounded px-1 md:px-2 py-0.5 text-xs font-bold"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditEvent(event);
                        }}
                        title="Edit event"
                      >
                        ✏️
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white rounded px-1 md:px-2 py-0.5 text-xs font-bold"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteEvent(event.id);
                        }}
                        title="Delete event"
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-96">
                <p className="text-gray-500 text-base md:text-lg">No events scheduled for this day</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
