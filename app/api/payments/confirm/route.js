import { getSessionUserOrErrorResponse } from "@/lib/auth-server";
import { getStripe } from "@/lib/payments/stripe";
import { handleCheckoutCompleted } from "@/lib/payments/webhook";
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
  const sessionId = body.sessionId;

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

  if (appointment.paymentStatus === "PAID") {
    return Response.json({ ok: true, appointment });
  }

  const checkoutSessionId = sessionId || appointment.stripeCheckoutSessionId;
  if (!checkoutSessionId) {
    return Response.json(
      { ok: false, error: "No checkout session found for this appointment." },
      { status: 400 }
    );
  }

  const session = await getStripe().checkout.sessions.retrieve(checkoutSessionId);
  if (session.payment_status !== "paid") {
    return Response.json(
      { ok: false, error: "Payment is not completed yet." },
      { status: 400 }
    );
  }

  await handleCheckoutCompleted(prisma, session);

  const updated = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  return Response.json({ ok: true, appointment: updated });
}
