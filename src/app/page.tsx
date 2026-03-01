"use client";

import { useState, useEffect } from "react";
import EventForm from "@/components/EventForm";
import EventList from "@/components/EventList";
import FamilyMembers from "@/components/FamilyMembers";
import { Event, FamilyMember, Family } from "@/types";
import { familyAPI, membersAPI, eventsAPI } from "@/lib/api";
import { expandRecurringEvents } from "@/lib/recurring";
import Calendar from "@/components/Calendar";
import WeeklyCalendar from "@/components/WeeklyCalendar";

export default function Home() {
  const [family, setFamily] = useState<Family | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [familyCode, setFamilyCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [viewType, setViewType] = useState<"list" | "calendar" | "weekly">("list");
  const [prefilledDate, setPrefilledDate] = useState<string | null>(null);
  const [prefilledTime, setPrefilledTime] = useState<string | null>(null);

  // Load family data on mount
  useEffect(() => {
    const loadFamily = async () => {
      const storedFamilyId = localStorage.getItem("familyId");
      console.log("Loading family with ID:", storedFamilyId);

      try {
        if (storedFamilyId) {
          console.log("Fetching family data...");
          const familyData = await familyAPI.get(storedFamilyId);
          console.log("Family data loaded:", familyData);
          setFamily(familyData);
          setMembers(familyData.members);
          setEvents(familyData.events);
        } else {
          console.log("No stored family ID, showing setup");
          setShowSetup(true);
        }
      } catch (error) {
        console.error("Error loading family:", error);
        // If fetch fails, show setup screen
        setShowSetup(true);
      } finally {
        setLoading(false);
      }
    };

    loadFamily();
  }, []);

  const handleCreateFamily = async () => {
    try {
      const newFamily = await familyAPI.create();
      setFamily(newFamily);
      setMembers(newFamily.members);
      setEvents(newFamily.events);
      localStorage.setItem("familyId", newFamily.id);
      setFamilyCode(newFamily.code);
      setShowSetup(false);
    } catch (error) {
      alert("Error creating family");
      console.error(error);
    }
  };

  const handleJoinFamily = async () => {
    if (!joinCode.trim()) {
      alert("Please enter a family code");
      return;
    }

    try {
      const familyData = await familyAPI.getByCode(joinCode.toUpperCase());
      setFamily(familyData);
      setMembers(familyData.members);
      setEvents(familyData.events);
      localStorage.setItem("familyId", familyData.id);
      setShowSetup(false);
      setJoinCode("");
    } catch (error) {
      alert("Family code not found");
      console.error(error);
    }
  };

  const handleAddEvent = async (eventData: any) => {
    if (!family) return;

    try {
      const newEvent = await eventsAPI.add(family.id, {
        ...eventData,
        kidId: eventData.kid,
        title: eventData.title,
        description: eventData.description || null,
        date: eventData.date,
        time: eventData.time,
        category: eventData.category,
        reminder: eventData.reminder,
      });
      setEvents([...events, newEvent]);
      setShowForm(false);
    } catch (error) {
      alert("Error adding event");
      console.error(error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      // Expanded IDs have format: originalId::YYYY-MM-DD
      if (eventId.includes('::')) {
        const separatorIndex = eventId.indexOf('::');
        const originalId = eventId.substring(0, separatorIndex);
        await eventsAPI.delete(originalId);
        // Refetch events after update
        const familyId = family?.id;
        if (familyId) {
          const updatedEvents = await eventsAPI.getAll(familyId);
          setEvents(updatedEvents);
        }
      } else {
        await eventsAPI.delete(eventId);
        setEvents(events.filter((e) => e.id !== eventId));
      }
    } catch (error) {
      alert("Error deleting event");
      console.error(error);
    }
  };

  const handleEditEvent = (event: Event) => {
    // Extract original ID if this is an expanded recurring event (format: originalId::date)
    const originalId = event.id.includes('::') ? event.id.substring(0, event.id.indexOf('::')) : event.id;
    const originalEvent = events.find((e) => e.id === originalId);
    
    if (originalEvent) {
      setEditingEvent(originalEvent);
      setShowForm(true);
    }
  };

  const handleUpdateEvent = async (eventId: string, eventData: any) => {
    try {
      const updatedEvent = await eventsAPI.update(eventId, {
        ...eventData,
        kidId: eventData.kid,
        title: eventData.title,
        description: eventData.description || null,
        date: eventData.date,
        time: eventData.time,
        category: eventData.category,
        reminder: eventData.reminder,
      });
      setEvents(events.map((e) => (e.id === eventId ? updatedEvent : e)));
      setEditingEvent(null);
      setShowForm(false);
    } catch (error) {
      alert("Error updating event");
      console.error(error);
    }
  };

  const handleAddMember = async (name: string, age?: number) => {
    if (!family) return;

    const colors = [
      "#ff6b6b",
      "#4ecdc4",
      "#45b7d1",
      "#f9ca24",
      "#6c5ce7",
      "#a29bfe",
      "#fd79a8",
      "#fdcb6e",
    ];

    try {
      const color = colors[members.length % colors.length];
      const newMember = await membersAPI.add(family.id, name, age, color);
      setMembers([...members, newMember]);
    } catch (error) {
      alert("Error adding member");
      console.error(error);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    try {
      await membersAPI.delete(memberId);
      setMembers(members.filter((m) => m.id !== memberId));
      // Remove events for deleted member
      const memberEvents = events.filter((e) => e.kidId === memberId);
      for (const event of memberEvents) {
        await eventsAPI.delete(event.id);
      }
      setEvents(events.filter((e) => e.kidId !== memberId));
    } catch (error) {
      alert("Error deleting member");
      console.error(error);
    }
  };

  const handleCalendarSlotClick = (date: string, time: string) => {
    setEditingEvent(null);
    setPrefilledDate(date);
    setPrefilledTime(time);
    setShowForm(true);
  };

  const filteredEvents = selectedMember
    ? events.filter((e) => e.kidId === selectedMember)
    : events;

  const expandedEvents = expandRecurringEvents(filteredEvents);

  const sortedEvents = [...expandedEvents].sort(
    (a, b) =>
      new Date(`${a.date} ${a.time}`).getTime() -
      new Date(`${b.date} ${b.time}`).getTime()
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (showSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">👨‍👩‍👧‍👦 Kimberly's Scheduler</h1>

          {familyCode || family ? (
            <div className="space-y-4">
              <p className="text-gray-700 mb-4">Your family code:</p>
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                <p className="text-3xl font-bold text-blue-600 text-center font-mono">
                  {familyCode || family?.code}
                </p>
              </div>
              <p className="text-gray-600 text-sm">
                Share this code with family members so they can join your family
                scheduler!
              </p>
              <button
                onClick={() => {
                  setShowSetup(false);
                  setFamilyCode("");
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                Continue
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <button
                onClick={handleCreateFamily}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition"
              >
                Create New Family
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter family code"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  maxLength={6}
                />
                <button
                  onClick={handleJoinFamily}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                  Join Family
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-800">👨‍👩‍👧‍👦 Kimberly's Scheduler</h1>
              <p className="text-gray-600 mt-2">Manage family events and kids activities</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Family Code:</p>
              <p className="text-2xl font-bold text-indigo-600">{family?.code}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <FamilyMembers
              members={members}
              selectedMember={selectedMember}
              onSelectMember={setSelectedMember}
              onAddMember={handleAddMember}
              onDeleteMember={handleDeleteMember}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedMember
                  ? `Events for ${members.find((m) => m.id === selectedMember)?.name}`
                  : "All Events"}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewType("list")}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    viewType === "list"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  📋 List
                </button>
                <button
                  onClick={() => setViewType("calendar")}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    viewType === "calendar"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  📅 Month
                </button>
                <button
                  onClick={() => setViewType("weekly")}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    viewType === "weekly"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  🗓️ Week
                </button>
              </div>
              {!showForm && (
                <button
                  onClick={() => {
                    setEditingEvent(null);
                    setShowForm(true);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                  + Add Event
                </button>
              )}
            </div>

            {showForm && (
              <EventForm
                members={members}
                onAddEvent={handleAddEvent}
                onUpdateEvent={handleUpdateEvent}
                onCancel={() => {
                  setShowForm(false);
                  setEditingEvent(null);
                  setPrefilledDate(null);
                  setPrefilledTime(null);
                }}
                initialEvent={editingEvent || undefined}
                prefilledDate={prefilledDate}
                prefilledTime={prefilledTime}
              />
            )}

            {viewType === "calendar" ? (
              <Calendar
                events={filteredEvents}
                members={members}
                onEditEvent={handleEditEvent}
                onDeleteEvent={handleDeleteEvent}
              />
            ) : viewType === "weekly" ? (
              <WeeklyCalendar
                events={filteredEvents}
                members={members}
                onEditEvent={handleEditEvent}
                onDeleteEvent={handleDeleteEvent}
                onAddEvent={handleCalendarSlotClick}
              />
            ) : (
              <EventList
                events={sortedEvents}
                members={members}
                onDeleteEvent={handleDeleteEvent}
                onEditEvent={handleEditEvent}
              />
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white shadow-lg mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-gray-600">
            © 2026 Kimberly's Scheduler. Share this with your family to manage events together!
          </p>
        </div>
      </footer>
    </div>
  );
}
