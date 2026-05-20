"use client";

import { motion } from "framer-motion";
import { Stethoscope } from "lucide-react";

/**
 * Rich month bar chart for admin “doctor accounts joined” analytics.
 * @param {{ months: { label: string; count: number; highlight?: boolean }[]; ariaLabel?: string }} props
 */
export function AdminDoctorJoinsChart({ months, ariaLabel = "Doctor accounts created per month" }) {
  const max = Math.max(1, ...months.map((m) => m.count));
  const total = months.reduce((s, m) => s + m.count, 0);

  return (
    <div className="relative" role="img" aria-label={ariaLabel}>
      <div className="pointer-events-none absolute right-3 top-3 text-primary/[0.07]" aria-hidden>
        <Stethoscope size={120} strokeWidth={1} />
      </div>

      <div className="relative rounded-2xl border border-primary/[0.1] bg-gradient-to-br from-primary/[0.04] via-surface-lowest to-surface-low shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" aria-hidden />

        <div className="relative px-3 pt-5 pb-2 sm:px-5 sm:pt-6">
          <div className="flex justify-between items-stretch gap-1.5 sm:gap-3 min-h-[12.5rem]">
            {months.map((m, i) => {
              const pct = (m.count / max) * 100;
              const barH = m.count ? Math.max(pct, 12) : 0;
              return (
                <div key={`${m.label}-${i}`} className="flex-1 flex flex-col items-center min-w-0 group">
                  <div className="h-6 w-full flex items-end justify-center mb-1">
                    {m.count > 0 ? (
                      <motion.span
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + i * 0.05, duration: 0.35 }}
                        className={`text-sm font-black font-manrope tabular-nums ${
                          m.highlight ? "text-primary" : "text-foreground/55"
                        }`}
                      >
                        {m.count}
                      </motion.span>
                    ) : (
                      <span className="text-[10px] font-semibold text-foreground/25 tabular-nums">—</span>
                    )}
                  </div>

                  <div className="relative flex-1 w-full flex justify-center min-h-[9rem]">
                    <div
                      className="absolute inset-x-0 bottom-0 top-6 flex flex-col justify-between pointer-events-none"
                      aria-hidden
                    >
                      {[0, 1, 2].map((line) => (
                        <div
                          key={line}
                          className="border-t border-dashed border-primary/[0.06] w-full"
                        />
                      ))}
                    </div>

                    <div className="relative w-[78%] max-w-[3.25rem] h-full flex flex-col justify-end pb-0.5">
                      <motion.div
                        className={`w-full rounded-t-xl origin-bottom ${
                          m.highlight
                            ? "bg-gradient-to-t from-primary-container via-primary to-primary shadow-[0_-4px_24px_-4px_rgba(0,72,141,0.45)] ring-1 ring-white/40"
                            : "bg-gradient-to-t from-primary/35 to-primary/12 ring-1 ring-primary/[0.08]"
                        }`}
                        initial={{ height: 0, opacity: 0.6 }}
                        animate={{
                          height: `${barH}%`,
                          opacity: 1,
                        }}
                        transition={{
                          height: { duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: i * 0.06 },
                          opacity: { duration: 0.3 },
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-1 flex justify-between gap-1.5 sm:gap-3 border-t border-primary/[0.08] pt-3">
            {months.map((m, i) => (
              <div key={`lbl-${m.label}-${i}`} className="flex-1 text-center min-w-0">
                <span
                  className={`block text-[10px] font-bold uppercase tracking-[0.12em] truncate ${
                    m.highlight ? "text-primary" : "text-foreground/40"
                  }`}
                >
                  {m.label}
                </span>
                {m.highlight ? (
                  <span className="mt-0.5 block text-[9px] font-semibold text-primary/70 uppercase tracking-wider">
                    Current
                  </span>
                ) : (
                  <span className="mt-0.5 block h-3.5" aria-hidden />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="px-4 py-3 sm:px-5 border-t border-primary/[0.06] bg-surface-low/60">
          <p className="text-center text-xs text-foreground/55">
            <span className="font-bold tabular-nums text-foreground">{total}</span>
            <span className="mx-1">·</span>
            New clinician account{total === 1 ? "" : "s"} in the last six months
          </p>
        </div>
      </div>
    </div>
  );
}
