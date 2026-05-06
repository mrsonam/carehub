import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getAdminOrErrorResponse } from "@/lib/auth-server";
import { getAppBaseUrl } from "@/lib/app-url";
import { sendStaffWelcomeEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_ROLES = new Set(["ADMIN", "DOCTOR"]);

export async function POST(req) {
  const auth = await getAdminOrErrorResponse();
  if ("response" in auth) return auth.response;

  const body = await req.json().catch(() => null);
  const name = body?.name?.trim?.();
  const email = body?.email?.trim?.().toLowerCase?.();
  const password = body?.password;
  const role = body?.role;

  if (!name || !email || !password) {
    return Response.json(
      { ok: false, error: "Name, email, and password are required." },
      { status: 400 }
    );
  }
  if (typeof password !== "string" || password.length < 8) {
    return Response.json(
      { ok: false, error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }
  if (!ALLOWED_ROLES.has(role)) {
    return Response.json(
      { ok: false, error: "Role must be ADMIN or DOCTOR." },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return Response.json(
      { ok: false, error: "That email is already in use." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      mustChangePassword: true,
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  const welcome = await sendStaffWelcomeEmail({
    to: user.email,
    name: user.name,
    role: user.role,
    temporaryPassword: password,
    loginUrl: `${getAppBaseUrl()}/login`,
  });

  return Response.json({
    ok: true,
    user,
    emailSent: welcome.ok,
    ...(welcome.ok ? {} : { emailWarning: welcome.error }),
  });
}
