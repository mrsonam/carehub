import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { getSessionCookieName, signSessionToken } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  const body = await req.json().catch(() => null);
  const email = body?.email?.trim?.().toLowerCase?.();
  const password = body?.password;

  if (!email || !password) {
    return Response.json({ ok: false, error: "Missing email or password." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, role: true, passwordHash: true },
  });

  const ok = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!ok) {
    return Response.json({ ok: false, error: "Invalid email or password." }, { status: 401 });
  }

  const token = await signSessionToken({ userId: user.id, role: user.role });
  const cookieStore = await cookies();
  cookieStore.set(getSessionCookieName(), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return Response.json({
    ok: true,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
}

