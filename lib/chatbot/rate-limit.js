const WINDOW_MS = 60_000;
const MAX_REQUESTS = 15;
const buckets = new Map();

function now() {
  return Date.now();
}

function getClientIp(req) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")?.[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function checkChatRateLimit(req) {
  const key = getClientIp(req);
  const entry = buckets.get(key);
  const current = now();

  if (!entry || current - entry.startedAt > WINDOW_MS) {
    buckets.set(key, { startedAt: current, count: 1 });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  buckets.set(key, entry);
  return { allowed: true, remaining: MAX_REQUESTS - entry.count };
}
