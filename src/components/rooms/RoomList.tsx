import { useState } from "react";
import { useRooms } from "../../hooks/useRooms";
import { RoomCard } from "./RoomCard";
import { RoomModal } from "./RoomModal";
import { RoomMembersModal } from "./RoomMembersModal";
import type { Room } from "../../types";
import { Plus, DoorClosed, Loader2 } from "lucide-react";

export function RoomList() {
  const { rooms, loading } = useRooms();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomToEdit, setRoomToEdit] = useState<Room | null>(null);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [roomForMembers, setRoomForMembers] = useState<Room | null>(null);

  function handleOpenCreateModal() {
    setRoomToEdit(null);
    setIsModalOpen(true);
  }

  function handleOpenEditModal(room: Room) {
    setRoomToEdit(room);
    setIsModalOpen(true);
  }

  function handleOpenMembersModal(room: Room) {
    setRoomForMembers(room);
    setIsMembersModalOpen(true);
  }

  return (
    <div className="space-y-4">
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Meeting Rooms
          </h2>
          <p className="text-xs text-gray-500">
            Select a room to view or manage bookings
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Room</span>
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center p-12 bg-white rounded-xl border border-gray-200 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin mr-2 text-blue-600" />
          <span>Loading meeting rooms...</span>
        </div>
      ) : rooms.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed border-gray-300 text-center space-y-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
            <DoorClosed className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-800">
              No meeting rooms found
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mt-1">
              You aren't a member of any meeting rooms yet. Create a new room to
              get started!
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Room</span>
          </button>
        </div>
      ) : (
        /* Room cards grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onEdit={handleOpenEditModal}
              onManageMembers={handleOpenMembersModal}
            />
          ))}
        </div>
      )}

      {/* Create / Edit room modal */}
      <RoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        roomToEdit={roomToEdit}
      />

      {/* Room members modal */}
      <RoomMembersModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        room={roomForMembers}
      />
    </div>
  );
}
