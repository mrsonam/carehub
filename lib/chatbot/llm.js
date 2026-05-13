import { formatDoctorChatBubbleReply } from "./doctor-format.js";
import { chatbotLogInfo, chatbotLogWarn } from "./log.js";

/** OpenAI-compatible NVIDIA NIM / integrate.api.nvidia.com */
const NVIDIA_BASE_URL = String(process.env.NVIDIA_API_BASE_URL || "https://integrate.api.nvidia.com/v1").replace(
  /\/$/,
  "",
);
const DEFAULT_MODEL = process.env.CHATBOT_MODEL || "minimaxai/minimax-m2.7";
const MAX_TOKENS = Number.isFinite(Number(process.env.CHATBOT_MAX_TOKENS))
  ? Math.min(Math.max(1, Number(process.env.CHATBOT_MAX_TOKENS)), 8192)
  : 2048;

/** Production default 15s; development has no abort (wait for NVIDIA). Override with LLM_FETCH_TIMEOUT_MS (min 3000ms, max 120s). */
function getLlmFetchTimeoutMs() {
  if (process.env.NODE_ENV === "development") return null;

  const n = Number(process.env.LLM_FETCH_TIMEOUT_MS);
  if (Number.isFinite(n) && n >= 3000) return Math.min(n, 120_000);
  return 15_000;
}
const TEMPERATURE = Number.isFinite(Number(process.env.CHATBOT_TEMPERATURE))
  ? Number(process.env.CHATBOT_TEMPERATURE)
  : 1;
const TOP_P = Number.isFinite(Number(process.env.CHATBOT_TOP_P)) ? Number(process.env.CHATBOT_TOP_P) : 0.95;

function createFallbackReply({ intent, context, userMessage }) {
  if (intent === "doctor_info") {
    return formatDoctorChatBubbleReply({
      doctors: context.doctors,
      queryMessage: typeof userMessage === "string" ? userMessage : "",
      totalDoctorsInDirectory: context.doctors?.length ?? 0,
    });
  }

  if (intent === "website_navigation") {
    return "Here are shortcuts to our main clinic pages — use the links below to open each page.";
  }

  return `I can help with our services, booking, doctors, and contact information. You can reach us at ${context.contact?.email || "the clinic"}.`;
}

function fallbackBecauseAssistantUnavailable({ intent, context }) {
  const email = context?.contact?.email || "our contact email";
  const phone = context?.contact?.phone || "the number on our Contact page";
  const base = `Our assistant is taking longer than usual, so here are quick ways to reach us: email ${email} or call ${phone}.`;
  if (intent === "website_navigation") {
    return `${base} You can also use the links below for main pages on our site.`;
  }
  return `${base} Thanks for your patience.`;
}

export function normalizeModelText(raw) {
  const text = String(raw ?? "").trim();
  if (!text) return "";

  const tryParseObject = (s) => {
    if (!s.startsWith("{") || !s.endsWith("}")) return null;
    try {
      const obj = JSON.parse(s);
      return obj && typeof obj === "object" ? obj : null;
    } catch {
      return null;
    }
  };

  let obj = tryParseObject(text);
  if (obj) {
    const keys = ["response", "answer", "message", "text", "content", "reply"];
    for (const k of keys) {
      const v = obj[k];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
  }

  // Strip accidental ```json ... ``` fences around a single JSON object
  const fenced = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenced) {
    const inner = fenced[1].trim();
    obj = tryParseObject(inner);
    if (obj) {
      const keys = ["response", "answer", "message", "text", "content", "reply"];
      for (const k of keys) {
        const v = obj[k];
        if (typeof v === "string" && v.trim()) return v.trim();
      }
    }
  }

  return text;
}

export async function askClinicModel({ userMessage, intent, context, requestId }) {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    chatbotLogWarn("nvidia_skipped_no_api_key", { requestId, intent });
    return createFallbackReply({ intent, context, userMessage });
  }

  const llmStarted = Date.now();
  const systemPrompt = [
    "You are CareHub's assistant and you speak on behalf of the clinic.",
    "Always use first person for the clinic: \"we\", \"our\", \"we're open\", \"we offer\", \"reach us at\", \"email us\", \"call us\".",
    "Never describe CareHub in third person — do not use \"they\", \"their\", \"the clinic is\", or \"CareHub offers\"; rewrite as \"we\" / \"our\".",
    "Reply with plain natural-language text only — never JSON, markdown code fences, or key-value wrappers.",
    "Answer ONLY using the JSON context in each user message (doctors, website routes, contact). Do not invent doctors, hours, addresses, or pages beyond that context.",
    "Never provide diagnosis or treatment plans.",
    "If data is missing in context, say we don't have it listed here and suggest emailing or calling us using the contact details from context when present.",
    "For doctor_info intent, return a structured list with fields: Name, Title, Bio, Availability, Booking.",
    "For website_navigation intent, one or two short sentences only; do not list every path because the chat UI shows clickable links.",
  ].join(" ");

  const url = `${NVIDIA_BASE_URL}/chat/completions`;
  const timeoutMs = getLlmFetchTimeoutMs();

  chatbotLogInfo("nvidia_request_start", {
    requestId,
    intent,
    baseHost: NVIDIA_BASE_URL.replace(/^https?:\/\//, "").split("/")[0],
    model: DEFAULT_MODEL,
    timeoutMs: timeoutMs ?? "none",
    nodeEnv: process.env.NODE_ENV,
    maxTokens: MAX_TOKENS,
  });

  let timer = null;
  let fetchSignal = undefined;
  if (typeof timeoutMs === "number" && timeoutMs > 0) {
    const controller = new AbortController();
    fetchSignal = controller.signal;
    timer = setTimeout(() => controller.abort(), timeoutMs);
  }

  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        temperature: TEMPERATURE,
        top_p: TOP_P,
        max_tokens: MAX_TOKENS,
        stream: false,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: JSON.stringify({
              question: userMessage,
              intent,
              context,
            }),
          },
        ],
      }),
      ...(fetchSignal ? { signal: fetchSignal } : {}),
    });
  } catch (err) {
    if (timer) clearTimeout(timer);
    const name = err?.name || "";
    if (name === "AbortError" && typeof timeoutMs === "number") {
      chatbotLogWarn("nvidia_fetch_timeout", { requestId, intent, timeoutMs, ms: Date.now() - llmStarted });
    } else {
      chatbotLogWarn("nvidia_fetch_error", {
        requestId,
        intent,
        err: err?.message,
        errName: name,
        ms: Date.now() - llmStarted,
      });
    }
    return fallbackBecauseAssistantUnavailable({ intent, context });
  }
  if (timer) clearTimeout(timer);

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    chatbotLogWarn("nvidia_http_error", {
      requestId,
      intent,
      status: response.status,
      bodySnippet: errText.slice(0, 400),
      ms: Date.now() - llmStarted,
    });
    return createFallbackReply({ intent, context, userMessage });
  }

  const payload = await response.json().catch(() => null);
  const raw = payload?.choices?.[0]?.message?.content?.trim?.();
  const answer = normalizeModelText(raw);

  const usedFallback = !answer;
  if (usedFallback) {
    chatbotLogWarn("nvidia_empty_completion", {
      requestId,
      intent,
      ms: Date.now() - llmStarted,
      hasChoices: Boolean(payload?.choices?.length),
    });
  } else {
    chatbotLogInfo("nvidia_completion_ok", {
      requestId,
      intent,
      ms: Date.now() - llmStarted,
      answerChars: answer.length,
    });
  }

  return answer || createFallbackReply({ intent, context, userMessage });
}
