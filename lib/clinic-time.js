/** Fixed locale and timezone so server HTML matches client hydration. */
export const CLINIC_LOCALE = "en-AU";
export const CLINIC_TIMEZONE = "Australia/Sydney";

const dateFormatterCache = new Map();

function getDateTimeFormatter(options) {
  const key = JSON.stringify(options);
  if (!dateFormatterCache.has(key)) {
    dateFormatterCache.set(
      key,
      new Intl.DateTimeFormat(CLINIC_LOCALE, { timeZone: CLINIC_TIMEZONE, ...options })
    );
  }
  return dateFormatterCache.get(key);
}

/** @param {Date | string | number} date */
export function zonedDateKey(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "";

  const parts = getDateTimeFormatter({ year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(
    d
  );

  let year = "";
  let month = "";
  let day = "";
  for (const part of parts) {
    if (part.type === "year") year = part.value;
    if (part.type === "month") month = part.value;
    if (part.type === "day") day = part.value;
  }

  return year && month && day ? `${year}-${month}-${day}` : "";
}

/** @param {Date | string | number} [date] */
export function clinicHour(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const part = getDateTimeFormatter({ hour: "numeric", hour12: false }).formatToParts(d).find(
    (p) => p.type === "hour"
  );
  return part ? Number(part.value) : 0;
}
