import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/auth-server";
import CreateStaffForm from "../../components/admin/CreateStaffForm";
import TeamDirectory from "../../components/admin/TeamDirectory";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requireAdminUser();

  const staff = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "DOCTOR"] } },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return (
    <div className="max-w-6xl mx-auto w-full flex flex-col gap-10">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/45">
          Access
        </p>
        <h1 className="mt-2 text-3xl font-extrabold font-manrope tracking-tight">
          Staff & administrators
        </h1>
        <p className="text-foreground/55 mt-1.5 text-sm max-w-2xl">
          Create sign-ins for new doctors and administrators. Only clinic admins
          can use this page.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[22rem_minmax(0,1fr)] gap-6 items-start">
        <CreateStaffForm />
        <TeamDirectory
          staff={staff.map((member) => ({
            ...member,
            createdAt: member.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
