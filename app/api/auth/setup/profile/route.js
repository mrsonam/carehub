import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSessionCookieName, verifySessionToken } from "@/lib/auth";
import { setSessionFromUser } from "@/lib/session-cookie";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  if (!token) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const session = await verifySessionToken(token).catch(() => null);
  if (!session || session.role !== "DOCTOR") {
    return Response.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const phone = body?.phone?.trim?.() ?? "";
  const title = body?.title?.trim?.() ?? "";
  const bio = typeof body?.bio === "string" ? body.bio.trim() : "";

  if (!phone || !title) {
    return Response.json(
      { ok: false, error: "Phone and professional title are required." },
      { status: 400 }
    );
  }

  const updated = await prisma.user.update({
    where: { id: session.userId },
    data: {
      phone,
      title,
      bio: bio || null,
      profileCompletedAt: new Date(),
    },
    select: {
      id: true,
      role: true,
      email: true,
      name: true,
      mustChangePassword: true,
      profileCompletedAt: true,
    },
  });

  await setSessionFromUser(updated);

  return Response.json({ ok: true, user: updated });
}
