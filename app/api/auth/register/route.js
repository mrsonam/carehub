import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { setSessionFromUser } from "@/lib/session-cookie";

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
      role: "PATIENT",
      mustChangePassword: false,
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

  await setSessionFromUser(user);

  return Response.json({ ok: true, user });
}
