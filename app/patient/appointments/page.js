import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionCookieName, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatApptTime } from "@/lib/dashboard-format";
import { AppointmentBookingForm } from "../../components/appointments/AppointmentBookingForm";
import PatientAppointmentsWorkspace from "../../components/patient/PatientAppointmentsWorkspace";

export const dynamic = "force-dynamic";

function scopeForPatient(name) {
  return { patientName: { equals: name, mode: "insensitive" } };
}

function patientScope(user) {
  return {
    OR: [{ patientId: user.id }, scopeForPatient(user.name)],
  };
}

export default async function PatientAppointmentsPage({ searchParams }) {
  const sp = await Promise.resolve(searchParams);
  const focus = sp?.focus;

  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const session = token ? await verifySessionToken(token).catch(() => null) : null;
  if (!session) redirect("/login?next=/patient/appointments");
  if (session.role !== "PATIENT") redirect("/dashboard");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true },
  });
  if (!user) redirect("/login?next=/patient/appointments");

  const w = patientScope(user);
  const now = new Date();
  const terminalStatuses = ["CANCELLED", "COMPLETED", "NO_SHOW"];

  const [upcoming, past, doctors] = await Promise.all([
    prisma.appointment.findMany({
      where: { ...w, scheduledAt: { gte: now }, status: { notIn: terminalStatuses } },
      orderBy: { scheduledAt: "asc" },
    }),
    prisma.appointment.findMany({
      where: {
        AND: [
          w,
          {
            OR: [{ status: { in: terminalStatuses } }, { scheduledAt: { lt: now } }],
          },
        ],
      },
      orderBy: { scheduledAt: "desc" },
      take: 50,
    }),
    prisma.user.findMany({
      where: { role: "DOCTOR" },
      select: { id: true, name: true, title: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="max-w-5xl mx-auto w-full flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-extrabold font-manrope tracking-tight">
          Your appointments
        </h1>
        <p className="text-sm text-foreground/55 mt-1">
          Request new care, then track confirmations and visit history.
        </p>
      </div>

      <AppointmentBookingForm doctors={doctors} />

      <PatientAppointmentsWorkspace
        focus={focus}
        terminalStatuses={terminalStatuses}
        upcoming={upcoming.map((row) => ({
          ...row,
          scheduledAt: row.scheduledAt.toISOString(),
          displayScheduledAt: formatApptTime(row.scheduledAt),
        }))}
        past={past.map((row) => ({
          ...row,
          scheduledAt: row.scheduledAt.toISOString(),
          displayScheduledAt: formatApptTime(row.scheduledAt),
        }))}
      />
    </div>
  );
}
