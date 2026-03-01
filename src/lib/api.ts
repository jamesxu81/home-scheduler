import { Event, FamilyMember, Family } from "@/types";

// Family API calls
export const familyAPI = {
  create: async (): Promise<Family> => {
    const response = await fetch("/api/family", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create" }),
    });
    if (!response.ok) throw new Error("Failed to create family");
    return response.json();
  },

  join: async (code: string): Promise<Family> => {
    const response = await fetch("/api/family", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "join", code }),
    });
    if (!response.ok) throw new Error("Failed to join family");
    return response.json();
  },

  get: async (familyId: string): Promise<Family> => {
    const response = await fetch(`/api/family?familyId=${familyId}`);
    if (!response.ok) throw new Error("Failed to get family");
    return response.json();
  },

  getByCode: async (code: string): Promise<Family> => {
    const response = await fetch(`/api/family?code=${code}`);
    if (!response.ok) throw new Error("Failed to get family");
    return response.json();
  },
};

// Members API calls
export const membersAPI = {
  add: async (
    familyId: string,
    name: string,
    age: number | undefined,
    color: string
  ): Promise<FamilyMember> => {
    const response = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ familyId, name, age, color }),
    });
    if (!response.ok) throw new Error("Failed to add member");
    return response.json();
  },

  delete: async (memberId: string): Promise<void> => {
    const response = await fetch(`/api/members?memberId=${memberId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete member");
  },

  update: async (
    memberId: string,
    name: string,
    age: number | undefined,
    color: string
  ): Promise<FamilyMember> => {
    const response = await fetch("/api/members", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId, name, age, color }),
    });
    if (!response.ok) throw new Error("Failed to update member");
    return response.json();
  },
};

// Events API calls
export const eventsAPI = {
  add: async (
    familyId: string,
    event: Omit<Event, "id" | "familyId" | "createdAt" | "updatedAt">
  ): Promise<Event> => {
    const response = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ familyId, ...event }),
    });
    if (!response.ok) throw new Error("Failed to add event");
    return response.json();
  },

  getAll: async (familyId: string): Promise<Event[]> => {
    const response = await fetch(`/api/events?familyId=${familyId}`);
    if (!response.ok) throw new Error("Failed to get events");
    return response.json();
  },

  update: async (
    eventId: string,
    event: Omit<Event, "id" | "familyId" | "createdAt" | "updatedAt">
  ): Promise<Event> => {
    const response = await fetch("/api/events", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, ...event }),
    });
    if (!response.ok) throw new Error("Failed to update event");
    return response.json();
  },

  delete: async (eventId: string): Promise<void> => {
    const response = await fetch(`/api/events?eventId=${eventId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete event");
  },
};
