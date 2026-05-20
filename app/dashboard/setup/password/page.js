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
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[18rem_minmax(0,1fr)] gap-8 items-start">
      <aside className="panel p-6 lg:sticky lg:top-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/45">
          Onboarding
        </p>
        <h2 className="mt-2 text-xl font-extrabold font-manrope tracking-tight">
          Security setup
        </h2>
        <p className="mt-2 text-sm text-foreground/55">
          Replace the temporary password before entering the workspace.
        </p>
        <ol className="mt-5 space-y-3 text-sm">
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-primary text-white text-[11px] font-bold inline-flex items-center justify-center shrink-0">
              1
            </span>
            Verify your current temporary password
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[11px] font-bold inline-flex items-center justify-center shrink-0">
              2
            </span>
            Set a stronger private password
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[11px] font-bold inline-flex items-center justify-center shrink-0">
              3
            </span>
            Continue to your role setup
          </li>
        </ol>
      </aside>
      <SetupPasswordForm userRole={session.role} />
    </div>
  );
}
