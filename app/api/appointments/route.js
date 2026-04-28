import { getSessionUserOrErrorResponse } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cleanText(value, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

const STATUSES = new Set([
  "REQUESTED",
  "CONFIRMED",
  "ONGOING",
  "CANCELLED",
  "COMPLETED",
  "NO_SHOW",
]);
const ACTIVE_STATUSES = ["REQUESTED", "CONFIRMED", "ONGOING"];
const ALLOWED_DURATIONS = new Set([15, 30, 45, 60]);

function rangesOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

export async function POST(request) {
  const auth = await getSessionUserOrErrorResponse();
  if (auth.response) return auth.response;

  const body = await request.json().catch(() => ({}));
  const scheduledAt = new Date(body.scheduledAt);
  if (Number.isNaN(scheduledAt.getTime())) {
    return Response.json({ ok: false, error: "Choose a valid date and time." }, { status: 400 });
  }

  if (scheduledAt.getTime() < Date.now() - 5 * 60 * 1000) {
    return Response.json({ ok: false, error: "Appointments must be scheduled in the future." }, { status: 400 });
  }

  const durationMinutes = Number(body.durationMinutes ?? 15);
  if (!ALLOWED_DURATIONS.has(durationMinutes)) {
    return Response.json(
      { ok: false, error: "Duration must be 15, 30, 45, or 60 minutes." },
      { status: 400 }
    );
  }

  const doctorId = cleanText(body.doctorId, null);
  const doctor = doctorId
    ? await prisma.user.findFirst({
        where: { id: doctorId, role: "DOCTOR" },
        select: { id: true, name: true },
      })
    : null;

  if (doctorId && !doctor) {
    return Response.json({ ok: false, error: "Selected doctor was not found." }, { status: 400 });
  }
  if (auth.user.role === "PATIENT" && !doctor) {
    return Response.json({ ok: false, error: "Choose a doctor before selecting a time." }, { status: 400 });
  }

  let patient = null;
  let patientName = auth.user.name;

  if (auth.user.role === "PATIENT") {
    patient = auth.user;
  } else if (auth.user.role === "ADMIN") {
    const patientId = cleanText(body.patientId, null);
    if (patientId) {
      patient = await prisma.user.findFirst({
        where: { id: patientId, role: "PATIENT" },
        select: { id: true, name: true },
      });
      if (!patient) {
        return Response.json({ ok: false, error: "Selected patient was not found." }, { status: 400 });
      }
      patientName = patient.name;
    } else {
      patientName = cleanText(body.patientName);
      if (!patientName) {
        return Response.json({ ok: false, error: "Patient name is required." }, { status: 400 });
      }
    }
  } else {
    return Response.json({ ok: false, error: "Only patients and admins can create appointments." }, { status: 403 });
  }

  const requestedStatus = cleanText(body.status, "CONFIRMED").toUpperCase();
  const status =
    auth.user.role === "ADMIN" && STATUSES.has(requestedStatus)
      ? requestedStatus
      : "REQUESTED";

  if (doctor) {
    const dayStart = new Date(scheduledAt);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);
    const activeAppointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctor.id,
        scheduledAt: { gte: dayStart, lt: dayEnd },
        status: { in: ACTIVE_STATUSES },
      },
      select: { id: true, scheduledAt: true, durationMinutes: true },
    });
    const requestedStart = scheduledAt.getTime();
    const requestedEnd = requestedStart + durationMinutes * 60 * 1000;
    const hasOverlap = activeAppointments.some((appt) => {
      const start = appt.scheduledAt.getTime();
      const end = start + (appt.durationMinutes || 15) * 60 * 1000;
      return rangesOverlap(requestedStart, requestedEnd, start, end);
    });
    if (hasOverlap) {
      return Response.json(
        { ok: false, error: "That time is no longer available. Please choose another slot." },
        { status: 409 }
      );
    }
  }

  const appointment = await prisma.appointment.create({
    data: {
      patientId: patient?.id ?? null,
      doctorId: doctor?.id ?? null,
      patientName,
      doctorName: doctor?.name ?? cleanText(body.doctorName, null),
      scheduledAt,
      durationMinutes,
      patientNotes: cleanText(body.patientNotes ?? body.notes, null) || null,
      status,
    },
  });

  return Response.json({ ok: true, appointment }, { status: 201 });
}
