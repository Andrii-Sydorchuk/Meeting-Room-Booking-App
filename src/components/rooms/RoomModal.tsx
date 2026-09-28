import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRooms } from "../../hooks/useRooms";
import type { Room, RoomFormData } from "../../types";
import { X, Loader2, DoorClosed } from "lucide-react";

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomToEdit?: Room | null;
}

export function RoomModal({ isOpen, onClose, roomToEdit }: RoomModalProps) {
  const { create, update } = useRooms();
  const isEditing = Boolean(roomToEdit);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RoomFormData>();

  useEffect(() => {
    if (roomToEdit) {
      reset({
        name: roomToEdit.name,
        description: roomToEdit.description,
      });
    } else {
      reset({ name: "", description: "" });
    }
  }, [roomToEdit, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (data: RoomFormData) => {
    try {
      if (isEditing && roomToEdit) {
        await update(roomToEdit.id, data);
      } else {
        await create(data);
      }
      onClose();
    } catch (err) {
      console.error("Failed to save room:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <DoorClosed className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-800">
              {isEditing ? "Edit Room Information" : "Create New Meeting Room"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Name
            </label>
            <input
              type="text"
              {...register("name", {
                required: "Room name is required.",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters.",
                },
              })}
              placeholder="e.g. Conference Room A"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                errors.name
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              {...register("description", {
                required: "Description is required.",
              })}
              placeholder="e.g. Main conference room with projector and whiteboards."
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                errors.description
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Footer buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? "Save Changes" : "Create Room"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
