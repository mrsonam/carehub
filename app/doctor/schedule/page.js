import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarCheck2, CalendarClock, ClipboardList, Eye, Timer } from "lucide-react";
import { getSessionCookieName, verifySessionToken } from "@/lib/auth";
import { autoCloseExpiredAppointments } from "@/lib/appointment-lifecycle";
import { prisma } from "@/lib/prisma";
import { Metric, PanelHead } from "../../components/dashboard/DashboardPanels";
import { formatApptTime, formatTimeOnly } from "@/lib/dashboard-format";
import { ConsultationControls } from "../../components/doctor/ConsultationControls";
import DoctorRecordsWorkspace from "../../components/doctor/DoctorRecordsWorkspace";

export const dynamic = "force-dynamic";

function doctorScope(user) {
  return {
    OR: [
      { doctorId: user.id },
      { doctorName: { equals: user.name, mode: "insensitive" } },
    ],
  };
}

function keyForDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function monthGrid(monthDate) {
  const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  start.setHours(0, 0, 0, 0);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
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
    take: 80,
  });

  const terminalStatuses = ["CANCELLED", "COMPLETED", "NO_SHOW"];
  const now = new Date();
  const active = appointments.filter((a) => !terminalStatuses.includes(a.status));
  const finished = appointments.filter((a) => terminalStatuses.includes(a.status));
  const finishedRows = finished.map((appt) => ({
    ...appt,
    displayScheduledAt: formatApptTime(appt.scheduledAt),
    bucket: new Date(appt.scheduledAt) >= now ? "UPCOMING" : "PAST",
  }));
  const nowUpcoming = active.filter((a) => new Date(a.scheduledAt) >= now);
  const ongoingCount = active.filter((a) => a.status === "ONGOING").length;
  const todayKey = keyForDate(now);
  const todayCount = appointments.filter((a) => keyForDate(new Date(a.scheduledAt)) === todayKey).length;
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthDays = monthGrid(monthStart);
  const byDate = appointments.reduce((acc, appt) => {
    const key = keyForDate(new Date(appt.scheduledAt));
    if (!acc[key]) acc[key] = [];
    acc[key].push(appt);
    return acc;
  }, {});

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

      <section className="panel p-6">
        <PanelHead eyebrow="Calendar" title="Month view" />
        <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-foreground/50">
            Snapshot of your appointments in {monthStart.toLocaleDateString(undefined, { month: "long", year: "numeric" })}.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-foreground/55">
            <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" aria-hidden />Confirmed</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden />Live or completed</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" aria-hidden />Cancelled</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-500" aria-hidden />No-show</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-7 rounded-2xl overflow-hidden border border-primary/[0.06] bg-surface-lowest">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="px-2 py-2 text-center text-[10px] font-bold uppercase tracking-widest text-foreground/45 bg-surface-low">
              {day}
            </div>
          ))}
          {monthDays.map((day) => {
            const key = keyForDate(day);
            const dayAppts = (byDate[key] ?? []).sort(
              (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
            );
            const isCurrentMonth = day.getMonth() === monthStart.getMonth();
            const isToday = keyForDate(day) === keyForDate(now);
            return (
              <div
                key={key}
                className={`min-h-[7.5rem] border-t border-r border-primary/[0.06] p-2 ${
                  isCurrentMonth ? "bg-surface-lowest" : "bg-surface-lowest/55"
                } ${isToday ? "ring-1 ring-primary/20 ring-inset" : ""}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-xs font-bold font-manrope ${isCurrentMonth ? "text-foreground/75" : "text-foreground/35"}`}>
                    {day.getDate()}
                  </p>
                  <span className="text-[10px] font-semibold text-foreground/40">
                    {dayAppts.length > 0 ? `${dayAppts.length} appt${dayAppts.length === 1 ? "" : "s"}` : ""}
                  </span>
                </div>
                <div className="mt-2 space-y-1.5">
                  {dayAppts.slice(0, 3).map((appt) => (
                    <Link
                      key={appt.id}
                      href={`/doctor/appointments/${appt.id}`}
                      className="block rounded-lg border border-primary/[0.08] bg-surface-low px-2 py-1.5 transition-colors hover:bg-surface-lowest"
                    >
                      <div className="flex items-start gap-2 min-w-0">
                        <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${statusTone(appt.status).dot}`} aria-hidden />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-semibold text-foreground/75 truncate">
                            {formatTimeOnly(appt.scheduledAt)} · {appt.patientName}
                          </p>
                          <p className="mt-0.5 text-[10px] text-foreground/45 truncate">
                            {appt.status.replace("_", " ")}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {dayAppts.length > 3 ? (
                    <p className="text-[10px] font-semibold text-foreground/45">
                      +{dayAppts.length - 3} more
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>

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
                className={`grid gap-4 py-5 first:pt-0 last:pb-0 rounded-xl border border-transparent px-2 ${
                  focus === appt.id ? "bg-primary/[0.06] border-primary/20" : "hover:bg-surface-lowest/70 hover:border-primary/[0.08]"
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
                      <span className="inline-flex items-center rounded-full border border-primary/[0.08] bg-surface-low px-2.5 py-1 text-[10px] font-semibold text-foreground/55">
                        {new Date(appt.scheduledAt) >= now ? "Upcoming" : "Past due"}
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
          <DoctorRecordsWorkspace records={finishedRows} focus={focus} />
        )}
      </section>
    </div>
  );
}
