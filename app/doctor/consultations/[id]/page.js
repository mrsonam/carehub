import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionCookieName, verifySessionToken } from "@/lib/auth";
import {
  isWithinConsultationActionWindow,
  resolveAutoCloseStatus,
} from "@/lib/appointment-lifecycle";
import { prisma } from "@/lib/prisma";
import { AppointmentStatusBadge } from "../../../components/appointments/AppointmentStatusBadge";
import { ConsultationWorkspace } from "./ConsultationWorkspace";

export const dynamic = "force-dynamic";

function doctorCanOpen(user, appointment) {
  return (
    appointment.doctorId === user.id ||
    appointment.doctorName?.toLowerCase() === user.name.toLowerCase()
  );
}

export default async function DoctorConsultationPage({ params }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const session = token ? await verifySessionToken(token).catch(() => null) : null;
  if (!session) redirect(`/login?next=/doctor/consultations/${id}`);
  if (session.role !== "DOCTOR") redirect("/dashboard");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true },
  });
  if (!user) redirect(`/login?next=/doctor/consultations/${id}`);

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      patient: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
        },
      },
    },
  });

  if (!appointment || !doctorCanOpen(user, appointment)) {
    redirect("/doctor/schedule");
  }

  const autoStatus = resolveAutoCloseStatus(appointment);
  if (autoStatus) {
    await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: autoStatus,
        consultationEndedAt: autoStatus === "COMPLETED" ? new Date() : appointment.consultationEndedAt,
      },
    });
    appointment.status = autoStatus;
  }

  if (appointment.status === "CONFIRMED") {
    if (!isWithinConsultationActionWindow(appointment)) {
      redirect("/doctor/schedule");
    }
    await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: "ONGOING",
        consultationStartedAt: appointment.consultationStartedAt ?? new Date(),
      },
    });
    appointment.status = "ONGOING";
    appointment.consultationStartedAt = appointment.consultationStartedAt ?? new Date();
  }

  if (!["ONGOING", "COMPLETED", "NO_SHOW"].includes(appointment.status)) {
    redirect("/doctor/schedule");
  }

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-extrabold font-manrope tracking-tight">
              Consultation with {appointment.patientName}
            </h1>
            <AppointmentStatusBadge status={appointment.status} />
          </div>
          <p className="text-sm text-foreground/55 mt-1">
            Review patient context, document clinical recommendations, and complete
            the appointment from one workspace.
          </p>
        </div>
      </header>

      <ConsultationWorkspace
        appointment={{
          ...appointment,
          scheduledAt: appointment.scheduledAt.toISOString(),
          createdAt: appointment.createdAt.toISOString(),
          updatedAt: appointment.updatedAt.toISOString(),
          patient: appointment.patient
            ? {
                ...appointment.patient,
                createdAt: appointment.patient.createdAt.toISOString(),
              }
            : null,
        }}
      />
    </div>
  );
}
