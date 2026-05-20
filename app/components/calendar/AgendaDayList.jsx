"use client";

import Link from "next/link";
import { CalendarClock, Eye } from "lucide-react";
import { displayDay } from "@/lib/calendar/dates";
import { formatApptTime, formatTimeOnly } from "@/lib/dashboard-format";
import { AppointmentStatusBadge } from "../appointments/AppointmentStatusBadge";

/**
 * @param {{
 *   selectedDateKey: string;
 *   appointments: Array<{ id: string; scheduledAt: string; patientName: string; doctorName?: string | null; status: string; durationMinutes?: number }>;
 *   detailHref: (id: string) => string;
 *   emptyMessage?: string;
 * }} props
 */
export function AgendaDayList({
  selectedDateKey,
  appointments,
  detailHref,
  emptyMessage = "No appointments this day.",
}) {
  const sorted = [...appointments].sort(
    (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  );

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/45">
        {displayDay(selectedDateKey)}
      </p>
      {sorted.length === 0 ? (
        <p className="mt-3 text-sm text-foreground/50">{emptyMessage}</p>
      ) : (
        <ul className="mt-3 divide-y divide-primary/[0.06]">
          {sorted.map((appt) => (
            <li key={appt.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <CalendarClock size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm">
                  {formatTimeOnly(appt.scheduledAt)} · {appt.patientName}
                </p>
                <p className="text-xs text-foreground/50 mt-0.5">
                  {appt.doctorName ?? "Clinician TBD"} · {appt.durationMinutes ?? 15} min
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <AppointmentStatusBadge status={appt.status} />
                  <span className="text-[10px] text-foreground/45">{formatApptTime(appt.scheduledAt)}</span>
                </div>
              </div>
              <Link
                href={detailHref(appt.id)}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-primary/[0.12] text-primary hover:bg-primary/10 transition-colors shrink-0"
                aria-label="View appointment"
              >
                <Eye size={15} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
