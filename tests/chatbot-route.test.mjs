import test from "node:test";
import assert from "node:assert/strict";

import { POST } from "../app/api/chatbot/route.js";

function createRequest(body) {
  return new Request("http://localhost/api/chatbot", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": "1.2.3.4" },
    body: JSON.stringify(body),
  });
}

test("POST /api/chatbot rejects empty message", async () => {
  const response = await POST(createRequest({ message: "" }));
  assert.equal(response.status, 400);
});

test("POST /api/chatbot refuses out-of-scope prompts", async () => {
  const response = await POST(createRequest({ message: "Tell me today's bitcoin price" }));
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.ok, true);
  assert.equal(payload.policyReason, "out_of_scope");
});

test("POST /api/chatbot enforces conversation turn cap", async () => {
  const history = Array.from({ length: 25 }, (_, index) => ({ role: "user", text: String(index) }));
  const response = await POST(createRequest({ message: "How do I book?", history }));
  assert.equal(response.status, 400);
});
