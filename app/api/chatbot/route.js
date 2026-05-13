import { buildChatbotReply } from "../../../lib/chatbot/engine.js";
import { getClinicContext } from "../../../lib/chatbot/context.js";
import { askClinicModel } from "../../../lib/chatbot/llm.js";
import { trackChatbotEvent } from "../../../lib/chatbot/telemetry.js";
import { checkChatRateLimit } from "../../../lib/chatbot/rate-limit.js";
import { chatbotLogError, chatbotLogInfo, chatbotLogWarn, previewText } from "../../../lib/chatbot/log.js";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Allow time for DB + doctor hints + NVIDIA; increase on Vercel if you raise the platform function limit. */
export const maxDuration = 60;

const MAX_MESSAGE = 800;
const MAX_TURNS = 20;

export async function POST(req) {
  const startedAt = Date.now();
  const requestId = req.headers?.get?.("x-vercel-id") || req.headers?.get?.("x-request-id") || randomUUID();

  const rate = checkChatRateLimit(req);
  if (!rate.allowed) {
    chatbotLogWarn("chatbot_rate_limited", { requestId });
    return Response.json(
      { ok: false, error: "Too many chatbot requests. Please wait and try again." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const message = body?.message?.trim?.();
  const history = Array.isArray(body?.history) ? body.history : [];

  if (!message) {
    chatbotLogWarn("chatbot_bad_request", { requestId, reason: "empty_message" });
    return Response.json({ ok: false, error: "Message is required." }, { status: 400 });
  }
  if (message.length > MAX_MESSAGE) {
    chatbotLogWarn("chatbot_bad_request", { requestId, reason: "message_too_long", len: message.length });
    return Response.json({ ok: false, error: "Message is too long." }, { status: 400 });
  }
  if (history.length > MAX_TURNS) {
    chatbotLogWarn("chatbot_bad_request", { requestId, reason: "history_too_long", turns: history.length });
    return Response.json({ ok: false, error: "Conversation is too long. Start a new chat." }, { status: 400 });
  }

  chatbotLogInfo("chatbot_request", {
    requestId,
    messageLen: message.length,
    messagePreview: previewText(message),
    historyTurns: history.length,
  });

  try {
    const result = await buildChatbotReply({
      message,
      getContext: getClinicContext,
      askModel: askClinicModel,
      telemetry: trackChatbotEvent,
      requestId,
    });
    chatbotLogInfo("chatbot_response", {
      requestId,
      ms: Date.now() - startedAt,
      intent: result.intent,
      ok: result.ok !== false,
      policyReason: result.policyReason ?? null,
      hasDoctorCards: Array.isArray(result.doctorCards) && result.doctorCards.length > 0,
      hasNavLinks: Array.isArray(result.navLinks) && result.navLinks.length > 0,
    });
    return Response.json(result);
  } catch (error) {
    chatbotLogError("chatbot_route_error", error, { requestId, ms: Date.now() - startedAt });
    trackChatbotEvent("chatbot_error", { message: error?.message || "Unknown chatbot error" });
    return Response.json(
      { ok: false, error: "Sorry, I could not answer right now. Please try again." },
      { status: 503 }
    );
  }
}
