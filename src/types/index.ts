export interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string;
  kidId: string;
  category: string;
  reminder: boolean;
  familyId: string;
  repeatType?: string;
  repeatUntil?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FamilyMember {
  id: string;
  name: string;
  age: number | null;
  color: string;
  photo?: string; // Base64 encoded photo
  familyId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Family {
  id: string;
  code: string;
  members: FamilyMember[];
  events: Event[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  kid: string;
  category: "school" | "activities" | "appointment" | "other";
  reminder: boolean;
}
