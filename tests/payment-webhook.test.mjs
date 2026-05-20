import { test } from "node:test";
import assert from "node:assert/strict";
import { handleCheckoutCompleted } from "../lib/payments/webhook.js";

test("handleCheckoutCompleted is idempotent when already paid", async () => {
  const appointmentId = "appt-1";
  const prisma = {
    appointment: {
      findUnique: async () => ({
        id: appointmentId,
        paymentStatus: "PAID",
      }),
      update: async () => {
        throw new Error("update should not be called when already paid");
      },
    },
  };

  const result = await handleCheckoutCompleted(prisma, {
    id: "cs_test_123",
    metadata: { appointmentId },
    payment_intent: "pi_test_123",
  });

  assert.equal(result.handled, true);
  assert.equal(result.reason, "already_paid");
});

test("handleCheckoutCompleted marks unpaid appointment as paid", async () => {
  const appointmentId = "appt-2";
  let updated;
  const prisma = {
    appointment: {
      findUnique: async () => ({
        id: appointmentId,
        paymentStatus: "UNPAID",
      }),
      update: async ({ where, data }) => {
        updated = { where, data };
        return { id: where.id, ...data };
      },
    },
  };

  const result = await handleCheckoutCompleted(prisma, {
    id: "cs_test_456",
    metadata: { appointmentId },
    payment_intent: "pi_test_456",
  });

  assert.equal(result.handled, true);
  assert.equal(result.reason, "marked_paid");
  assert.equal(updated.where.id, appointmentId);
  assert.equal(updated.data.paymentStatus, "PAID");
  assert.equal(updated.data.paymentMethod, "STRIPE");
  assert.equal(updated.data.stripeCheckoutSessionId, "cs_test_456");
  assert.equal(updated.data.stripePaymentIntentId, "pi_test_456");
  assert.ok(updated.data.paidAt instanceof Date);
});
