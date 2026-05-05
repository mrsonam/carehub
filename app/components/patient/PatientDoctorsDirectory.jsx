"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CalendarPlus,
  Filter,
  Search,
  SortAsc,
  UserRound,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatApptTime, formatRelative } from "@/lib/dashboard-format";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "mine", label: "My doctors" },
  { id: "slots", label: "Online booking" },
  { id: "upcoming", label: "Upcoming with me" },
];

const SORTS = [
  { id: "name", label: "Name (A–Z)" },
  { id: "visits", label: "Most visits" },
  { id: "recent", label: "Recently seen" },
];

/**
 * @param {{ doctors: { id: string; name: string; title: string | null; bioPreview: string | null; image: string; hasRules: boolean; visitCountWithYou: number; upcomingWithYou: number; lastVisitAt: string | null }[] }} props
 */
export function PatientDoctorsDirectory({ doctors }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("name");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = !q
      ? [...doctors]
      : doctors.filter(
          (d) =>
            d.name.toLowerCase().includes(q) ||
            (d.title && d.title.toLowerCase().includes(q)) ||
            (d.bioPreview && d.bioPreview.toLowerCase().includes(q))
        );

    if (filter === "mine") rows = rows.filter((d) => d.visitCountWithYou > 0);
    if (filter === "slots") rows = rows.filter((d) => d.hasRules);
    if (filter === "upcoming") rows = rows.filter((d) => d.upcomingWithYou > 0);

    if (sort === "visits") {
      rows.sort((a, b) => b.visitCountWithYou - a.visitCountWithYou);
    } else if (sort === "recent") {
      rows.sort((a, b) => {
        const ta = a.lastVisitAt ? new Date(a.lastVisitAt).getTime() : 0;
        const tb = b.lastVisitAt ? new Date(b.lastVisitAt).getTime() : 0;
        return tb - ta;
      });
    } else {
      rows.sort((a, b) => a.name.localeCompare(b.name));
    }
    return rows;
  }, [doctors, query, filter, sort]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-foreground/40 mr-1">
          <Filter size={12} aria-hidden />
          View
        </span>
        {FILTERS.map((f) => {
          const on = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={
                on
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
            placeholder="Search by name, title, or bio…"
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
        <p className="text-sm text-foreground/50 py-10 text-center">
          {doctors.length === 0
            ? "No clinicians are listed in the network yet."
            : "No doctors match your filters. Try “All” or clear search."}
        </p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((d, i) => (
            <motion.li
              key={d.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.24) }}
              className="panel p-0 overflow-hidden flex flex-col hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4 p-5">
                <div className="relative w-20 h-24 shrink-0 rounded-xl overflow-hidden bg-surface-high ring-1 ring-primary/[0.06]">
                  <Image
                    src={d.image}
                    alt={`${d.name}, clinician`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <div className="min-w-0 flex-1 flex flex-col">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold font-manrope text-base leading-tight truncate">{d.name}</p>
                    {d.visitCountWithYou > 0 ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
                        My doctor
                      </span>
                    ) : null}
                    {d.hasRules ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0">
                        Booking open
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground/40 border border-primary/[0.1] px-2 py-0.5 rounded-full shrink-0">
                        Call to book
                      </span>
                    )}
                  </div>
                  {d.title ? (
                    <p className="text-xs text-foreground/55 mt-1 line-clamp-2">{d.title}</p>
                  ) : (
                    <p className="text-xs text-foreground/45 mt-1">Clinician</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-foreground/45">
                    <span className="inline-flex items-center gap-1">
                      <UserRound size={12} className="opacity-70" aria-hidden />
                      {d.visitCountWithYou} visit{d.visitCountWithYou === 1 ? "" : "s"} with you
                    </span>
                    {d.upcomingWithYou > 0 ? (
                      <span className="inline-flex items-center gap-1 text-primary font-semibold">
                        <CalendarClock size={12} aria-hidden />
                        {d.upcomingWithYou} upcoming
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {d.bioPreview ? (
                <p className="px-5 pb-4 text-xs text-foreground/55 leading-relaxed line-clamp-3 -mt-1">{d.bioPreview}</p>
              ) : null}

              {d.lastVisitAt ? (
                <p className="px-5 pb-4 text-[11px] text-foreground/45 -mt-1">
                  Last touch {formatRelative(d.lastVisitAt)}
                  <span className="text-foreground/35"> · </span>
                  {formatApptTime(d.lastVisitAt)}
                </p>
              ) : null}

              <div className="mt-auto flex flex-wrap gap-2 p-5 pt-0 border-t border-primary/[0.06]">
                <Link
                  href={`/patient/appointments?doctor=${encodeURIComponent(d.id)}`}
                  className="inline-flex flex-1 min-w-[8rem] items-center justify-center gap-1.5 h-10 px-4 rounded-lg bg-primary text-white text-xs font-semibold shadow-sm shadow-primary/20 hover:bg-primary-container transition-colors"
                >
                  <CalendarPlus size={15} aria-hidden />
                  Book visit
                  <ArrowRight size={14} className="opacity-90" aria-hidden />
                </Link>
                <Link
                  href="/patient/appointments"
                  className="inline-flex items-center justify-center h-10 px-4 rounded-lg border border-primary/[0.12] text-xs font-semibold text-foreground/70 hover:bg-surface-low transition-colors"
                >
                  All bookings
                </Link>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
