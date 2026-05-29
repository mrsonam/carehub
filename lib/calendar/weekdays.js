/**
 * Doctor availability weekday codes (matches Prisma `DoctorAvailabilityRule.weekday`
 * and JavaScript `Date#getDay()`).
 *
 * 0 = Sunday, 1 = Monday, … 6 = Saturday
 */
export const WEEKDAY_LABELS_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const WEEKDAY_LABELS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** @param {number} weekday */
export function weekdayLabel(weekday, style = "long") {
  const labels = style === "short" ? WEEKDAY_LABELS_SHORT : WEEKDAY_LABELS_LONG;
  return labels[weekday] ?? "Day";
}

/** @param {Date | string} date */
export function weekdayFromDate(date) {
  const d = date instanceof Date ? date : new Date(`${date}T12:00:00`);
  return d.getDay();
}
