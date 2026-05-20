import { UserRound } from "lucide-react";
import { requireAdminUser } from "@/lib/auth-server";
import { autoCloseExpiredAppointments } from "@/lib/appointment-lifecycle";
import { prisma } from "@/lib/prisma";
import { AppointmentBookingForm } from "../../components/appointments/AppointmentBookingForm";
import AppointmentsWorkspace from "../../components/admin/AppointmentsWorkspace";
import AdminAppointmentsCalendar from "../../components/admin/AdminAppointmentsCalendar";

export const dynamic = "force-dynamic";

export default async function AdminAppointmentsPage() {
  await requireAdminUser("/admin/appointments");
  await autoCloseExpiredAppointments(prisma);

  const [appointments, doctors, patients] = await Promise.all([
    prisma.appointment.findMany({
      orderBy: { scheduledAt: "asc" },
      take: 250,
    }),
    prisma.user.findMany({
      where: { role: "DOCTOR" },
      select: { id: true, name: true, title: true },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where: { role: "PATIENT" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="max-w-6xl mx-auto w-full flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-extrabold font-manrope tracking-tight">
          Appointments
        </h1>
        <p className="text-sm text-foreground/55 mt-1">
          Create bookings, confirm requests, and manage clinic-wide visit status.
        </p>
      </div>

      <AppointmentBookingForm doctors={doctors} patients={patients} mode="admin" />

      <AdminAppointmentsCalendar
        appointments={appointments.map((appt) => ({
          ...appt,
          scheduledAt: appt.scheduledAt.toISOString(),
        }))}
      />

      <AppointmentsWorkspace
        appointments={appointments.map((appt) => ({
          ...appt,
          scheduledAt: appt.scheduledAt.toISOString(),
        }))}
      />

      {patients.length === 0 ? (
        <div className="panel p-5 flex gap-3 text-sm text-foreground/60">
          <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <UserRound size={16} />
          </span>
          Add patient users before creating linked appointments.
        </div>
      ) : null}
    </div>
  );
}
