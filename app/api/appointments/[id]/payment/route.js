import { getSessionUserOrErrorResponse } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function ownsAppointment(user, appointment) {
  return (
    appointment.patientId === user.id ||
    appointment.patientName.toLowerCase() === user.name.toLowerCase()
  );
}

export async function PATCH(request, { params }) {
  const auth = await getSessionUserOrErrorResponse();
  if (auth.response) return auth.response;

  const { id } = await params;
  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) {
    return Response.json({ ok: false, error: "Appointment not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));

  if (body.action === "mark_paid_at_counter") {
    if (auth.user.role !== "ADMIN") {
      return Response.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    if (appointment.paymentStatus === "PAID") {
      return Response.json({ ok: true, appointment });
    }
    if (appointment.paymentStatus === "WAIVED") {
      return Response.json({ ok: false, error: "This appointment has no fee." }, { status: 400 });
    }
    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        paymentStatus: "PAID",
        paymentMethod: "PAY_AT_COUNTER",
        paidAt: new Date(),
      },
    });
    return Response.json({ ok: true, appointment: updated });
  }

  if (auth.user.role !== "PATIENT" || !ownsAppointment(auth.user, appointment)) {
    return Response.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  if (body.paymentMethod !== "PAY_AT_COUNTER") {
    return Response.json({ ok: false, error: "Invalid payment method." }, { status: 400 });
  }
  if (appointment.paymentStatus !== "UNPAID") {
    return Response.json({ ok: false, error: "Payment already recorded." }, { status: 400 });
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: { paymentMethod: "PAY_AT_COUNTER" },
  });
  return Response.json({ ok: true, appointment: updated });
}
