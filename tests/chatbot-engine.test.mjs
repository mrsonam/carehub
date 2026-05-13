import test from "node:test";
import assert from "node:assert/strict";

import { buildChatbotReply } from "../lib/chatbot/engine.js";

test("buildChatbotReply refuses out-of-scope requests", async () => {
  const result = await buildChatbotReply({
    message: "Write me a stock market forecast",
    getDoctorHints: async () => [],
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
    getDoctorHints: async () => [],
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

test("buildChatbotReply returns nav links for website navigation", async () => {
  const result = await buildChatbotReply({
    message: "Where is the contact page?",
    getDoctorHints: async () => [],
    getContext: async () => ({
      doctors: [],
      website: [
        { path: "/contact", label: "Contact", purpose: "Contact the clinic." },
        { path: "/doctors", label: "Doctors", purpose: "Browse doctors." },
      ],
      contact: {},
    }),
    askModel: async () => "Use the links below to open any page.",
    telemetry: () => {},
  });

  assert.equal(result.intent, "website_navigation");
  assert.equal(result.ok, true);
  assert.equal(Array.isArray(result.navLinks), true);
  assert.equal(result.navLinks.length, 2);
  assert.equal(result.navLinks[0].href, "/contact");
  assert.equal(result.navLinks[0].label, "Contact");
});

test("buildChatbotReply applies medical safety override", async () => {
  const result = await buildChatbotReply({
    message: "I have chest pain, what medication should I take?",
    getDoctorHints: async () => [],
    getContext: async () => ({ doctors: [], website: [] }),
    askModel: async () => "Take pain killers and wait at home.",
    telemetry: () => {},
  });

  assert.equal(result.ok, true);
  assert.equal(result.policyReason, "medical_safety");
  assert.match(result.reply, /emergency/i);
});

test("buildChatbotReply matches a doctor by full name without the word doctor", async () => {
  const result = await buildChatbotReply({
    message: "Tell me about Sarah Mitchell",
    getDoctorHints: async () => ["dr sarah mitchell", "sarah mitchell"],
    getContext: async () => ({
      doctors: [
        {
          name: "Dr Sarah Mitchell",
          title: "GP",
          bio: "Family medicine specialist.",
          availability: "Monday: 9:00 AM - 5:00 PM",
        },
        {
          name: "Dr James Lee",
          title: "Cardiology",
          bio: "Heart health.",
          availability: "Tuesday: 10:00 AM - 4:00 PM",
        },
      ],
      website: [],
      contact: {},
    }),
    askModel: async () => "Ignored because doctor replies are formatted server-side.",
    telemetry: () => {},
  });

  assert.equal(result.intent, "doctor_info");
  assert.match(result.reply, /Sarah Mitchell/);
  assert.ok(!result.reply.includes("James Lee"));
  assert.equal(result.doctorCards.length, 1);
});
