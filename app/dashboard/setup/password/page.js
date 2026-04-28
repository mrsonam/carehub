import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionCookieName, verifySessionToken } from "@/lib/auth";
import SetupPasswordForm from "./SetupPasswordForm";

export const dynamic = "force-dynamic";

export default async function SetupPasswordPage() {
  const token = (await cookies()).get(getSessionCookieName())?.value;
  const session = token ? await verifySessionToken(token).catch(() => null) : null;
  if (!session) redirect("/login?next=/dashboard/setup/password");
  if (!session.mustChangePassword) {
    if (session.needsProfile && session.role === "DOCTOR") {
      redirect("/dashboard/setup/profile");
    }
    redirect("/dashboard");
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <SetupPasswordForm userRole={session.role} />
    </div>
  );
}
