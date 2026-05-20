import { requireRoleUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { profileSelect, serializeProfile } from "@/lib/profile/serialize";
import { ProfileSettingsForm } from "@/app/components/profile/ProfileSettingsForm";

export const dynamic = "force-dynamic";

export default async function DoctorProfilePage() {
  const sessionUser = await requireRoleUser("DOCTOR", "/doctor/profile");

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
          Update how you appear to patients and clinic staff.
        </p>
      </div>
      <ProfileSettingsForm role="DOCTOR" initialProfile={serializeProfile(user)} />
    </div>
  );
}
