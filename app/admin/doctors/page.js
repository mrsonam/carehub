import Link from "next/link";
import {
  CalendarClock,
  CalendarPlus,
  Clock,
  KeyRound,
  Sparkles,
  Stethoscope,
  UserPlus,
  Users,
} from "lucide-react";
import { requireAdminUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { Metric, PanelHead } from "../../components/dashboard/DashboardPanels";
import { AdminDoctorDirectory } from "../../components/admin/AdminDoctorDirectory";
import { AdminDoctorJoinsChart } from "../../components/admin/AdminDoctorJoinsChart";

export const dynamic = "force-dynamic";

const TERMINAL = ["CANCELLED", "COMPLETED", "NO_SHOW"];

function buildMonthlyJoins(users) {
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

export default async function AdminDoctorsPage() {
  await requireAdminUser("/admin/doctors");

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [doctorUsers, upcomingByDoctor, nameOnlyGroups, volumeGroups] = await Promise.all([
    prisma.user.findMany({
      where: { role: "DOCTOR" },
      orderBy: { name: "asc" },
      take: 300,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        title: true,
        createdAt: true,
        profileCompletedAt: true,
        mustChangePassword: true,
        _count: {
          select: { doctorAppointments: true, availabilityRules: true },
        },
        doctorAppointments: {
          orderBy: { scheduledAt: "desc" },
          take: 1,
          select: { id: true, scheduledAt: true },
        },
      },
    }),
    prisma.appointment.groupBy({
      by: ["doctorId"],
      where: {
        doctorId: { not: null },
        scheduledAt: { gte: now },
        status: { notIn: TERMINAL },
      },
      _count: { _all: true },
    }),
    prisma.appointment.groupBy({
      by: ["doctorName"],
      where: { doctorId: null, doctorName: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { doctorName: "desc" } },
      take: 8,
    }),
    prisma.appointment.groupBy({
      by: ["doctorId"],
      where: { doctorId: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { doctorId: "desc" } },
      take: 6,
    }),
  ]);

  const upcomingMap = Object.fromEntries(
    upcomingByDoctor.map((r) => [r.doctorId, r._count._all])
  );

  const doctors = doctorUsers.map((u) => {
    const last = u.doctorAppointments[0];
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      title: u.title,
      createdAt: u.createdAt.toISOString(),
      profileCompleted: Boolean(u.profileCompletedAt),
      mustChangePassword: u.mustChangePassword,
      visitCount: u._count.doctorAppointments,
      ruleCount: u._count.availabilityRules,
      upcomingCount: upcomingMap[u.id] ?? 0,
      lastVisitAt: last ? new Date(last.scheduledAt).toISOString() : null,
      lastApptId: last?.id ?? null,
    };
  });

  const monthlyJoins = buildMonthlyJoins(doctorUsers);

  const total = doctors.length;
  const profilesDone = doctors.filter((d) => d.profileCompleted).length;
  const withRules = doctors.filter((d) => d.ruleCount > 0).length;
  const newThisMonth = doctorUsers.filter((u) => u.createdAt >= monthStart).length;
  const pendingPassword = doctors.filter((d) => d.mustChangePassword).length;

  const leaderboardIds = volumeGroups.map((g) => g.doctorId).filter(Boolean);
  const nameById =
    leaderboardIds.length > 0
      ? Object.fromEntries(
          (
            await prisma.user.findMany({
              where: { id: { in: leaderboardIds } },
              select: { id: true, name: true },
            })
          ).map((u) => [u.id, u.name])
        )
      : {};

  const leaderboard = volumeGroups.map((g) => ({
    doctorId: g.doctorId,
    name: nameById[g.doctorId] ?? "Unknown",
    count: g._count._all,
  }));

  const needsRules = doctors.filter((d) => d.ruleCount === 0).slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-8">
      <header className="relative overflow-hidden rounded-2xl border border-primary/[0.08] bg-gradient-to-br from-primary/[0.06] via-surface-lowest to-surface-lowest p-6 sm:p-8">
        <div
          className="pointer-events-none absolute -right-10 -top-8 h-40 w-40 rounded-full bg-primary/[0.11] blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/45">
              <Sparkles size={14} className="text-primary/80" aria-hidden />
              Clinical staff
            </p>
            <h1 className="mt-2 text-3xl lg:text-4xl font-extrabold font-manrope tracking-tight">
              Doctors
            </h1>
            <p className="text-foreground/55 mt-1.5 text-sm max-w-2xl leading-relaxed">
              Clinicians with sign-in access, their booking volume, and availability setup. Invite or edit
              accounts under Team; schedule visits from Appointments.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Link
              href="/admin/users"
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary-container transition-colors"
            >
              <UserPlus size={18} />
              Team & invites
            </Link>
            <Link
              href="/admin/appointments"
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl border border-primary/[0.15] text-primary text-sm font-semibold hover:bg-primary/10 transition-colors"
            >
              <CalendarPlus size={18} />
              Appointments
            </Link>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl border border-primary/[0.12] text-foreground/75 text-sm font-semibold hover:bg-surface-low transition-colors"
            >
              Overview
            </Link>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric
          icon={Stethoscope}
          label="Clinicians"
          value={total}
          hint="Doctor-role accounts"
        />
        <Metric
          icon={Users}
          label="Profiles complete"
          value={profilesDone}
          hint="Finished onboarding wizard"
        />
        <Metric
          icon={Clock}
          label="Availability set"
          value={withRules}
          hint="At least one weekly rule"
        />
        <Metric
          icon={KeyRound}
          label="Password pending"
          value={pendingPassword}
          hint="Must change password on next sign-in"
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="panel p-6 lg:col-span-2">
          <PanelHead
            eyebrow="Growth"
            title="Doctor accounts by month"
            action={{ href: "/admin/users", label: "Manage team" }}
          />
          <p className="text-xs text-foreground/50 mt-1">
            New clinician accounts created in each calendar month (last six months).
          </p>
          <div className="mt-6">
            {monthlyJoins.every((m) => m.count === 0) ? (
              <p className="text-sm text-foreground/50 py-6 text-center">No clinician sign-ups in this window.</p>
            ) : (
              <AdminDoctorJoinsChart
                months={monthlyJoins}
                ariaLabel="New doctor accounts created in each of the last six months"
              />
            )}
          </div>
        </div>

        <div className="panel p-6 flex flex-col">
          <PanelHead eyebrow="Load" title="Top by bookings" />
          <p className="text-xs text-foreground/50 mt-1">Appointments linked to a doctor id.</p>
          {leaderboard.length === 0 ? (
            <p className="mt-6 text-sm text-foreground/50 flex-1">
              No linked appointments yet. Bookings will rank clinicians here.
            </p>
          ) : (
            <ol className="mt-4 space-y-3 flex-1">
              {leaderboard.map((row, i) => (
                <li key={row.doctorId} className="flex items-center gap-3 text-sm">
                  <span className="w-6 h-6 rounded-md bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 tabular-nums">
                    {i + 1}
                  </span>
                  <span className="font-semibold font-manrope truncate flex-1 min-w-0">{row.name}</span>
                  <span className="text-xs tabular-nums text-foreground/50 shrink-0">
                    {row.count} appt{row.count === 1 ? "" : "s"}
                  </span>
                </li>
              ))}
            </ol>
          )}
          <div className="mt-6 pt-4 border-t border-primary/[0.06]">
            <p className="text-[11px] font-bold uppercase tracking-wider text-foreground/45">Needs availability</p>
            {needsRules.length === 0 ? (
              <p className="mt-2 text-xs text-foreground/50">Everyone has at least one weekly rule.</p>
            ) : (
              <ul className="mt-2 space-y-1.5 text-xs text-foreground/65">
                {needsRules.map((d) => (
                  <li key={d.id} className="truncate">
                    · {d.name}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-[11px] text-foreground/45 leading-relaxed">
              Doctors configure slots in their own{" "}
              <span className="font-medium text-foreground/55">Availability</span> workspace after sign-in.
            </p>
          </div>
        </div>
      </section>

      <section className="panel p-6">
        <PanelHead
          eyebrow="Data hygiene"
          title="Bookings without doctor id"
          action={{ href: "/admin/appointments", label: "Review schedule" }}
        />
        <p className="text-xs text-foreground/50 mt-1">
          Legacy or manual rows only store a display name. Prefer selecting a clinician when creating
          appointments so metrics stay accurate.
        </p>
        {nameOnlyGroups.length === 0 ? (
          <p className="mt-4 text-sm text-foreground/50">All recent bookings reference a doctor account.</p>
        ) : (
          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {nameOnlyGroups.map((g) => (
              <li
                key={g.doctorName}
                className="flex items-center justify-between gap-3 rounded-xl border border-primary/[0.08] bg-surface-low px-4 py-3 text-sm"
              >
                <span className="font-medium font-manrope truncate">{g.doctorName}</span>
                <span className="text-xs tabular-nums text-foreground/50 shrink-0">
                  {g._count._all} row{g._count._all === 1 ? "" : "s"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel p-6">
        <PanelHead
          eyebrow="Directory"
          title="All clinicians"
          action={{ href: "/admin/patients", label: "Patients" }}
        />
        <p className="text-xs text-foreground/50 mt-1">
          Search the roster, see upcoming load and availability rules, and jump to the last booking or Team.
        </p>
        <div className="mt-6">
          <AdminDoctorDirectory doctors={doctors} />
        </div>
      </section>

      <section className="rounded-xl border border-primary/[0.08] bg-surface-low px-5 py-4 flex flex-wrap items-center gap-3 text-sm text-foreground/60">
        <CalendarClock size={18} className="text-primary shrink-0" aria-hidden />
        <span>
          <span className="font-semibold text-foreground/80">{newThisMonth}</span> new clinician account
          {newThisMonth === 1 ? "" : "s"} this month ·{" "}
          <span className="font-semibold text-foreground/80">{doctors.reduce((s, d) => s + d.upcomingCount, 0)}</span>{" "}
          upcoming visits currently assigned across the team.
        </span>
      </section>
    </div>
  );
}
