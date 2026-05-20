export async function handleCheckoutCompleted(prisma, session) {
  const appointmentId = session.metadata?.appointmentId;
  if (!appointmentId) return { handled: false, reason: "missing_appointment_id" };

  const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appointment) return { handled: false, reason: "appointment_not_found" };
  if (appointment.paymentStatus === "PAID") return { handled: true, reason: "already_paid" };

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      paymentStatus: "PAID",
      paymentMethod: "STRIPE",
      paidAt: new Date(),
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null,
    },
  });
  return { handled: true, reason: "marked_paid" };
}
