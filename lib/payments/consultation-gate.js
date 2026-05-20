export const PAYMENT_REQUIRED_BEFORE_START_MESSAGE =
  "Payment is required before starting this consultation. The patient can pay online, or an admin can mark the fee paid at the counter.";

/** True when the appointment has a fee that is not yet paid or waived. */
export function requiresPaymentBeforeConsultation(appointment) {
  const fee = Number(appointment?.feeAmountCents ?? 0);
  if (fee <= 0) return false;
  const status = String(appointment?.paymentStatus ?? "UNPAID");
  return status !== "PAID" && status !== "WAIVED";
}

export function canStartConsultation(appointment) {
  return !requiresPaymentBeforeConsultation(appointment);
}
