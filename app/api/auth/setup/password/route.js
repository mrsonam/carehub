import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSessionCookieName, verifySessionToken } from "@/lib/auth";
import { setSessionFromUser } from "@/lib/session-cookie";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  const body = await req.json().catch(() => null);
  const currentPassword = body?.currentPassword;
  const newPassword = body?.newPassword;

  if (
    typeof currentPassword !== "string" ||
    typeof newPassword !== "string" ||
    !newPassword.length
  ) {
    return Response.json(
      { ok: false, error: "Current and new passwords are required." },
      { status: 400 }
    );
  }
  if (newPassword.length < 8) {
    return Response.json(
      { ok: false, error: "New password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  if (!token) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const session = await verifySessionToken(token).catch(() => null);
  if (!session) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      role: true,
      email: true,
      name: true,
      passwordHash: true,
      mustChangePassword: true,
      profileCompletedAt: true,
    },
  });

  if (!user) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return Response.json(
      { ok: false, error: "Current password is incorrect." },
      { status: 400 }
    );
  }

  const nextHash = await bcrypt.hash(newPassword, 12);
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { mustChangePassword: false, passwordHash: nextHash },
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

  return Response.json({ ok: true });
}
