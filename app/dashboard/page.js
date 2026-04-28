import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSessionCookieName, verifySessionToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardIndex() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const session = token ? await verifySessionToken(token).catch(() => null) : null;

  if (!session) redirect("/login?next=/dashboard");

  if (session.role === "ADMIN") redirect("/admin/dashboard");
  if (session.role === "DOCTOR") redirect("/doctor/dashboard");
  redirect("/patient/dashboard");
}
