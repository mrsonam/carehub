import { test } from "node:test";
import assert from "node:assert/strict";
import {
  WEEKDAY_LABELS_LONG,
  weekdayFromDate,
  weekdayLabel,
} from "../lib/calendar/weekdays.js";

test("weekday codes follow JavaScript Date#getDay (0 = Sunday)", () => {
  assert.equal(WEEKDAY_LABELS_LONG[0], "Sunday");
  assert.equal(WEEKDAY_LABELS_LONG[1], "Monday");
  assert.equal(WEEKDAY_LABELS_LONG[6], "Saturday");
});

test("weekly template index matches calendar weekday for each day", () => {
  const monday = new Date(2026, 5, 1, 12, 0, 0, 0);
  assert.equal(weekdayFromDate(monday), 1);
  assert.equal(WEEKDAY_LABELS_LONG[weekdayFromDate(monday)], "Monday");

  const sunday = new Date(2026, 5, 7, 12, 0, 0, 0);
  assert.equal(weekdayFromDate(sunday), 0);
  assert.equal(weekdayLabel(0), "Sunday");
});

test("Monday is not stored as weekday 0", () => {
  const monday = new Date(2026, 5, 1, 12, 0, 0, 0);
  assert.notEqual(weekdayFromDate(monday), 0);
});
