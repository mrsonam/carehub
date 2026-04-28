"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

/**
 * Line chart showing appointment volume over the last N days.
 * Two series: completed (past appointments on that day) and upcoming
 * (future appointments scheduled on that day).
 */
export function AppointmentTrendsChart({ days }) {
  const width = 560;
  const height = 220;
  const padding = { top: 16, right: 16, bottom: 32, left: 16 };

  const { completedPath, upcomingPath, maxValue, xs } = useMemo(() => {
    const max = Math.max(
      1,
      ...days.map((d) => Math.max(d.completed, d.upcoming))
    );
    const innerW = width - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;
    const step = days.length > 1 ? innerW / (days.length - 1) : 0;

    const toPoint = (value, i) => {
      const x = padding.left + step * i;
      const y = padding.top + innerH - (value / max) * innerH;
      return [x, y];
    };

    const buildPath = (key) =>
      days
        .map((d, i) => {
          const [x, y] = toPoint(d[key], i);
          return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(" ");

    return {
      completedPath: buildPath("completed"),
      upcomingPath: buildPath("upcoming"),
      maxValue: max,
      xs: days.map((_, i) => padding.left + step * i),
    };
  }, [days]);

  return (
    <div className="w-full">
      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          preserveAspectRatio="none"
          role="img"
          aria-label="Appointment trends over the last 7 days"
        >
          {[0.25, 0.5, 0.75].map((t) => (
            <line
              key={t}
              x1={padding.left}
              x2={width - padding.right}
              y1={padding.top + (height - padding.top - padding.bottom) * t}
              y2={padding.top + (height - padding.top - padding.bottom) * t}
              stroke="var(--primary)"
              strokeOpacity={0.07}
              strokeDasharray="3 4"
              strokeWidth={1}
            />
          ))}

          <motion.path
            d={upcomingPath}
            fill="none"
            stroke="var(--secondary)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />

          <motion.path
            d={completedPath}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.1, ease: "easeOut", delay: 0.1 }}
          />

          {days.map((d, i) => {
            const [, y] = [
              xs[i],
              padding.top +
                (height - padding.top - padding.bottom) -
                (d.completed / maxValue) *
                  (height - padding.top - padding.bottom),
            ];
            return (
              <motion.circle
                key={d.label}
                cx={xs[i]}
                cy={y}
                r={3}
                fill="var(--surface-lowest)"
                stroke="var(--primary)"
                strokeWidth={1.5}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 + i * 0.05 }}
              />
            );
          })}
        </svg>
      </div>
      <div className="flex justify-between px-1 mt-3">
        {days.map((d) => (
          <span
            key={d.label}
            className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/40 tabular-nums"
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Horizontal bar breakdown (appointments grouped by doctor).
 */
export function DoctorBreakdown({ items }) {
  const total = Math.max(
    1,
    items.reduce((sum, i) => sum + i.count, 0)
  );

  if (items.length === 0) {
    return (
      <p className="text-sm text-foreground/50">
        No appointments recorded yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {items.map((item, idx) => {
        const pct = Math.round((item.count / total) * 100);
        return (
          <div key={item.name} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-semibold font-manrope truncate pr-4">
                {item.name}
              </span>
              <span className="text-xs tabular-nums text-foreground/55">
                {item.count} · {pct}%
              </span>
            </div>
            <div className="h-[3px] bg-primary/[0.08] overflow-hidden rounded-full">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.08 }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
