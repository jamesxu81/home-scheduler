"use client";

import { Event, FamilyMember } from "@/types";
import { useState, useEffect } from "react";
import { fetchWeather, WeatherData, getMonthWeatherFromCache, cacheMonthWeather, recordMonthFetchTime, shouldFetchMonthWeather } from "@/lib/weather";

interface EventListProps {
  events: Event[];
  members: FamilyMember[];
  onDeleteEvent: (eventId: string) => void;
  onEditEvent: (event: Event) => void;
}

interface WeatherCache {
  [date: string]: WeatherData | null;
}

const categoryIcons: Record<string, string> = {
  school: "🎓",
  activities: "🎨",
  appointment: "⏰",
  other: "📅",
};

const categoryBgColors: Record<string, string> = {
  school: "bg-blue-50 border-blue-200",
  activities: "bg-purple-50 border-purple-200",
  appointment: "bg-orange-50 border-orange-200",
  other: "bg-gray-50 border-gray-200",
};

type DateGroup = "overdue" | "today" | "tomorrow" | "upcoming" | "far-future";

interface GroupedEvent {
  group: DateGroup;
  events: Event[];
  date: string;
}

export default function EventList({
  events,
  members,
  onDeleteEvent,
  onEditEvent,
}: EventListProps) {
  const [weatherData, setWeatherData] = useState<WeatherCache>({});

  // Fetch weather for unique dates in events
  useEffect(() => {
    const fetchWeatherForDates = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      // Check if we have cached weather for the current month
      const cachedMonthWeather = getMonthWeatherFromCache(currentYear, currentMonth);
      if (cachedMonthWeather) {
        // Use cached month weather
        setWeatherData(cachedMonthWeather);
        return;
      }

      // If not cached, fetch weather for unique dates from events
      const uniqueDates = [...new Set(events.map((e) => e.date))];
      const newWeatherData: WeatherCache = {};

      for (const date of uniqueDates) {
        try {
          const weather = await fetchWeather(date);
          newWeatherData[date] = weather;
        } catch (error) {
          console.error(`Error fetching weather for ${date}:`, error);
          newWeatherData[date] = null;
        }
      }

      setWeatherData(newWeatherData);
      
      // Cache the month weather for future use
      if (shouldFetchMonthWeather(currentYear, currentMonth)) {
        cacheMonthWeather(currentYear, currentMonth, newWeatherData);
        recordMonthFetchTime(currentYear, currentMonth);
      }
    };

    if (events.length > 0) {
      fetchWeatherForDates();
    }
  }, [events]);
  const getMemberColor = (memberId: string) => {
    return members.find((m) => m.id === memberId)?.color || "#999999";
  };

  const getMemberName = (memberId: string) => {
    return members.find((m) => m.id === memberId)?.name || "Unknown";
  };

  const getMemberInitials = (memberId: string) => {
    const name = getMemberName(memberId);
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getWeatherForDate = (date: string): WeatherData | null => {
    const weather = weatherData[date];
    if (!weather) {
      return null;
    }
    return weather as WeatherData;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getDateGroup = (dateString: string): { group: DateGroup; label: string } => {
    const eventDate = new Date(dateString + "T00:00:00");
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    if (eventDate < today) {
      return { group: "overdue", label: "Overdue" };
    } else if (eventDate.getTime() === today.getTime()) {
      return { group: "today", label: "Today" };
    } else if (eventDate.getTime() === tomorrow.getTime()) {
      return { group: "tomorrow", label: "Tomorrow" };
    } else if (eventDate < weekFromNow) {
      return { group: "upcoming", label: "This Week" };
    } else {
      return { group: "far-future", label: "Later" };
    }
  };

  const getRelativeTime = (dateString: string): string => {
    const eventDate = new Date(dateString + "T00:00:00");
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} ago`;
    } else if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Tomorrow";
    } else if (diffDays < 7) {
      return `In ${diffDays} days`;
    } else {
      return `In ${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) !== 1 ? 's' : ''}`;
    }
  };

  const groupEventsByDate = (): GroupedEvent[] => {
    const groups: Map<DateGroup, Map<string, Event[]>> = new Map();
    const groupOrder: DateGroup[] = ["today", "tomorrow", "upcoming", "far-future", "overdue"];

    // Initialize groups
    groupOrder.forEach((g) => {
      groups.set(g, new Map());
    });

    // Sort events and group them
    events.forEach((event) => {
      const { group } = getDateGroup(event.date);
      const dateMap = groups.get(group) || new Map();
      const eventList = dateMap.get(event.date) || [];
      eventList.push(event);
      dateMap.set(event.date, eventList);
      groups.set(group, dateMap);
    });

    // Flatten and sort by date within each group
    const result: GroupedEvent[] = [];
    groupOrder.forEach((group) => {
      const dateMap = groups.get(group);
      if (dateMap && dateMap.size > 0) {
        Array.from(dateMap.entries())
          .sort((a, b) => {
            const aDate = new Date(a[0] + "T00:00:00");
            const bDate = new Date(b[0] + "T00:00:00");
            return group === "overdue" 
              ? bDate.getTime() - aDate.getTime()
              : aDate.getTime() - bDate.getTime();
          })
          .forEach(([date, eventList]) => {
            result.push({
              group,
              date,
              events: eventList.sort(
                (a, b) =>
                  new Date(`${a.date} ${a.time}`).getTime() -
                  new Date(`${b.date} ${b.time}`).getTime()
              ),
            });
          });
      }
    });

    return result;
  };

  const groupedEvents = groupEventsByDate();

  const getGroupLabel = (group: DateGroup, date: string): string => {
    const { label } = getDateGroup(date);
    return label;
  };

  const getGroupColor = (group: DateGroup): string => {
    switch (group) {
      case "overdue":
        return "text-red-700 bg-red-50 border-red-200";
      case "today":
        return "text-green-700 bg-green-50 border-green-200";
      case "tomorrow":
        return "text-blue-700 bg-blue-50 border-blue-200";
      case "upcoming":
        return "text-purple-700 bg-purple-50 border-purple-200";
      case "far-future":
        return "text-gray-700 bg-gray-50 border-gray-200";
      default:
        return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center border border-gray-200">
        <p className="text-xl text-gray-600 font-semibold">📭 No events scheduled</p>
        <p className="text-gray-500 mt-2">Add an event to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groupedEvents.map((group, groupIdx) => {
        const weather = getWeatherForDate(group.date);
        return (
          <div key={groupIdx} className="space-y-3">
            {/* Date Group Header with Weather */}
            <div className={`sticky top-0 z-10 border-l-4 ${getGroupColor(group.group)} rounded px-4 py-3 font-semibold text-sm uppercase tracking-wide`}>
              <div className="flex justify-between items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <span>{getGroupLabel(group.group, group.date)}</span>
                  <div className="text-xs font-normal">{formatFullDate(group.date)}</div>
                </div>
                
                {/* Weather Info */}
                {weather && (
                  <div className="flex items-center gap-2 bg-white bg-opacity-70 rounded-lg px-3 py-2 text-xs whitespace-nowrap border border-gray-200 shadow-sm">
                    <span className="text-2xl">{weather.icon}</span>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-gray-800">{weather.temperature}°C</span>
                      <span className="text-gray-600 text-xs capitalize">{weather.condition}</span>
                    </div>
                  </div>
                )}
                {weatherData[group.date] === "loading" && (
                  <div className="text-xs text-gray-500 animate-pulse">Loading weather...</div>
                )}
              </div>
            </div>

            {/* Events in this group */}
            <div className="space-y-3">
              {group.events.map((event) => (
                <div
                  key={event.id}
                  className={`bg-white rounded-lg border-2 hover:shadow-md transition-all duration-200 overflow-hidden ${
                    categoryBgColors[event.category] || "border-gray-200 bg-white"
                  } ${group.group === "overdue" ? "opacity-75" : ""}`}
                >
                  <div className="flex items-stretch">
                    {/* Left accent bar */}
                    <div
                      className="w-1.5 flex-shrink-0"
                      style={{ backgroundColor: getMemberColor(event.kidId) }}
                    />

                    {/* Main content */}
                    <div className="p-4 flex-1 flex justify-between gap-4 items-start">
                      {/* Left side - content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-3">
                          {/* Category Icon & Title */}
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-2xl flex-shrink-0">
                              {categoryIcons[event.category] || "📅"}
                            </span>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-gray-800 truncate">
                                {event.title}
                              </h3>
                            </div>
                          </div>

                          {/* Status badges */}
                          <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
                            {event.reminder && (
                              <span
                                className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700"
                                title="Reminder set"
                              >
                                🔔
                              </span>
                            )}
                            {event.repeatType && event.repeatType !== "NONE" && (
                              <span
                                className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-purple-100 text-purple-700"
                                title={`Repeats ${event.repeatType.toLowerCase()}`}
                              >
                                🔄
                              </span>
                            )}
                            {group.group === "overdue" && (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-700">
                                ⏰
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        {event.description && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {event.description}
                          </p>
                        )}

                        {/* Event details grid */}
                        <div className="flex flex-wrap gap-4 text-sm">
                          {/* Time */}
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🕐</span>
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-800">
                                {event.time}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDuration(event.duration)}
                              </span>
                            </div>
                          </div>

                          {/* Member Avatar */}
                          <div className="flex items-center gap-2">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                              style={{ backgroundColor: getMemberColor(event.kidId) }}
                              title={getMemberName(event.kidId)}
                            >
                              {getMemberInitials(event.kidId)}
                            </div>
                            <span className="text-gray-700 font-medium">
                              {getMemberName(event.kidId)}
                            </span>
                          </div>

                          {/* Relative time */}
                          <div className="flex items-center gap-2 ml-auto">
                            <span className="text-lg">📆</span>
                            <span className="text-gray-600 text-xs font-semibold">
                              {getRelativeTime(event.date)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right side - actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => onEditEvent(event)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                          title="Edit event"
                          aria-label="Edit event"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => onDeleteEvent(event.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          title="Delete event"
                          aria-label="Delete event"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
