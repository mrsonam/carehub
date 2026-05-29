"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { dateKey, weekDays, addDays, startOfWeek, formatWeekdayShort } from "@/lib/calendar/dates";

const EASE = [0.23, 1, 0.32, 1];

/**
 * @param {{
 *   weekAnchor: Date;
 *   selectedDateKey: string;
 *   onSelectDateKey: (key: string) => void;
 *   onWeekAnchorChange: (date: Date) => void;
 *   getDayMeta?: (key: string) => { badge?: string | number; disabled?: boolean; tone?: string };
 * }} props
 */
export function DayStrip({
  weekAnchor,
  selectedDateKey,
  onSelectDateKey,
  onWeekAnchorChange,
  getDayMeta = () => ({}),
}) {
  const reduceMotion = useReducedMotion();
  const days = useMemo(() => weekDays(weekAnchor), [weekAnchor]);

  const shiftWeek = (delta) => {
    const next = addDays(startOfWeek(weekAnchor), delta * 7);
    onWeekAnchorChange(next);
    onSelectDateKey(dateKey(next));
  };

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.28, ease: EASE }}
      className="md:hidden"
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => shiftWeek(-1)}
          className="w-9 h-9 shrink-0 rounded-lg border border-primary/[0.08] text-foreground/65 hover:bg-surface-low inline-flex items-center justify-center"
          aria-label="Previous week"
        >
          <ChevronLeft size={17} />
        </button>
        <div
          role="tablist"
          aria-label="Week days"
          className="flex flex-1 gap-1.5 overflow-x-auto pb-0.5 scroll-smooth min-w-0"
        >
          {days.map((day) => {
            const key = dateKey(day);
            const meta = getDayMeta(key);
            const selected = key === selectedDateKey;
            const disabled = Boolean(meta.disabled);
            const weekday = formatWeekdayShort(day);
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={selected}
                disabled={disabled}
                onClick={() => onSelectDateKey(key)}
                className={`flex flex-col items-center justify-center min-w-[2.75rem] h-14 px-1 rounded-xl border text-center transition-colors shrink-0 disabled:opacity-45 disabled:cursor-not-allowed ${
                  selected
                    ? "bg-primary/10 border-primary/30 ring-2 ring-primary/20"
                    : "border-primary/[0.1] bg-surface-lowest hover:bg-surface-low"
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wide text-foreground/45">
                  {weekday}
                </span>
                <span
                  className={`text-sm font-black font-manrope leading-none mt-0.5 ${
                    selected ? "text-primary" : "text-foreground/80"
                  }`}
                >
                  {day.getDate()}
                </span>
                {meta.badge !== undefined && meta.badge !== "" && meta.badge !== 0 ? (
                  <span className="mt-1 text-[9px] font-bold tabular-nums text-foreground/50">
                    {meta.badge}
                  </span>
                ) : meta.tone ? (
                  <span
                    className={`mt-1.5 w-1.5 h-1.5 rounded-full ${
                      meta.tone === "available"
                        ? "bg-emerald-500"
                        : meta.tone === "busy"
                          ? "bg-primary"
                          : meta.tone === "off"
                            ? "bg-red-500"
                            : "bg-foreground/25"
                    }`}
                    aria-hidden
                  />
                ) : null}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => shiftWeek(1)}
          className="w-9 h-9 shrink-0 rounded-lg border border-primary/[0.08] text-foreground/65 hover:bg-surface-low inline-flex items-center justify-center"
          aria-label="Next week"
        >
          <ChevronRight size={17} />
        </button>
      </div>
    </motion.div>
  );
}
