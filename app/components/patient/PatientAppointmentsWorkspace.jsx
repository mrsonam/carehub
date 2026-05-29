"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarCheck2, CalendarClock, Eye, Search } from "lucide-react";
import { AppointmentStatusActions } from "../appointments/AppointmentStatusActions";
import {
  AppointmentListIcon,
  AppointmentListRow,
  appointmentRowStatusTone,
  appointmentViewLinkClass,
} from "../appointments/AppointmentListRow";
import { PaymentStatusBadge } from "../appointments/PaymentStatusBadge";

const FILTERS = ["ALL", "REQUESTED", "CONFIRMED", "ONGOING", "COMPLETED", "NO_SHOW", "CANCELLED"];

const STATUS_HELP = {
  REQUESTED: "Awaiting clinic confirmation",
  CONFIRMED: "Confirmed by the clinic",
  ONGOING: "Consultation in progress",
  CANCELLED: "Cancelled",
  COMPLETED: "Visit completed",
  NO_SHOW: "Marked no-show",
};

export default function PatientAppointmentsWorkspace({
  upcoming = [],
  past = [],
  focus,
  terminalStatuses = ["CANCELLED", "COMPLETED", "NO_SHOW"],
  initialQuery = "",
}) {
  const [query, setQuery] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [scope, setScope] = useState("UPCOMING");

  useEffect(() => {
    setQuery(initialQuery);
    if (initialQuery) setScope("ALL");
  }, [initialQuery]);

  const allRows = useMemo(
    () => [
      ...upcoming.map((row) => ({ ...row, bucket: "UPCOMING" })),
      ...past.map((row) => ({ ...row, bucket: "PAST" })),
    ],
    [upcoming, past]
  );

  const stats = useMemo(() => {
    const total = allRows.length;
    const active = allRows.filter((row) => !terminalStatuses.includes(row.status)).length;
    const completed = allRows.filter((row) => row.status === "COMPLETED").length;
    return { total, active, completed };
  }, [allRows, terminalStatuses]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return allRows.filter((row) => {
      if (scope !== "ALL" && row.bucket !== scope) return false;
      if (statusFilter !== "ALL" && row.status !== statusFilter) return false;
      if (!needle) return true;
      return (
        row.patientName?.toLowerCase().includes(needle) ||
        (row.doctorName ?? "").toLowerCase().includes(needle) ||
        (row.patientNotes ?? row.notes ?? "").toLowerCase().includes(needle)
      );
    });
  }, [allRows, query, scope, statusFilter]);

  return (
    <section className="panel p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/45">
          Schedule
        </p>
        <h2 className="mt-2 text-2xl font-extrabold font-manrope tracking-tight">
          Your appointments
        </h2>
        <p className="text-sm text-foreground/55 mt-1">
          Track active requests, upcoming consultations, and completed history.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, delay: 0.05, ease: [0.2, 0, 0, 1] }}
        className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        <div className="rounded-xl border border-primary/[0.08] bg-surface-low px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/45">
            Total records
          </p>
          <p className="mt-1 text-2xl font-black font-manrope">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-primary/[0.08] bg-surface-low px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/45">
            Active
          </p>
          <p className="mt-1 text-2xl font-black font-manrope">{stats.active}</p>
        </div>
        <div className="rounded-xl border border-primary/[0.08] bg-surface-low px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/45">
            Completed
          </p>
          <p className="mt-1 text-2xl font-black font-manrope">{stats.completed}</p>
        </div>
      </motion.div>

      <div className="mt-5 grid gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative w-full sm:max-w-sm">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/45"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search doctor or notes"
              className="w-full h-10 rounded-lg bg-surface-low border border-primary/[0.1] pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>

          <div className="inline-flex rounded-lg border border-primary/[0.1] p-1 bg-surface-low">
            {[
              { id: "UPCOMING", label: "Upcoming" },
              { id: "PAST", label: "Past" },
              { id: "ALL", label: "All" },
            ].map((option) => {
              const active = scope === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setScope(option.id)}
                  className={`h-8 px-3 rounded-md text-xs font-semibold transition-colors ${
                    active ? "bg-primary text-white" : "text-foreground/65 hover:bg-surface-lowest"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="inline-flex rounded-lg border border-primary/[0.1] p-1 bg-surface-low overflow-auto">
          {FILTERS.map((filter) => {
            const active = statusFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={`h-8 px-3 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                  active ? "bg-primary text-white" : "text-foreground/65 hover:bg-surface-lowest"
                }`}
              >
                {filter === "ALL" ? "All statuses" : filter.replace("_", " ")}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5">
        <AnimatePresence mode="wait" initial={false}>
          {filtered.length === 0 ? (
            <motion.p
              key="empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-sm text-foreground/50 py-4"
            >
              No appointments match the current filters.
            </motion.p>
          ) : (
            <motion.ul
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-2.5"
            >
              {filtered.map((row, index) => (
                <motion.li
                  key={row.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: Math.min(index * 0.02, 0.16) }}
                  className="list-none"
                >
                  <AppointmentListRow
                    id={row.id}
                    focused={focus === row.id}
                    icon={
                      <AppointmentListIcon>
                        {row.bucket === "PAST" ? (
                          <CalendarCheck2 size={16} aria-hidden />
                        ) : (
                          <CalendarClock size={16} aria-hidden />
                        )}
                      </AppointmentListIcon>
                    }
                    title={`${row.displayScheduledAt} · ${row.durationMinutes ?? 15} min`}
                    subtitle={row.doctorName ? `with ${row.doctorName}` : "Clinician TBD"}
                    note={
                      row.patientNotes || row.notes
                        ? `You wrote: ${row.patientNotes ?? row.notes}`
                        : null
                    }
                    badges={
                      <>
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold ${appointmentRowStatusTone(
                            row.status
                          )}`}
                        >
                          {STATUS_HELP[row.status] ?? "Scheduled"}
                        </span>
                        <span className="inline-flex items-center rounded-full border border-primary/[0.08] bg-surface-low px-2.5 py-1 text-[10px] font-semibold text-foreground/55">
                          {row.bucket === "PAST" ? "History" : "Upcoming"}
                        </span>
                        {Number(row.feeAmountCents ?? 0) > 0 ? (
                          <PaymentStatusBadge paymentStatus={row.paymentStatus} />
                        ) : null}
                      </>
                    }
                    actions={
                      <>
                        {!terminalStatuses.includes(row.status) ? (
                          <AppointmentStatusActions appointmentId={row.id} actions={["CANCELLED"]} />
                        ) : null}
                        {row.status !== "CANCELLED" ? (
                          <Link
                            href={`/patient/appointments/${row.id}`}
                            className={appointmentViewLinkClass}
                            aria-label="View appointment details"
                            title="View details"
                          >
                            <Eye size={15} aria-hidden />
                          </Link>
                        ) : null}
                      </>
                    }
                  />
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
