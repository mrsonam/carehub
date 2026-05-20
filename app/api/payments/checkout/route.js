import { getSessionUserOrErrorResponse } from "@/lib/auth-server";
import { getAppBaseUrl } from "@/lib/app-url";
import { createAppointmentCheckoutSession } from "@/lib/payments/stripe";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function ownsAppointment(user, appointment) {
  return (
    appointment.patientId === user.id ||
    appointment.patientName.toLowerCase() === user.name.toLowerCase()
  );
}

export async function POST(request) {
  const auth = await getSessionUserOrErrorResponse();
  if (auth.response) return auth.response;

  if (auth.user.role !== "PATIENT") {
    return Response.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const appointmentId = body.appointmentId;
  if (!appointmentId) {
    return Response.json({ ok: false, error: "appointmentId is required." }, { status: 400 });
  }

  const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appointment) {
    return Response.json({ ok: false, error: "Appointment not found." }, { status: 404 });
  }

  if (!ownsAppointment(auth.user, appointment)) {
    return Response.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  if (appointment.paymentStatus !== "UNPAID") {
    return Response.json({ ok: false, error: "Payment already recorded." }, { status: 400 });
  }

  if (appointment.feeAmountCents <= 0) {
    return Response.json({ ok: false, error: "This appointment has no fee." }, { status: 400 });
  }

  const origin = getAppBaseUrl();
  const successUrl = `${origin}/patient/appointments/${appointment.id}?paid=1`;
  const cancelUrl = `${origin}/patient/appointments/${appointment.id}?paid=0`;

  const session = await createAppointmentCheckoutSession({
    appointment,
    successUrl,
    cancelUrl,
  });

  await prisma.appointment.update({
    where: { id: appointment.id },
    data: { stripeCheckoutSessionId: session.id },
  });

  return Response.json({ ok: true, url: session.url });
}
