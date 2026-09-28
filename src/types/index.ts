export type UserRole = "admin" | "user";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string;
}

export interface RoomMember {
  email: string;
  role: UserRole;
  addedAt: string;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  createdBy: string; // user id of room creator
  createdByName?: string;
  members: Record<string, RoomMember>; // mapped by user email
  memberEmails: string[];
  createdAt: string;
}

export interface Booking {
  id: string;
  roomId: string;
  roomName?: string;
  description: string;
  startTime: string;
  endTime: string;
  createdBy: string; // user id
  creatorEmail: string;
  creatorName: string;
  participants: string[]; // array of user emails who joined
  createdAt: string;
}

export interface BookingFormData {
  roomId: string;
  description: string;
  startTime: string;
  endTime: string;
}

export interface RoomFormData {
  name: string;
  description: string;
}
