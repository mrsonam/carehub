"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { useToast } from "@/app/components/toast/ToastProvider";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const FULL_WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function pad(n) {
  return String(n).padStart(2, "0");
}

function minutesToTime(minutes = 540) {
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

function timeToMinutes(value) {
  const [h, m] = String(value).split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return 0;
  return h * 60 + m;
}

function allTimeOptions(step = 15) {
  return Array.from({ length: (24 * 60) / step + 1 }, (_, index) => {
    const minutes = index * step;
    return {
      value: minutesToTime(minutes),
      minutes,
    };
  }).filter((option) => option.minutes <= 24 * 60);
}

function dateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function monthTitle(date) {
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function displayDate(date) {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function groupBy(items, key) {
  return items.reduce((acc, item) => {
    const k = key(item);
    acc[k] ??= [];
    acc[k].push(item);
    return acc;
  }, {});
}

function blockLabel(block) {
  return `${minutesToTime(block.startMinutes)}-${minutesToTime(block.endMinutes)}`;
}

function monthGrid(monthDate) {
  const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  start.setHours(0, 0, 0, 0);

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function isoToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return dateKey(d);
}

function sortBlocks(blocks) {
  return [...blocks].sort((a, b) => (a.startMinutes ?? 0) - (b.startMinutes ?? 0));
}

function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

function hasOverlap(block, existingBlocks, excludeId = "") {
  return existingBlocks.some((row) => {
    if (excludeId && row.id === excludeId) return false;
    return rangesOverlap(
      block.startMinutes,
      block.endMinutes,
      row.startMinutes ?? 0,
      row.endMinutes ?? 0
    );
  });
}

function canUseEndMinute(startMinute, endMinute, existingBlocks, excludeId = "") {
  if (endMinute <= startMinute) return false;
  return !hasOverlap({ startMinutes: startMinute, endMinutes: endMinute }, existingBlocks, excludeId);
}

function Modal({ title, subtitle, children, onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <button
          type="button"
          className="absolute inset-0 bg-foreground/35 backdrop-blur-sm"
          onClick={onClose}
          aria-label="Close modal"
        />
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
          className="relative w-full max-w-lg rounded-3xl bg-surface-lowest shadow-2xl shadow-primary/10 border border-primary/[0.08] overflow-hidden"
        >
          <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-primary/[0.06]">
            <div>
              <h2 className="text-lg font-bold font-manrope tracking-tight">{title}</h2>
              {subtitle ? (
                <p className="text-sm text-foreground/50 mt-1">{subtitle}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-lg text-foreground/55 hover:bg-surface-low inline-flex items-center justify-center"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function BlockFormModal({ modal, onClose, onDone }) {
  const toast = useToast();
  const isEdit = modal.mode === "edit";
  const [start, setStart] = useState(minutesToTime(modal.block?.startMinutes ?? 540));
  const [end, setEnd] = useState(minutesToTime(modal.block?.endMinutes ?? 1020));
  const [pending, setPending] = useState("");
  const [errors, setErrors] = useState({});
  const existingBlocks = Array.isArray(modal.existingBlocks) ? modal.existingBlocks : [];
  const excludeId = modal.block?.id ?? "";
  const timeOptions = useMemo(() => allTimeOptions(15), []);
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  const startOptions = useMemo(
    () =>
      timeOptions.filter((option) => option.minutes < 24 * 60).map((option) => {
        const hasValidEnd = timeOptions.some((endOption) =>
          canUseEndMinute(option.minutes, endOption.minutes, existingBlocks, excludeId)
        );
        return { ...option, disabled: !hasValidEnd };
      }),
    [timeOptions, existingBlocks, excludeId]
  );
  const endOptions = useMemo(
    () =>
      timeOptions
        .filter((option) => option.minutes > 0)
        .map((option) => ({
          ...option,
          disabled: !canUseEndMinute(startMinutes, option.minutes, existingBlocks, excludeId),
        })),
    [timeOptions, startMinutes, existingBlocks, excludeId]
  );

  const save = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!start) nextErrors.start = "Start time is required.";
    if (!end) nextErrors.end = "End time is required.";
    if (!nextErrors.start && !nextErrors.end && endMinutes <= startMinutes) {
      nextErrors.end = "End time must be after start time.";
    }

    if (!nextErrors.start && !nextErrors.end) {
      const proposed = { startMinutes, endMinutes };
      if (hasOverlap(proposed, existingBlocks, excludeId)) {
        nextErrors.end = "This time overlaps with an existing availability block.";
      }
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("This availability block overlaps an existing one.");
      return;
    }

    setPending("save");
    try {
      const method = isEdit ? "PATCH" : "POST";
      const body = {
        id: modal.block?.id,
        type: modal.type,
        weekday: modal.weekday,
        date: modal.date,
        startMinutes,
        endMinutes,
      };
      const r = await fetch("/api/doctor/availability", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        toast.error(data.error || "Could not save availability.");
        return;
      }
      toast.success("Availability saved.");
      onDone();
      onClose();
    } finally {
      setPending("");
    }
  };

  const remove = async () => {
    if (!isEdit) return;
    setPending("delete");
    try {
      const r = await fetch(
        `/api/doctor/availability?type=${modal.type}&id=${modal.block.id}`,
        { method: "DELETE" }
      );
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        toast.error(data.error || "Could not remove availability.");
        return;
      }
      toast.success("Availability removed.");
      onDone();
      onClose();
    } finally {
      setPending("");
    }
  };

  const label =
    modal.type === "rule"
      ? FULL_WEEKDAYS[modal.weekday]
      : new Date(`${modal.date}T00:00:00`).toLocaleDateString(undefined, {
          month: "long",
          day: "numeric",
        });

  return (
    <Modal
      title={isEdit ? "Edit availability" : "Add availability"}
      subtitle={`${modal.type === "rule" ? "Weekly default" : "Date override"} · ${label}`}
      onClose={onClose}
    >
      <form onSubmit={save} className="grid gap-5">
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold text-foreground/60">Start</span>
            <select
              value={start}
              onChange={(e) => {
                setStart(e.target.value);
                setErrors((prev) => ({ ...prev, start: "", end: "" }));
                const nextStartMinutes = timeToMinutes(e.target.value);
                const firstValidEnd = endOptions.find((option) =>
                  canUseEndMinute(nextStartMinutes, option.minutes, existingBlocks, excludeId)
                );
                if (
                  !canUseEndMinute(nextStartMinutes, timeToMinutes(end), existingBlocks, excludeId)
                  && firstValidEnd
                ) {
                  setEnd(firstValidEnd.value);
                }
              }}
              className={`h-11 rounded-xl bg-surface-low border px-3 text-sm outline-none focus:ring-2 ${
                errors.start
                  ? "border-red-500 bg-red-50/50 focus:ring-red-500/25"
                  : "border-primary/[0.1] focus:ring-primary/20"
              }`}
            >
              {startOptions.map((option) => (
                <option key={option.value} value={option.value} disabled={option.disabled}>
                  {option.value}
                </option>
              ))}
            </select>
            {errors.start ? <p className="text-xs text-red-600">{errors.start}</p> : null}
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold text-foreground/60">End</span>
            <select
              value={end}
              onChange={(e) => {
                setEnd(e.target.value);
                setErrors((prev) => ({ ...prev, end: "" }));
              }}
              className={`h-11 rounded-xl bg-surface-low border px-3 text-sm outline-none focus:ring-2 ${
                errors.end
                  ? "border-red-500 bg-red-50/50 focus:ring-red-500/25"
                  : "border-primary/[0.1] focus:ring-primary/20"
              }`}
            >
              {endOptions.map((option) => (
                <option key={option.value} value={option.value} disabled={option.disabled}>
                  {option.value}
                </option>
              ))}
            </select>
            {errors.end ? <p className="text-xs text-red-600">{errors.end}</p> : null}
          </label>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2">
          {isEdit ? (
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              disabled={Boolean(pending)}
              onClick={remove}
              className="h-11 px-4 rounded-xl border border-red-500/20 text-red-700 text-sm font-semibold hover:bg-red-500/10 disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              <Trash2 size={15} />
              {pending === "delete" ? "Removing..." : "Remove"}
            </motion.button>
          ) : (
            <span />
          )}
          <motion.button
            type="submit"
            whileTap={{ scale: 0.97 }}
            disabled={Boolean(pending)}
            className="h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold shadow-sm shadow-primary/20 hover:bg-primary-container disabled:opacity-50"
          >
            {pending === "save" ? "Saving..." : "Save availability"}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
}

function AvailabilityPill({ block, onClick, compact = false }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`rounded-full bg-primary/10 text-primary font-semibold hover:bg-primary/15 transition-colors ${
        compact ? "px-2 py-1 text-[10px]" : "px-3 py-1.5 text-xs"
      }`}
    >
      {blockLabel(block)}
    </motion.button>
  );
}

function Segmented({ value, options, onChange }) {
  return (
    <div className="inline-flex rounded-xl border border-primary/[0.1] p-1 bg-surface-low">
      {options.map((option) => {
        const active = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`h-9 px-3 rounded-lg text-xs font-semibold transition-colors ${
              active ? "bg-primary text-white" : "text-foreground/65 hover:bg-surface-lowest"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function AvailabilityPlanner({ rules, overrides }) {
  const router = useRouter();
  const toast = useToast();
  const todayKey = isoToday();
  const [monthDate, setMonthDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [modal, setModal] = useState(null);
  const [pendingDay, setPendingDay] = useState("");
  const [inspectorTab, setInspectorTab] = useState("DAY");

  const rulesByWeekday = useMemo(
    () => groupBy(rules, (rule) => String(rule.weekday)),
    [rules]
  );
  const overridesByDate = useMemo(
    () => groupBy(overrides, (override) => override.date.slice(0, 10)),
    [overrides]
  );
  const days = useMemo(() => monthGrid(monthDate), [monthDate]);

  const selected = new Date(`${selectedDate}T00:00:00`);
  const selectedOverrides = sortBlocks(overridesByDate[selectedDate] ?? []);
  const selectedUnavailable = selectedOverrides.some((o) => o.isUnavailable);
  const selectedRuleBlocks = sortBlocks(rulesByWeekday[String(selected.getDay())] ?? []);
  const overrideBlocks = selectedOverrides.filter((o) => !o.isUnavailable);
  const effectiveBlocks = selectedUnavailable
    ? []
    : overrideBlocks.length > 0
      ? overrideBlocks
      : selectedRuleBlocks;

  const refresh = () => router.refresh();

  const shiftMonth = (delta) => {
    setMonthDate((current) => {
      const next = new Date(current);
      next.setMonth(current.getMonth() + delta);
      return next;
    });
  };

  const markUnavailable = async () => {
    setPendingDay("unavailable");
    try {
      const r = await fetch("/api/doctor/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "override", date: selectedDate, isUnavailable: true }),
      });
      if (r.ok) {
        toast.success("Day marked unavailable.");
        refresh();
      } else {
        const data = await r.json().catch(() => ({}));
        toast.error(data.error || "Could not update day.");
      }
    } finally {
      setPendingDay("");
    }
  };

  const clearDayOverride = async () => {
    setPendingDay("clear");
    try {
      const r = await fetch(`/api/doctor/availability?type=override-day&date=${selectedDate}`, {
        method: "DELETE",
      });
      if (r.ok) {
        toast.success("Date override cleared.");
        refresh();
      } else {
        const data = await r.json().catch(() => ({}));
        toast.error(data.error || "Could not clear override.");
      }
    } finally {
      setPendingDay("");
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.25fr)_21rem] gap-6 items-start">
        <section className="panel p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/45">
                Calendar
              </p>
              <h2 className="mt-1.5 text-xl font-bold font-manrope tracking-tight">
                {monthTitle(monthDate)}
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-foreground/55">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" aria-hidden />
                  Off
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary" aria-hidden />
                  Custom
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-foreground/25" aria-hidden />
                  Default
                </span>
              </div>
              <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                className="w-10 h-10 rounded-xl border border-primary/[0.08] text-foreground/65 hover:bg-surface-low inline-flex items-center justify-center"
                aria-label="Previous month"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  d.setDate(1);
                  setMonthDate(d);
                  setSelectedDate(todayKey);
                }}
                className="h-10 px-4 rounded-xl border border-primary/[0.08] text-sm font-semibold text-foreground/70 hover:bg-surface-low"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                className="w-10 h-10 rounded-xl border border-primary/[0.08] text-foreground/65 hover:bg-surface-low inline-flex items-center justify-center"
                aria-label="Next month"
              >
                <ChevronRight size={18} />
              </button>
              </div>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-[1.75rem] border border-primary/[0.08] bg-surface-low shadow-sm shadow-primary/5">
            <div className="grid grid-cols-7 border-b border-primary/[0.06] bg-surface-low">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="px-3 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/45"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {days.map((day) => {
                const key = dateKey(day);
                const overridesForDay = overridesByDate[key] ?? [];
                const unavailable = overridesForDay.some((o) => o.isUnavailable);
                const customBlocks = sortBlocks(overridesForDay.filter((o) => !o.isUnavailable));
                const defaultBlocks = sortBlocks(rulesByWeekday[String(day.getDay())] ?? []);
                const blocks = unavailable
                  ? []
                  : customBlocks.length > 0
                    ? customBlocks
                    : defaultBlocks;
                const isSelected = key === selectedDate;
                const isToday = key === todayKey;
                const isOtherMonth = day.getMonth() !== monthDate.getMonth();
                const marker =
                  unavailable ? "OFF" : customBlocks.length > 0 ? "CUSTOM" : blocks.length > 0 ? "DEFAULT" : "NONE";

                return (
                  <motion.button
                    key={key}
                    type="button"
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedDate(key)}
                    className={`min-h-[7rem] border-r border-b border-primary/[0.06] p-3 text-left transition-colors ${
                      isSelected
                        ? "bg-primary/[0.08] ring-2 ring-inset ring-primary/30"
                        : "hover:bg-surface-low"
                    } ${isOtherMonth ? "bg-surface-lowest/35 text-foreground/35" : "bg-surface-lowest"}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold font-manrope ${
                          isToday
                            ? "bg-primary text-white"
                            : isSelected
                              ? "text-primary"
                              : "text-foreground/75"
                        }`}
                      >
                        {day.getDate()}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 text-[10px] font-semibold ${
                          marker === "OFF"
                            ? "text-red-700"
                            : marker === "CUSTOM"
                              ? "text-primary"
                              : marker === "DEFAULT"
                                ? "text-foreground/55"
                                : "text-foreground/35"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            marker === "OFF"
                              ? "bg-red-500"
                              : marker === "CUSTOM"
                                ? "bg-primary"
                                : marker === "DEFAULT"
                                  ? "bg-foreground/25"
                                  : "bg-foreground/15"
                          }`}
                          aria-hidden
                        />
                        {marker === "OFF"
                          ? "Off"
                          : marker === "CUSTOM"
                            ? "Custom"
                            : marker === "DEFAULT"
                              ? "Default"
                              : "—"}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-col gap-1">
                      {blocks.length === 0 ? (
                        <span className="text-[11px] text-foreground/35">
                          {unavailable ? "Unavailable" : "No hours"}
                        </span>
                      ) : (
                        <>
                          <span className="text-[11px] font-semibold text-foreground/65 truncate">
                            {blockLabel(blocks[0])}
                          </span>
                          <span className="text-[10px] text-foreground/45">
                            {blocks.length === 1 ? "1 block" : `${blocks.length} blocks`}
                          </span>
                        </>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="grid gap-6 xl:sticky xl:top-24">
          <section className="panel p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/45">
                  Inspector
                </p>
                <h2 className="mt-1.5 text-lg font-bold font-manrope tracking-tight truncate">
                  {displayDate(selected)}
                </h2>
                <p className="text-xs text-foreground/50 mt-1">
                  {overrideBlocks.length > 0 || selectedUnavailable
                    ? "Date override active"
                    : "Using weekly defaults"}
                </p>
              </div>
              <CalendarDays size={22} className="text-primary/50" />
            </div>

            <div className="mt-5">
              <Segmented
                value={inspectorTab}
                onChange={setInspectorTab}
                options={[
                  { id: "DAY", label: "Selected day" },
                  { id: "TEMPLATE", label: "Weekly template" },
                ]}
              />
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {inspectorTab === "DAY" ? (
                <motion.div
                  key="day"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.18 }}
                  className="mt-5"
                >
                  <div className="rounded-2xl bg-surface-low p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-foreground/45">
                      Effective hours
                    </p>
                    {effectiveBlocks.length === 0 ? (
                      <p className="mt-3 text-sm text-foreground/55">
                        {selectedUnavailable ? "This day is blocked out." : "No availability for this date."}
                      </p>
                    ) : (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {effectiveBlocks.map((block) => (
                          <AvailabilityPill
                            key={block.id}
                            block={block}
                            onClick={() =>
                              setModal({
                                mode: "edit",
                                type: overrideBlocks.length > 0 ? "override" : "rule",
                                block,
                                existingBlocks: overrideBlocks.length > 0 ? overrideBlocks : selectedRuleBlocks,
                                weekday: selected.getDay(),
                                date: selectedDate,
                              })
                            }
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 grid gap-2">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        setModal({
                          mode: "add",
                          type: "override",
                          date: selectedDate,
                          existingBlocks: overrideBlocks,
                        })
                      }
                      className="h-11 rounded-xl bg-primary text-white text-sm font-semibold shadow-sm shadow-primary/20 inline-flex items-center justify-center gap-2"
                    >
                      <Plus size={16} />
                      Add date override
                    </motion.button>
                    <div className="grid grid-cols-2 gap-2">
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.98 }}
                        disabled={Boolean(pendingDay)}
                        onClick={markUnavailable}
                        className="h-10 rounded-xl border border-red-500/20 text-red-700 text-xs font-semibold hover:bg-red-500/10 disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
                      >
                        <XCircle size={14} />
                        {pendingDay === "unavailable" ? "Saving" : "Mark off"}
                      </motion.button>
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.98 }}
                        disabled={Boolean(pendingDay)}
                        onClick={clearDayOverride}
                        className="h-10 rounded-xl border border-primary/[0.12] text-foreground/70 text-xs font-semibold hover:bg-surface-low disabled:opacity-50"
                      >
                        {pendingDay === "clear" ? "Clearing" : "Use default"}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="template"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.18 }}
                  className="mt-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-foreground/45">
                      Weekly template
                    </p>
                    <Clock size={18} className="text-primary/50" />
                  </div>

                  <div className="mt-4 grid gap-3">
                    {FULL_WEEKDAYS.map((day, weekday) => {
                      const dayRules = sortBlocks(rulesByWeekday[String(weekday)] ?? []);
                      return (
                        <div
                          key={day}
                          className="rounded-2xl border border-primary/[0.07] bg-surface-low/70 p-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-bold font-manrope">{day}</p>
                              <p className="text-[11px] text-foreground/45">
                                {dayRules.length
                                  ? `${dayRules.length} block${dayRules.length === 1 ? "" : "s"}`
                                  : "Unavailable"}
                              </p>
                            </div>
                            <motion.button
                              type="button"
                              whileTap={{ scale: 0.96 }}
                              onClick={() =>
                                setModal({
                                  mode: "add",
                                  type: "rule",
                                  weekday,
                                  existingBlocks: dayRules,
                                })
                              }
                              className="w-9 h-9 rounded-xl bg-primary text-white inline-flex items-center justify-center"
                              aria-label={`Add availability for ${day}`}
                            >
                              <Plus size={16} />
                            </motion.button>
                          </div>
                          {dayRules.length > 0 ? (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {dayRules.map((rule) => (
                                <AvailabilityPill
                                  key={rule.id}
                                  block={rule}
                                  compact
                                  onClick={() =>
                                    setModal({
                                      mode: "edit",
                                      type: "rule",
                                      block: rule,
                                      existingBlocks: dayRules,
                                      weekday,
                                    })
                                  }
                                />
                              ))}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </aside>
      </div>

      {modal ? (
        <BlockFormModal
          modal={modal}
          onClose={() => setModal(null)}
          onDone={refresh}
        />
      ) : null}
    </>
  );
}
