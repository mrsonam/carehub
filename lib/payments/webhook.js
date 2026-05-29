function paymentCurrency() {
  return (process.env.PAYMENT_CURRENCY || "aud").toLowerCase();
}

export async function handleCheckoutCompleted(prisma, session) {
  const appointmentId = session.metadata?.appointmentId;
  if (!appointmentId) return { handled: false, reason: "missing_appointment_id" };

  if (session.payment_status !== "paid") {
    return { handled: false, reason: "payment_not_completed" };
  }

  const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appointment) return { handled: false, reason: "appointment_not_found" };
  if (appointment.paymentStatus === "PAID") return { handled: true, reason: "already_paid" };

  const expectedAmount = appointment.feeAmountCents;
  if (typeof session.amount_total === "number" && session.amount_total !== expectedAmount) {
    return { handled: false, reason: "amount_mismatch" };
  }

  const currency = paymentCurrency();
  if (session.currency && String(session.currency).toLowerCase() !== currency) {
    return { handled: false, reason: "currency_mismatch" };
  }

  const result = await prisma.appointment.updateMany({
    where: { id: appointmentId, paymentStatus: "UNPAID" },
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

  if (result.count === 0) {
    const latest = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { paymentStatus: true },
    });
    if (latest?.paymentStatus === "PAID") {
      return { handled: true, reason: "already_paid" };
    }
    return { handled: false, reason: "update_failed" };
  }

  return { handled: true, reason: "marked_paid" };
}
