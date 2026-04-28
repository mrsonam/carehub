import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/auth-server";
import { PanelHead } from "../../components/DashboardPanels";
import CreateStaffForm from "./CreateStaffForm";

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

      <CreateStaffForm />

      <section className="panel p-6">
        <PanelHead
          eyebrow="Directory"
          title="Admins & doctors in the system"
        />
        {staff.length === 0 ? (
          <p className="mt-4 text-sm text-foreground/50">No staff accounts yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-primary/[0.08] text-[11px] font-bold uppercase tracking-widest text-foreground/45">
                  <th className="py-2 pr-4 font-bold">Name</th>
                  <th className="py-2 pr-4 font-bold">Email</th>
                  <th className="py-2 pr-4 font-bold">Role</th>
                  <th className="py-2 font-bold">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/[0.06]">
                {staff.map((u) => (
                  <tr key={u.id}>
                    <td className="py-3 pr-4 font-semibold font-manrope">
                      {u.name}
                    </td>
                    <td className="py-3 pr-4 text-foreground/70">{u.email}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={
                          u.role === "ADMIN"
                            ? "text-primary font-semibold"
                            : "text-foreground/80"
                        }
                      >
                        {u.role === "ADMIN" ? "Admin" : "Doctor"}
                      </span>
                    </td>
                    <td className="py-3 text-foreground/50 text-xs tabular-nums">
                      {u.createdAt.toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
