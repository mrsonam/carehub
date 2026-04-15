import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSessionCookieName, verifySessionToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardIndex() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const session = token ? await verifySessionToken(token).catch(() => null) : null;

  if (!session) redirect("/login?next=/dashboard");

  if (session.role === "ADMIN") redirect("/dashboard/admin");
  if (session.role === "DOCTOR") redirect("/dashboard/doctor");
  redirect("/dashboard/patient");
}

