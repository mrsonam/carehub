import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  UserRound,
  CalendarDays,
  CalendarClock,
  ClipboardList,
  CalendarCheck2,
  AlertTriangle,
} from "lucide-react";
import { getSessionCookieName, verifySessionToken } from "@/lib/auth";
import { autoCloseExpiredAppointments } from "@/lib/appointment-lifecycle";
import { prisma } from "@/lib/prisma";
import { Metric, PanelHead } from "../../components/dashboard/DashboardPanels";
import { AppointmentStatusBadge } from "../../components/appointments/AppointmentStatusBadge";
import {
  startOfDay,
  formatRelative,
  formatApptTime,
  formatTimeOnly,
  greetingForHour,
  initialsFromName,
} from "@/lib/dashboard-format";
import { DoctorVolumeChart } from "../../components/doctor/DoctorVolumeChart";
import { ConsultationControls } from "../../components/doctor/ConsultationControls";

export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

function scopeForDoctor(user) {
  return {
    OR: [
      { doctorId: user.id },
      { doctorName: { equals: user.name, mode: "insensitive" } },
    ],
  };
}

async function loadDoctorDashboard(user) {
  const w = scopeForDoctor(user);
  await autoCloseExpiredAppointments(prisma, w);
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = new Date(todayStart.getTime() + DAY_MS);
  const horizon = new Date(now.getTime() - 42 * DAY_MS);
  const terminalStatuses = ["CANCELLED", "COMPLETED", "NO_SHOW"];

  const [
    patientGroups,
    totalAppts,
    completedCount,
    todayList,
    upcomingList,
    upcomingWithNotes,
    urgentRows,
    weeklyRaw,
    recentAppts,
  ] = await Promise.all([
    prisma.appointment.groupBy({
      by: ["patientName"],
      where: w,
      _count: { _all: true },
    }),
    prisma.appointment.count({ where: w }),
    prisma.appointment.count({ where: { ...w, status: "COMPLETED" } }),
    prisma.appointment.findMany({
      where: {
        ...w,
        scheduledAt: { gte: todayStart, lt: todayEnd },
        status: { notIn: terminalStatuses },
      },
      orderBy: { scheduledAt: "asc" },
    }),
    prisma.appointment.findMany({
      where: {
        AND: [w, { status: { notIn: terminalStatuses } }, { OR: [{ scheduledAt: { gte: now } }, { status: "ONGOING" }] }],
      },
      orderBy: { scheduledAt: "asc" },
      take: 6,
    }),
    prisma.appointment.count({
      where: {
        ...w,
        scheduledAt: { gte: now },
        status: { notIn: terminalStatuses },
        patientNotes: { not: null },
      },
    }),
    prisma.appointment.findMany({
      where: {
        ...w,
        patientNotes: { contains: "urgent", mode: "insensitive" },
        status: { notIn: ["CANCELLED", "NO_SHOW"] },
      },
      orderBy: { scheduledAt: "asc" },
      take: 8,
    }),
    prisma.appointment.findMany({
      where: {
        ...w,
        scheduledAt: { gte: horizon, lte: now },
        status: { notIn: ["CANCELLED", "NO_SHOW"] },
      },
      select: { scheduledAt: true },
    }),
    prisma.appointment.findMany({
      where: w,
      orderBy: { updatedAt: "desc" },
      take: 40,
    }),
  ]);

  const myPatients = patientGroups.length;
  const completionRate = totalAppts > 0 ? Math.round((completedCount / totalAppts) * 100) : 0;
  const pendingToday = todayList.filter((a) => new Date(a.scheduledAt) >= now).length;

  const weeks = [];
  for (let i = 5; i >= 0; i--) {
    const end = new Date(now.getTime() - i * 7 * DAY_MS);
    const start = new Date(end.getTime() - 7 * DAY_MS);
    weeks.push({
      label: startOfDay(start).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      start,
      end,
      count: 0,
      highlight: i === 0,
    });
  }

  for (const row of weeklyRaw) {
    const t = row.scheduledAt.getTime();
    for (const bucket of weeks) {
      if (t >= bucket.start.getTime() && t < bucket.end.getTime()) {
        bucket.count += 1;
        break;
      }
    }
  }

  const seen = new Set();
  const recentPatients = [];
  for (const a of recentAppts) {
    if (seen.has(a.patientName)) continue;
    seen.add(a.patientName);
    recentPatients.push(a);
    if (recentPatients.length >= 5) break;
  }

  const alertIds = new Set();
  const alerts = [];

  for (const a of urgentRows) {
    alertIds.add(a.id);
    alerts.push({
      id: a.id,
      title: "Urgent note on file",
      detail: `${a.patientName} — ${(a.patientNotes ?? a.notes ?? "").slice(0, 96)}`,
      tone: "urgent",
      meta: formatRelative(a.updatedAt),
    });
  }

  for (const a of todayList) {
    const patientConcern = a.patientNotes ?? a.notes;
    if (!patientConcern || alertIds.has(a.id)) continue;
    if (patientConcern.toLowerCase().includes("urgent")) continue;
    alerts.push({
      id: a.id,
      title: "Pre-visit note",
      detail: `${a.patientName}: ${patientConcern.slice(0, 88)}`,
      tone: "info",
      meta: formatTimeOnly(a.scheduledAt),
    });
    alertIds.add(a.id);
    if (alerts.length >= 6) break;
  }

  const nextUp = upcomingList.find((a) => new Date(a.scheduledAt) >= now || a.status === "ONGOING");
  const nextHref = nextUp ? `/doctor/consultations/${nextUp.id}` : "/doctor/schedule";

  return {
    myPatients,
    totalAppts,
    todayCount: todayList.length,
    pendingToday,
    upcomingWithNotes,
    completionRate,
    todayList,
    upcomingList,
    weeks: weeks.map(({ label, count, highlight }) => ({ label, count, highlight })),
    recentPatients,
    alerts,
    nextHref,
  };
}

