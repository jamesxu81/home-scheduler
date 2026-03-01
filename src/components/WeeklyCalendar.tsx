import { Event, FamilyMember } from "@/types";
import React, { useState } from "react";

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6am to 10pm
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getWeekStart(date: Date) {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
  return new Date(date.setDate(diff));
}

export default function WeeklyCalendar({ events, members, onEditEvent, onDeleteEvent, onAddEvent }: {
  events: Event[];
  members: FamilyMember[];
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (eventId: string) => void;
  onAddEvent?: (date: string, time: string) => void;
}) {
  const [currentWeek, setCurrentWeek] = useState(getWeekStart(new Date()));

  // Get all days in current week
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentWeek);
    d.setDate(currentWeek.getDate() + i);
    return d;
  });

  // Map events to each day/hour
  function eventsForDayHour(day: Date, hour: number) {
    const dayDateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
    return events.filter(e => {
      // Check if date matches
      if (e.date !== dayDateStr) return false;
      
      // Check if hour matches (handle missing time as 00:00)
      const timeStr = e.time || "00:00";
      const [eventHour] = timeStr.split(":").map(Number);
      return eventHour === hour;
    });
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setCurrentWeek(new Date(currentWeek.setDate(currentWeek.getDate() - 7)))} className="px-2 py-1 bg-gray-200 rounded">Prev</button>
        <span className="font-bold text-lg">Week of {days[0].toLocaleDateString()} - {days[6].toLocaleDateString()}</span>
        <button onClick={() => setCurrentWeek(new Date(currentWeek.setDate(currentWeek.getDate() + 7)))} className="px-2 py-1 bg-gray-200 rounded">Next</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="border px-2 py-1 w-16">Time</th>
              {days.map((d, i) => (
                <th key={i} className="border px-2 py-1 w-32 text-center">
                  {WEEKDAYS[i]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map(hour => (
              <tr key={hour}>
                <td className="border px-2 py-1 text-right align-top text-xs">{hour}:00</td>
                {days.map((day, i) => (
                  <td 
                    key={i} 
                    className="border px-1 py-1 align-top h-12 cursor-pointer hover:bg-indigo-50 transition"
                    onClick={() => {
                      if (onAddEvent) {
                        const dateStr = day.toISOString().split('T')[0];
                        const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                        onAddEvent(dateStr, timeStr);
                      }
                    }}
                  >
                    {eventsForDayHour(day, hour).map(ev => {
                      const member = members.find(m => m.id === ev.kidId);
                      return (
                        <div key={ev.id} className="mb-1 p-1 rounded bg-indigo-100 border-l-4" style={{ borderColor: member?.color || '#6366f1' }}>
                          <span className="font-semibold text-xs" style={{ color: member?.color }}>{ev.title}</span>
                          <button className="ml-1 text-xs text-gray-500 hover:text-indigo-600" onClick={() => onEditEvent(ev)}>✏️</button>
                          <button className="ml-1 text-xs text-gray-500 hover:text-red-600" onClick={() => onDeleteEvent(ev.id)}>❌</button>
                        </div>
                      );
                    })}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
