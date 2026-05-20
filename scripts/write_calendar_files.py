from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

CALENDAR_SHELL = r'''"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { monthTitle, parseDateKey, startOfWeek } from "@/lib/calendar/dates";
import { DayStrip } from "./DayStrip";
import { MonthGrid } from "./MonthGrid";

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
    <motion.div
      layout
      className={`rounded-xl border p-4 ${
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

      {legend ? <div>{legend}</motion.div> : null}

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
'''

# fix the template - I accidentally left motion junk in template
CALENDAR_SHELL = CALENDAR_SHELL.replace('    <motion.div\n      layout\n      className={`rounded-xl border p-4 ${\n    <motion.div', '<div')
CALENDAR_SHELL = CALENDAR_SHELL.replace('      {legend ? <div>{legend}</motion.div> : null}', '      {legend ? <motion.div>{legend}</motion.div> : null}')
# still wrong - rewrite clean

CALENDAR_SHELL = '''"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { monthTitle, parseDateKey, startOfWeek } from "@/lib/calendar/dates";
import { DayStrip } from "./DayStrip";
import { MonthGrid } from "./MonthGrid";

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
          <motion.div
      layout
      className={`rounded-xl border p-4 ${
          <motion.div className="min-w-[8rem] text-center text-sm font-bold font-manrope">
            {monthTitle(monthDate)}
          </motion.div>
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
'''

import re
CALENDAR_SHELL = re.sub(r'\s*<motion\.div[^>]*>\s*', lambda m: '', CALENDAR_SHELL)
CALENDAR_SHELL = CALENDAR_SHELL.replace('</motion.div>', '')
CALENDAR_SHELL = CALENDAR_SHELL.replace(
          <motion.div className="min-w-[8rem] text-center text-sm font-bold font-manrope">',
          '          <div className="min-w-[8rem] text-center text-sm font-bold font-manrope">'
)

# manual fix - read and write final clean version
clean_shell = Path(ROOT / "app/components/calendar/CalendarShell.jsx")
content = clean_shell.read_text(encoding='utf-8') if clean_shell.exists() else ""
import re
content = re.sub(r'\s*<motion\.div\s+layout\s+className=\{`rounded-xl border p-4 \$\{\s*', '\n', content)
content = re.sub(r'\s*<motion\.motion\.motion\.div[^<]*', '', content)
content = content.replace('</motion.div>', '')
content = re.sub(r'<motion\.motion\.div className=', '<div className=', content)

# If still broken, overwrite entirely
FINAL = '''"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { monthTitle, parseDateKey, startOfWeek } from "@/lib/calendar/dates";
import { DayStrip } from "./DayStrip";
import { MonthGrid } from "./MonthGrid";

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
        {headerExtra ? <motion.div className="min-w-0 flex-1">{headerExtra}</motion.div> : null}
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
'''
FINAL = FINAL.replace('{headerExtra ? <motion.div className=', '{headerExtra ? <div className=')
FINAL = FINAL.replace('</motion.div> : null}', '</motion.div> : null}'.replace('</motion.div>', '</div>', 1))
# fix properly
FINAL = FINAL.replace('<motion.div className="min-w-0 flex-1">', '<div className="min-w-0 flex-1">')
FINAL = FINAL.replace('</motion.div> : null}', '</div> : null}')

(ROOT / "app/components/calendar/CalendarShell.jsx").write_text(FINAL, encoding="utf-8")
print("CalendarShell written")
