import { dateKey, parseDateKey } from "@/lib/calendar/dates";
import { weekdayFromDate } from "@/lib/calendar/weekdays";
import { rangesOverlap } from "@/lib/booking/overlap";
import { formatTimeOnly } from "@/lib/dashboard-format";

export const BLOCKED_SLOT_STATUSES = ["REQUESTED", "CONFIRMED", "ONGOING"];
export const PATIENT_SLOT_MINUTES = 15;
export const ALLOWED_BOOKING_DURATIONS = new Set([15, 30, 45, 60]);

function pad(n) {
  return String(n).padStart(2, "0");
}

function minutesToTime(minutes) {
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

export function normalizeBookingDate(value) {
  if (typeof value !== "string") return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return match[0];
}

function dateAtMinutes(date, minutes) {
  return new Date(`${date}T${minutesToTime(minutes)}:00`);
}

/**
 * @param {import("@prisma/client").PrismaClient | import("@prisma/client").Prisma.TransactionClient} db
 */
export async function computeAvailableSlots(
  db,
  { doctorId, date, durationMinutes, now = Date.now() }
) {
  const dayStart = parseDateKey(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayStart.getDate() + 1);
  const weekday = weekdayFromDate(dayStart);

  const [rules, overrides, appointments] = await Promise.all([
    db.doctorAvailabilityRule.findMany({
      where: { doctorId, weekday },
      orderBy: { startMinutes: "asc" },
    }),
    db.doctorAvailabilityOverride.findMany({
      where: { doctorId, date: { gte: dayStart, lt: dayEnd } },
      orderBy: { startMinutes: "asc" },
    }),
    db.appointment.findMany({
      where: {
        doctorId,
        scheduledAt: { gte: dayStart, lt: dayEnd },
        status: { in: BLOCKED_SLOT_STATUSES },
      },
      select: { scheduledAt: true, durationMinutes: true },
    }),
  ]);

  const isUnavailable = overrides.some((override) => override.isUnavailable);
  const overrideBlocks = overrides.filter((override) => !override.isUnavailable);
  const source = isUnavailable ? [] : overrideBlocks.length > 0 ? overrideBlocks : rules;

  const bookedRanges = appointments.map((appt) => {
    const start = appt.scheduledAt.getTime();
    const end = start + (appt.durationMinutes || 15) * 60 * 1000;
    return { start, end };
  });

  const slots = [];
  for (const block of source) {
    for (
      let minutes = block.startMinutes;
      minutes + durationMinutes <= block.endMinutes;
      minutes += PATIENT_SLOT_MINUTES
    ) {
      const startsAt = dateAtMinutes(date, minutes);
      const slotStart = startsAt.getTime();
      const slotEnd = slotStart + durationMinutes * 60 * 1000;
      if (startsAt.getTime() <= now) continue;
      if (bookedRanges.some((range) => rangesOverlap(slotStart, slotEnd, range.start, range.end))) {
        continue;
      }
      slots.push({
        startsAt: startsAt.toISOString(),
        label: formatTimeOnly(startsAt),
        slotMinutes: durationMinutes,
      });
    }
  }

  return {
    source: isUnavailable ? "unavailable" : overrideBlocks.length > 0 ? "override" : "default",
    slots,
  };
}

/**
 * @param {import("@prisma/client").PrismaClient | import("@prisma/client").Prisma.TransactionClient} db
 */
export async function isScheduledSlotAvailable(db, { doctorId, scheduledAt, durationMinutes }) {
  if (!ALLOWED_BOOKING_DURATIONS.has(durationMinutes)) return false;

  const when = scheduledAt instanceof Date ? scheduledAt : new Date(scheduledAt);
  if (Number.isNaN(when.getTime())) return false;

  const date = dateKey(when);
  if (!normalizeBookingDate(date)) return false;

  const { slots } = await computeAvailableSlots(db, {
    doctorId,
    date,
    durationMinutes,
  });

  const target = when.getTime();
  return slots.some((slot) => new Date(slot.startsAt).getTime() === target);
}
