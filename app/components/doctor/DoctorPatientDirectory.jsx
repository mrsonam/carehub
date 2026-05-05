"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  Filter,
  Search,
  SortAsc,
  UserRound,
} from "lucide-react";
import { AppointmentStatusBadge } from "../appointments/AppointmentStatusBadge";
import { formatApptTime, formatRelative, initialsFromName } from "@/lib/dashboard-format";

const SORTS = [
  { id: "recent", label: "Recent activity" },
  { id: "name", label: "Name (A–Z)" },
  { id: "visits", label: "Most visits" },
];

const FILTERS = [
  { id: "all", label: "All" },
  { id: "urgent", label: "Flagged notes" },
  { id: "upcoming", label: "Upcoming / live" },
  { id: "portal", label: "Portal accounts" },
];

export function DoctorPatientDirectory({ patients }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recent");
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = !q
      ? [...patients]
      : patients.filter((p) => p.patientName.toLowerCase().includes(q));

    const now = Date.now();
    const TERMINAL = new Set(["CANCELLED", "COMPLETED", "NO_SHOW"]);
    if (filter === "urgent") rows = rows.filter((p) => p.urgent);
    if (filter === "portal") rows = rows.filter((p) => p.patientId);
    if (filter === "upcoming") {
      rows = rows.filter((p) => {
        if (p.ongoing) return true;
        if (!p.nextAppt) return false;
        const t = new Date(p.nextAppt.scheduledAt).getTime();
        return t >= now && !TERMINAL.has(p.nextAppt.status);
      });
    }

    if (sort === "name") {
      rows.sort((a, b) => a.patientName.localeCompare(b.patientName));
    } else if (sort === "visits") {
      rows.sort((a, b) => b.visitCount - a.visitCount);
    } else {
      rows.sort((a, b) => new Date(b.lastTouch).getTime() - new Date(a.lastTouch).getTime());
    }
    return rows;
  }, [patients, query, sort, filter]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-foreground/40 mr-1">
          <Filter size={12} aria-hidden />
          View
        </span>
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={
                active
                  ? "h-8 px-3 rounded-full text-xs font-semibold bg-primary text-white shadow-sm shadow-primary/20"
                  : "h-8 px-3 rounded-full text-xs font-semibold border border-primary/[0.12] bg-surface-low text-foreground/70 hover:border-primary/25 hover:bg-surface-lowest transition-colors"
              }
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by patient name…"
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-primary/[0.1] bg-surface-lowest text-sm placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/25"
            autoComplete="off"
          />
        </label>
        <div className="flex items-center gap-2">
          <SortAsc size={16} className="text-foreground/40 shrink-0" aria-hidden />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-10 rounded-lg border border-primary/[0.1] bg-surface-lowest px-3 text-sm font-medium text-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/25"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-foreground/50 py-8 text-center">
          {patients.length === 0
            ? "No patients yet — assigned appointments will appear here."
            : "No names match your search."}
        </p>
      ) : (
        <ul className="divide-y divide-primary/[0.06] rounded-2xl border border-primary/[0.06] bg-surface-lowest overflow-hidden">
          {filtered.map((p) => (
            <li
              key={p.patientName}
              className="flex flex-col gap-4 p-4 sm:p-5 sm:flex-row sm:items-start sm:justify-between hover:bg-surface-low/50 transition-colors"
            >
              <div className="flex gap-4 min-w-0 flex-1">
                <span className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-sm font-bold font-manrope">
                  {initialsFromName(p.patientName)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold font-manrope text-base truncate">{p.patientName}</p>
                    {p.patientId ? (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground/45 border border-primary/[0.12] rounded-full px-2 py-0.5">
                        Portal account
                      </span>
                    ) : null}
                    {p.urgent ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                        <AlertTriangle size={11} aria-hidden />
                        Note
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground/50">
                    <span className="inline-flex items-center gap-1">
                      <UserRound size={12} className="opacity-70" aria-hidden />
                      {p.visitCount} visit{p.visitCount === 1 ? "" : "s"}
                    </span>
                    <span>Last activity {formatRelative(p.lastTouch)}</span>
                  </div>
                  {p.notePreview ? (
                    <p className="mt-2 text-xs text-foreground/55 line-clamp-2 leading-relaxed">
                      {p.notePreview}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:items-end sm:text-right shrink-0 sm:pl-4 border-t border-primary/[0.06] pt-4 sm:border-0 sm:pt-0">
                {p.nextAppt ? (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">
                      {p.ongoing ? "Active" : "Next on calendar"}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 justify-end">
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground/80">
                        <CalendarClock size={14} className="text-primary shrink-0" aria-hidden />
                        {formatApptTime(p.nextAppt.scheduledAt)}
                      </span>
                      <AppointmentStatusBadge status={p.nextAppt.status} />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-foreground/45">No upcoming visits</p>
                )}
                <Link
                  href={p.primaryHref}
                  className="inline-flex items-center justify-center gap-1.5 self-start sm:self-end h-9 px-4 rounded-lg bg-primary text-white text-xs font-semibold shadow-sm shadow-primary/20 hover:bg-primary-container transition-colors"
                >
                  {p.primaryLabel}
                  <ArrowRight size={14} />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
