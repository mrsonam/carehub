import { CLINIC_LOCALE, CLINIC_TIMEZONE, zonedDateKey } from "../clinic-time.js";

const PAD = (n) => String(n).padStart(2, "0");

const weekdayShortFormatter = new Intl.DateTimeFormat(CLINIC_LOCALE, {
  timeZone: CLINIC_TIMEZONE,
  weekday: "short",
});

const monthTitleFormatter = new Intl.DateTimeFormat(CLINIC_LOCALE, {
  timeZone: CLINIC_TIMEZONE,
  month: "long",
  year: "numeric",
});

const displayDayFormatter = new Intl.DateTimeFormat(CLINIC_LOCALE, {
  timeZone: CLINIC_TIMEZONE,
  weekday: "long",
  month: "long",
  day: "numeric",
});

/** @param {Date | string} date */
export function dateKey(date) {
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
  if (date instanceof Date) {
    return zonedDateKey(date);
  }
  const d = new Date(`${date}T12:00:00`);
  return zonedDateKey(d);
}

/** @param {string} key YYYY-MM-DD */
export function parseDateKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

/** @param {Date} date */
export function monthTitle(date) {
  return monthTitleFormatter.format(date);
}

/** @param {Date | string} date */
export function displayDay(date) {
  const d = date instanceof Date ? date : parseDateKey(date);
  return displayDayFormatter.format(d);
}

/** @param {Date | string} date */
export function formatWeekdayShort(date) {
  const d = date instanceof Date ? date : parseDateKey(date);
  return weekdayShortFormatter.format(d);
}

/** @param {Date} date @param {number} days */
export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Monday-start week containing `date`.
 * @param {Date} date
 */
export function startOfWeek(date) {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Seven days Mon–Sun for the week containing `anchor`. */
export function weekDays(anchor) {
  const start = startOfWeek(anchor);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/** 42-day grid (Mon–Sun) aligned with WEEKDAY_HEADERS. */
export function monthGrid(monthDate) {
  const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1, 12, 0, 0, 0);
  const start = startOfWeek(first);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

export const WEEKDAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function todayKey() {
  return zonedDateKey(new Date());
}

export function dateKeyOffset(days) {
  const anchor = parseDateKey(todayKey());
  anchor.setDate(anchor.getDate() + days);
  return `${anchor.getFullYear()}-${PAD(anchor.getMonth() + 1)}-${PAD(anchor.getDate())}`;
}

/** Stable first-of-month anchor for calendar state (SSR + client). */
export function currentMonthAnchor() {
  const [y, m] = todayKey().split("-").map(Number);
  return new Date(y, m - 1, 1, 12, 0, 0, 0);
}
