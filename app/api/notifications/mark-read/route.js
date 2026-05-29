import { getSessionUserOrErrorResponse } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  const auth = await getSessionUserOrErrorResponse();
  if (auth.response) return auth.response;

  const body = await req.json().catch(() => ({}));
  const ids = Array.isArray(body?.ids)
    ? body.ids.filter((id) => typeof id === "string" && id.trim())
    : [];
  const markAll = body?.all === true;

  if (!markAll && ids.length === 0) {
    return Response.json({ ok: false, error: "No notifications specified." }, { status: 400 });
  }

  const where = markAll
    ? { userId: auth.user.id, readAt: null }
    : { userId: auth.user.id, id: { in: ids }, readAt: null };

  const result = await prisma.notification.updateMany({
    where,
    data: { readAt: new Date() },
  });

  return Response.json({ ok: true, updated: result.count });
}
