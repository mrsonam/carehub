import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSessionCookieName, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * @returns {Response} error response, or { user } for a verified admin row.
 */
export async function getAdminOrErrorResponse() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  if (!token) {
    return { response: Response.json({ ok: false, error: "Unauthorized" }, { status: 401 }) };
  }
  const session = await verifySessionToken(token).catch(() => null);
  if (!session) {
    return { response: Response.json({ ok: false, error: "Unauthorized" }, { status: 401 }) };
  }
  if (session.role !== "ADMIN") {
    return { response: Response.json({ ok: false, error: "Forbidden" }, { status: 403 }) };
  }
  const user = await prisma.user.findFirst({
    where: { id: session.userId, role: "ADMIN" },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!user) {
    return { response: Response.json({ ok: false, error: "Forbidden" }, { status: 403 }) };
  }
  return { user };
}

/** Server Components: redirects if not a logged-in admin. */
export async function requireAdminUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  if (!token) redirect("/login?next=/dashboard/admin/users");
  const session = await verifySessionToken(token).catch(() => null);
  if (!session) redirect("/login?next=/dashboard/admin/users");
  if (session.role !== "ADMIN") redirect("/dashboard");
  const user = await prisma.user.findFirst({
    where: { id: session.userId, role: "ADMIN" },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!user) redirect("/dashboard");
  return user;
}
