"use client";

import { useState, useEffect } from "react";
import { Event, FamilyMember } from "@/types";

interface EventFormProps {
  members: FamilyMember[];
  onAddEvent: (event: any) => void;
  onUpdateEvent?: (eventId: string, event: any) => void;
  onCancel: () => void;
  initialEvent?: Event;
  prefilledDate?: string | null;
  prefilledTime?: string | null;
}

export default function EventForm({ members, onAddEvent, onUpdateEvent, onCancel, initialEvent, prefilledDate, prefilledTime }: EventFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: prefilledDate || "",
    time: prefilledTime || "",
    kid: members[0]?.id || "",
    category: "other" as const,
    reminder: false,
    repeatType: "NONE" as const,
    repeatUntil: "",
  });

  useEffect(() => {
    if (initialEvent) {
      setFormData({
        title: initialEvent.title,
        description: initialEvent.description || "",
        date: initialEvent.date,
        time: initialEvent.time,
        kid: initialEvent.kidId,
        category: initialEvent.category as typeof formData.category,
        reminder: initialEvent.reminder || false,
        repeatType: initialEvent.repeatType as typeof formData.repeatType,
        repeatUntil: initialEvent.repeatUntil || "",
      });
    } else if (prefilledDate || prefilledTime) {
      setFormData((prev) => ({
        ...prev,
        date: prefilledDate || prev.date,
        time: prefilledTime || prev.time,
      }));
    }
  }, [initialEvent, prefilledDate, prefilledTime]);

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
      if (initialEvent && onUpdateEvent) {
        onUpdateEvent(initialEvent.id, formData);
      } else {
        onAddEvent(formData);
      }
      setFormData({
        title: "",
        description: "",
        date: "",
        time: "",
        kid: members[0]?.id || "",
        category: "other",
        reminder: false,
        repeatType: "NONE",
        repeatUntil: "",
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
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        {initialEvent ? "Edit Event" : "Add New Event"}
      </h3>

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

        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Repeat
          </label>
          <select
            name="repeatType"
            value={formData.repeatType}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
              <option value="NONE">No Repeat</option>
              <option value="DAILY">Daily</option>
              <option value="WEEKDAYS">Weekdays (Mon-Fri)</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
          </select>
        </div>

        {formData.repeatType !== "NONE" && (
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Repeat Until (Optional)
            </label>
            <input
              type="date"
              name="repeatUntil"
              value={formData.repeatUntil}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              min={formData.date}
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty for unlimited repetition</p>
          </div>
        )}
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
          {initialEvent ? "Update Event" : "Add Event"}
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
