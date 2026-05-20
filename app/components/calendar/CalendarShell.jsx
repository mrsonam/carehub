"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { monthTitle, parseDateKey, startOfWeek } from "@/lib/calendar/dates";
import { DayStrip } from "./DayStrip";
import { MonthGrid } from "./MonthGrid";

/**
 * @param {{
 *   monthDate: Date;
 *   selectedDateKey: string;
 *   onMonthDateChange: (d: Date) => void;
 *   onSelectDateKey: (key: string) => void;
 *   getDayMeta?: (key: string) => object;
 *   legend?: React.ReactNode;
 *   headerExtra?: React.ReactNode;
 *   renderDesktopDay: (day: Date, key: string) => React.ReactNode;
 *   desktopMinCellClassName?: string;
 *   children?: React.ReactNode;
 * }} props
 */
export function CalendarShell({
  monthDate,
  selectedDateKey,
  onMonthDateChange,
  onSelectDateKey,
  getDayMeta,
  legend,
  headerExtra,
  renderDesktopDay,
  desktopMinCellClassName,
  children,
}) {
  const [weekAnchor, setWeekAnchor] = useState(() => startOfWeek(parseDateKey(selectedDateKey)));

  useEffect(() => {
    setWeekAnchor(startOfWeek(parseDateKey(selectedDateKey)));
  }, [selectedDateKey]);

  const shiftMonth = (delta) => {
    const next = new Date(monthDate);
    next.setMonth(monthDate.getMonth() + delta);
    onMonthDateChange(next);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {headerExtra ? <div className="min-w-0 flex-1">{headerExtra}</div> : null}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="w-9 h-9 rounded-lg border border-primary/[0.08] text-foreground/65 hover:bg-surface-lowest inline-flex items-center justify-center"
            aria-label="Previous month"
          >
            <ChevronLeft size={17} />
          </button>
          <div className="min-w-[8rem] text-center text-sm font-bold font-manrope">
            {monthTitle(monthDate)}
          </div>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="w-9 h-9 rounded-lg border border-primary/[0.08] text-foreground/65 hover:bg-surface-lowest inline-flex items-center justify-center"
            aria-label="Next month"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>

      {legend ? <div>{legend}</div> : null}

      <DayStrip
        weekAnchor={weekAnchor}
        selectedDateKey={selectedDateKey}
        onSelectDateKey={onSelectDateKey}
        onWeekAnchorChange={setWeekAnchor}
        getDayMeta={getDayMeta}
      />

      <MonthGrid
        monthDate={monthDate}
        renderDay={renderDesktopDay}
        minCellClassName={desktopMinCellClassName}
      />

      {children ? (
        <div className="md:hidden rounded-2xl bg-surface-low p-4" aria-live="polite">
          {children}
        </div>
      ) : null}
    </div>
  );
}