export default async function DoctorDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const session = token ? await verifySessionToken(token).catch(() => null) : null;
  if (!session) redirect("/login?next=/doctor/dashboard");
  if (session.role !== "DOCTOR") redirect("/dashboard");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true },
  });
  if (!user) redirect("/login?next=/doctor/dashboard");

  const data = await loadDoctorDashboard(user);
  const greet = greetingForHour();

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-8">
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric icon={UserRound} label="My patients" value={data.myPatients} hint={data.totalAppts ? `${data.totalAppts} total visit${data.totalAppts === 1 ? "" : "s"}` : "No visits on file yet"} />
        <Metric icon={CalendarDays} label="Today’s schedule" value={data.todayCount} hint={data.pendingToday ? `${data.pendingToday} remaining today` : "Nothing else today"} />
        <Metric icon={ClipboardList} label="Notes before visits" value={data.upcomingWithNotes} hint="Upcoming with a note" />
        <Metric icon={CalendarCheck2} label="Visit completion" value={`${data.completionRate}%`} hint="Share of past appointments" />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="panel p-6 lg:col-span-2">
          <PanelHead eyebrow="Schedule" title="Upcoming schedule" action={{ href: "/doctor/schedule", label: "Full schedule" }} />
          {data.upcomingList.length === 0 ? (
            <p className="mt-6 text-sm text-foreground/50">
              No active appointments are assigned to you. Confirmed and ongoing consultations will appear here.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-primary/[0.06]">
              {data.upcomingList.map((appt) => {
                const urgent = (appt.patientNotes ?? appt.notes)?.toLowerCase().includes("urgent") ?? false;
                const Icon = urgent ? AlertTriangle : CalendarClock;
                return (
                  <li key={appt.id} className={`grid gap-4 py-5 text-sm first:pt-0 last:pb-0 ${urgent ? "border-l-[3px] border-primary pl-3 -ml-0.5" : ""}`}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Icon size={16} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold font-manrope truncate">{appt.patientName}</p>
                          <AppointmentStatusBadge status={appt.status} />
                        </div>
                        <p className="text-xs text-foreground/50 mt-0.5">
                          {formatApptTime(appt.scheduledAt)} · {appt.durationMinutes ?? 15} min
                          {appt.status === "ONGOING" ? " · consultation in progress" : ""}
                        </p>
                      </div>
                    </div>
                    <ConsultationControls appointment={appt} />
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="panel p-6">
          <PanelHead eyebrow="Inbox" title="Clinical alerts" />
          {data.alerts.length === 0 ? (
            <p className="mt-6 text-sm text-foreground/50">
              No flagged notes or pre-visit reminders. Add the word “urgent” to a note to surface it here.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-primary/[0.06]">
              {data.alerts.map((a) => (
                <li key={a.id} className="flex gap-3 py-3.5 text-sm first:pt-0 last:pb-0">
                  <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${a.tone === "urgent" ? "bg-primary" : "bg-secondary"}`} aria-hidden />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{a.title}</p>
                    <p className="text-xs text-foreground/55 mt-0.5 line-clamp-2">{a.detail}</p>
                  </div>
                  <span className="text-[11px] text-foreground/45 tabular-nums shrink-0">{a.meta}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="panel p-6">
          <PanelHead eyebrow="Volume" title="Your last six weeks" action={{ href: "/doctor/schedule", label: "View calendar" }} />
          <p className="text-xs text-foreground/50 mt-1">
            Completed and past visits only — rolling weekly buckets.
          </p>
          <div className="mt-6">
            <DoctorVolumeChart weeks={data.weeks} />
          </div>
        </div>

        <div className="panel p-6">
          <PanelHead eyebrow="Patients" title="Recently reviewed" action={{ href: "/doctor/patients", label: "Browse all patients" }} />
          {data.recentPatients.length === 0 ? (
            <p className="mt-6 text-sm text-foreground/50">
              Patient shortcuts appear after you have appointments assigned to your name.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-primary/[0.06]">
              {data.recentPatients.map((row) => (
                <li key={row.patientName} className="flex items-center gap-4 py-3.5 text-sm first:pt-0 last:pb-0">
                  <span className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold font-manrope">
                    {initialsFromName(row.patientName)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{row.patientName}</p>
                    <p className="text-xs text-foreground/50">Last touch {formatRelative(row.updatedAt)}</p>
                  </div>
                  <span className="text-xs text-foreground/45 tabular-nums shrink-0">
                    {formatApptTime(row.scheduledAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
