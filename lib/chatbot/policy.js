const DOCTOR_KEYWORDS = [
  "doctor",
  "dr",
  "specialist",
  "practitioner",
  "physician",
  "bio",
  "experience",
  "profile",
];

const WEBSITE_KEYWORDS = [
  "book",
  "appointment",
  "website",
  "page",
  "contact",
  "hours",
  "open",
  "location",
  "services",
  "doctors",
  "login",
  "register",
  "dashboard",
];

const CLINIC_KEYWORDS = [
  "clinic",
  "carehub",
  "medical",
  "consultation",
  "visit",
  "patient",
];

const RISK_KEYWORDS = [
  "chest pain",
  "trouble breathing",
  "can't breathe",
  "cannot breathe",
  "suicidal",
  "overdose",
  "severe bleeding",
  "stroke",
  "heart attack",
  "emergency",
];

function normalize(message) {
  return String(message || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(text, keywords) {
  return keywords.some((word) => text.includes(word));
}

export function classifyIntent(message) {
  const text = normalize(message);
  if (!text) return "out_of_scope";
  if (includesAny(text, RISK_KEYWORDS)) return "clinic_general";
  if (includesAny(text, DOCTOR_KEYWORDS)) return "doctor_info";
  if (includesAny(text, WEBSITE_KEYWORDS)) return "website_navigation";
  if (includesAny(text, CLINIC_KEYWORDS)) return "clinic_general";
  return "out_of_scope";
}

export function isOutOfScope(message) {
  return classifyIntent(message) === "out_of_scope";
}

export function hasMedicalRiskSignal(message) {
  return includesAny(normalize(message), RISK_KEYWORDS);
}

export function createOutOfScopeReply() {
  return "I can only help with CareHub clinic and website questions, such as finding doctors, booking guidance, services, or contact details.";
}

export function createSafetyReply() {
  return "I cannot provide emergency or diagnostic medical advice. If this may be urgent, call emergency services (000/911) now or contact the clinic immediately.";
}

export function enforceResponsePolicy({ userMessage, modelText }) {
  if (hasMedicalRiskSignal(userMessage)) {
    return { blocked: true, reason: "medical_safety", safeText: createSafetyReply() };
  }
  if (isOutOfScope(userMessage) || isOutOfScope(modelText)) {
    return { blocked: true, reason: "out_of_scope", safeText: createOutOfScopeReply() };
  }
  return { blocked: false, reason: null, safeText: modelText };
}
