import { test } from "node:test";
import assert from "node:assert/strict";
import { handleCheckoutCompleted } from "../lib/payments/webhook.js";

const paidSession = {
  id: "cs_test_123",
  payment_status: "paid",
  amount_total: 4500,
  currency: "aud",
  payment_intent: "pi_test_123",
};

test("handleCheckoutCompleted is idempotent when already paid", async () => {
  const appointmentId = "appt-1";
  const prisma = {
    appointment: {
      findUnique: async () => ({
        id: appointmentId,
        paymentStatus: "PAID",
        feeAmountCents: 4500,
      }),
      updateMany: async () => {
        throw new Error("updateMany should not be called when already paid");
      },
    },
  };

  const result = await handleCheckoutCompleted(prisma, {
    ...paidSession,
    metadata: { appointmentId },
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
        feeAmountCents: 4500,
      }),
      updateMany: async ({ where, data }) => {
        updated = { where, data };
        return { count: 1 };
      },
    },
  };

  const result = await handleCheckoutCompleted(prisma, {
    ...paidSession,
    metadata: { appointmentId },
    payment_intent: "pi_test_456",
    id: "cs_test_456",
  });

  assert.equal(result.handled, true);
  assert.equal(result.reason, "marked_paid");
  assert.equal(updated.where.id, appointmentId);
  assert.equal(updated.where.paymentStatus, "UNPAID");
  assert.equal(updated.data.paymentStatus, "PAID");
  assert.equal(updated.data.paymentMethod, "STRIPE");
  assert.equal(updated.data.stripeCheckoutSessionId, "cs_test_456");
  assert.equal(updated.data.stripePaymentIntentId, "pi_test_456");
  assert.ok(updated.data.paidAt instanceof Date);
});

test("handleCheckoutCompleted rejects amount mismatch", async () => {
  const appointmentId = "appt-3";
  const prisma = {
    appointment: {
      findUnique: async () => ({
        id: appointmentId,
        paymentStatus: "UNPAID",
        feeAmountCents: 4500,
      }),
      updateMany: async () => {
        throw new Error("updateMany should not run on amount mismatch");
      },
    },
  };

  const result = await handleCheckoutCompleted(prisma, {
    ...paidSession,
    amount_total: 100,
    metadata: { appointmentId },
  });

  assert.equal(result.handled, false);
  assert.equal(result.reason, "amount_mismatch");
});
