"use client";

import Link from "next/link";
import { CalendarClock, Eye } from "lucide-react";
import { displayDay } from "@/lib/calendar/dates";
import { formatApptTime, formatTimeOnly } from "@/lib/dashboard-format";
import { AppointmentStatusBadge } from "../appointments/AppointmentStatusBadge";
import {
  AppointmentList,
  AppointmentListIcon,
  AppointmentListRow,
  appointmentViewLinkClass,
} from "../appointments/AppointmentListRow";

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
        <AppointmentList className="mt-3">
          {sorted.map((appt) => (
            <li key={appt.id} className="list-none">
              <AppointmentListRow
                icon={
                  <AppointmentListIcon>
                    <CalendarClock size={16} aria-hidden />
                  </AppointmentListIcon>
                }
                title={`${formatTimeOnly(appt.scheduledAt)} · ${appt.patientName}`}
                subtitle={`${appt.doctorName ?? "Clinician TBD"} · ${appt.durationMinutes ?? 15} min`}
                badges={
                  <>
                    <AppointmentStatusBadge status={appt.status} />
                    <span className="text-[10px] text-foreground/45">{formatApptTime(appt.scheduledAt)}</span>
                  </>
                }
                actions={
                  <Link
                    href={detailHref(appt.id)}
                    className={appointmentViewLinkClass}
                    aria-label="View appointment"
                  >
                    <Eye size={15} aria-hidden />
                  </Link>
                }
              />
            </li>
          ))}
        </AppointmentList>
      )}
    </div>
  );
}
