"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock,
  KeyRound,
  Mail,
  Search,
  SortAsc,
  Stethoscope,
} from "lucide-react";
import { formatApptTime, formatRelative } from "@/lib/dashboard-format";

const SORTS = [
  { id: "name", label: "Name (A–Z)" },
  { id: "visits", label: "Most visits" },
  { id: "recent", label: "Recently joined" },
];

/**
 * @param {{ doctors: { id: string; name: string; email: string; phone: string | null; title: string | null; createdAt: string; profileCompleted: boolean; mustChangePassword: boolean; visitCount: number; ruleCount: number; upcomingCount: number; lastApptId: string | null; lastVisitAt: string | null }[] }} props
 */
export function AdminDoctorDirectory({ doctors }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("name");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = !q
      ? [...doctors]
      : doctors.filter(
          (d) =>
            d.name.toLowerCase().includes(q) ||
            d.email.toLowerCase().includes(q) ||
            (d.title && d.title.toLowerCase().includes(q)) ||
            (d.phone && d.phone.toLowerCase().includes(q))
        );
    if (sort === "visits") {
      rows.sort((a, b) => b.visitCount - a.visitCount);
    } else if (sort === "recent") {
      rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      rows.sort((a, b) => a.name.localeCompare(b.name));
    }
    return rows;
  }, [doctors, query, sort]);

  return (
    <div className="flex flex-col gap-4">
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
            placeholder="Search name, email, or title…"
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-lowest border border-primary/[0.08] text-sm shadow-[0_1px_2px_rgba(16,24,40,0.04)] outline-none placeholder:text-foreground/40 focus:border-primary/20 focus:ring-2 focus:ring-primary/15"
            autoComplete="off"
          />
        </label>
        <div className="flex items-center gap-2">
          <SortAsc size={16} className="text-foreground/40 shrink-0" aria-hidden />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-10 rounded-lg border border-primary/[0.08] bg-surface-lowest px-3 text-sm font-medium text-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/15"
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
          {doctors.length === 0
            ? "No clinician accounts yet. Add doctors from Team."
            : "No clinicians match your search."}
        </p>
      ) : (
        <ul className="mt-2 divide-y divide-primary/[0.06]">
          {filtered.map((d) => (
            <li
              key={d.id}
              className="flex flex-col gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex gap-4 min-w-0 flex-1">
                <span className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Stethoscope size={20} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold font-manrope truncate">{d.name}</p>
                    {d.title ? (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground/50 border border-primary/[0.1] rounded-full px-2 py-0.5 truncate max-w-[12rem]">
                        {d.title}
                      </span>
                    ) : null}
                    {d.profileCompleted ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-800">
                        <CheckCircle2 size={11} aria-hidden />
                        Profile
                      </span>
                    ) : null}
                    {d.mustChangePassword ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-900">
                        <KeyRound size={11} aria-hidden />
                        Password
                      </span>
                    ) : null}
                    {d.upcomingCount > 0 ? (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {d.upcomingCount} upcoming
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-foreground/55 truncate">
                    <Mail size={12} className="shrink-0 opacity-70" aria-hidden />
                    {d.email}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-foreground/45">
                    <span className="inline-flex items-center gap-1">
                      <Clock size={12} className="opacity-70" aria-hidden />
                      {d.ruleCount} availability rule{d.ruleCount === 1 ? "" : "s"}
                    </span>
                    <span>
                      {d.visitCount} linked visit{d.visitCount === 1 ? "" : "s"}
                    </span>
                    <span>Joined {formatRelative(d.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:items-end shrink-0 sm:pl-4">
                {d.lastVisitAt ? (
                  <div className="flex items-center gap-2 text-xs text-foreground/55 sm:justify-end">
                    <CalendarClock size={14} className="text-primary shrink-0" aria-hidden />
                    <span>
                      Last booking{" "}
                      <span className="font-medium text-foreground/70">{formatApptTime(d.lastVisitAt)}</span>
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-foreground/45">No linked appointments yet</p>
                )}
                <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
                  {d.lastApptId ? (
                    <Link
                      href={`/admin/appointments/${d.lastApptId}`}
                      className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg bg-primary text-white text-xs font-semibold shadow-sm shadow-primary/20 hover:bg-primary-container transition-colors"
                    >
                      Last booking
                      <ArrowRight size={14} />
                    </Link>
                  ) : null}
                  <Link
                    href="/admin/users"
                    className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg border border-primary/[0.15] text-primary text-xs font-semibold hover:bg-primary/10 transition-colors"
                  >
                    Team
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
