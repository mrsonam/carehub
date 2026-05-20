"use client";

import { motion } from "framer-motion";

/**
 * Simple vertical bar chart — appointment counts per week or month.
 * `highlight` draws the current period in solid primary.
 */
export function DoctorVolumeChart({ weeks, ariaLabel = "Appointment volume by period" }) {
  const max = Math.max(1, ...weeks.map((w) => w.count));

  return (
    <div
      className="flex justify-between gap-2 sm:gap-3"
      role="img"
      aria-label={ariaLabel}
    >
      {weeks.map((w, i) => {
        const pct = (w.count / max) * 100;
        return (
          <div
            key={w.label}
            className="flex-1 flex flex-col items-center gap-2 min-w-0"
          >
            <div className="h-32 w-full flex flex-col justify-end">
              <motion.div
                className={`w-full max-w-10 mx-auto rounded-t-md ${
                  w.highlight ? "bg-primary" : "bg-primary/15"
                }`}
                initial={{ height: 0 }}
                animate={{
                  height: `${w.count ? Math.max(pct, 6) : 0}%`,
                }}
                transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.06 }}
              />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground/45 truncate w-full text-center">
              {w.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
