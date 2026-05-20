import { getSessionUserOrErrorResponse } from "@/lib/auth-server";
import {
  isWithinConsultationActionWindow,
  resolveAutoCloseStatus,
} from "@/lib/appointment-lifecycle";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications/notifications";
import {
  PAYMENT_REQUIRED_BEFORE_START_MESSAGE,
  requiresPaymentBeforeConsultation,
} from "@/lib/payments/consultation-gate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES = new Set([
  "REQUESTED",
  "CONFIRMED",
  "ONGOING",
  "CANCELLED",
  "COMPLETED",
  "NO_SHOW",
]);

function cleanText(value, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function canManageAppointment(user, appointment) {
  if (user.role === "ADMIN") return true;
  if (user.role === "DOCTOR") {
    return appointment.doctorId === user.id || appointment.doctorName?.toLowerCase() === user.name.toLowerCase();
  }
  if (user.role === "PATIENT") {
    return appointment.patientId === user.id || appointment.patientName.toLowerCase() === user.name.toLowerCase();
  }
  return false;
}

export async function PATCH(request, { params }) {
  const auth = await getSessionUserOrErrorResponse();
  if (auth.response) return auth.response;

  const { id } = await params;
  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) {
    return Response.json({ ok: false, error: "Appointment not found." }, { status: 404 });
  }
  if (!canManageAppointment(auth.user, appointment)) {
    return Response.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const autoStatus = resolveAutoCloseStatus(appointment);
  if (autoStatus) {
    appointment.status = autoStatus;
    await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: autoStatus,
        consultationEndedAt: autoStatus === "COMPLETED" ? new Date() : appointment.consultationEndedAt,
      },
    });
  }

  const body = await request.json().catch(() => ({}));
  const update = {};

  if (typeof body.status === "string") {
    const status = body.status.trim().toUpperCase();
    if (!STATUSES.has(status)) {
      return Response.json({ ok: false, error: "Invalid appointment status." }, { status: 400 });
    }
    if (auth.user.role === "PATIENT" && status !== "CANCELLED") {
      return Response.json({ ok: false, error: "Patients can only cancel appointments." }, { status: 403 });
    }
    if (status === "ONGOING" && requiresPaymentBeforeConsultation(appointment)) {
      return Response.json(
        { ok: false, error: PAYMENT_REQUIRED_BEFORE_START_MESSAGE },
        { status: 403 }
      );
    }
    if (
      auth.user.role !== "PATIENT" &&
      (status === "ONGOING" || status === "NO_SHOW") &&
      !isWithinConsultationActionWindow(appointment)
    ) {
      return Response.json(
        {
          ok: false,
          error:
            "Consultation can only be started or marked no-show from 10 minutes before to 10 minutes after the scheduled time.",
        },
        { status: 403 }
      );
    }
    if (status === "CONFIRMED") {
      update.confirmedAt = new Date();
      update.confirmedById = auth.user.id;
      update.confirmedByName = auth.user.name;
    }
    if (status === "ONGOING" && !appointment.consultationStartedAt) {
      update.consultationStartedAt = new Date();
    }
    if (status === "COMPLETED") {
      update.consultationEndedAt = new Date();
      if (!appointment.consultationStartedAt) {
        update.consultationStartedAt = appointment.scheduledAt;
      }
    }
    if (status === "NO_SHOW" && appointment.status === "ONGOING") {
      update.consultationEndedAt = new Date();
    }
    update.status = status;
  }

  if (auth.user.role !== "PATIENT" && Object.prototype.hasOwnProperty.call(body, "doctorNotes")) {
    update.doctorNotes = cleanText(body.doctorNotes, null) || null;
  }

  if (auth.user.role === "PATIENT" && Object.prototype.hasOwnProperty.call(body, "patientNotes")) {
    if (appointment.status !== "REQUESTED") {
      return Response.json(
        { ok: false, error: "Patient notes can only be changed before confirmation." },
        { status: 403 }
      );
    }
    update.patientNotes = cleanText(body.patientNotes, null) || null;
  }

  if (auth.user.role !== "PATIENT" && Object.prototype.hasOwnProperty.call(body, "notes")) {
    update.doctorNotes = cleanText(body.notes, null) || null;
  }

  if (auth.user.role === "ADMIN" && typeof body.scheduledAt === "string") {
    const scheduledAt = new Date(body.scheduledAt);
    if (Number.isNaN(scheduledAt.getTime())) {
      return Response.json({ ok: false, error: "Choose a valid date and time." }, { status: 400 });
    }
    update.scheduledAt = scheduledAt;
  }

  if (Object.keys(update).length === 0) {
    return Response.json({ ok: false, error: "Nothing to update." }, { status: 400 });
  }

  const prevStatus = appointment.status;
  const updated = await prisma.appointment.update({
    where: { id },
    data: update,
  });

  if (typeof update.status === "string" && update.status !== prevStatus) {
    const whenLabel = updated.scheduledAt.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    if (update.status === "CONFIRMED") {
      if (updated.patientId) {
        await createNotification({
          userId: updated.patientId,
          type: "APPOINTMENT_CONFIRMED",
          title: "Appointment confirmed",
          message: `Your appointment is confirmed for ${whenLabel}.`,
          appointmentId: updated.id,
          dedupeKey: `appt_confirmed:${updated.id}`,
        }).catch(() => null);
      }
      if (updated.doctorId) {
        await createNotification({
          userId: updated.doctorId,
          type: "APPOINTMENT_CONFIRMED",
          title: "Appointment confirmed",
          message: `An appointment was confirmed for ${whenLabel}.`,
          appointmentId: updated.id,
          dedupeKey: `appt_confirmed_doctor:${updated.id}`,
        }).catch(() => null);
      }
    }

    if (update.status === "CANCELLED") {
      if (updated.patientId) {
        await createNotification({
          userId: updated.patientId,
          type: "APPOINTMENT_CANCELLED",
          title: "Appointment cancelled",
          message: `Your appointment scheduled for ${whenLabel} was cancelled.`,
          appointmentId: updated.id,
          dedupeKey: `appt_cancelled:${updated.id}`,
        }).catch(() => null);
      }
      if (updated.doctorId) {
        await createNotification({
          userId: updated.doctorId,
          type: "APPOINTMENT_CANCELLED",
          title: "Appointment cancelled",
          message: `An appointment scheduled for ${whenLabel} was cancelled.`,
          appointmentId: updated.id,
          dedupeKey: `appt_cancelled_doctor:${updated.id}`,
        }).catch(() => null);
      }
    }
  }

  return Response.json({ ok: true, appointment: updated });
}
