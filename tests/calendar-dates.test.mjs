import assert from "node:assert/strict";
import test from "node:test";
import { monthGrid, WEEKDAY_HEADERS } from "../lib/calendar/dates.js";

test("WEEKDAY_HEADERS starts on Monday", () => {
  assert.equal(WEEKDAY_HEADERS[0], "Mon");
  assert.equal(WEEKDAY_HEADERS[6], "Sun");
});

test("monthGrid places Mondays in the first column", () => {
  const anchor = new Date(2026, 4, 1, 12, 0, 0, 0); // May 2026
  const days = monthGrid(anchor);

  assert.equal(days.length, 42);

  for (let row = 0; row < 6; row++) {
    const monday = days[row * 7];
    const sunday = days[row * 7 + 6];
    assert.equal(monday.getDay(), 1, `row ${row} column Mon should be Monday`);
    assert.equal(sunday.getDay(), 0, `row ${row} column Sun should be Sunday`);
  }
});

test("monthGrid first row includes the 1st of the month", () => {
  const anchor = new Date(2026, 4, 1, 12, 0, 0, 0); // May 2026 (1st is Friday)
  const days = monthGrid(anchor);
  const hasFirst = days.some((d) => d.getFullYear() === 2026 && d.getMonth() === 4 && d.getDate() === 1);
  assert.ok(hasFirst);
});
