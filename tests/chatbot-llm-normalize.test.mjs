import test from "node:test";
import assert from "node:assert/strict";

import { normalizeModelText } from "../lib/chatbot/llm.js";

test("normalizeModelText unwraps JSON response wrapper", () => {
  const wrapped =
    '{"response":"CareHub is a clinic. Contact info@c.example.com for more."}';
  assert.equal(
    normalizeModelText(wrapped),
    "CareHub is a clinic. Contact info@c.example.com for more.",
  );
});

test("normalizeModelText leaves plain prose unchanged", () => {
  assert.equal(normalizeModelText("Hello world."), "Hello world.");
});
