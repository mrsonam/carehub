/**
 * Scheduled via external cron (e.g. https://console.cron-job.org/jobs):
 * - URL: GET https://<your-domain>/api/cron/appointment-reminders
 * - Schedule: every 5 minutes (or similar) — aligns with reminder windows in lib/notifications
 * - Optional auth: if CRON_SECRET is set, require either
 *     Authorization: Bearer <CRON_SECRET>
 *   or X-Cron-Secret: <CRON_SECRET>
 *   If CRON_SECRET is unset, the route is open (anyone who guesses the URL can trigger it;
 *   dedupe limits duplicate notifications, but you still get extra DB work — prefer a secret in production).
 */
import { createAppointmentReminderNotifications } from "@/lib/notifications/notifications";
import { autoCloseExpiredAppointments } from "@/lib/appointment-lifecycle";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cronAuthorized(request, secret) {
  const trimmed = String(secret).trim();
  if (!trimmed) return false;

  const bearer = request.headers.get("authorization");
  if (bearer) {
    const m = /^Bearer\s+(.+)$/i.exec(bearer.trim());
    if (m && m[1] === trimmed) return true;
  }

  const headerSecret = request.headers.get("x-cron-secret");
  if (headerSecret && headerSecret.trim() === trimmed) return true;

  return false;
}

export async function GET(request) {
  const secret = String(process.env.CRON_SECRET ?? "").trim();
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      return Response.json({ ok: false, error: "Cron is not configured." }, { status: 503 });
    }
  } else if (!cronAuthorized(request, secret)) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const closed = await autoCloseExpiredAppointments(prisma);
    const result = await createAppointmentReminderNotifications();
    return Response.json({ ...result, autoClosed: closed });
  } catch (err) {
    console.error("[cron/appointment-reminders]", err);
    return Response.json(
      { ok: false, error: String(err?.message || err) },
      { status: 500 },
    );
  }
}
