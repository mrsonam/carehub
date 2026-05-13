import test from "node:test";
import assert from "node:assert/strict";

import { checkChatRateLimit } from "../lib/chatbot/rate-limit.js";

function requestWithIp(ip) {
  return new Request("http://localhost/api/chatbot", {
    headers: { "x-forwarded-for": ip },
  });
}

test("checkChatRateLimit blocks after limit", () => {
  const ip = "9.9.9.9";
  let lastResult = null;

  for (let i = 0; i < 16; i += 1) {
    lastResult = checkChatRateLimit(requestWithIp(ip));
  }

  assert.equal(lastResult.allowed, false);
  assert.equal(lastResult.remaining, 0);
});
