import Link from "next/link";
import { CalendarClock, UserPlus, UserRound, Users } from "lucide-react";
import { requireAdminUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { Metric, PanelHead } from "../../components/dashboard/DashboardPanels";
import { AdminPatientDirectory } from "../../components/admin/AdminPatientDirectory";
import { DoctorVolumeChart } from "../../components/doctor/DoctorVolumeChart";

export const dynamic = "force-dynamic";

const TERMINAL = ["CANCELLED", "COMPLETED", "NO_SHOW"];

function buildMonthlyRegistrations(users) {
  const now = new Date();
  const buckets = [];
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    buckets.push({
      label: start.toLocaleDateString(undefined, { month: "short" }),
      count: 0,
      highlight: i === 0,
      startMs: start.getTime(),
      endMs: end.getTime(),
    });
  }
  for (const u of users) {
    const ts = new Date(u.createdAt).getTime();
    for (const b of buckets) {
      if (ts >= b.startMs && ts < b.endMs) {
        b.count += 1;
        break;
      }
    }
  }
  return buckets.map(({ label, count, highlight }) => ({ label, count, highlight }));
}

export default async function AdminPatientsPage() {
  await requireAdminUser("/admin/patients");

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [patientUsers, upcomingRows, guestGroups] = await Promise.all([
    prisma.user.findMany({
      where: { role: "PATIENT" },
      orderBy: { createdAt: "desc" },
      take: 400,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        profileCompletedAt: true,
        _count: { select: { patientAppointments: true } },
        patientAppointments: {
          orderBy: { scheduledAt: "desc" },
          take: 1,
          select: { id: true, scheduledAt: true, status: true },
        },
      },
    }),
    prisma.appointment.findMany({
      where: {
        patientId: { not: null },
        scheduledAt: { gte: now },
        status: { notIn: TERMINAL },
      },
      select: { patientId: true },
    }),
    prisma.appointment.groupBy({
      by: ["patientName"],
      where: { patientId: null },
      _count: { _all: true },
      orderBy: { _count: { patientName: "desc" } },
      take: 10,
    }),
  ]);

  const upcomingPatientIds = new Set(
    upcomingRows.map((r) => r.patientId).filter(Boolean)
  );

  const patients = patientUsers.map((u) => {
    const last = u.patientAppointments[0];
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      createdAt: u.createdAt.toISOString(),
      profileCompleted: Boolean(u.profileCompletedAt),
      visitCount: u._count.patientAppointments,
      lastVisitAt: last ? new Date(last.scheduledAt).toISOString() : null,
      lastApptId: last?.id ?? null,
      hasUpcoming: upcomingPatientIds.has(u.id),
    };
  });

  const monthlyRegs = buildMonthlyRegistrations(patientUsers);

  const total = patients.length;
  const profilesDone = patients.filter((p) => p.profileCompleted).length;
  const withUpcoming = patients.filter((p) => p.hasUpcoming).length;
  const newThisMonth = patientUsers.filter((u) => u.createdAt >= monthStart).length;

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-8">
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric
          icon={Users}
          label="Patient accounts"
          value={total}
          hint="Portal users with patient role"
        />
        <Metric
          icon={UserRound}
          label="Profiles complete"
          value={profilesDone}
          hint="Finished onboarding wizard"
        />
        <Metric
          icon={CalendarClock}
          label="With upcoming visit"
          value={withUpcoming}
          hint="Active booking on calendar"
        />
        <Metric
          icon={UserPlus}
          label="New this month"
          value={newThisMonth}
          hint="Accounts created since month start"
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="panel p-6 lg:col-span-2">
          <PanelHead
            eyebrow="Growth"
            title="New registrations by month"
            action={{ href: "/register", label: "Public register" }}
          />
          <p className="text-xs text-foreground/50 mt-1">
            Patient accounts created in each calendar month (last six months).
          </p>
          <div className="mt-6">
            {monthlyRegs.every((m) => m.count === 0) ? (
              <p className="text-sm text-foreground/50 py-6 text-center">No registrations in this window.</p>
            ) : (
              <DoctorVolumeChart
                weeks={monthlyRegs}
                ariaLabel="New patient registrations per month for the last six months"
              />
            )}
          </div>
        </div>

        <div className="panel p-6">
          <PanelHead eyebrow="Guests" title="Walk-ins without account" />
          <p className="text-xs text-foreground/50 mt-1">
            Top names on appointments not linked to a user id.
          </p>
          {guestGroups.length === 0 ? (
            <p className="mt-6 text-sm text-foreground/50">Every recent booking is linked to a patient id.</p>
          ) : (
            <ul className="mt-4 divide-y divide-primary/[0.06]">
              {guestGroups.map((g) => (
                <li key={g.patientName} className="flex items-center justify-between gap-3 py-3 text-sm first:pt-0 last:pb-0">
                  <span className="font-medium font-manrope truncate">{g.patientName}</span>
                  <span className="text-xs tabular-nums text-foreground/50 shrink-0">
                    {g._count._all} visit{g._count._all === 1 ? "" : "s"}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-[11px] text-foreground/45 leading-relaxed">
            Create a patient user under{" "}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Register
            </Link>{" "}
            or coordinate with staff, then book using their account in Appointments.
          </p>
        </div>
      </section>

      <section className="panel p-6">
        <PanelHead
          eyebrow="Directory"
          title="All patient accounts"
          action={{ href: "/admin/appointments", label: "Manage bookings" }}
        />
        <p className="text-xs text-foreground/50 mt-1">
          Search and sort the roster. “Open last booking” jumps to the most recent appointment for that
          person.
        </p>
        <div className="mt-6">
          <AdminPatientDirectory patients={patients} />
        </div>
      </section>
    </div>
  );
}
