export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  kid: string;
  category: "school" | "activities" | "appointment" | "other";
  color?: string;
  reminder?: boolean;
}

export interface FamilyMember {
  id: string;
  name: string;
  age?: number;
  color: string;
}
