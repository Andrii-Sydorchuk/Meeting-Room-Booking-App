import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import type { Booking, BookingFormData, UserProfile } from "../types";
import { hasBookingConflict } from "../utils/overlapCheck";

export async function createBooking(
  data: BookingFormData,
  currentUser: UserProfile,
  existingRoomBookings: Booking[],
): Promise<Booking> {
  if (hasBookingConflict(data, existingRoomBookings)) {
    throw new Error(
      "Time conflict! Another booking already exists for this room during the selected time slot.",
    );
  }

  const bookingRef = doc(collection(db, "bookings"));
  const now = new Date().toISOString();

  const newBooking: Booking = {
    id: bookingRef.id,
    roomId: data.roomId,
    description: data.description.trim(),
    startTime: data.startTime,
    endTime: data.endTime,
    createdBy: currentUser.uid,
    creatorEmail: currentUser.email,
    creatorName: currentUser.displayName,
    participants: [currentUser.email],
    createdAt: now,
  };

  await setDoc(bookingRef, newBooking);

  return newBooking;
}

export async function updateBooking(
  bookingId: string,
  data: BookingFormData,
  existingRoomBookings: Booking[],
) {
  if (hasBookingConflict({ ...data, id: bookingId }, existingRoomBookings)) {
    throw new Error(
      "Time conflict! The updated time slot overlaps with another booking in this room.",
    );
  }

  const bookingRef = doc(db, "bookings", bookingId);

  await updateDoc(bookingRef, {
    description: data.description.trim(),
    startTime: data.startTime,
    endTime: data.endTime,
  });
}

export async function cancelBooking(bookingId: string) {
  const bookingRef = doc(db, "bookings", bookingId);

  await deleteDoc(bookingRef);
}

export async function joinBooking(bookingId: string, userEmail: string) {
  const bookingRef = doc(db, "bookings", bookingId);

  await updateDoc(bookingRef, {
    participants: arrayUnion(userEmail.trim().toLowerCase()),
  });
}

/**
 * Removes a user email from a booking's participants list.
 */
export async function leaveBooking(bookingId: string, userEmail: string) {
  const bookingRef = doc(db, "bookings", bookingId);

  await updateDoc(bookingRef, {
    participants: arrayRemove(userEmail.trim().toLowerCase()),
  });
}

/**
 * Subscribes to booking updates for a specific room.
 */
export function subscribeToRoomBookings(
  roomId: string,
  onUpdate: (bookings: Booking[]) => void,
  onError?: (error: Error) => void,
) {
  const bookingsRef = collection(db, "bookings");
  const q = query(bookingsRef, where("roomId", "==", roomId));

  return onSnapshot(
    q,
    (snapshot) => {
      const bookings: Booking[] = [];

      snapshot.forEach((docSnap) => {
        bookings.push(docSnap.data() as Booking);
      });

      // Sort bookings chronologically by startTime
      bookings.sort((a, b) => a.startTime.localeCompare(b.startTime));
      onUpdate(bookings);
    },
    (err) => {
      console.error(`Error subscribing to bookings for room ${roomId}:`, err);

      if (onError) onError(err);
    },
  );
}

export async function fetchRoomBookings(roomId: string): Promise<Booking[]> {
  const bookingsRef = collection(db, "bookings");
  const q = query(bookingsRef, where("roomId", "==", roomId));
  const snapshot = await getDocs(q);
  const bookings: Booking[] = [];

  snapshot.forEach((docSnap) => {
    bookings.push(docSnap.data() as Booking);
  });

  return bookings;
}
