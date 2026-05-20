import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionCookieName, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SetupProfileWizard from "./SetupProfileWizard";

export const dynamic = "force-dynamic";

export default async function SetupProfilePage() {
  const token = (await cookies()).get(getSessionCookieName())?.value;
  const session = token ? await verifySessionToken(token).catch(() => null) : null;
  if (!session) redirect("/login?next=/dashboard/setup/profile");
  if (session.role !== "DOCTOR" || !session.needsProfile) {
    redirect("/dashboard");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true },
  });
  if (!user) redirect("/login");

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[18rem_minmax(0,1fr)] gap-8 items-start">
      <aside className="panel p-6 lg:sticky lg:top-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/45">
          Onboarding
        </p>
        <h2 className="mt-2 text-xl font-extrabold font-manrope tracking-tight">
          Clinical profile
        </h2>
        <p className="mt-2 text-sm text-foreground/55">
          These details appear in schedules and patient-facing summaries.
        </p>
        <div className="mt-5 rounded-xl border border-primary/[0.08] bg-surface-low px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/45">
            Signing in as
          </p>
          <p className="mt-1 text-sm font-semibold font-manrope truncate">{user.name}</p>
          <p className="text-xs text-foreground/55 truncate">{user.email}</p>
        </div>
      </aside>
      <SetupProfileWizard userName={user.name} userEmail={user.email} />
    </div>
  );
}
