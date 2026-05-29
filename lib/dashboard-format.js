import { CLINIC_LOCALE, CLINIC_TIMEZONE, clinicHour, zonedDateKey } from "./clinic-time.js";

export { CLINIC_LOCALE, CLINIC_TIMEZONE };

export const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function formatRelative(from, nowMs = Date.now()) {
  const diffMs = nowMs - new Date(from).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function formatApptTime(d) {
  const dt = new Date(d);
  return new Intl.DateTimeFormat(CLINIC_LOCALE, {
    timeZone: CLINIC_TIMEZONE,
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  }).format(dt);
}

export function formatTimeOnly(d) {
  return new Intl.DateTimeFormat(CLINIC_LOCALE, {
    timeZone: CLINIC_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(d));
}

export function formatDateTimeMedium(value) {
  if (!value) return "Not yet";
  return new Intl.DateTimeFormat(CLINIC_LOCALE, {
    timeZone: CLINIC_TIMEZONE,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatMonthShort(date) {
  return new Intl.DateTimeFormat(CLINIC_LOCALE, {
    timeZone: CLINIC_TIMEZONE,
    month: "short",
  }).format(date instanceof Date ? date : new Date(date));
}

export function formatMonthDayShort(date) {
  return new Intl.DateTimeFormat(CLINIC_LOCALE, {
    timeZone: CLINIC_TIMEZONE,
    month: "short",
    day: "numeric",
  }).format(date instanceof Date ? date : new Date(date));
}

export function formatDateShort(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(CLINIC_LOCALE, {
    timeZone: CLINIC_TIMEZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatNumber(value) {
  return new Intl.NumberFormat(CLINIC_LOCALE).format(value);
}

export function greetingForHour(date = new Date()) {
  const h = clinicHour(date);
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function initialsFromName(name = "") {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}
