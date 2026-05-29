import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarCheck2, CalendarClock, ClipboardList, Eye, Timer } from "lucide-react";
import { getSessionCookieName, verifySessionToken } from "@/lib/auth";
import { autoCloseExpiredAppointments, isActiveUpcomingAppointment, isCalendarVisibleAppointment } from "@/lib/appointment-lifecycle";
import { readSearchQuery } from "@/lib/dashboard-search";
import { prisma } from "@/lib/prisma";
import { Metric, PanelHead } from "../../components/dashboard/DashboardPanels";
import { formatApptTime, formatTimeOnly } from "@/lib/dashboard-format";
import { ConsultationControls } from "../../components/doctor/ConsultationControls";
import DoctorRecordsWorkspace from "../../components/doctor/DoctorRecordsWorkspace";
import DoctorScheduleCalendar from "../../components/doctor/DoctorScheduleCalendar";
import { dateKey } from "@/lib/calendar/dates";

export const dynamic = "force-dynamic";

function doctorScope(user) {
  return {
    OR: [
      { doctorId: user.id },
      { doctorName: { equals: user.name, mode: "insensitive" } },
    ],
  };
}

function statusTone(status) {
  if (status === "REQUESTED") return { chip: "bg-amber-500/10 text-amber-700 border-amber-500/25", dot: "bg-amber-500" };
  if (status === "CONFIRMED") return { chip: "bg-primary/10 text-primary border-primary/25", dot: "bg-primary" };
  if (status === "ONGOING") return { chip: "bg-emerald-500/10 text-emerald-700 border-emerald-500/25", dot: "bg-emerald-500" };
  if (status === "COMPLETED") return { chip: "bg-emerald-500/10 text-emerald-700 border-emerald-500/25", dot: "bg-emerald-500" };
  if (status === "NO_SHOW") return { chip: "bg-slate-500/10 text-slate-700 border-slate-500/25", dot: "bg-slate-500" };
  if (status === "CANCELLED") return { chip: "bg-red-500/10 text-red-700 border-red-500/25", dot: "bg-red-500" };
  return { chip: "bg-surface-low text-foreground/70 border-primary/[0.1]", dot: "bg-foreground/35" };
}

export default async function DoctorSchedulePage({ searchParams }) {
  const sp = await Promise.resolve(searchParams);
  const initialQuery = readSearchQuery(sp?.q);
  const focus = sp?.focus;
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const session = token ? await verifySessionToken(token).catch(() => null) : null;
  if (!session) redirect("/login?next=/doctor/schedule");
  if (session.role !== "DOCTOR") redirect("/dashboard");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true },
  });
  if (!user) redirect("/login?next=/doctor/schedule");
  const scope = doctorScope(user);
  await autoCloseExpiredAppointments(prisma, scope);

  const appointments = await prisma.appointment.findMany({
    where: scope,
    orderBy: { scheduledAt: "asc" },
    take: 250,
  });

  const terminalStatuses = ["CANCELLED", "COMPLETED", "NO_SHOW"];
  const now = new Date();
  const active = appointments.filter((a) => isActiveUpcomingAppointment(a, now));
  const calendarAppointments = appointments.filter((a) => isCalendarVisibleAppointment(a, now));
  const finished = appointments.filter((a) => terminalStatuses.includes(a.status));
  const finishedRows = finished.map((appt) => ({
    ...appt,
    displayScheduledAt: formatApptTime(appt.scheduledAt),
    bucket: new Date(appt.scheduledAt) >= now ? "UPCOMING" : "PAST",
  }));
  const nowUpcoming = active.filter((a) => new Date(a.scheduledAt) >= now);
  const ongoingCount = active.filter((a) => a.status === "ONGOING").length;
  const todayKeyValue = dateKey(now);
  const todayCount = calendarAppointments.filter(
    (a) => dateKey(new Date(a.scheduledAt)) === todayKeyValue
  ).length;

  return (
    <div className="max-w-5xl mx-auto w-full flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-extrabold font-manrope tracking-tight">
          Schedule management
        </h1>
        <p className="text-sm text-foreground/55 mt-1">
          Start consultations, capture live notes, complete visits, or mark a no-show.
        </p>
      </div>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric icon={CalendarCheck2} label="Today" value={todayCount} hint="Appointments on calendar" />
        <Metric icon={ClipboardList} label="Active queue" value={active.length} hint="Requested, confirmed, ongoing" />
        <Metric icon={CalendarClock} label="Upcoming" value={nowUpcoming.length} hint="Still ahead of now" />
        <Metric icon={Timer} label="In progress" value={ongoingCount} hint="Consultations live" />
      </section>

      <DoctorScheduleCalendar
        appointments={calendarAppointments.map((appt) => ({
          ...appt,
          scheduledAt: appt.scheduledAt.toISOString(),
        }))}
      />

      <section className="panel p-6">
        <PanelHead eyebrow="Queue" title="Needs attention" />
        {active.length === 0 ? (
          <p className="mt-4 text-sm text-foreground/50">
            No active appointments assigned to you.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-primary/[0.06]">
            {active.map((appt) => (
              <li
                key={appt.id}
                id={appt.id}
                className={`grid gap-4 py-5 first:pt-0 last:pb-0 rounded-xl border px-2 ${
                  focus === appt.id
                    ? "bg-primary/[0.06] border-primary/20"
                    : "border-transparent"
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <span className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <CalendarClock size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold font-manrope">{appt.patientName}</p>
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusTone(appt.status).chip}`}>
                        {appt.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs text-foreground/50 mt-1">
                      {formatApptTime(appt.scheduledAt)} · {appt.durationMinutes ?? 15} min
                    </p>
                  </div>
                </div>
                <ConsultationControls appointment={appt} />
                <div className="flex justify-end">
                  <Link
                    href={`/doctor/appointments/${appt.id}`}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-primary/[0.12] text-primary hover:bg-primary/10 transition-colors"
                    aria-label="View appointment details"
                    title="View details"
                  >
                    <Eye size={15} />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel p-6">
        <PanelHead eyebrow="Records" title="Completed and cancelled" />
        {finishedRows.length === 0 ? (
          <p className="mt-4 text-sm text-foreground/50">
            Completed visits, no-shows, and cancellations will appear here.
          </p>
        ) : (
          <DoctorRecordsWorkspace records={finishedRows} focus={focus} initialQuery={initialQuery} />
        )}
      </section>
    </div>
  );
}
