"use client";

import { useState, useEffect } from "react";
import EventForm from "@/components/EventForm";
import EventList from "@/components/EventList";
import FamilyMembers from "@/components/FamilyMembers";
import { Event, FamilyMember } from "@/types";

const defaultMembers: FamilyMember[] = [
  { id: "1", name: "Alice", age: 8, color: "#ff6b6b" },
  { id: "2", name: "Bob", age: 10, color: "#4ecdc4" },
  { id: "3", name: "Charlie", age: 12, color: "#45b7d1" },
];

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>(defaultMembers);
  const [showForm, setShowForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  // Load data from localStorage
  useEffect(() => {
    const savedEvents = localStorage.getItem("familyEvents");
    const savedMembers = localStorage.getItem("familyMembers");

    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
    if (savedMembers) {
      setMembers(JSON.parse(savedMembers));
    }
  }, []);

  // Save events to localStorage
  useEffect(() => {
    localStorage.setItem("familyEvents", JSON.stringify(events));
  }, [events]);

  // Save members to localStorage
  useEffect(() => {
    localStorage.setItem("familyMembers", JSON.stringify(members));
  }, [members]);

  const handleAddEvent = (event: Omit<Event, "id">) => {
    const newEvent: Event = {
      ...event,
      id: Math.random().toString(36).substr(2, 9),
    };
    setEvents([...events, newEvent]);
    setShowForm(false);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter((e) => e.id !== eventId));
  };

  const handleAddMember = (name: string, age?: number) => {
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
    const newMember: FamilyMember = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      age,
      color: colors[members.length % colors.length],
    };
    setMembers([...members, newMember]);
  };

  const handleDeleteMember = (memberId: string) => {
    setMembers(members.filter((m) => m.id !== memberId));
    // Remove events for deleted member
    setEvents(events.filter((e) => e.kid !== memberId));
  };

  const filteredEvents = selectedMember
    ? events.filter((e) => e.kid === selectedMember)
    : events;

  const sortedEvents = [...filteredEvents].sort(
    (a, b) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime()
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-4xl font-bold text-gray-800">👨‍👩‍👧‍👦 Family Scheduler</h1>
          <p className="text-gray-600 mt-2">Manage family events and kids activities</p>
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedMember
                  ? `Events for ${members.find((m) => m.id === selectedMember)?.name}`
                  : "All Events"}
              </h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                {showForm ? "Cancel" : "+ Add Event"}
              </button>
            </div>

            {showForm && (
              <EventForm
                members={members}
                onAddEvent={handleAddEvent}
                onCancel={() => setShowForm(false)}
              />
            )}

            <EventList
              events={sortedEvents}
              members={members}
              onDeleteEvent={handleDeleteEvent}
            />
          </div>
        </div>
      </main>

      <footer className="bg-white shadow-lg mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-gray-600">
            © 2026 Family Scheduler. Share this with your family to manage events together!
          </p>
        </div>
      </footer>
    </div>
  );
}
