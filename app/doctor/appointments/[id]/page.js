import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSessionCookieName, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppointmentDetailsPanel } from "../../../components/appointments/AppointmentDetailsPanel";

export const dynamic = "force-dynamic";

function doctorScope(user) {
  return {
    OR: [
      { doctorId: user.id },
      { doctorName: { equals: user.name, mode: "insensitive" } },
    ],
  };
}

export default async function DoctorAppointmentDetailsPage({ params }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const session = token ? await verifySessionToken(token).catch(() => null) : null;
  if (!session) redirect(`/login?next=/doctor/appointments/${id}`);
  if (session.role !== "DOCTOR") redirect("/dashboard");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true },
  });
  if (!user) redirect(`/login?next=/doctor/appointments/${id}`);

  const appointment = await prisma.appointment.findFirst({
    where: { id, ...doctorScope(user) },
  });
  if (!appointment) notFound();

  return (
    <div className="max-w-5xl mx-auto w-full flex flex-col gap-6">
      <AppointmentDetailsPanel appointment={appointment} />
    </div>
  );
}
