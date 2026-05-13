import { prisma } from "@/lib/prisma";

function safeDedupeKey(parts) {
  return parts.filter(Boolean).join(":");
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  appointmentId = null,
  dedupeKey = null,
}) {
  const trimmedTitle = String(title || "").trim();
  const trimmedMessage = String(message || "").trim();
  if (!userId || !type || !trimmedTitle || !trimmedMessage) {
    throw new Error("createNotification missing required fields");
  }

  const key = dedupeKey ? safeDedupeKey([dedupeKey]) : null;

  // Best-effort dedupe: if key exists and conflicts, ignore.
  try {
    return await prisma.notification.create({
      data: {
        userId,
        type,
        title: trimmedTitle,
        message: trimmedMessage,
        appointmentId,
        dedupeKey: key,
      },
    });
  } catch (err) {
    if (key && String(err?.code) === "P2002") {
      return null;
    }
    throw err;
  }
}

export async function createAppointmentReminderNotifications({ now = new Date() } = {}) {
  const msNow = now.getTime();
  const oneHourMs = 60 * 60 * 1000;
  const dayMs = 24 * oneHourMs;

  // Only for confirmed appointments with both patient and doctor.
  const upcoming = await prisma.appointment.findMany({
    where: {
      status: "CONFIRMED",
      scheduledAt: { gte: now, lte: new Date(msNow + dayMs + 5 * 60 * 1000) },
      patientId: { not: null },
      doctorId: { not: null },
    },
    select: {
      id: true,
      patientId: true,
      doctorId: true,
      patientName: true,
      doctorName: true,
      scheduledAt: true,
    },
  });

  let created = 0;

  for (const appt of upcoming) {
    const msUntil = appt.scheduledAt.getTime() - msNow;

    const needs24h = msUntil <= dayMs && msUntil > dayMs - 15 * 60 * 1000;
    const needs1h = msUntil <= oneHourMs && msUntil > oneHourMs - 10 * 60 * 1000;

    if (!needs24h && !needs1h) continue;

    const whenLabel = appt.scheduledAt.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    if (needs24h) {
      const dedupe = `reminder24h:${appt.id}`;
      const patientCreated = await createNotification({
        userId: appt.patientId,
        type: "APPOINTMENT_REMINDER_24H",
        title: "Appointment reminder (24h)",
        message: `You have an appointment scheduled for ${whenLabel}.`,
        appointmentId: appt.id,
        dedupeKey: `${dedupe}:patient`,
      });
      const doctorCreated = await createNotification({
        userId: appt.doctorId,
        type: "APPOINTMENT_REMINDER_24H",
        title: "Appointment reminder (24h)",
        message: `You have an appointment scheduled for ${whenLabel}.`,
        appointmentId: appt.id,
        dedupeKey: `${dedupe}:doctor`,
      });
      created += (patientCreated ? 1 : 0) + (doctorCreated ? 1 : 0);
    }

    if (needs1h) {
      const dedupe = `reminder1h:${appt.id}`;
      const patientCreated = await createNotification({
        userId: appt.patientId,
        type: "APPOINTMENT_REMINDER_1H",
        title: "Appointment reminder (1h)",
        message: `Your appointment starts in about 1 hour (${whenLabel}).`,
        appointmentId: appt.id,
        dedupeKey: `${dedupe}:patient`,
      });
      const doctorCreated = await createNotification({
        userId: appt.doctorId,
        type: "APPOINTMENT_REMINDER_1H",
        title: "Appointment reminder (1h)",
        message: `Your appointment starts in about 1 hour (${whenLabel}).`,
        appointmentId: appt.id,
        dedupeKey: `${dedupe}:doctor`,
      });
      created += (patientCreated ? 1 : 0) + (doctorCreated ? 1 : 0);
    }
  }

  return { ok: true, created };
}

