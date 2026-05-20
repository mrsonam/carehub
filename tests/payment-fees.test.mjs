import { test } from "node:test";
import assert from "node:assert/strict";
import { feeCentsForDuration, ALLOWED_DURATIONS } from "../lib/payments/fees.js";

const schedule = {
  fee15Cents: 5000,
  fee30Cents: 8000,
  fee45Cents: 11000,
  fee60Cents: 14000,
};

test("feeCentsForDuration maps each allowed duration", () => {
  assert.equal(feeCentsForDuration(15, schedule), 5000);
  assert.equal(feeCentsForDuration(30, schedule), 8000);
  assert.equal(feeCentsForDuration(45, schedule), 11000);
  assert.equal(feeCentsForDuration(60, schedule), 14000);
});

test("feeCentsForDuration rejects unknown duration", () => {
  assert.throws(() => feeCentsForDuration(20, schedule), /duration/i);
});

test("ALLOWED_DURATIONS matches booking form", () => {
  assert.deepEqual([...ALLOWED_DURATIONS].sort(), [15, 30, 45, 60]);
});
