export const CONSULTATION_WINDOW_MINUTES = 10;

function windowTimes(scheduledAt) {
  const appointmentMs = new Date(scheduledAt).getTime();
  const paddingMs = CONSULTATION_WINDOW_MINUTES * 60 * 1000;
  return {
    startMs: appointmentMs - paddingMs,
    endMs: appointmentMs + paddingMs,
  };
}

export function isWithinConsultationActionWindow(appointment, now = new Date()) {
  const nowMs = now.getTime();
  const { startMs, endMs } = windowTimes(appointment.scheduledAt);
  return nowMs >= startMs && nowMs <= endMs;
}

export function resolveAutoCloseStatus(appointment, now = new Date()) {
  const nowMs = now.getTime();
  const { endMs } = windowTimes(appointment.scheduledAt);
  if (nowMs <= endMs) return null;
  if (appointment.status === "CONFIRMED") return "NO_SHOW";
  if (appointment.status === "ONGOING") return "COMPLETED";
  return null;
}

export async function autoCloseExpiredAppointments(prisma, where = {}) {
  const now = new Date();
  const cutoff = new Date(now.getTime() - CONSULTATION_WINDOW_MINUTES * 60 * 1000);

  const [toNoShow, toCompleted] = await Promise.all([
    prisma.appointment.updateMany({
      where: {
        ...where,
        status: "CONFIRMED",
        scheduledAt: { lt: cutoff },
      },
      data: { status: "NO_SHOW" },
    }),
    prisma.appointment.updateMany({
      where: {
        ...where,
        status: "ONGOING",
        scheduledAt: { lt: cutoff },
      },
      data: {
        status: "COMPLETED",
        consultationEndedAt: now,
      },
    }),
  ]);

  return toNoShow.count + toCompleted.count;
}
