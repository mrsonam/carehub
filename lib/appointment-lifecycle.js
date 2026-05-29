export const CONSULTATION_WINDOW_MINUTES = 10;

export const TERMINAL_STATUSES = ["CANCELLED", "COMPLETED", "NO_SHOW"];

function windowTimes(scheduledAt) {
  const appointmentMs = new Date(scheduledAt).getTime();
  const paddingMs = CONSULTATION_WINDOW_MINUTES * 60 * 1000;
  return {
    startMs: appointmentMs - paddingMs,
    endMs: appointmentMs + paddingMs,
  };
}

/** End of the booked slot (scheduled start + duration). */
export function appointmentSlotEndMs(appointment) {
  const durationMinutes = appointment.durationMinutes ?? 15;
  return new Date(appointment.scheduledAt).getTime() + durationMinutes * 60 * 1000;
}

export function hasConsultationStarted(appointment) {
  return Boolean(appointment.consultationStartedAt);
}

export function isWithinConsultationActionWindow(appointment, now = new Date()) {
  const nowMs = now.getTime();
  const { startMs, endMs } = windowTimes(appointment.scheduledAt);
  return nowMs >= startMs && nowMs <= endMs;
}

/** Past the start window with no consultation recorded. */
export function isPastDueWithoutConsultation(appointment, now = new Date()) {
  if (TERMINAL_STATUSES.includes(appointment.status)) return false;
  if (hasConsultationStarted(appointment)) return false;
  const nowMs = now.getTime();
  const { endMs } = windowTimes(appointment.scheduledAt);
  return nowMs > endMs;
}

export function shouldAutoCompleteConsultation(appointment, now = new Date()) {
  if (appointment.status !== "ONGOING") return false;
  if (!hasConsultationStarted(appointment)) return false;
  return now.getTime() > appointmentSlotEndMs(appointment);
}

export function resolveAutoCloseStatus(appointment, now = new Date()) {
  if (shouldAutoCompleteConsultation(appointment, now)) return "COMPLETED";
  if (isPastDueWithoutConsultation(appointment, now)) return "CANCELLED";
  return null;
}

/** Active queue / upcoming lists — excludes past-due visits that were never started. */
export function isActiveUpcomingAppointment(appointment, now = new Date()) {
  if (TERMINAL_STATUSES.includes(appointment.status)) return false;
  if (appointment.status === "ONGOING" && hasConsultationStarted(appointment)) return true;
  if (isWithinConsultationActionWindow(appointment, now)) return true;
  return new Date(appointment.scheduledAt).getTime() > now.getTime();
}

/** Month/day calendar views — hide auto-cancelled and stale past-due rows. */
export function isCalendarVisibleAppointment(appointment, now = new Date()) {
  if (appointment.status === "CANCELLED") return false;
  if (isPastDueWithoutConsultation(appointment, now)) return false;
  return true;
}

export async function autoCloseExpiredAppointments(prisma, where = {}) {
  const now = new Date();

  const candidates = await prisma.appointment.findMany({
    where: {
      ...where,
      status: { in: ["REQUESTED", "CONFIRMED", "ONGOING"] },
      scheduledAt: { lt: now },
    },
  });

  const toCancel = [];
  const toComplete = [];

  for (const appt of candidates) {
    const auto = resolveAutoCloseStatus(appt, now);
    if (auto === "CANCELLED") toCancel.push(appt.id);
    if (auto === "COMPLETED") toComplete.push(appt.id);
  }

  const [cancelled, completed] = await Promise.all([
    toCancel.length
      ? prisma.appointment.updateMany({
          where: { id: { in: toCancel } },
          data: { status: "CANCELLED" },
        })
      : Promise.resolve({ count: 0 }),
    toComplete.length
      ? prisma.appointment.updateMany({
          where: { id: { in: toComplete } },
          data: { status: "COMPLETED", consultationEndedAt: now },
        })
      : Promise.resolve({ count: 0 }),
  ]);

  return cancelled.count + completed.count;
}
