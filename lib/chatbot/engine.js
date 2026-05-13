import {
  classifyIntent,
  createOutOfScopeReply,
  enforceResponsePolicy,
} from "./policy.js";
import { formatDoctorChatBubbleReply, pickDoctorsMatchingQuery } from "./doctor-format.js";
import { listDoctorNamesForClassifier } from "./context.js";
import { chatbotLogInfo, chatbotLogWarn } from "./log.js";

export async function buildChatbotReply({
  message,
  getContext,
  askModel,
  telemetry = () => {},
  getDoctorHints = listDoctorNamesForClassifier,
  requestId = null,
}) {
  const startedAt = Date.now();
  let doctorHints = [];
  const hintStarted = Date.now();
  if (typeof getDoctorHints === "function") {
    try {
      doctorHints = await getDoctorHints();
    } catch (e) {
      doctorHints = [];
      chatbotLogWarn("doctor_hints_failed", { requestId, ms: Date.now() - hintStarted, err: e?.message });
    }
  }
  if (!Array.isArray(doctorHints)) doctorHints = [];

  chatbotLogInfo("doctor_hints_loaded", {
    requestId,
    ms: Date.now() - hintStarted,
    hintCount: doctorHints.length,
  });

  const intent = classifyIntent(message, doctorHints);

  if (intent === "out_of_scope") {
    const reply = createOutOfScopeReply();
    telemetry("chatbot_refused", { intent, reason: "out_of_scope" });
    chatbotLogInfo("chatbot_refused", { requestId, intent, ms: Date.now() - startedAt });
    return { ok: true, intent, policyReason: "out_of_scope", reply };
  }

  if (typeof getContext !== "function" || typeof askModel !== "function") {
    throw new Error("buildChatbotReply requires getContext and askModel functions");
  }

  const ctxStarted = Date.now();
  const context = await getContext(intent);
  chatbotLogInfo("clinic_context_loaded", {
    requestId,
    intent,
    ms: Date.now() - ctxStarted,
    doctorCount: context.doctors?.length ?? 0,
  });

  if (intent === "doctor_info") {
    const reply = formatDoctorChatBubbleReply({
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
    chatbotLogInfo("chatbot_doctor_info_reply", {
      requestId,
      ms: Date.now() - startedAt,
      matchedCards: doctorCards.length,
      roster: context.doctors?.length ?? 0,
    });
    return {
      ok: true,
      intent,
      policyReason: null,
      reply,
      doctorCards,
    };
  }

  const llmStarted = Date.now();
  const rawReply = await askModel({ userMessage: message, intent, context, requestId });
  chatbotLogInfo("chatbot_llm_done", {
    requestId,
    intent,
    ms: Date.now() - llmStarted,
    replyChars: typeof rawReply === "string" ? rawReply.length : 0,
  });

  const policy = enforceResponsePolicy({ userMessage: message, modelText: rawReply });

  telemetry("chatbot_answered", {
    intent,
    blocked: policy.blocked,
    reason: policy.reason,
    latencyMs: Date.now() - startedAt,
  });

  chatbotLogInfo("chatbot_llm_answer_ready", {
    requestId,
    intent,
    ms: Date.now() - startedAt,
    policyReason: policy.reason,
    blocked: policy.blocked,
    safeTextChars: typeof policy.safeText === "string" ? policy.safeText.length : 0,
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
