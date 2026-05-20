"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  TrendingDown,
  TrendingUp,
  Minus,
} from "lucide-react";
import { AppointmentStatusBadge } from "../../appointments/AppointmentStatusBadge";

const EASE_OUT = [0.23, 1, 0.32, 1];

function DeltaBadge({ delta, invert = false }) {
  if (delta === null || delta === undefined) return null;
  const positive = invert ? delta < 0 : delta > 0;
  const negative = invert ? delta > 0 : delta < 0;
  const Icon = delta === 0 ? Minus : positive ? TrendingUp : TrendingUp;
  const tone = delta === 0
    ? "text-foreground/45 bg-surface-low"
    : positive
      ? "text-emerald-700 bg-emerald-500/10"
      : negative
        ? "text-red-700 bg-red-500/10"
        : "text-foreground/45 bg-surface-low";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${tone}`}
    >
      {delta === 0 ? (
        <Minus size={12} aria-hidden />
      ) : (
        <Icon
          size={12}
          className={negative && !invert ? "rotate-180" : ""}
          aria-hidden
        />
      )}
      {delta > 0 ? "+" : ""}
      {delta}%
    </span>
  );
}

export function AnalyticsKpiGrid({ kpis }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-3 sm:gap-4">
      {kpis.map((kpi, i) => (
        <motion.article
          key={kpi.id}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduceMotion ? 0 : 0.35,
            ease: EASE_OUT,
            delay: reduceMotion ? 0 : i * 0.05,
          }}
          className="panel p-4 sm:p-5 flex flex-col gap-3 min-h-[7.5rem]"
        >
          <motion.p
            className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.18em] text-foreground/45"
            initial={false}
          >
            {kpi.label}
          </motion.p>
          <p className="text-2xl sm:text-3xl font-black font-manrope tracking-tight tabular-nums leading-none">
            {typeof kpi.value === "number" ? kpi.value.toLocaleString() : kpi.value}
          </p>
          <motion.div
            className="mt-auto flex flex-wrap items-center justify-between gap-2"
            initial={false}
          >
            <p className="text-[11px] text-foreground/50 leading-snug">{kpi.hint}</p>
            <DeltaBadge delta={kpi.delta} invert={kpi.invertDelta} />
          </motion.div>
        </motion.article>
      ))}
    </div>
  );
}

export function VolumeAreaChart({ days, ariaLabel = "Daily appointment volume" }) {
  const reduceMotion = useReducedMotion();
  const width = 720;
  const height = 240;
  const pad = { top: 20, right: 12, bottom: 36, left: 12 };

  const { scheduledPath, completedPath, completedArea, max, labels } = useMemo(() => {
    const maxVal = Math.max(
      1,
      ...days.map((d) => Math.max(d.scheduled, d.completed, d.cancelled))
    );
    const innerW = width - pad.left - pad.right;
    const innerH = height - pad.top - pad.bottom;
    const step = days.length > 1 ? innerW / (days.length - 1) : 0;

    const point = (val, i) => {
      const x = pad.left + step * i;
      const y = pad.top + innerH - (val / maxVal) * innerH;
      return [x, y];
    };

    const scheduled = days
      .map((d, i) => {
        const [x, y] = point(d.scheduled, i);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");

    const completedLine = days
      .map((d, i) => {
        const [x, y] = point(d.completed, i);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");

    const baseY = pad.top + innerH;
    const firstX = pad.left;
    const lastX = pad.left + step * (days.length - 1);
    const completedAreaPath = `${completedLine} L${lastX.toFixed(1)},${baseY} L${firstX.toFixed(1)},${baseY} Z`;

    return {
      scheduledPath: scheduled,
      completedPath: completedLine,
      completedArea: completedAreaPath,
      max: maxVal,
      labels: days.map((d) => d.label),
    };
  }, [days]);

  const showEvery = days.length > 14 ? 5 : days.length > 7 ? 3 : 1;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={ariaLabel}
      >
        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={t}
            x1={pad.left}
            x2={width - pad.right}
            y1={pad.top + (height - pad.top - pad.bottom) * t}
            y2={pad.top + (height - pad.top - pad.bottom) * t}
            stroke="var(--primary)"
            strokeOpacity={0.06}
            strokeDasharray="4 6"
          />
        ))}
        <motion.path
          d={completedArea}
          fill="var(--primary)"
          fillOpacity={0.08}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
        />
        <motion.path
          d={scheduledPath}
          fill="none"
          stroke="var(--secondary)"
          strokeWidth={2}
          strokeLinecap="round"
          initial={reduceMotion ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, ease: EASE_OUT }}
        />
        <motion.path
          d={completedPath}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={2.5}
          strokeLinecap="round"
          initial={reduceMotion ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.85, ease: EASE_OUT, delay: 0.08 }}
        />
      </svg>
      <motion.div
        className="flex justify-between gap-1 mt-2 px-1 overflow-hidden"
        initial={false}
      >
        {labels.map((label, i) =>
          i % showEvery === 0 || i === labels.length - 1 ? (
            <span
              key={`${label}-${i}`}
              className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide text-foreground/40 tabular-nums truncate"
            >
              {label}
            </span>
          ) : (
            <span key={`sp-${i}`} className="flex-1 min-w-0" aria-hidden />
          )
        )}
      </motion.div>
      <p className="sr-only">Peak daily scheduled: {max}</p>
    </motion.div>
  );
}

export function RevenueBarsChart({ months, ariaLabel = "Monthly revenue collected" }) {
  const reduceMotion = useReducedMotion();
  const max = Math.max(1, ...months.map((m) => m.cents));
  const total = months.reduce((s, m) => s + m.cents, 0);

  return (
    <motion.div
      className="relative rounded-2xl border border-primary/[0.1] bg-gradient-to-br from-primary/[0.04] via-surface-lowest to-surface-low"
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
      role="img"
      aria-label={ariaLabel}
    >
      <motion.div
        className="flex justify-between items-stretch gap-2 sm:gap-3 min-h-[11rem] px-3 pt-5 pb-2 sm:px-5"
        initial={false}
      >
        {months.map((m, i) => {
          const pct = (m.cents / max) * 100;
          const barH = m.cents ? Math.max(pct, 10) : 0;
          const aud =
            m.cents > 0
              ? (m.cents / 100).toLocaleString("en-AU", {
                  style: "currency",
                  currency: "AUD",
                  maximumFractionDigits: 0,
                })
              : "—";
          return (
            <div key={m.label} className="flex-1 flex flex-col items-center min-w-0">
              <span
                className={`text-[10px] sm:text-xs font-bold tabular-nums mb-2 truncate max-w-full ${
                  m.highlight ? "text-primary" : "text-foreground/50"
                }`}
              >
                {aud}
              </span>
              <div className="relative flex-1 w-full flex justify-center min-h-[7.5rem]">
                <motion.div
                  className={`w-[72%] max-w-12 rounded-t-lg origin-bottom ${
                    m.highlight
                      ? "bg-gradient-to-t from-primary-container to-primary shadow-[0_-6px_20px_-6px_rgba(0,72,141,0.4)]"
                      : "bg-primary/20"
                  }`}
                  initial={reduceMotion ? false : { height: 0 }}
                  animate={{ height: `${barH}%` }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.55,
                    ease: EASE_OUT,
                    delay: i * 0.05,
                  }}
                />
              </div>
              <span
                className={`mt-2 text-[10px] font-bold uppercase tracking-wider truncate w-full text-center ${
                  m.highlight ? "text-primary" : "text-foreground/40"
                }`}
              >
                {m.label}
              </span>
            </div>
          );
        })}
      </motion.div>
      <div className="px-4 py-3 border-t border-primary/[0.06] text-center text-xs text-foreground/55">
        <span className="font-bold tabular-nums text-foreground">
          {(total / 100).toLocaleString("en-AU", {
            style: "currency",
            currency: "AUD",
            maximumFractionDigits: 0,
          })}
        </span>
        <span className="mx-1">·</span>
        Collected in the last 6 months
      </div>
    </motion.div>
  );
}

export function StatusDonutChart({ items, total }) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(null);
  const size = 200;
  const stroke = 28;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  const colors = {
    REQUESTED: "#f59e0b",
    CONFIRMED: "var(--primary)",
    ONGOING: "var(--secondary)",
    COMPLETED: "#059669",
    CANCELLED: "#dc2626",
    NO_SHOW: "#64748b",
  };

  let offset = 0;
  const segments = items.map((item) => {
    const pct = total > 0 ? item.count / total : 0;
    const dash = pct * c;
    const seg = {
      ...item,
      pct: Math.round(pct * 100),
      dash,
      offset,
      color: colors[item.status] ?? "var(--primary)",
    };
    offset += dash;
    return seg;
  });

  const focus = active
    ? segments.find((s) => s.status === active)
    : segments.reduce((best, s) => (s.count > (best?.count ?? 0) ? s : best), null);

  return (
    <div className="flex flex-col lg:flex-row items-center gap-8">
      <div className="relative shrink-0">
        <svg width={size} height={size} className="-rotate-90" role="img" aria-label="Appointment status distribution">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--primary)"
            strokeOpacity={0.08}
            strokeWidth={stroke}
          />
          {segments.map((seg, i) => (
            <motion.circle
              key={seg.status}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeDasharray={`${seg.dash} ${c - seg.dash}`}
              strokeDashoffset={-seg.offset}
              strokeLinecap="butt"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: active && active !== seg.status ? 0.35 : 1 }}
              transition={{ duration: 0.25, delay: reduceMotion ? 0 : i * 0.06 }}
              className="cursor-pointer"
              onMouseEnter={() => setActive(seg.status)}
              onMouseLeave={() => setActive(null)}
            />
          ))}
        </svg>
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none"
          initial={false}
        >
          <p className="text-3xl font-black font-manrope tabular-nums">
            {focus?.count ?? 0}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/45 mt-1">
            {focus ? focus.status.replace("_", " ") : "Total"}
          </p>
          {focus ? (
            <p className="text-xs text-foreground/50 mt-0.5">{focus.pct}% of all</p>
          ) : null}
        </motion.div>
      </div>
      <ul className="flex-1 w-full flex flex-col gap-2">
        {segments.map((seg) => (
          <li key={seg.status}>
            <button
              type="button"
              onMouseEnter={() => setActive(seg.status)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(seg.status)}
              onBlur={() => setActive(null)}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors duration-200 cursor-pointer ${
                active === seg.status ? "bg-primary/[0.06]" : "hover:bg-surface-low"
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: seg.color }}
                aria-hidden
              />
              <AppointmentStatusBadge status={seg.status} />
              <span className="ml-auto text-sm font-bold tabular-nums text-foreground/70">
                {seg.count}
              </span>
              <span className="w-10 text-right text-xs tabular-nums text-foreground/45">
                {seg.pct}%
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HourlyDemandChart({ buckets, peakHour }) {
  const reduceMotion = useReducedMotion();
  const max = Math.max(1, ...buckets.map((b) => b.count));
  const clinicHours = buckets.filter((b) => b.hour >= 7 && b.hour <= 19);

  return (
    <div role="img" aria-label="Appointments by hour of day">
      <div className="flex items-end justify-between gap-1 h-36">
        {clinicHours.map((b, i) => {
          const pct = (b.count / max) * 100;
          const isPeak = peakHour && b.hour === peakHour.hour;
          return (
            <motion.div
              key={b.hour}
              className="flex-1 flex flex-col items-center gap-1.5 min-w-0 group"
              initial={reduceMotion ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02, duration: 0.3, ease: EASE_OUT }}
            >
              <div className="h-28 w-full flex flex-col justify-end items-center">
                {b.count > 0 ? (
                  <span className="text-[9px] font-bold tabular-nums text-foreground/50 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {b.count}
                  </span>
                ) : null}
                <motion.div
                  className={`w-full max-w-3 rounded-sm origin-bottom ${
                    isPeak
                      ? "bg-primary shadow-sm shadow-primary/25"
                      : "bg-primary/15 group-hover:bg-primary/25"
                  }`}
                  initial={reduceMotion ? false : { height: 0 }}
                  animate={{ height: `${b.count ? Math.max(pct, 8) : 0}%` }}
                  transition={{ duration: 0.45, ease: EASE_OUT, delay: i * 0.02 }}
                />
              </div>
              <span
                className={`text-[9px] font-semibold tabular-nums ${
                  isPeak ? "text-primary font-bold" : "text-foreground/40"
                }`}
              >
                {b.hour % 12 === 0 ? 12 : b.hour % 12}
                {b.hour < 12 ? "a" : "p"}
              </span>
            </motion.div>
          );
        })}
      </div>
      {peakHour ? (
        <p className="mt-4 text-xs text-foreground/55 text-center">
          Busiest slot:{" "}
          <span className="font-semibold text-foreground">{peakHour.label}</span> with{" "}
          <span className="font-semibold tabular-nums text-primary">{peakHour.count}</span>{" "}
          appointments
        </p>
      ) : (
        <p className="mt-4 text-xs text-foreground/50 text-center">No bookings in this period yet.</p>
      )}
    </div>
  );
}

export function DurationMixChart({ items }) {
  const reduceMotion = useReducedMotion();
  const total = Math.max(1, items.reduce((s, d) => s + d.count, 0));

  return (
    <motion.div className="flex flex-col gap-4" initial={false}>
      {items.map((item, i) => {
        const pct = Math.round((item.count / total) * 100);
        return (
          <motion.div
            key={item.minutes}
            initial={reduceMotion ? false : { opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3, ease: EASE_OUT }}
          >
            <motion.div
              className="flex justify-between text-sm mb-1.5"
              initial={false}
            >
              <span className="font-semibold font-manrope">{item.minutes} minutes</span>
              <span className="text-xs tabular-nums text-foreground/55">
                {item.count} · {pct}%
              </span>
            </motion.div>
            <div className="h-2 rounded-full bg-primary/[0.08] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary"
                initial={reduceMotion ? false : { width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: EASE_OUT, delay: i * 0.06 }}
              />
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export function PaymentInsightsPanel({ summary, paymentMethodItems, paymentStatusItems }) {
  const paidTotal = paymentMethodItems.reduce((s, p) => s + p.count, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="rounded-xl border border-primary/[0.08] bg-surface-low p-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/45">
          Collection
        </p>
        <p className="mt-2 text-2xl font-black font-manrope tabular-nums">
          {summary.collectionRate}%
        </p>
        <p className="text-xs text-foreground/55 mt-1">
          of fee-bearing visits collected · {summary.unpaidFees} still unpaid
        </p>
      </div>
      <div className="rounded-xl border border-primary/[0.08] bg-surface-low p-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/45">
          Period revenue
        </p>
        <p className="mt-2 text-2xl font-black font-manrope tabular-nums text-primary">
          {summary.revenueFormatted}
        </p>
        <p className="text-xs text-foreground/55 mt-1">Paid appointments in the last 30 days</p>
      </div>
      <div className="sm:col-span-2 flex flex-col gap-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/45">
          Paid via
        </p>
        {paymentMethodItems.map((item) => {
          const pct = paidTotal > 0 ? Math.round((item.count / paidTotal) * 100) : 0;
          return (
            <div key={item.method} className="flex flex-col gap-1.5">
              <motion.div
                className="flex justify-between text-sm"
                initial={false}
              >
                <span className="font-medium">{item.label}</span>
                <span className="text-xs tabular-nums text-foreground/55">
                  {item.count} · {pct}%
                </span>
              </motion.div>
              <div className="h-1.5 rounded-full bg-primary/[0.08] overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    item.method === "STRIPE" ? "bg-secondary" : "bg-primary"
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5, ease: EASE_OUT }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="sm:col-span-2 flex flex-wrap gap-2">
        {paymentStatusItems.map((p) => (
          <span
            key={p.status}
            className="inline-flex items-center gap-2 rounded-full border border-primary/[0.1] bg-surface-lowest px-3 py-1.5 text-xs font-semibold"
          >
            <span className="text-foreground/50">{p.status}</span>
            <span className="tabular-nums text-foreground">{p.count}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function DoctorLeaderboard({ items, totalAppointments }) {
  const reduceMotion = useReducedMotion();
  const max = Math.max(1, ...items.map((d) => d.count));

  if (items.length === 0) {
    return (
      <p className="text-sm text-foreground/50 py-6 text-center">
        Doctor workload appears once appointments are scheduled.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-primary/[0.06]">
      {items.map((doc, i) => {
        const share = Math.round((doc.count / Math.max(1, totalAppointments)) * 100);
        const barPct = Math.round((doc.count / max) * 100);
        return (
          <motion.li
            key={doc.name}
            className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3, ease: EASE_OUT }}
          >
            <span className="w-6 text-xs font-bold tabular-nums text-foreground/35">
              {String(i + 1).padStart(2, "0")}
            </span>
            <motion.div
              className="flex-1 min-w-0"
              initial={false}
            >
              <div className="flex justify-between gap-2 mb-2">
                <p className="font-semibold font-manrope truncate">{doc.name}</p>
                <p className="text-xs tabular-nums text-foreground/55 shrink-0">
                  {doc.count} · {share}%
                </p>
              </div>
              <div className="h-1.5 rounded-full bg-primary/[0.08] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={reduceMotion ? false : { width: 0 }}
                  animate={{ width: `${barPct}%` }}
                  transition={{ duration: 0.55, ease: EASE_OUT, delay: i * 0.05 }}
                />
              </div>
            </motion.div>
          </motion.li>
        );
      })}
    </ul>
  );
}
