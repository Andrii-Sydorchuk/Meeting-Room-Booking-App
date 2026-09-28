import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRooms } from "../../hooks/useRooms";
import { useAuth } from "../../hooks/useAuth";
import type { Room, UserRole } from "../../types";
import { ConfirmModal } from "../common/ConfirmModal";
import {
  X,
  UserPlus,
  Trash2,
  Shield,
  User,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface RoomMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
}

interface AddMemberFormData {
  email: string;
  role: UserRole;
}

export function RoomMembersModal({
  isOpen,
  onClose,
  room: initialRoom,
}: RoomMembersModalProps) {
  const { rooms, addMember, removeMember, updateMemberRole, isRoomAdmin } =
    useRooms();
  const { profile } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddMemberFormData>({
    defaultValues: { role: "user" },
  });

  const room = rooms.find((r) => r.id === initialRoom?.id) ?? initialRoom;

  if (!isOpen || !room) return null;

  const isAdmin = isRoomAdmin(room);
  const memberList = Object.values(room.members || {});

  const handleAddMember = async (data: AddMemberFormData) => {
    setError(null);
    const emailToMember = data.email.trim().toLowerCase();

    if (room.members?.[emailToMember]) {
      setError("This user is already a member of this room.");
      return;
    }

    try {
      await addMember({
        roomId: room.id,
        email: emailToMember,
        role: data.role,
      });
      reset({ email: "", role: "user" });
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Failed to add member.");
    }
  };

  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;
    try {
      await removeMember({ roomId: room.id, email: memberToRemove });
      setMemberToRemove(null);
    } catch (err) {
      console.error("Failed to remove member:", err);
    }
  };

  const handleToggleRole = async (
    memberEmail: string,
    currentRole: UserRole,
  ) => {
    const newRole: UserRole = currentRole === "admin" ? "user" : "admin";
    try {
      await updateMemberRole({
        roomId: room.id,
        email: memberEmail,
        role: newRole,
      });
    } catch (err) {
      console.error("Failed to change role:", err);
    }
  };

  const isRemovingSelf = memberToRemove === profile?.email;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-xl bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                Manage Room Members
              </h3>
              <p className="text-xs text-gray-500">{room.name}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Add member form (admin only) */}
            {isAdmin && (
              <form
                onSubmit={handleSubmit(handleAddMember)}
                className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3"
              >
                <h4 className="text-sm font-semibold text-blue-900 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-blue-600" />
                  Invite New Member by Email
                </h4>

                {error && (
                  <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="email"
                      {...register("email", {
                        required: "Email is required.",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Enter a valid email address.",
                        },
                      })}
                      placeholder="user@example.com"
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <select
                    {...register("role")}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow transition disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>Add</span>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Members list */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Current Members ({memberList.length})
              </h4>

              <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden bg-white">
                {memberList.map((m) => {
                  const isCurrentMemberAdmin = m.role === "admin";
                  const isSelf = m.email === profile?.email;

                  return (
                    <div
                      key={m.email}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            isCurrentMemberAdmin
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {isCurrentMemberAdmin ? (
                            <Shield className="w-4 h-4" />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-800">
                              {m.email}
                            </span>
                            {isSelf && (
                              <span className="text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded font-semibold">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-400">
                            Role: {isCurrentMemberAdmin ? "Admin" : "User"}
                          </span>
                        </div>
                      </div>

                      {/* Member controls (admins only) */}
                      {isAdmin && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleRole(m.email, m.role)}
                            className={`px-2 py-1 text-xs font-medium rounded border transition cursor-pointer ${
                              isCurrentMemberAdmin
                                ? "border-blue-300 text-blue-700 hover:bg-blue-50"
                                : "border-gray-300 text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            Make {isCurrentMemberAdmin ? "User" : "Admin"}
                          </button>

                          <button
                            type="button"
                            onClick={() => setMemberToRemove(m.email)}
                            title="Remove member"
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end px-6 py-3 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Member Removal Modal */}
      <ConfirmModal
        isOpen={Boolean(memberToRemove)}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleConfirmRemove}
        title={isRemovingSelf ? "Leave Meeting Room" : "Remove Member"}
        message={
          isRemovingSelf
            ? `Are you sure you want to remove yourself from room "${room.name}"? You will lose access to this room.`
            : `Are you sure you want to remove ${memberToRemove} from room "${room.name}"?`
        }
        confirmText={isRemovingSelf ? "Leave Room" : "Remove Member"}
        variant="danger"
      />
    </>
  );
}
