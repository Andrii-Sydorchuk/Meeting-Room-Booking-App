import type { Booking } from "../types";

export type BookingCheckTarget = Pick<
  Booking,
  "roomId" | "startTime" | "endTime"
> & {
  id?: string;
};

/**
 * Checks if a target booking interval overlaps with any existing bookings for a room.
 */
export function hasBookingConflict(
  target: BookingCheckTarget,
  existingBookings: Booking[],
): boolean {
  return existingBookings.some((existing) => {
    if (target.id && existing.id === target.id) return false;
    if (existing.roomId !== target.roomId) return false;

    return (
      target.startTime < existing.endTime && target.endTime > existing.startTime
    );
  });
}
