import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  deleteField,
  doc,
  FieldPath,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import type { Room, RoomFormData, UserProfile, UserRole } from "../types";
import { db } from "../firebase";

export async function createRoom(
  { name, description }: RoomFormData,
  currentUser: UserProfile,
): Promise<Room> {
  const roomRef = doc(collection(db, "rooms"));

  const now = new Date().toISOString();

  const newRoom: Room = {
    id: roomRef.id,
    name,
    description,
    createdBy: currentUser.uid,
    createdByName: currentUser.displayName,
    members: {
      [currentUser.email]: {
        email: currentUser.email,
        role: "admin",
        addedAt: now,
      },
    },
    memberEmails: [currentUser.email],
    createdAt: now,
  };

  await setDoc(roomRef, newRoom);
  return newRoom;
}

export async function updateRoom(
  roomId: string,
  { name, description }: RoomFormData,
) {
  const roomRef = doc(db, "rooms", roomId);

  await updateDoc(roomRef, {
    name: name.trim(),
    description: description.trim(),
  });
}

export async function deleteRoom(roomId: string) {
  const roomRef = doc(db, "rooms", roomId);

  await deleteDoc(roomRef);
}

export interface RoomMemberParams {
  roomId: string;
  email: string;
  role: UserRole;
}

export async function addRoomMember({ roomId, email, role }: RoomMemberParams) {
  const roomRef = doc(db, "rooms", roomId);

  await updateDoc(
    roomRef,
    new FieldPath("members", email),
    {
      email,
      role,
      addedAt: new Date().toISOString(),
    },
    "memberEmails",
    arrayUnion(email),
  );
}

export interface RemoveRoomMemberParams {
  roomId: string;
  email: string;
}

export async function removeRoomMember({
  roomId,
  email,
}: RemoveRoomMemberParams) {
  const roomRef = doc(db, "rooms", roomId);

  await updateDoc(
    roomRef,
    new FieldPath("members", email),
    deleteField(),
    "memberEmails",
    arrayRemove(email),
  );
}

export async function updateRoomMemberRole({
  roomId,
  email,
  role,
}: RoomMemberParams) {
  const roomRef = doc(db, "rooms", roomId);

  await updateDoc(roomRef, new FieldPath("members", email, "role"), role);
}

/**
 * Subscribes to real-time updates for rooms where the given user is a member.
 */
export function subscribeToRooms(
  email: string,
  onUpdate: (rooms: Room[]) => void,
  onError?: (error: Error) => void,
) {
  const roomsRef = collection(db, "rooms");
  const q = query(roomsRef, where("memberEmails", "array-contains", email));

  return onSnapshot(
    q,
    (snapshot) => {
      const rooms: Room[] = [];
      snapshot.forEach((docSnap) => {
        rooms.push(docSnap.data() as Room);
      });
      onUpdate(rooms);
    },
    (err) => {
      console.error("Error subscribing to rooms:", err);
      if (onError) onError(err);
    },
  );
}
