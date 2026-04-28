"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarCheck2, ClipboardList, Eye, Search, UserRound } from "lucide-react";

const FILTERS = ["ALL", "COMPLETED", "NO_SHOW", "CANCELLED"];

const STATUS_HELP = {
  CANCELLED: "Cancelled",
  COMPLETED: "Visit completed",
  NO_SHOW: "Marked no-show",
};

function metaTone(status) {
  if (status === "COMPLETED") return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
  if (status === "CANCELLED") return "bg-red-500/10 text-red-700 border-red-500/20";
  if (status === "NO_SHOW") return "bg-slate-500/10 text-slate-700 border-slate-500/20";
  return "bg-surface-low text-foreground/60 border-primary/[0.08]";
}

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
              className="divide-y divide-primary/[0.06]"
            >
              {filtered.slice(0, 30).map((appt, index) => (
                <motion.li
                  key={appt.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: Math.min(index * 0.02, 0.16) }}
                  id={appt.id}
                  className={`group flex flex-col gap-3 py-4 text-sm first:pt-0 last:pb-0 rounded-xl border border-transparent sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:px-3 transition-colors ${
                    focus === appt.id ? "bg-primary/[0.06] border-primary/20" : ""
                  }`}
                >
                  <div className="flex gap-3 min-w-0 flex-1">
                    <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      {appt.status === "COMPLETED" ? (
                        <ClipboardList size={16} />
                      ) : (
                        <UserRound size={16} />
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">
                        {appt.displayScheduledAt} · {appt.durationMinutes ?? 15} min
                      </p>
                      <p className="text-xs text-foreground/50 mt-0.5">
                        {appt.patientName}
                        {appt.patientNotes || appt.notes
                          ? ` · ${appt.patientNotes ?? appt.notes}`
                          : ""}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold ${metaTone(
                            appt.status
                          )}`}
                        >
                          {STATUS_HELP[appt.status] ?? "Scheduled"}
                        </span>
                        <span className="inline-flex items-center rounded-full border border-primary/[0.08] bg-surface-low px-2.5 py-1 text-[10px] font-semibold text-foreground/55">
                          {(appt.bucket ?? "PAST") === "UPCOMING" ? "Upcoming" : "History"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start justify-between gap-2 sm:flex-col sm:items-end sm:justify-start">
                    {appt.status !== "CANCELLED" ? (
                      <Link
                        href={`/doctor/appointments/${appt.id}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-primary/[0.12] text-primary hover:bg-primary/10 transition-colors"
                        aria-label="View appointment details"
                        title="View details"
                      >
                        <Eye size={15} />
                      </Link>
                    ) : null}
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
