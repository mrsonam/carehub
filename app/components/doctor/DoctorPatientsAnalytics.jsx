"use client";

import { motion } from "framer-motion";
import { Activity, Layers, PieChart, TrendingUp } from "lucide-react";
import { DoctorVolumeChart } from "./DoctorVolumeChart";

const STATUS_META = {
  REQUESTED: { label: "Requested", dot: "bg-amber-500", fill: "#f59e0b" },
  CONFIRMED: { label: "Confirmed", dot: "bg-primary", fill: "#00488d" },
  ONGOING: { label: "Ongoing", dot: "bg-emerald-500", fill: "#10b981" },
  COMPLETED: { label: "Completed", dot: "bg-emerald-600", fill: "#059669" },
  CANCELLED: { label: "Cancelled", dot: "bg-red-500", fill: "#ef4444" },
  NO_SHOW: { label: "No-show", dot: "bg-slate-500", fill: "#64748b" },
};

function buildDonutGradient(slices, total) {
  const nonzero = slices.filter((x) => x.count > 0);
  if (nonzero.length === 0 || total <= 0) return null;
  let offset = 0;
  const parts = [];
  for (const x of nonzero) {
    const meta = STATUS_META[x.status] ?? STATUS_META.REQUESTED;
    const sweep = (x.count / total) * 100;
    const start = offset;
    offset += sweep;
    parts.push(`${meta.fill} ${start}% ${offset}%`);
  }
  return `conic-gradient(${parts.join(", ")})`;
}

/**
 * @param {{ monthlyVolume: { label: string; count: number; highlight?: boolean }[]; statusSlices: { status: string; count: number }[]; topPatients: { patientName: string; visitCount: number }[]; }} props
 */
export function DoctorPatientsAnalytics({ monthlyVolume, statusSlices, topPatients }) {
  const totalStatus = statusSlices.reduce((s, x) => s + x.count, 0) || 1;
  const maxTop = Math.max(1, ...topPatients.map((p) => p.visitCount));
  const donutBg = buildDonutGradient(statusSlices, totalStatus);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="panel p-6 lg:col-span-2 flex flex-col"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/45">
              Trend
            </p>
            <h2 className="mt-1.5 text-lg font-bold font-manrope tracking-tight flex items-center gap-2">
              <TrendingUp size={18} className="text-primary shrink-0" aria-hidden />
              Appointments by month
            </h2>
            <p className="text-xs text-foreground/50 mt-1">
              Scheduled visits in each month (from your loaded appointment history).
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-primary/[0.1] bg-surface-low px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground/45">
            <Activity size={12} aria-hidden />
            6 mo
          </span>
        </div>
        <div className="mt-6 flex-1 min-h-[10rem]">
          {monthlyVolume.every((m) => m.count === 0) ? (
            <p className="text-sm text-foreground/50 py-8 text-center">No data in this window yet.</p>
          ) : (
            <DoctorVolumeChart
              weeks={monthlyVolume}
              ariaLabel="Appointments scheduled in each of the last six months"
            />
          )}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="panel p-6 flex flex-col"
      >
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/45">
            Mix
          </p>
          <h2 className="mt-1.5 text-lg font-bold font-manrope tracking-tight flex items-center gap-2">
            <PieChart size={18} className="text-primary shrink-0" aria-hidden />
            Status split
          </h2>
          <p className="text-xs text-foreground/50 mt-1">How appointments are distributed by state.</p>
        </div>

        <div className="mt-5 flex flex-col items-center gap-5">
          <div
            className="relative w-36 h-36 rounded-full shadow-inner border border-primary/[0.08] bg-surface-low"
            style={donutBg ? { background: donutBg } : undefined}
            role="img"
            aria-label="Appointment status distribution"
          >
            <div className="absolute inset-[22%] rounded-full bg-surface-lowest border border-primary/[0.06] flex items-center justify-center shadow-sm">
              <span className="text-center">
                <span className="block text-2xl font-black font-manrope tabular-nums text-foreground">
                  {statusSlices.reduce((s, x) => s + x.count, 0)}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground/45">
                  Total
                </span>
              </span>
            </div>
          </div>

          <ul className="w-full space-y-2">
            {statusSlices
              .filter((x) => x.count > 0)
              .map((x) => {
                const meta = STATUS_META[x.status] ?? STATUS_META.REQUESTED;
                const pct = Math.round((x.count / totalStatus) * 100);
                return (
                  <li key={x.status} className="flex items-center gap-2 text-xs">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${meta.dot}`} aria-hidden />
                    <span className="flex-1 font-medium text-foreground/75 truncate">{meta.label}</span>
                    <span className="tabular-nums text-foreground/55">
                      {x.count}{" "}
                      <span className="text-foreground/35">({pct}%)</span>
                    </span>
                  </li>
                );
              })}
            {statusSlices.every((x) => x.count === 0) ? (
              <li className="text-xs text-foreground/50 text-center">No appointments loaded.</li>
            ) : null}
          </ul>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="panel p-6 lg:col-span-3"
      >
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/45">
            Engagement
          </p>
          <h2 className="mt-1.5 text-lg font-bold font-manrope tracking-tight flex items-center gap-2">
            <Layers size={18} className="text-primary shrink-0" aria-hidden />
            Most frequent visitors
          </h2>
          <p className="text-xs text-foreground/50 mt-1">
            Top five patients by number of visits in this dataset.
          </p>
        </div>

        {topPatients.length === 0 ? (
          <p className="mt-6 text-sm text-foreground/50 text-center py-6">
            No repeat visits to highlight yet.
          </p>
        ) : (
          <ul className="mt-6 space-y-4" aria-label="Top patients by visit count">
            {topPatients.map((p, i) => {
              const barPct = (p.visitCount / maxTop) * 100;
              return (
                <li key={p.patientName} className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold font-manrope text-foreground/85 truncate min-w-0">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-primary/10 text-primary text-[11px] font-bold mr-2 tabular-nums">
                        {i + 1}
                      </span>
                      {p.patientName}
                    </span>
                    <span className="text-xs font-bold tabular-nums text-foreground/55 shrink-0">
                      {p.visitCount} visit{p.visitCount === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-low overflow-hidden border border-primary/[0.06]">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-primary/75 to-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(barPct, 3)}%` }}
                      transition={{ duration: 0.55, ease: "easeOut", delay: 0.06 * i }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </motion.section>
    </div>
  );
}
