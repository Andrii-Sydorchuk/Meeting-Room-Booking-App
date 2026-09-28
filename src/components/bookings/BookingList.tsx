import { useState } from "react";
import { useBookings } from "../../hooks/useBookings";
import { useRooms } from "../../hooks/useRooms";
import { BookingCard } from "./BookingCard";
import { BookingModal } from "./BookingModal";
import type { Booking } from "../../types";
import { Calendar, Plus, Loader2, Info } from "lucide-react";

export function BookingList() {
  const { selectedRoom, isRoomAdmin } = useRooms();
  const { bookings, loading } = useBookings();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingToEdit, setBookingToEdit] = useState<Booking | null>(null);

  if (!selectedRoom) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed border-gray-300 text-center space-y-3">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
          <Info className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-800">
            No Room Selected
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mt-1">
            Please click on a meeting room card above to view its booking
            schedule or create a new booking.
          </p>
        </div>
      </div>
    );
  }

  const isAdmin = isRoomAdmin(selectedRoom);

  const handleOpenCreateModal = () => {
    setBookingToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (booking: Booking) => {
    setBookingToEdit(booking);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">
              {selectedRoom.name} — Schedule
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {selectedRoom.description}
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow transition cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Booking</span>
          </button>
        )}
      </div>

      {/* Bookings schedule list */}
      {loading ? (
        <div className="flex items-center justify-center p-12 bg-white rounded-xl border border-gray-200 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin mr-2 text-blue-600" />
          <span>Loading room bookings...</span>
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed border-gray-300 text-center space-y-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-800">
              No Bookings Scheduled
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mt-1">
              There are currently no active bookings scheduled for{" "}
              {selectedRoom.name}.
            </p>
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Booking</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              isAdmin={isAdmin}
              onEdit={handleOpenEditModal}
            />
          ))}
        </div>
      )}

      {/* Create / edit booking modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bookingToEdit={bookingToEdit}
      />
    </div>
  );
}
