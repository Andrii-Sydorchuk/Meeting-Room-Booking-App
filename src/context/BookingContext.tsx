import { createContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import { useRooms } from "../hooks/useRooms";
import {
  cancelBooking,
  createBooking,
  joinBooking,
  leaveBooking,
  subscribeToRoomBookings,
  updateBooking,
} from "../services/bookingService";
import type { Booking, BookingFormData } from "../types";

export interface BookingContextData {
  bookings: Booking[];
  loading: boolean;
  create: (data: BookingFormData) => Promise<Booking>;
  update: (bookingId: string, data: BookingFormData) => Promise<void>;
  cancel: (bookingId: string) => Promise<void>;
  join: (bookingId: string) => Promise<void>;
  leave: (bookingId: string) => Promise<void>;
}

const BookingContext = createContext<BookingContextData | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const { selectedRoomId } = useRooms();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [prevRoomId, setPrevRoomId] = useState<string | null>(null);

  if (selectedRoomId !== prevRoomId) {
    setPrevRoomId(selectedRoomId);
    if (!selectedRoomId) {
      setBookings([]);
      setLoading(false);
    } else {
      setLoading(true);
    }
  }

  useEffect(() => {
    if (!selectedRoomId) return;

    const unsubscribe = subscribeToRoomBookings(
      selectedRoomId,
      (updatedBookings) => {
        setBookings(updatedBookings);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to load bookings:", err);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [selectedRoomId]);

  const create = async (data: BookingFormData): Promise<Booking> => {
    if (!profile) {
      throw new Error("You must be logged in to create a booking.");
    }
    return await createBooking(data, profile, bookings);
  };

  const update = async (
    bookingId: string,
    data: BookingFormData,
  ): Promise<void> => {
    await updateBooking(bookingId, data, bookings);
  };

  const cancel = async (bookingId: string): Promise<void> => {
    await cancelBooking(bookingId);
  };

  const join = async (bookingId: string): Promise<void> => {
    if (!profile?.email) return;
    await joinBooking(bookingId, profile.email);
  };

  const leave = async (bookingId: string): Promise<void> => {
    if (!profile?.email) return;
    await leaveBooking(bookingId, profile.email);
  };

  return (
    <BookingContext.Provider
      value={{
        bookings,
        loading,
        create,
        update,
        cancel,
        join,
        leave,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export default BookingContext;
