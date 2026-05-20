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

/** Opening-hours / reach-us style questions without saying "doctor" or "website" */
const CONTACT_AND_HOURS_KEYWORDS = ["phone", "email", "call", "address", "reach"];

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

export function classifyIntent(message, knownDoctorNamesNormalized = []) {
  const text = normalize(message);
  if (!text) return "out_of_scope";
  if (includesAny(text, RISK_KEYWORDS)) return "clinic_general";
  if (includesAny(text, DOCTOR_KEYWORDS)) return "doctor_info";
  if (Array.isArray(knownDoctorNamesNormalized)) {
    for (const name of knownDoctorNamesNormalized) {
      const n = String(name || "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
      if (n.length >= 4 && text.includes(n)) return "doctor_info";
    }
  }
  if (includesAny(text, WEBSITE_KEYWORDS)) return "website_navigation";
  if (includesAny(text, CLINIC_KEYWORDS)) return "clinic_general";
  if (includesAny(text, CONTACT_AND_HOURS_KEYWORDS)) return "clinic_general";
  return "out_of_scope";
}

export function isOutOfScope(message, knownDoctorNamesNormalized) {
  return classifyIntent(message, knownDoctorNamesNormalized) === "out_of_scope";
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
  if (isOutOfScope(userMessage)) {
    return { blocked: true, reason: "out_of_scope", safeText: createOutOfScopeReply() };
  }
  return { blocked: false, reason: null, safeText: modelText };
}
