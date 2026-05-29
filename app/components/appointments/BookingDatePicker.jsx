"use client";

import { motion } from "framer-motion";
import { CalendarPlus } from "lucide-react";
import { CalendarShell } from "@/app/components/calendar/CalendarShell";
import { dateKey } from "@/lib/calendar/dates";

export function BookingDatePicker({
  monthDate,
  setMonthDate,
  date,
  durationMinutes,
  doctorId,
  dateAvailability,
  datesLoading,
  todayKey,
  onDateChange,
}) {
  const renderDayCell = (day) => {
    const value = dateKey(day);
    const count = dateAvailability[value] ?? 0;
    const available = count > 0;
    const active = date === value;
    const isPast = value < todayKey;
    const isOtherMonth = day.getMonth() !== monthDate.getMonth();
    const disabled = !doctorId || datesLoading || isPast || !available;
    const marker = active ? "SELECTED" : isPast ? "PAST" : available ? "AVAILABLE" : "UNAVAILABLE";

    return (
      <motion.button
        key={value}
        type="button"
        data-testid={`booking-date-${value}`}
        whileTap={disabled ? undefined : { scale: 0.97 }}
        disabled={disabled}
        onClick={() => onDateChange(value)}
        className={`w-full min-h-[4.6rem] p-2 text-left transition-colors disabled:cursor-not-allowed border-t border-r border-primary/[0.06] ${
          active
            ? "bg-primary/[0.08] ring-2 ring-inset ring-primary/30"
            : "hover:bg-surface-low"
        } ${isOtherMonth ? "bg-surface-lowest/35 text-foreground/35" : "bg-surface-lowest"} ${
          disabled ? "opacity-55 hover:bg-surface-lowest" : ""
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold font-manrope ${
              active ? "text-primary" : "text-foreground/75"
            }`}
          >
            {day.getDate()}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 text-[10px] font-semibold ${
              marker === "SELECTED"
                ? "text-primary"
                : marker === "AVAILABLE"
                  ? "text-emerald-700"
                  : marker === "PAST"
                    ? "text-foreground/35"
                    : "text-foreground/45"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                marker === "SELECTED"
                  ? "bg-primary"
                  : marker === "AVAILABLE"
                    ? "bg-emerald-500"
                    : marker === "PAST"
                      ? "bg-foreground/15"
                      : "bg-foreground/25"
              }`}
              aria-hidden
            />
            {datesLoading
              ? "Checking"
              : marker === "PAST"
                ? "Past"
                : marker === "AVAILABLE"
                  ? `${count} slot${count === 1 ? "" : "s"}`
                  : marker === "SELECTED"
                    ? `${count} slot${count === 1 ? "" : "s"}`
                    : doctorId
                      ? "Unavailable"
                      : "Pick doctor"}
          </span>
        </div>
      </motion.button>
    );
  };

  return (
    <div className="mt-5 rounded-2xl bg-surface-low p-4">
      <CalendarShell
        monthDate={monthDate}
        selectedDateKey={date}
        onMonthDateChange={setMonthDate}
        onSelectDateKey={onDateChange}
        headerExtra={
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-foreground/45 inline-flex items-center gap-1.5">
              <CalendarPlus size={14} /> Choose a date
            </p>
            <p className="text-xs text-foreground/50 mt-1">
              Slot availability is calculated for a {durationMinutes}-minute visit.
            </p>
          </div>
        }
        legend={
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-foreground/55">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden />
              Available
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary" aria-hidden />
              Selected
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-foreground/25" aria-hidden />
              Unavailable
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-foreground/15" aria-hidden />
              Past
            </span>
          </div>
        }
        getDayMeta={(value) => {
          const count = dateAvailability[value] ?? 0;
          const available = count > 0;
          const isPast = value < todayKey;
          if (isPast) return { disabled: true };
          if (!doctorId) return { disabled: true };
          if (datesLoading) return { badge: "…" };
          if (available) return { badge: count, tone: "available" };
          return { disabled: true };
        }}
        desktopMinCellClassName="min-h-[4.6rem]"
        renderDesktopDay={(day) => renderDayCell(day)}
      />
    </div>
  );
}
