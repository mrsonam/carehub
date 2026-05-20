import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionCookieName, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { avatarDisplayUrl } from "@/lib/profile/avatar-url";
import { PatientDashboardHome } from "@/app/components/patient/PatientDashboardHome";

export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

function scopeForPatient(user) {
  return {
    OR: [
      { patientId: user.id },
      { patientName: { equals: user.name, mode: "insensitive" } },
    ],
  };
}

async function loadPatientDashboard(user) {
  const w = scopeForPatient(user);
  const now = new Date();
  const weekEnd = new Date(now.getTime() + 7 * DAY_MS);
  const terminalStatuses = ["CANCELLED", "COMPLETED", "NO_SHOW"];

  const [upcoming, pastVisits, weekCount, doctorsInNetwork] = await Promise.all([
    prisma.appointment.findMany({
      where: { ...w, scheduledAt: { gte: now }, status: { notIn: terminalStatuses } },
      orderBy: { scheduledAt: "asc" },
      take: 20,
    }),
    prisma.appointment.findMany({
      where: {
        AND: [
          w,
          { OR: [{ status: { in: ["COMPLETED", "NO_SHOW"] } }, { scheduledAt: { lt: now } }] },
          { status: { not: "CANCELLED" } },
        ],
      },
      orderBy: { scheduledAt: "desc" },
      take: 8,
    }),
    prisma.appointment.count({
      where: {
        ...w,
        scheduledAt: { gte: now, lte: weekEnd },
        status: { notIn: terminalStatuses },
      },
    }),
    prisma.user.count({ where: { role: "DOCTOR" } }),
  ]);

  const nextAppt = upcoming[0] ?? null;
  const nextDoctorRow = nextAppt?.doctorId
    ? await prisma.user.findUnique({
        where: { id: nextAppt.doctorId },
        select: { name: true, title: true, avatarUrl: true, updatedAt: true },
      })
    : null;

  const nextDoctor = nextDoctorRow
    ? {
        name: nextDoctorRow.name,
        title: nextDoctorRow.title,
        avatarUrl: avatarDisplayUrl(nextDoctorRow.avatarUrl, nextDoctorRow.updatedAt),
      }
    : null;

  return {
    upcoming,
    pastVisits,
    weekCount,
    doctorsInNetwork,
    nextAppt,
    nextDoctor,
  };
}

export default async function PatientDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const session = token ? await verifySessionToken(token).catch(() => null) : null;
  if (!session) redirect("/login?next=/patient/dashboard");
  if (session.role !== "PATIENT") redirect("/dashboard");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, profileCompletedAt: true },
  });
  if (!user) redirect("/login?next=/patient/dashboard");

  const data = await loadPatientDashboard(user);
  const firstName = user.name.split(/\s+/)[0] ?? user.name;

  return (
    <PatientDashboardHome
      firstName={firstName}
      profileComplete={Boolean(user.profileCompletedAt)}
      weekCount={data.weekCount}
      upcoming={data.upcoming}
      pastVisits={data.pastVisits}
      doctorsInNetwork={data.doctorsInNetwork}
      nextAppt={data.nextAppt}
      nextDoctor={data.nextDoctor}
    />
  );
}
