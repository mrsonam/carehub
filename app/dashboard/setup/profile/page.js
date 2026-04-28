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
    <div className="w-full max-w-lg mx-auto">
      <SetupProfileWizard userName={user.name} userEmail={user.email} />
    </div>
  );
}
