import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BLOCKED_STATUSES = ["REQUESTED", "CONFIRMED", "ONGOING"];
const PATIENT_SLOT_MINUTES = 15;
const ALLOWED_DURATIONS = new Set([15, 30, 45, 60]);

function pad(n) {
  return String(n).padStart(2, "0");
}

function minutesToTime(minutes) {
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

function normalizeDate(value) {
  if (typeof value !== "string") return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return match[0];
}

function dateAtMinutes(date, minutes) {
  return new Date(`${date}T${minutesToTime(minutes)}:00`);
}

function rangesOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

export async function GET(request, { params }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const date = normalizeDate(searchParams.get("date"));
  const durationMinutes = Number(searchParams.get("duration") ?? 15);

  if (!date) {
    return Response.json({ ok: false, error: "Choose a valid date." }, { status: 400 });
  }
  if (!ALLOWED_DURATIONS.has(durationMinutes)) {
    return Response.json({ ok: false, error: "Choose a valid duration." }, { status: 400 });
  }

  const doctor = await prisma.user.findFirst({
    where: { id, role: "DOCTOR" },
    select: { id: true, name: true },
  });
  if (!doctor) {
    return Response.json({ ok: false, error: "Doctor not found." }, { status: 404 });
  }

  const dayStart = new Date(`${date}T00:00:00.000Z`);
  const dayEnd = new Date(dayStart);
  dayEnd.setUTCDate(dayStart.getUTCDate() + 1);
  const weekday = dayStart.getUTCDay();

  const [rules, overrides, appointments] = await Promise.all([
    prisma.doctorAvailabilityRule.findMany({
      where: { doctorId: doctor.id, weekday },
      orderBy: { startMinutes: "asc" },
    }),
    prisma.doctorAvailabilityOverride.findMany({
      where: { doctorId: doctor.id, date: { gte: dayStart, lt: dayEnd } },
      orderBy: { startMinutes: "asc" },
    }),
    prisma.appointment.findMany({
      where: {
        doctorId: doctor.id,
        scheduledAt: { gte: dayStart, lt: dayEnd },
        status: { in: BLOCKED_STATUSES },
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
  const now = Date.now();

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
      if (bookedRanges.some((range) => rangesOverlap(slotStart, slotEnd, range.start, range.end))) continue;
      slots.push({
        startsAt: startsAt.toISOString(),
        label: startsAt.toLocaleTimeString(undefined, {
          hour: "numeric",
          minute: "2-digit",
        }),
        slotMinutes: durationMinutes,
      });
    }
  }

  return Response.json({
    ok: true,
    doctor,
    date,
    durationMinutes,
    source: isUnavailable ? "unavailable" : overrideBlocks.length > 0 ? "override" : "default",
    slots,
  });
}
