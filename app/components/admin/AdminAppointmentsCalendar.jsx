"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarShell } from "@/app/components/calendar/CalendarShell";
import { AgendaDayList } from "@/app/components/calendar/AgendaDayList";
import { dateKey, todayKey } from "@/lib/calendar/dates";
import { formatTimeOnly } from "@/lib/dashboard-format";
import { PanelHead } from "@/app/components/dashboard/DashboardPanels";

function statusDot(status) {
  if (status === "REQUESTED") return "bg-amber-500";
  if (status === "CONFIRMED" || status === "ONGOING") return "bg-primary";
  if (status === "COMPLETED") return "bg-emerald-500";
  if (status === "CANCELLED") return "bg-red-500";
  if (status === "NO_SHOW") return "bg-slate-500";
  return "bg-foreground/35";
}

export default function AdminAppointmentsCalendar({ appointments = [] }) {
  const now = useMemo(() => new Date(), []);
  const [monthDate, setMonthDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [selectedDateKey, setSelectedDateKey] = useState(todayKey());

  const byDate = useMemo(() => {
    const map = {};
    for (const appt of appointments) {
      const key = dateKey(new Date(appt.scheduledAt));
      if (!map[key]) map[key] = [];
      map[key].push(appt);
    }
    return map;
  }, [appointments]);

  const selectedDayAppts = byDate[selectedDateKey] ?? [];

  const legend = (
    <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-foreground/55">
      <span className="inline-flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-primary" aria-hidden />
        Confirmed / live
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-amber-500" aria-hidden />
        Requested
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-red-500" aria-hidden />
        Cancelled
      </span>
    </div>
  );

  return (
    <section className="panel p-4 sm:p-6">
      <PanelHead eyebrow="Calendar" title="Clinic schedule" />
      <p className="mt-1 text-xs text-foreground/50">
        Browse appointments by day. On mobile, use the week strip; on larger screens, the month grid.
      </p>

      <div className="mt-5">
        <CalendarShell
          monthDate={monthDate}
          selectedDateKey={selectedDateKey}
          onMonthDateChange={setMonthDate}
          onSelectDateKey={setSelectedDateKey}
          legend={legend}
          getDayMeta={(key) => {
            const count = byDate[key]?.length ?? 0;
            return count > 0 ? { badge: count, tone: "busy" } : {};
          }}
          desktopMinCellClassName="min-h-[7.5rem] border-t border-r border-primary/[0.06] p-2"
          renderDesktopDay={(day, key) => {
            const dayAppts = (byDate[key] ?? []).sort(
              (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
            );
            const isCurrentMonth = day.getMonth() === monthDate.getMonth();
            const isToday = key === dateKey(now);
            return (
              <div
                className={`h-full ${
                  isCurrentMonth ? "bg-surface-lowest" : "bg-surface-lowest/55"
                } ${isToday ? "ring-1 ring-primary/20 ring-inset" : ""} ${
                  key === selectedDateKey ? "bg-primary/[0.06]" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedDateKey(key)}
                  className="w-full h-full min-h-[7.5rem] p-2 text-left hover:bg-surface-low transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-xs font-bold font-manrope ${
                        isCurrentMonth ? "text-foreground/75" : "text-foreground/35"
                      }`}
                    >
                      {day.getDate()}
                    </p>
                    {dayAppts.length > 0 ? (
                      <span className="text-[10px] font-semibold text-foreground/40">
                        {dayAppts.length} appt{dayAppts.length === 1 ? "" : "s"}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-2 space-y-1.5">
                    {dayAppts.slice(0, 3).map((appt) => (
                      <Link
                        key={appt.id}
                        href={`/admin/appointments/${appt.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="block rounded-lg border border-primary/[0.08] bg-surface-low px-2 py-1.5 transition-colors hover:bg-surface-lowest"
                      >
                        <div className="flex items-start gap-2 min-w-0">
                          <span
                            className={`mt-1 w-2 h-2 rounded-full shrink-0 ${statusDot(appt.status)}`}
                            aria-hidden
                          />
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
                </button>
              </div>
            );
          }}
        >
          <AgendaDayList
            selectedDateKey={selectedDateKey}
            appointments={selectedDayAppts}
            detailHref={(id) => `/admin/appointments/${id}`}
          />
        </CalendarShell>
      </div>
    </section>
  );
}
