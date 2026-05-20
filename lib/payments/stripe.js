import Stripe from "stripe";

let stripe;

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  if (!stripe) stripe = new Stripe(key, { apiVersion: "2024-11-20.acacia" });
  return stripe;
}

export async function createAppointmentCheckoutSession({ appointment, successUrl, cancelUrl }) {
  const stripe = getStripe();
  const currency = (process.env.PAYMENT_CURRENCY || "aud").toLowerCase();

  return stripe.checkout.sessions.create({
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency,
          unit_amount: appointment.feeAmountCents,
          product_data: {
            name: "Appointment fee",
            description: `${appointment.durationMinutes} min with ${appointment.doctorName ?? "clinic"}`,
          },
        },
      },
    ],
    metadata: { appointmentId: appointment.id },
  });
}
