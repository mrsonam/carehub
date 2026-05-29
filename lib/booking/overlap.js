export const ACTIVE_APPOINTMENT_STATUSES = ["REQUESTED", "CONFIRMED", "ONGOING"];

export function rangesOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

/**
 * @param {import("@prisma/client").PrismaClient | import("@prisma/client").Prisma.TransactionClient} db
 */
export async function doctorHasSchedulingConflict(
  db,
  { doctorId, scheduledAt, durationMinutes, excludeAppointmentId = null }
) {
  const dayStart = new Date(scheduledAt);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayStart.getDate() + 1);

  const activeAppointments = await db.appointment.findMany({
    where: {
      doctorId,
      scheduledAt: { gte: dayStart, lt: dayEnd },
      status: { in: ACTIVE_APPOINTMENT_STATUSES },
      ...(excludeAppointmentId ? { id: { not: excludeAppointmentId } } : {}),
    },
    select: { id: true, scheduledAt: true, durationMinutes: true },
  });

  const requestedStart = scheduledAt.getTime();
  const requestedEnd = requestedStart + durationMinutes * 60 * 1000;

  return activeAppointments.some((appt) => {
    const start = appt.scheduledAt.getTime();
    const end = start + (appt.durationMinutes || 15) * 60 * 1000;
    return rangesOverlap(requestedStart, requestedEnd, start, end);
  });
}
