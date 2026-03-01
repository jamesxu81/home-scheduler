"use client";

import { Event, FamilyMember } from "@/types";

interface EventListProps {
  events: Event[];
  members: FamilyMember[];
  onDeleteEvent: (eventId: string) => void;
  onEditEvent: (event: Event) => void;
}

const categoryIcons: Record<string, string> = {
  school: "🎓",
  activities: "🎨",
  appointment: "⏰",
  other: "📅",
};

export default function EventList({
  events,
  members,
  onDeleteEvent,
  onEditEvent,
}: EventListProps) {
  const getMemberColor = (memberId: string) => {
    return members.find((m) => m.id === memberId)?.color || "#gray";
  };

  const getMemberName = (memberId: string) => {
    return members.find((m) => m.id === memberId)?.name || "Unknown";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <p className="text-gray-600 text-lg">No events scheduled yet.</p>
        <p className="text-gray-500">Add an event to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div
          key={event.id}
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
        >
          <div className="flex">
            <div
              className="w-1 "
              style={{ backgroundColor: getMemberColor(event.kidId) }}
            />
            <div className="p-4 flex-1">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">
                      {categoryIcons[event.category] || "📅"}
                    </span>
                    <h3 className="text-xl font-bold text-gray-800">
                      {event.title}
                    </h3>
                  </div>
                  {event.description && (
                    <p className="text-gray-600 mb-2">{event.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span>📍 {getMemberName(event.kidId)}</span>
                    <span>📅 {formatDate(event.date)}</span>
                    <span>🕐 {event.time}</span>
                    {event.reminder && (
                      <span className="text-blue-600 font-semibold">🔔 Reminder set</span>
                    )}
                  </div>
                </div>
                <div className="ml-4 flex gap-2">
                  <button
                    onClick={() => onEditEvent(event)}
                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded transition"
                    title="Edit event"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onDeleteEvent(event.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition"
                    title="Delete event"
                  >
                    ❌
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
