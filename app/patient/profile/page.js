import { requireRoleUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { profileSelect, serializeProfile } from "@/lib/profile/serialize";
import { ProfileSettingsForm } from "@/app/components/profile/ProfileSettingsForm";

export const dynamic = "force-dynamic";

export default async function PatientProfilePage() {
  const sessionUser = await requireRoleUser("PATIENT", "/patient/profile");

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: profileSelect,
  });
  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold font-manrope tracking-tight">Profile</h1>
        <p className="text-sm text-foreground/55 mt-1">
          Keep your contact details and emergency information up to date.
        </p>
      </div>
      <ProfileSettingsForm role="PATIENT" initialProfile={serializeProfile(user)} />
    </div>
  );
}
