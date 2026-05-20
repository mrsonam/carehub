export const ALLOWED_DURATIONS = new Set([15, 30, 45, 60]);

export function feeCentsForDuration(durationMinutes, schedule) {
  const d = Number(durationMinutes);
  if (!ALLOWED_DURATIONS.has(d)) {
    throw new Error("Duration must be 15, 30, 45, or 60 minutes.");
  }
  const key = { 15: "fee15Cents", 30: "fee30Cents", 45: "fee45Cents", 60: "fee60Cents" }[d];
  return schedule[key];
}

export function formatMoney(cents, currency = "AUD") {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(cents / 100);
}
