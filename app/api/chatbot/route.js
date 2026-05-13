import { buildChatbotReply } from "../../../lib/chatbot/engine.js";
import { getClinicContext } from "../../../lib/chatbot/context.js";
import { askClinicModel } from "../../../lib/chatbot/llm.js";
import { trackChatbotEvent } from "../../../lib/chatbot/telemetry.js";
import { checkChatRateLimit } from "../../../lib/chatbot/rate-limit.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Allow time for DB + doctor hints + NVIDIA; increase on Vercel if you raise the platform function limit. */
export const maxDuration = 60;

const MAX_MESSAGE = 800;
const MAX_TURNS = 20;

export async function POST(req) {
  const rate = checkChatRateLimit(req);
  if (!rate.allowed) {
    return Response.json(
      { ok: false, error: "Too many chatbot requests. Please wait and try again." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const message = body?.message?.trim?.();
  const history = Array.isArray(body?.history) ? body.history : [];

  if (!message) {
    return Response.json({ ok: false, error: "Message is required." }, { status: 400 });
  }
  if (message.length > MAX_MESSAGE) {
    return Response.json({ ok: false, error: "Message is too long." }, { status: 400 });
  }
  if (history.length > MAX_TURNS) {
    return Response.json({ ok: false, error: "Conversation is too long. Start a new chat." }, { status: 400 });
  }

  try {
    const result = await buildChatbotReply({
      message,
      getContext: getClinicContext,
      askModel: askClinicModel,
      telemetry: trackChatbotEvent,
    });
    return Response.json(result);
  } catch (error) {
    trackChatbotEvent("chatbot_error", { message: error?.message || "Unknown chatbot error" });
    return Response.json(
      { ok: false, error: "Sorry, I could not answer right now. Please try again." },
      { status: 503 }
    );
  }
}
