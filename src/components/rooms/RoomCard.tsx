import { useRooms } from "../../hooks/useRooms";
import type { Room } from "../../types";
import { DoorClosed, Users, Edit3, Trash2, Shield, User } from "lucide-react";

interface RoomCardProps {
  room: Room;
  onEdit: (room: Room) => void;
  onManageMembers: (room: Room) => void;
}

export function RoomCard({ room, onEdit, onManageMembers }: RoomCardProps) {
  const { selectedRoomId, selectRoom, remove, isRoomAdmin, getUserRole } =
    useRooms();
  const isSelected = selectedRoomId === room.id;
  const isAdmin = isRoomAdmin(room);
  const userRole = getUserRole(room);

  const memberCount = Object.keys(room.members || {}).length;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (confirm(`Are you sure you want to delete room "${room.name}"?`)) {
      try {
        await remove(room.id);
      } catch (err) {
        console.error("Failed to delete room:", err);
      }
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();

    onEdit(room);
  };

  const handleMembers = (e: React.MouseEvent) => {
    e.stopPropagation();
    onManageMembers(room);
  };

  return (
    <div
      onClick={() => selectRoom(room.id)}
      className={`p-5 rounded-xl border-2 transition-all cursor-pointer ${
        isSelected
          ? "border-blue-600 bg-blue-50/40 shadow-md ring-2 ring-blue-500/20"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-lg ${
              isSelected
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            <DoorClosed className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base leading-tight">
              {room.name}
            </h3>
            <span className="text-xs text-gray-400">
              Created by {room.createdByName || "Admin"}
            </span>
          </div>
        </div>

        {/* Role badge */}
        <span
          className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold border ${
            userRole === "admin"
              ? "bg-blue-100 text-blue-800 border-blue-200"
              : "bg-gray-100 text-gray-700 border-gray-200"
          }`}
        >
          {userRole === "admin" ? (
            <Shield className="w-3.5 h-3.5" />
          ) : (
            <User className="w-3.5 h-3.5" />
          )}
          {userRole === "admin" ? "Admin" : "User"}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 line-clamp-2 my-3 min-h-10">
        {room.description || "No description provided."}
      </p>

      {/* Card footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
        <button
          type="button"
          onClick={handleMembers}
          className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-blue-600 font-medium transition cursor-pointer"
        >
          <Users className="w-4 h-4 text-gray-400" />
          <span>
            {memberCount} member{memberCount === 1 ? "" : "s"}
          </span>
        </button>

        {/* Action controls (Admin only) */}
        {isAdmin && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleEdit}
              title="Edit Room"
              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              title="Delete Room"
              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
