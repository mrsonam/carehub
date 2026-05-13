import test from "node:test";
import assert from "node:assert/strict";

import {
  classifyIntent,
  isOutOfScope,
  hasMedicalRiskSignal,
  createOutOfScopeReply,
  createSafetyReply,
  enforceResponsePolicy,
} from "../lib/chatbot/policy.js";

test("classifyIntent detects doctor info questions", () => {
  const intent = classifyIntent("Can you tell me about Dr Sarah and her experience?");
  assert.equal(intent, "doctor_info");
});

test("classifyIntent detects website navigation questions", () => {
  const intent = classifyIntent("How do I book an appointment on this website?");
  assert.equal(intent, "website_navigation");
});

test("classifyIntent marks unrelated questions as out of scope", () => {
  const intent = classifyIntent("Who won the football game yesterday?");
  assert.equal(intent, "out_of_scope");
});

test("isOutOfScope returns true for unrelated prompts", () => {
  assert.equal(isOutOfScope("Write me a recipe for pasta."), true);
});

test("isOutOfScope returns false for clinic questions", () => {
  assert.equal(isOutOfScope("What are your clinic opening hours?"), false);
});

test("hasMedicalRiskSignal identifies urgent safety language", () => {
  assert.equal(hasMedicalRiskSignal("I have chest pain and trouble breathing."), true);
});

test("createOutOfScopeReply keeps response constrained to clinic topics", () => {
  const reply = createOutOfScopeReply();
  assert.match(reply, /clinic|website/i);
});

test("createSafetyReply includes emergency guidance", () => {
  const reply = createSafetyReply();
  assert.match(reply, /emergency|000|911/i);
});

test("enforceResponsePolicy blocks non-clinic answers", () => {
  const result = enforceResponsePolicy({
    userMessage: "Tell me bitcoin prices.",
    modelText: "Bitcoin is trading at...",
  });

  assert.equal(result.blocked, true);
  assert.equal(result.reason, "out_of_scope");
});

test("enforceResponsePolicy blocks unsafe medical advice", () => {
  const result = enforceResponsePolicy({
    userMessage: "I have chest pain.",
    modelText: "Take two tablets and wait at home.",
  });

  assert.equal(result.blocked, true);
  assert.equal(result.reason, "medical_safety");
});
