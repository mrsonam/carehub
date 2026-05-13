import {
  classifyIntent,
  isOutOfScope,
  createOutOfScopeReply,
  enforceResponsePolicy,
} from "./policy.js";
import { formatDoctorStructuredReply } from "./doctor-format.js";

export async function buildChatbotReply({
  message,
  getContext,
  askModel,
  telemetry = () => {},
}) {
  const startedAt = Date.now();
  const intent = classifyIntent(message);

  if (isOutOfScope(message)) {
    const reply = createOutOfScopeReply();
    telemetry("chatbot_refused", { intent, reason: "out_of_scope" });
    return { ok: true, intent, policyReason: "out_of_scope", reply };
  }

  if (typeof getContext !== "function" || typeof askModel !== "function") {
    throw new Error("buildChatbotReply requires getContext and askModel functions");
  }

  const context = await getContext(intent);
  if (intent === "doctor_info") {
    const reply = formatDoctorStructuredReply({ doctors: context.doctors });
    const doctorCards = context.doctors.map((doctor) => ({
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

  return {
    ok: true,
    intent,
    policyReason: policy.reason,
    reply: policy.safeText,
  };
}
