"use client";

import { useMemo } from "react";
import { monthGrid, dateKey, WEEKDAY_HEADERS } from "@/lib/calendar/dates";

/**
 * @param {{
 *   monthDate: Date;
 *   renderDay: (day: Date, key: string) => React.ReactNode;
 *   minCellClassName?: string;
 * }} props
 */
export function MonthGrid({ monthDate, renderDay, minCellClassName = "" }) {
  const days = useMemo(() => monthGrid(monthDate), [monthDate]);

  return (
    <div className="hidden md:grid grid-cols-7 rounded-2xl overflow-hidden border border-primary/[0.06] bg-surface-lowest">
      {WEEKDAY_HEADERS.map((day) => (
        <div
          key={day}
          className="px-2 py-2 text-center text-[10px] font-bold uppercase tracking-widest text-foreground/45 bg-surface-low"
        >
          {day}
        </div>
      ))}
      {days.map((day) => {
        const key = dateKey(day);
        return (
          <div key={key} className={minCellClassName || undefined}>
            {renderDay(day, key)}
          </div>
        );
      })}
    </div>
  );
}
