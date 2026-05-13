import test from "node:test";
import assert from "node:assert/strict";

import { buildChatbotReply } from "../lib/chatbot/engine.js";

test("buildChatbotReply refuses out-of-scope requests", async () => {
  const result = await buildChatbotReply({
    message: "Write me a stock market forecast",
    getContext: async () => ({ doctors: [], website: [] }),
    askModel: async () => "Stocks are rising.",
    telemetry: () => {},
  });

  assert.equal(result.intent, "out_of_scope");
  assert.equal(result.ok, true);
  assert.match(result.reply, /only help with carehub clinic and website/i);
});

test("buildChatbotReply returns grounded doctor information", async () => {
  const result = await buildChatbotReply({
    message: "Tell me about Dr Sarah",
    getContext: async () => ({
      doctors: [
        {
          name: "Dr Sarah Mitchell",
          title: "GP",
          bio: "Family medicine specialist.",
          availability: "Monday: 9:00 AM - 5:00 PM",
        },
      ],
      website: [],
      contact: {},
    }),
    askModel: async () => "Ignored because doctor replies are formatted server-side.",
    telemetry: () => {},
  });

  assert.equal(result.intent, "doctor_info");
  assert.equal(result.ok, true);
  assert.match(result.reply, /Dr Sarah Mitchell/);
  assert.match(result.reply, /Availability:/);
  assert.match(result.reply, /Booking:/);
  assert.equal(Array.isArray(result.doctorCards), true);
  assert.equal(result.doctorCards.length, 1);
});

test("buildChatbotReply applies medical safety override", async () => {
  const result = await buildChatbotReply({
    message: "I have chest pain, what medication should I take?",
    getContext: async () => ({ doctors: [], website: [] }),
    askModel: async () => "Take pain killers and wait at home.",
    telemetry: () => {},
  });

  assert.equal(result.ok, true);
  assert.equal(result.policyReason, "medical_safety");
  assert.match(result.reply, /emergency/i);
});
