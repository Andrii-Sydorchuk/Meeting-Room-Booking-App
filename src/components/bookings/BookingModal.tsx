import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useBookings } from "../../hooks/useBookings";
import { useRooms } from "../../hooks/useRooms";
import type { Booking } from "../../types";
import {
  formatBookingTime,
  isValidInterval,
  toDateTimeLocalString,
} from "../../utils/dateUtils";
import { X, Calendar, Clock, Loader2, AlertTriangle } from "lucide-react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingToEdit?: Booking | null;
}

interface BookingFormValues {
  description: string;
  startTime: string;
  endTime: string;
}

export function BookingModal({
  isOpen,
  onClose,
  bookingToEdit,
}: BookingModalProps) {
  const { selectedRoom } = useRooms();
  const { create, update } = useBookings();
  const [conflictError, setConflictError] = useState<string | null>(null);

  const isEditing = Boolean(bookingToEdit);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>();

  const startValue = watch("startTime");
  const endValue = watch("endTime");

  useEffect(() => {
    setConflictError(null);
    if (bookingToEdit) {
      reset({
        description: bookingToEdit.description,
        startTime: toDateTimeLocalString(bookingToEdit.startTime),
        endTime: toDateTimeLocalString(bookingToEdit.endTime),
      });
    } else {
      // Default: start in 1 hour, duration 1 hour
      const defaultStart = new Date();
      defaultStart.setHours(defaultStart.getHours() + 1, 0, 0, 0);
      const defaultEnd = new Date(defaultStart);
      defaultEnd.setHours(defaultEnd.getHours() + 1);

      reset({
        description: "",
        startTime: toDateTimeLocalString(defaultStart),
        endTime: toDateTimeLocalString(defaultEnd),
      });
    }
  }, [bookingToEdit, reset, isOpen]);

  if (!isOpen || !selectedRoom) return null;

  const onSubmit = async (values: BookingFormValues) => {
    setConflictError(null);

    // Convert local date inputs to standard iso strings
    const isoStart = new Date(values.startTime).toISOString();
    const isoEnd = new Date(values.endTime).toISOString();

    if (!isValidInterval({ isoStart, isoEnd })) {
      setConflictError("Start time must be strictly before end time.");
      return;
    }

    try {
      if (isEditing && bookingToEdit) {
        await update(bookingToEdit.id, {
          roomId: selectedRoom.id,
          description: values.description,
          startTime: isoStart,
          endTime: isoEnd,
        });
      } else {
        await create({
          roomId: selectedRoom.id,
          description: values.description,
          startTime: isoStart,
          endTime: isoEnd,
        });
      }
      onClose();
    } catch (err: unknown) {
      const e = err as Error;
      setConflictError(
        e.message ||
          "Failed to save booking due to a conflict or server error.",
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                {isEditing ? "Edit Booking" : "Create New Booking"}
              </h3>
              <p className="text-xs text-gray-500">Room: {selectedRoom.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Error alert */}
          {conflictError && (
            <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              <AlertTriangle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">
                  Booking Conflict Error
                </span>
                <span>{conflictError}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Booking Purpose / Description
            </label>
            <textarea
              rows={3}
              {...register("description", {
                required: "Description is required.",
                minLength: {
                  value: 3,
                  message: "Description must be at least 3 characters.",
                },
              })}
              placeholder="e.g. Q3 Sprint Planning Meeting with Product Team"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Clock className="w-4 h-4 text-gray-400" />
                Start Time
              </label>
              <input
                type="datetime-local"
                {...register("startTime", {
                  required: "Start time is required.",
                })}
                className={`w-full px-3 py-2 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 ${
                  errors.startTime
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              {errors.startTime && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.startTime.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Clock className="w-4 h-4 text-gray-400" />
                End Time
              </label>
              <input
                type="datetime-local"
                {...register("endTime", {
                  required: "End time is required.",
                })}
                className={`w-full px-3 py-2 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 ${
                  errors.endTime
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              {errors.endTime && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.endTime.message}
                </p>
              )}
            </div>
          </div>

          {/* Time range preview */}
          {startValue && endValue && (
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Selected Range:{" "}
                <strong>
                  {formatBookingTime({
                    isoStart: new Date(startValue).toISOString(),
                    isoEnd: new Date(endValue).toISOString(),
                  })}
                </strong>
              </span>
            </div>
          )}

          {/* Footer controls */}
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
                  <span>Checking availability...</span>
                </>
              ) : (
                <span>{isEditing ? "Save Changes" : "Confirm Booking"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
