import { createContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  addRoomMember,
  createRoom,
  deleteRoom,
  removeRoomMember,
  subscribeToRooms,
  updateRoom,
  updateRoomMemberRole,
  type RemoveRoomMemberParams,
  type RoomMemberParams,
} from "../services/roomService";
import type { Room, RoomFormData, UserRole } from "../types";

export interface RoomContextData {
  rooms: Room[];
  selectedRoomId: string | null;
  selectedRoom: Room | null;
  loading: boolean;
  selectRoom: (roomId: string | null) => void;
  create: (data: RoomFormData) => Promise<Room>;
  update: (roomId: string, data: RoomFormData) => Promise<void>;
  remove: (roomId: string) => Promise<void>;
  addMember: (params: RoomMemberParams) => Promise<void>;
  removeMember: (params: RemoveRoomMemberParams) => Promise<void>;
  updateMemberRole: (params: RoomMemberParams) => Promise<void>;
  getUserRole: (room: Room) => UserRole | null;
  isRoomAdmin: (room: Room) => boolean;
}

const RoomContext = createContext<RoomContextData | undefined>(undefined);

export function RoomProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [prevEmail, setPrevEmail] = useState<string | null>(null);
  const currentEmail = profile?.email ?? null;

  if (currentEmail !== prevEmail) {
    setPrevEmail(currentEmail);

    if (!currentEmail) {
      setRooms([]);
      setLoading(false);
    } else {
      setLoading(true);
    }
  }

  useEffect(() => {
    if (!profile?.email) return;

    const unsubscribe = subscribeToRooms(
      profile.email,
      (updatedRooms) => {
        setRooms(updatedRooms);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to load rooms:", err);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [profile?.email]);

  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) ?? null;

  function selectRoom(roomId: string | null) {
    setSelectedRoomId(roomId);
  }

  async function create(data: RoomFormData): Promise<Room> {
    if (!profile) {
      throw new Error("You must be logged in to create a room.");
    }

    const newRoom = await createRoom(data, profile);
    setSelectedRoomId(newRoom.id);

    return newRoom;
  }

  async function update(roomId: string, data: RoomFormData) {
    await updateRoom(roomId, data);
  }

  async function remove(roomId: string) {
    await deleteRoom(roomId);

    if (selectedRoomId === roomId) {
      setSelectedRoomId(null);
    }
  }

  async function addMember(params: RoomMemberParams) {
    await addRoomMember(params);
  }

  async function removeMember(params: RemoveRoomMemberParams) {
    await removeRoomMember(params);
  }

  async function updateMemberRole(params: RoomMemberParams) {
    await updateRoomMemberRole(params);
  }

  function getUserRole(room: Room): UserRole | null {
    if (!profile?.email) return null;

    const member = room.members?.[profile.email];

    return member?.role ?? null;
  }

  function isRoomAdmin(room: Room): boolean {
    if (!profile?.email) return false;

    return getUserRole(room) === "admin" || room.createdBy === profile.uid;
  }

  return (
    <RoomContext.Provider
      value={{
        rooms,
        selectedRoomId,
        selectedRoom,
        loading,
        selectRoom,
        create,
        update,
        remove,
        addMember,
        removeMember,
        updateMemberRole,
        getUserRole,
        isRoomAdmin,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}

export default RoomContext;
