/**
 * Structured logs for Vercel / Node runtime (stdout). Search logs for prefix "[chatbot]".
 * Does not log secrets or full user messages (privacy + noise).
 */

const PREFIX = "[chatbot]";

function basePayload(event, fields) {
  return {
    event,
    t: new Date().toISOString(),
    ...fields,
  };
}

export function chatbotLogInfo(event, fields = {}) {
  console.log(PREFIX, JSON.stringify(basePayload(event, fields)));
}

export function chatbotLogWarn(event, fields = {}) {
  console.warn(PREFIX, JSON.stringify(basePayload(event, fields)));
}

export function chatbotLogError(event, err, fields = {}) {
  const msg = err?.message || String(err);
  console.error(
    PREFIX,
    JSON.stringify(
      basePayload(event, {
        ...fields,
        error: msg,
        errName: err?.name,
      }),
    ),
    err,
  );
}

/** Short preview for debugging intent routing without storing full PHI/chat in logs. */
export function previewText(s, max = 72) {
  const t = String(s || "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}
