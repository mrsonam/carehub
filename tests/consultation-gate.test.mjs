import assert from "node:assert/strict";
import test from "node:test";
import {
  canStartConsultation,
  requiresPaymentBeforeConsultation,
} from "../lib/payments/consultation-gate.js";

test("requires payment when fee is due and unpaid", () => {
  assert.equal(
    requiresPaymentBeforeConsultation({ feeAmountCents: 5000, paymentStatus: "UNPAID" }),
    true
  );
  assert.equal(canStartConsultation({ feeAmountCents: 5000, paymentStatus: "UNPAID" }), false);
});

test("allows start when paid, waived, or no fee", () => {
  assert.equal(
    requiresPaymentBeforeConsultation({ feeAmountCents: 5000, paymentStatus: "PAID" }),
    false
  );
  assert.equal(
    requiresPaymentBeforeConsultation({ feeAmountCents: 5000, paymentStatus: "WAIVED" }),
    false
  );
  assert.equal(
    requiresPaymentBeforeConsultation({ feeAmountCents: 0, paymentStatus: "UNPAID" }),
    false
  );
});
