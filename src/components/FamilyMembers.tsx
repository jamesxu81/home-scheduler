"use client";

import { useState } from "react";
import { FamilyMember } from "@/types";

interface FamilyMembersProps {
  members: FamilyMember[];
  selectedMember: string | null;
  onSelectMember: (memberId: string | null) => void;
  onAddMember: (name: string, age?: number) => void;
  onDeleteMember: (memberId: string) => void;
}

export default function FamilyMembers({
  members,
  selectedMember,
  onSelectMember,
  onAddMember,
  onDeleteMember,
}: FamilyMembersProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddMember(name, age ? parseInt(age) : undefined);
      setName("");
      setAge("");
      setShowForm(false);
    }
  };

  return (
    <div className="sticky top-8">
      <div className="bg-white rounded-lg shadow-lg p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Family Members</h2>

        <button
          onClick={() => onSelectMember(null)}
          className={`w-full text-left px-4 py-2 rounded-lg mb-2 transition ${
            selectedMember === null
              ? "bg-indigo-600 text-white"
              : "hover:bg-gray-100"
          }`}
        >
          👁️ All Events
        </button>

        <div className="space-y-2 mb-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <button
                onClick={() => onSelectMember(member.id)}
                className={`flex-1 text-left px-3 py-2 rounded-lg transition ${
                  selectedMember === member.id
                    ? "bg-indigo-600 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: member.color }}
                  />
                  <span className="font-medium">
                    {member.name}
                    {member.age && <span className="text-sm"> ({member.age})</span>}
                  </span>
                </div>
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete ${member.name}?`)) {
                    onDeleteMember(member.id);
                  }
                }}
                className="text-red-500 hover:text-red-700 p-1"
                title="Delete member"
              >
                ❌
              </button>
            </div>
          ))}
        </div>

        {showForm ? (
          <form onSubmit={handleAddMember} className="bg-gray-50 p-3 rounded-lg">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="w-full px-2 py-1 border border-gray-300 rounded mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              required
            />
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Age (optional)"
              className="w-full px-2 py-1 border border-gray-300 rounded mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              min="1"
              max="18"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-1 rounded text-sm font-semibold transition"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setName("");
                  setAge("");
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 py-1 rounded text-sm font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-3 rounded-lg transition"
          >
            + Add Family Member
          </button>
        )}
      </div>
    </div>
  );
}
