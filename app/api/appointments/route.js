import { getSessionUserOrErrorResponse } from "@/lib/auth-server";
import { doctorHasSchedulingConflict } from "@/lib/booking/overlap";
import { isScheduledSlotAvailable } from "@/lib/booking/slots";
import { feeCentsForDuration, ALLOWED_DURATIONS } from "@/lib/payments/fees.js";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications/notifications";

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
    const slotAvailable = await isScheduledSlotAvailable(prisma, {
      doctorId: doctor.id,
      scheduledAt,
      durationMinutes,
    });
    if (!slotAvailable) {
      return Response.json(
        { ok: false, error: "That time is not available. Please choose another slot." },
        { status: 409 }
      );
    }
  }

  const schedule = await prisma.clinicFeeSchedule.findUnique({ where: { id: "default" } });
  if (!schedule) {
    return Response.json({ ok: false, error: "Fee schedule is not configured." }, { status: 500 });
  }

  const feeAmountCents = feeCentsForDuration(durationMinutes, schedule);
  const paymentStatus = "UNPAID";

  let appointment;
  try {
    appointment = await prisma.$transaction(async (tx) => {
      if (doctor) {
        const hasConflict = await doctorHasSchedulingConflict(tx, {
          doctorId: doctor.id,
          scheduledAt,
          durationMinutes,
        });
        if (hasConflict) {
          throw new Error("OVERLAP");
        }
      }

      return tx.appointment.create({
        data: {
          patientId: patient?.id ?? null,
          doctorId: doctor?.id ?? null,
          patientName,
          doctorName: doctor?.name ?? cleanText(body.doctorName, null),
          scheduledAt,
          durationMinutes,
          patientNotes: cleanText(body.patientNotes ?? body.notes, null) || null,
          status,
          feeAmountCents,
          paymentStatus,
        },
      });
    });
  } catch (err) {
    if (err instanceof Error && err.message === "OVERLAP") {
      return Response.json(
        { ok: false, error: "That time is no longer available. Please choose another slot." },
        { status: 409 }
      );
    }
    throw err;
  }

  if (appointment.doctorId) {
    await createNotification({
      userId: appointment.doctorId,
      type: "APPOINTMENT_REQUESTED",
      title: "New appointment request",
      message: `${appointment.patientName} requested an appointment.`,
      appointmentId: appointment.id,
      dedupeKey: `appt_requested:${appointment.id}`,
    }).catch(() => null);
  }

  return Response.json({ ok: true, appointment }, { status: 201 });
}
