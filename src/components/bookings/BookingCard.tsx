import { useState } from "react";
import { useBookings } from "../../hooks/useBookings";
import { useAuth } from "../../hooks/useAuth";
import type { Booking } from "../../types";
import { formatBookingTime } from "../../utils/dateUtils";
import { ConfirmModal } from "../common/ConfirmModal";
import {
  Clock,
  User,
  Users,
  Edit3,
  Trash2,
  UserCheck,
  UserPlus,
} from "lucide-react";

interface BookingCardProps {
  booking: Booking;
  isAdmin: boolean;
  onEdit: (booking: Booking) => void;
}

export function BookingCard({ booking, isAdmin, onEdit }: BookingCardProps) {
  const { cancel, join, leave } = useBookings();
  const { profile } = useAuth();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const userEmail = profile?.email?.toLowerCase();
  const participants = booking.participants || [];
  const isParticipant = userEmail ? participants.includes(userEmail) : false;

  const handleToggleJoin = async () => {
    try {
      if (isParticipant) {
        await leave(booking.id);
      } else {
        await join(booking.id);
      }
    } catch (err) {
      console.error("Failed to update participation:", err);
    }
  };

  const handleConfirmCancel = async () => {
    await cancel(booking.id);
  };

  return (
    <>
      <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition space-y-3">
        {/* Time header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 font-semibold text-sm">
            <Clock className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              {formatBookingTime({
                isoStart: booking.startTime,
                isoEnd: booking.endTime,
              })}
            </span>
          </div>

          {/* Admin controls (edit / cancel) */}
          {isAdmin && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onEdit(booking)}
                title="Edit Booking"
                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(true)}
                title="Cancel Booking"
                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <p className="text-gray-800 text-sm font-medium leading-relaxed">
            {booking.description}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
            <User className="w-3.5 h-3.5" />
            <span>Booked by {booking.creatorName || booking.creatorEmail}</span>
          </div>
        </div>

        {/* Footer: participants & join / leave button */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-xs text-gray-600 font-medium">
                {participants.length} Participant
                {participants.length === 1 ? "" : "s"}:
              </span>
              {participants.map((email) => (
                <span
                  key={email}
                  className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                    email === userEmail
                      ? "bg-blue-100 text-blue-800 font-semibold"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {email === userEmail ? "You" : email.split("@")[0]}
                </span>
              ))}
            </div>
          </div>

          {/* Join / leave button */}
          <button
            type="button"
            onClick={handleToggleJoin}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              isParticipant
                ? "bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
            }`}
          >
            {isParticipant ? (
              <>
                <UserCheck className="w-3.5 h-3.5 text-green-600" />
                <span>Joined (Leave)</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>Join Meeting</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Confirm Booking Cancelation Modal */}
      <ConfirmModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Cancel Booking"
        message={`Are you sure you want to cancel the booking "${booking.description}"?`}
        confirmText="Cancel Booking"
        variant="danger"
      />
    </>
  );
}
