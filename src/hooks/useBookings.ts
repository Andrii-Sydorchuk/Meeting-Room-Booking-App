import { useContext } from "react";
import type { BookingContextData } from "../context/BookingContext";
import BookingContext from "../context/BookingContext";

export function useBookings(): BookingContextData {
  const context = useContext(BookingContext);

  if (!context) {
    throw new Error("useBookings must be used within a BookingProvider");
  }

  return context;
}
