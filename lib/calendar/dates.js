const PAD = (n) => String(n).padStart(2, "0");

/** @param {Date | string} date */
export function dateKey(date) {
  const d = date instanceof Date ? date : new Date(`${date}T12:00:00`);
  return `${d.getFullYear()}-${PAD(d.getMonth() + 1)}-${PAD(d.getDate())}`;
}

/** @param {string} key YYYY-MM-DD */
export function parseDateKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

/** @param {Date} date */
export function monthTitle(date) {
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

/** @param {Date | string} date */
export function displayDay(date) {
  const d = date instanceof Date ? date : parseDateKey(date);
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
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

/** 42-day grid (Sun-start) for desktop month — matches existing CareHub month views. */
export function monthGrid(monthDate) {
  const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  start.setHours(0, 0, 0, 0);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export const WEEKDAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function todayKey() {
  return dateKey(new Date());
}

export function dateKeyOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return dateKey(d);
}
