import { getStripe } from "@/lib/payments/stripe";
import { handleCheckoutCompleted } from "@/lib/payments/webhook";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) {
    return new Response("Webhook not configured", { status: 500 });
  }

  const rawBody = await request.text();
  let event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, secret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    await handleCheckoutCompleted(prisma, event.data.object);
  }

  return Response.json({ received: true });
}
