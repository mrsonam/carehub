import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { setSessionFromUser } from "@/lib/session-cookie";

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
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      passwordHash: true,
      mustChangePassword: true,
      profileCompletedAt: true,
    },
  });

  const ok = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!ok) {
    return Response.json({ ok: false, error: "Invalid email or password." }, { status: 401 });
  }

  const { passwordHash, ...sessionUser } = user;
  await setSessionFromUser(sessionUser);

  return Response.json({
    ok: true,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
}
