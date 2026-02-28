"use client";

import { useState } from "react";
import { Event, FamilyMember } from "@/types";

interface EventFormProps {
  members: FamilyMember[];
  onAddEvent: (event: Omit<Event, "id">) => void;
  onCancel: () => void;
}

export default function EventForm({ members, onAddEvent, onCancel }: EventFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    kid: members[0]?.id || "",
    category: "other" as const,
    reminder: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.date && formData.time && formData.kid) {
      onAddEvent(formData);
      setFormData({
        title: "",
        description: "",
        date: "",
        time: "",
        kid: members[0]?.id || "",
        category: "other",
        reminder: false,
      });
    } else {
      alert("Please fill in all required fields");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-lg p-6 mb-6"
    >
      <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Event</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Event Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
            placeholder="e.g., Soccer Practice"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Kid *
          </label>
          <select
            name="kid"
            value={formData.kid}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
            required
          >
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Date *
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Time *
          </label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            <option value="school">School</option>
            <option value="activities">Activities</option>
            <option value="appointment">Appointment</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="flex items-center pt-8">
          <input
            type="checkbox"
            name="reminder"
            id="reminder"
            checked={formData.reminder}
            onChange={handleChange}
            className="mr-2 w-4 h-4"
          />
          <label htmlFor="reminder" className="text-gray-700">
            Set reminder
          </label>
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-gray-700 font-semibold mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
          rows={3}
          placeholder="Add any additional details..."
        />
      </div>

      <div className="flex gap-4 mt-6">
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition"
        >
          Add Event
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-lg transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
