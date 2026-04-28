import { cookies } from "next/headers";
import { getSessionCookieName, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  if (!token) return Response.json({ ok: true, user: null });

  const session = await verifySessionToken(token).catch(() => null);
  if (!session) return Response.json({ ok: true, user: null });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      title: true,
      bio: true,
      mustChangePassword: true,
      profileCompletedAt: true,
    },
  });
  return Response.json({ ok: true, user });
}

