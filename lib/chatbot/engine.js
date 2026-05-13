import {
  classifyIntent,
  createOutOfScopeReply,
  enforceResponsePolicy,
} from "./policy.js";
import { formatDoctorStructuredReply, pickDoctorsMatchingQuery } from "./doctor-format.js";
import { listDoctorNamesForClassifier } from "./context.js";

export async function buildChatbotReply({
  message,
  getContext,
  askModel,
  telemetry = () => {},
  getDoctorHints = listDoctorNamesForClassifier,
}) {
  const startedAt = Date.now();
  let doctorHints = [];
  if (typeof getDoctorHints === "function") {
    try {
      doctorHints = await getDoctorHints();
    } catch {
      doctorHints = [];
    }
  }
  if (!Array.isArray(doctorHints)) doctorHints = [];

  const intent = classifyIntent(message, doctorHints);

  if (intent === "out_of_scope") {
    const reply = createOutOfScopeReply();
    telemetry("chatbot_refused", { intent, reason: "out_of_scope" });
    return { ok: true, intent, policyReason: "out_of_scope", reply };
  }

  if (typeof getContext !== "function" || typeof askModel !== "function") {
    throw new Error("buildChatbotReply requires getContext and askModel functions");
  }

  const context = await getContext(intent);
  if (intent === "doctor_info") {
    const reply = formatDoctorStructuredReply({
      doctors: context.doctors,
      queryMessage: message,
      totalDoctorsInDirectory: context.doctors?.length ?? 0,
    });
    const matched = pickDoctorsMatchingQuery(message, context.doctors);
    const doctorCards = matched.map((doctor) => ({
      id: doctor.id,
      name: doctor.name,
      title: doctor.title || "Not available",
      bio: doctor.bio || "Not available",
      availability: doctor.availability || "Not available",
      bookingPath: "/doctors",
    }));
    telemetry("chatbot_answered", {
      intent,
      blocked: false,
      reason: null,
      latencyMs: Date.now() - startedAt,
    });
    return {
      ok: true,
      intent,
      policyReason: null,
      reply,
      doctorCards,
    };
  }

  const rawReply = await askModel({ userMessage: message, intent, context });
  const policy = enforceResponsePolicy({ userMessage: message, modelText: rawReply });

  telemetry("chatbot_answered", {
    intent,
    blocked: policy.blocked,
    reason: policy.reason,
    latencyMs: Date.now() - startedAt,
  });

  const base = {
    ok: true,
    intent,
    policyReason: policy.reason,
    reply: policy.safeText,
  };

  if (intent === "website_navigation" && Array.isArray(context.website)) {
    return {
      ...base,
      navLinks: context.website.map((item) => ({
        href: item.path,
        label: item.label,
        purpose: item.purpose,
      })),
    };
  }

  return base;
}
