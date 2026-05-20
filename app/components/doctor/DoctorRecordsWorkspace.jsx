"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, Eye, Search, UserRound } from "lucide-react";
import {
  AppointmentListIcon,
  AppointmentListRow,
  appointmentRowStatusTone,
  appointmentViewLinkClass,
} from "../appointments/AppointmentListRow";

const FILTERS = ["ALL", "COMPLETED", "NO_SHOW", "CANCELLED"];

const STATUS_HELP = {
  CANCELLED: "Cancelled",
  COMPLETED: "Visit completed",
  NO_SHOW: "Marked no-show",
};

export default function DoctorRecordsWorkspace({ records = [], focus }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [scope, setScope] = useState("PAST");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return records.filter((row) => {
      if (scope !== "ALL" && (row.bucket ?? "PAST") !== scope) return false;
      if (statusFilter !== "ALL" && row.status !== statusFilter) return false;
      if (!needle) return true;
      return (
        (row.patientName ?? "").toLowerCase().includes(needle) ||
        (row.patientNotes ?? row.notes ?? "").toLowerCase().includes(needle)
      );
    });
  }, [records, query, scope, statusFilter]);

  return (
    <div className="mt-4">
      <div className="grid gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative w-full sm:max-w-sm">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/45"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search patient or notes"
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
              No records match the current filters.
            </motion.p>
          ) : (
            <motion.ul
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-2.5"
            >
              {filtered.slice(0, 30).map((appt, index) => (
                <motion.li
                  key={appt.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: Math.min(index * 0.02, 0.16) }}
                  className="list-none"
                >
                  <AppointmentListRow
                    id={appt.id}
                    focused={focus === appt.id}
                    icon={
                      <AppointmentListIcon>
                        {appt.status === "COMPLETED" ? (
                          <ClipboardList size={16} aria-hidden />
                        ) : (
                          <UserRound size={16} aria-hidden />
                        )}
                      </AppointmentListIcon>
                    }
                    title={`${appt.displayScheduledAt} · ${appt.durationMinutes ?? 15} min`}
                    subtitle={appt.patientName}
                    note={
                      appt.patientNotes || appt.notes ? appt.patientNotes ?? appt.notes : null
                    }
                    badges={
                      <>
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold ${appointmentRowStatusTone(
                            appt.status
                          )}`}
                        >
                          {STATUS_HELP[appt.status] ?? "Scheduled"}
                        </span>
                        <span className="inline-flex items-center rounded-full border border-primary/[0.08] bg-surface-low px-2.5 py-1 text-[10px] font-semibold text-foreground/55">
                          {(appt.bucket ?? "PAST") === "UPCOMING" ? "Upcoming" : "History"}
                        </span>
                      </>
                    }
                    actions={
                      appt.status !== "CANCELLED" ? (
                        <Link
                          href={`/doctor/appointments/${appt.id}`}
                          className={appointmentViewLinkClass}
                          aria-label="View appointment details"
                          title="View details"
                        >
                          <Eye size={15} aria-hidden />
                        </Link>
                      ) : null
                    }
                  />
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
