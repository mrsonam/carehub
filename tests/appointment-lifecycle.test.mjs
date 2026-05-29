import assert from "node:assert/strict";
import test from "node:test";
import {
  CONSULTATION_WINDOW_MINUTES,
  isPastDueWithoutConsultation,
  isActiveUpcomingAppointment,
  isCalendarVisibleAppointment,
  resolveAutoCloseStatus,
  shouldAutoCompleteConsultation,
} from "../lib/appointment-lifecycle.js";

const base = {
  durationMinutes: 30,
  consultationStartedAt: null,
  consultationEndedAt: null,
};

test("confirmed appointment past start window without consultation auto-cancels", () => {
  const scheduledAt = new Date("2026-05-01T10:00:00");
  const appt = { ...base, status: "CONFIRMED", scheduledAt };
  const now = new Date(scheduledAt.getTime() + (CONSULTATION_WINDOW_MINUTES + 1) * 60 * 1000);

  assert.equal(resolveAutoCloseStatus(appt, now), "CANCELLED");
  assert.equal(isPastDueWithoutConsultation(appt, now), true);
  assert.equal(isActiveUpcomingAppointment(appt, now), false);
  assert.equal(isCalendarVisibleAppointment(appt, now), false);
});

test("confirmed appointment still within start window stays active", () => {
  const scheduledAt = new Date("2026-05-01T10:00:00");
  const appt = { ...base, status: "CONFIRMED", scheduledAt };
  const now = new Date(scheduledAt.getTime() + 5 * 60 * 1000);

  assert.equal(resolveAutoCloseStatus(appt, now), null);
  assert.equal(isActiveUpcomingAppointment(appt, now), true);
});

test("ongoing consultation with start time auto-completes after slot end", () => {
  const scheduledAt = new Date("2026-05-01T10:00:00");
  const appt = {
    ...base,
    status: "ONGOING",
    scheduledAt,
    consultationStartedAt: new Date("2026-05-01T10:05:00"),
  };
  const now = new Date(scheduledAt.getTime() + 31 * 60 * 1000);

  assert.equal(shouldAutoCompleteConsultation(appt, now), true);
  assert.equal(resolveAutoCloseStatus(appt, now), "COMPLETED");
});

test("requested appointment past window is cancelled", () => {
  const scheduledAt = new Date("2026-05-01T14:00:00");
  const appt = { ...base, status: "REQUESTED", scheduledAt };
  const now = new Date(scheduledAt.getTime() + (CONSULTATION_WINDOW_MINUTES + 1) * 60 * 1000);

  assert.equal(resolveAutoCloseStatus(appt, now), "CANCELLED");
});

test("cancelled appointments are hidden from calendar", () => {
  const appt = {
    ...base,
    status: "CANCELLED",
    scheduledAt: new Date("2026-05-01T10:00:00"),
  };
  assert.equal(isCalendarVisibleAppointment(appt), false);
});
