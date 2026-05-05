import { notFound } from "next/navigation";
import { requireAdminUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { AppointmentDetailsPanel } from "../../../components/appointments/AppointmentDetailsPanel";

export const dynamic = "force-dynamic";

export default async function AdminAppointmentDetailsPage({ params }) {
  const { id } = await params;
  await requireAdminUser(`/admin/appointments/${id}`);

  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) notFound();

  return (
    <div className="max-w-5xl mx-auto w-full flex flex-col gap-6">
      <AppointmentDetailsPanel appointment={appointment} />
    </div>
  );
}
