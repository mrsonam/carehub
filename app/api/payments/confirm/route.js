import { getSessionUserOrErrorResponse } from "@/lib/auth-server";
import { patientOwnsAppointment } from "@/lib/booking/ownership";
import { getStripe } from "@/lib/payments/stripe";
import { handleCheckoutCompleted } from "@/lib/payments/webhook";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  if (!patientOwnsAppointment(auth.user, appointment)) {
    return Response.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  if (appointment.paymentStatus === "PAID") {
    return Response.json({ ok: true, appointment });
  }

  const checkoutSessionId = appointment.stripeCheckoutSessionId;
  if (!checkoutSessionId) {
    return Response.json(
      { ok: false, error: "No checkout session found for this appointment." },
      { status: 400 }
    );
  }

  let session;
  try {
    session = await getStripe().checkout.sessions.retrieve(checkoutSessionId);
  } catch {
    return Response.json(
      { ok: false, error: "Could not verify payment session." },
      { status: 502 }
    );
  }

  if (session.metadata?.appointmentId !== appointmentId) {
    return Response.json(
      { ok: false, error: "Payment session does not match this appointment." },
      { status: 400 }
    );
  }

  if (session.payment_status !== "paid") {
    return Response.json(
      { ok: false, error: "Payment is not completed yet." },
      { status: 400 }
    );
  }

  const result = await handleCheckoutCompleted(prisma, session);
  if (!result.handled) {
    return Response.json(
      { ok: false, error: "Payment could not be confirmed." },
      { status: 400 }
    );
  }

  const updated = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  return Response.json({ ok: true, appointment: updated });
}
