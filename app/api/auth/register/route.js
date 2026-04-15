import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { getSessionCookieName, signSessionToken } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  const body = await req.json().catch(() => null);
  const name = body?.name?.trim?.();
  const email = body?.email?.trim?.().toLowerCase?.();
  const password = body?.password;

  if (!name || !email || !password) {
    return Response.json({ ok: false, error: "Missing required fields." }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 8) {
    return Response.json({ ok: false, error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return Response.json({ ok: false, error: "Email is already registered." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "PATIENT", // registration is patient-only
    },
    select: { id: true, role: true, email: true, name: true },
  });

  const token = await signSessionToken({ userId: user.id, role: user.role });
  const cookieStore = await cookies();
  cookieStore.set(getSessionCookieName(), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return Response.json({ ok: true, user });
}

