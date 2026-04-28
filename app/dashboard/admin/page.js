import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Plus,
  CalendarDays,
  CheckCircle2,
  CalendarClock,
  UserRound,
  Stethoscope,
  CalendarCheck2,
} from "lucide-react";
import { getSessionCookieName, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Metric, PanelHead } from "../components/DashboardPanels";
import { DAY_LABELS, startOfDay, formatRelative, formatApptTime } from "@/lib/dashboard-format";
import { AppointmentTrendsChart, DoctorBreakdown } from "./AdminCharts";

export const dynamic = "force-dynamic";

async function loadAdminStats() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfDay(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000));

  const [
    totalAppointments,
    upcomingCount,
    completedCount,
    todayCount,
    patientsCount,
    doctorsCount,
    recentAppointments,
    trendRows,
    doctorGroups,
  ] = await Promise.all([
    prisma.appointment.count(),
    prisma.appointment.count({ where: { scheduledAt: { gte: now } } }),
    prisma.appointment.count({ where: { scheduledAt: { lt: now } } }),
    prisma.appointment.count({
      where: {
        scheduledAt: {
          gte: todayStart,
          lt: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.user.count({ where: { role: "PATIENT" } }),
    prisma.user.count({ where: { role: "DOCTOR" } }),
    prisma.appointment.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.appointment.findMany({
      where: { scheduledAt: { gte: weekStart } },
      select: { scheduledAt: true },
    }),
    prisma.appointment.groupBy({
      by: ["doctorName"],
      _count: { _all: true },
      orderBy: { _count: { doctorName: "desc" } },
      take: 5,
    }),
  ]);

  const dayBuckets = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000);
    return {
      label: DAY_LABELS[d.getDay() === 0 ? 6 : d.getDay() - 1],
      date: d,
      completed: 0,
      upcoming: 0,
    };
  });

  for (const row of trendRows) {
    const rowStart = startOfDay(row.scheduledAt).getTime();
    const idx = Math.round(
      (rowStart - weekStart.getTime()) / (24 * 60 * 60 * 1000)
    );
    if (idx < 0 || idx >= dayBuckets.length) continue;
    if (row.scheduledAt < now) dayBuckets[idx].completed += 1;
    else dayBuckets[idx].upcoming += 1;
  }

  const doctorItems = doctorGroups
    .filter((g) => g.doctorName)
    .map((g) => ({ name: g.doctorName, count: g._count._all }));

  return {
    totalAppointments,
    upcomingCount,
    completedCount,
    todayCount,
    patientsCount,
    doctorsCount,
    recentAppointments,
    days: dayBuckets,
    doctorItems,
  };
}

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const session = token ? await verifySessionToken(token).catch(() => null) : null;
  if (!session) redirect("/login?next=/dashboard/admin");
  if (session.role !== "ADMIN") redirect("/dashboard");

  const stats = await loadAdminStats();
  const completionRate =
    stats.totalAppointments > 0
      ? Math.round((stats.completedCount / stats.totalAppointments) * 100)
      : 0;

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-8">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/45">
            Overview
          </p>
          <h1 className="mt-2 text-3xl lg:text-4xl font-extrabold font-manrope tracking-tight">
            Today at the clinic
          </h1>
          <p className="text-foreground/55 mt-1.5 text-sm">
            {stats.todayCount} appointment{stats.todayCount === 1 ? "" : "s"} on
            the books · {stats.upcomingCount} upcoming · last 30 days
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-surface-lowest transition-colors"
          >
            Export
          </button>
          <Link
            href="/dashboard/admin/appointments/new"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-white text-sm font-semibold shadow-sm shadow-primary/20 hover:bg-primary-container transition-colors"
          >
            <Plus size={15} />
            New appointment
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric
          icon={CalendarDays}
          label="Total appointments"
          value={stats.totalAppointments}
          hint={`${stats.todayCount} today`}
        />
        <Metric
          icon={CheckCircle2}
          label="Completed"
          value={stats.completedCount}
          hint={`${completionRate}% completion`}
        />
        <Metric
          icon={CalendarClock}
          label="Upcoming"
          value={stats.upcomingCount}
          hint="scheduled ahead"
        />
        <Metric
          icon={UserRound}
          label="Active patients"
          value={stats.patientsCount}
          hint={`${stats.doctorsCount} doctors`}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="panel p-6 lg:col-span-2">
          <PanelHead
            eyebrow="Appointment trends"
            title="Daily volume, last 7 days"
            legend={[
              { label: "Completed", tone: "primary" },
              { label: "Upcoming", tone: "secondary" },
            ]}
          />
          <div className="mt-6">
            <AppointmentTrendsChart days={stats.days} />
          </div>
        </div>

        <div className="panel p-6">
          <PanelHead eyebrow="Load by doctor" title="Share of scheduled" />
          <div className="mt-6">
            <DoctorBreakdown items={stats.doctorItems} />
          </div>
        </div>
      </section>

      <section className="panel p-6">
        <PanelHead
          eyebrow="Staff"
          title="Top performing doctors"
          action={{ href: "/dashboard/admin/doctors", label: "View all staff" }}
        />
        {stats.doctorItems.length === 0 ? (
          <p className="mt-6 text-sm text-foreground/50">
            No appointments have been booked yet. Performers appear here once
            activity starts.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-primary/[0.06]">
            {stats.doctorItems.map((doc, i) => {
              const pct = Math.round(
                (doc.count / Math.max(1, stats.totalAppointments)) * 100
              );
              return (
                <li
                  key={doc.name}
                  className="flex items-center gap-4 py-3.5 text-sm first:pt-0 last:pb-0"
                >
                  <span className="w-5 shrink-0 text-xs font-semibold tabular-nums text-foreground/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Stethoscope size={16} />
                  </span>
                  <span className="flex-1 font-semibold font-manrope truncate">
                    {doc.name}
                  </span>
                  <span className="hidden sm:block w-40 text-foreground/55 truncate">
                    General practice
                  </span>
                  <span className="w-28 text-right tabular-nums text-foreground/70">
                    {doc.count} appt{doc.count === 1 ? "" : "s"}
                  </span>
                  <span className="w-14 text-right tabular-nums text-foreground/45">
                    {pct}%
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="panel p-6">
        <PanelHead
          eyebrow="Activity"
          title="Recent clinical activity"
          action={{
            href: "/dashboard/admin/activity",
            label: "View all activity",
          }}
        />
        {stats.recentAppointments.length === 0 ? (
          <p className="mt-6 text-sm text-foreground/50">
            No activity recorded yet.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-primary/[0.06]">
            {stats.recentAppointments.map((appt) => {
              const isPast = new Date(appt.scheduledAt) < new Date();
              const status = isPast ? "Completed" : "Scheduled";
              const Icon = isPast ? CalendarCheck2 : CalendarClock;
              return (
                <li
                  key={appt.id}
                  className="flex items-center gap-4 py-3.5 text-sm first:pt-0 last:pb-0"
                >
                  <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Icon size={16} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">
                      {appt.patientName}
                      {appt.doctorName ? (
                        <span className="text-foreground/55 font-normal">
                          {" "}
                          with Dr. {appt.doctorName}
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-foreground/50 mt-0.5">
                      {formatApptTime(appt.scheduledAt)}
                      {appt.notes ? ` · ${appt.notes}` : ""}
                    </p>
                  </div>
                  <span className="hidden sm:block text-xs text-foreground/55">
                    {status}
                  </span>
                  <span className="w-20 text-right text-xs text-foreground/40 tabular-nums">
                    {formatRelative(appt.createdAt)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
