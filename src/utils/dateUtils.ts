import { format, parseISO, isBefore, isValid } from "date-fns";

interface FormatBookingTimeParams {
  isoStart: string;
  isoEnd: string;
}

/**
 * Formats start and end ISO strings into a clean readable range.
 * Example: "10:00 - 11:30 (Sep 28, 2026)"
 */
export function formatBookingTime({
  isoStart,
  isoEnd,
}: FormatBookingTimeParams): string | null {
  try {
    const start = parseISO(isoStart);
    const end = parseISO(isoEnd);

    if (!isValid(start) || !isValid(end)) return null;

    const timeRange = `${format(start, "HH:mm")} - ${format(end, "HH:mm")}`;
    const dateStr = format(start, "MMM d, yyyy");

    return `${timeRange} (${dateStr})`;
  } catch {
    return null;
  }
}

/**
 * Formats an ISO string for display in date headers.
 * Example: "Monday, Sep 28, 2026"
 */
export function formatDateHeader(isoDate: string): string | null {
  try {
    const date = parseISO(isoDate);
    if (!isValid(date)) return null;

    return format(date, "EEEE, MMM d, yyyy");
  } catch {
    return null;
  }
}

/**
 * Converts a Date object or ISO string to format required by HTML datetime-local inputs (YYYY-MM-DDTHH:mm)
 */
export function toDateTimeLocalString(date: Date | string): string {
  try {
    const d = typeof date === "string" ? parseISO(date) : date;

    if (!isValid(d)) return "";

    return format(d, "yyyy-MM-dd'T'HH:mm");
  } catch {
    return "";
  }
}

interface IsValidIntervalParams {
  isoStart: string;
  isoEnd: string;
}

/**
 * Validates that startTime is strictly before endTime.
 */
export function isValidInterval({
  isoStart,
  isoEnd,
}: IsValidIntervalParams): boolean {
  try {
    const start = parseISO(isoStart);
    const end = parseISO(isoEnd);

    if (!isValid(start) || !isValid(end)) return false;

    return isBefore(start, end);
  } catch {
    return false;
  }
}
