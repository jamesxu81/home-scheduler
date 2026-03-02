import { Event, FamilyMember } from "@/types";
import React, { useState } from "react";

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6am to 10pm
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOUR_HEIGHT = 60; // pixels per hour

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
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get all days in current week
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentWeek);
    d.setDate(currentWeek.getDate() + i);
    d.setHours(0, 0, 0, 0);
    return d;
  });

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
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setCurrentWeek(new Date(currentWeek.setDate(currentWeek.getDate() - 7)))} className="px-2 py-1 bg-gray-200 rounded">Prev</button>
        <div className="flex flex-col items-center">
          <span className="font-bold text-lg">Week of {days[0].toLocaleDateString()} - {days[6].toLocaleDateString()}</span>
          <button onClick={() => setCurrentWeek(getWeekStart(new Date()))} className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm">Today</button>
        </div>
        <button onClick={() => setCurrentWeek(new Date(currentWeek.setDate(currentWeek.getDate() + 7)))} className="px-2 py-1 bg-gray-200 rounded">Next</button>
      </div>
      
      <div className="overflow-x-auto">
        {/* Day Headers */}
        <div className="flex">
          <div className="w-16 border-r"></div>
          <div className="flex flex-1">
            {days.map((d, i) => {
              const isToday = d.getTime() === today.getTime();
              return (
                <div key={i} className={`flex-1 text-center font-bold py-2 border-r ${isToday ? 'bg-blue-100' : ''}`}>
                  {WEEKDAYS[i]}
                  <br />
                  <span className="text-sm">{d.toLocaleDateString()}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Time Grid */}
        <div className="flex border-t">
          {/* Time Column */}
          <div className="w-16 border-r">
            {HOURS.map(hour => (
              <div key={hour} className="border-b" style={{ height: HOUR_HEIGHT }}>
                <div className="text-right text-xs px-2 py-1">{hour}:00</div>
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="flex flex-1">
            {days.map((day, dayIdx) => {
              const isToday = day.getTime() === today.getTime();
              const eventPositions = getEventPositionsForDay(day);
              
              return (
                <div key={dayIdx} className={`flex-1 border-r relative ${isToday ? 'bg-blue-50' : ''}`}>
                  {/* Hour rows for click areas */}
                  {HOURS.map(hour => (
                    <div
                      key={hour}
                      className="border-b hover:bg-indigo-50 cursor-pointer transition"
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
                        className="absolute left-1 right-1 p-1 rounded text-white text-xs overflow-hidden"
                        style={{
                          top: `${top}px`,
                          height: `${Math.max(height, 30)}px`, // minimum height for visibility
                          backgroundColor: member?.color || '#6366f1',
                          opacity: 0.9,
                        }}
                        title={`${ev.title} • ${ev.time || '00:00'} (${ev.duration || 30}m)`}
                      >
                        <div className="font-semibold truncate">{ev.title}</div>
                        <div className="text-xs flex justify-between gap-1">
                          <span>{ev.time || '00:00'}</span>
                          <span>({ev.duration || 30}m)</span>
                        </div>
                        <div className="flex gap-1 mt-1">
                          <button
                            className="text-white hover:text-yellow-300 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditEvent(ev);
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            className="text-white hover:text-red-300 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteEvent(ev.id);
                            }}
                          >
                            ❌
                          </button>
                        </div>
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
