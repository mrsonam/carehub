"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarPlus,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { useToast } from "@/app/components/toast/ToastProvider";

const DURATION_OPTIONS = [15, 30, 45, 60];

function dateValue(offsetDays = 1) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function keyForDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
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

function monthTitle(date) {
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function resolveInitialDoctorId(doctors, initialDoctorId) {
  if (initialDoctorId && doctors.some((d) => d.id === initialDoctorId)) return initialDoctorId;
  return doctors[0]?.id ?? "";
}

export function AppointmentBookingForm({
  doctors = [],
  patients = [],
  mode = "patient",
  initialDoctorId,
}) {
  const router = useRouter();
  const toast = useToast();
  const usesSlotPicker = mode === "patient" || mode === "admin";
  const [monthDate, setMonthDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const bookingDates = useMemo(() => monthGrid(monthDate), [monthDate]);
  const todayKey = dateValue(0);
  const [doctorId, setDoctorId] = useState(() => resolveInitialDoctorId(doctors, initialDoctorId));
  const [patientId, setPatientId] = useState(patients[0]?.id ?? "");
  const [patientName, setPatientName] = useState("");
  const [date, setDate] = useState(dateValue());
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [slots, setSlots] = useState([]);
  const [slotsSource, setSlotsSource] = useState("");
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [dateAvailability, setDateAvailability] = useState({});
  const [datesLoading, setDatesLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const selectedDoctor = useMemo(
    () => doctors.find((d) => d.id === doctorId),
    [doctorId, doctors]
  );

  useEffect(() => {
    if (!usesSlotPicker) return;
    setDateAvailability({});
    if (!doctorId) return;

    let cancelled = false;
    setDatesLoading(true);
    Promise.all(
      bookingDates.map((day) =>
        fetch(`/api/doctors/${doctorId}/slots?date=${keyForDate(day)}&duration=${durationMinutes}`, { cache: "no-store" })
          .then((r) => r.json())
          .then((data) => [keyForDate(day), data?.slots?.length ?? 0])
          .catch(() => [keyForDate(day), 0])
      )
    )
      .then((entries) => {
        if (cancelled) return;
        const map = Object.fromEntries(entries);
        setDateAvailability(map);
        if ((map[date] ?? 0) === 0 || date < todayKey) {
          const firstAvailable = entries.find(([key, count]) => key >= todayKey && count > 0)?.[0];
          if (firstAvailable) setDate(firstAvailable);
        }
      })
      .finally(() => {
        if (cancelled) return;
        setDatesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [bookingDates, date, doctorId, durationMinutes, refreshKey, todayKey, usesSlotPicker]);

  useEffect(() => {
    if (!usesSlotPicker) return;
    setSelectedSlot("");
    setSlots([]);
    setSlotsSource("");
    if (!doctorId || !date) return;

    let cancelled = false;
    setSlotsLoading(true);
    fetch(`/api/doctors/${doctorId}/slots?date=${date}&duration=${durationMinutes}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setSlots(data?.slots ?? []);
        setSlotsSource(data?.source ?? "");
      })
      .catch(() => {
        if (cancelled) return;
        setSlots([]);
        setSlotsSource("");
      })
      .finally(() => {
        if (cancelled) return;
        setSlotsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [date, doctorId, durationMinutes, refreshKey, usesSlotPicker]);

  const submit = async (e) => {
    e.preventDefault();
    if (pending) return;
    setError("");
    setSaved(false);
    const nextErrors = {};

    if (mode === "admin" && patients.length === 0 && !patientName.trim()) {
      nextErrors.patientName = "Patient name is required.";
    }
    if (usesSlotPicker && !selectedSlot) {
      nextErrors.selectedSlot = "Choose an available time slot.";
    }
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const scheduledAt = new Date(selectedSlot);
    if (Number.isNaN(scheduledAt.getTime())) {
      setError("Choose an available time slot.");
      return;
    }

    const body = {
      doctorId: doctorId || undefined,
      scheduledAt: scheduledAt.toISOString(),
      durationMinutes,
      patientNotes: notes.trim(),
      status: mode === "admin" ? "CONFIRMED" : undefined,
    };

    if (mode === "admin") {
      if (patientId) body.patientId = patientId;
      else body.patientName = patientName.trim();
    }

    setPending(true);
    try {
      const r = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(data.error || "Could not create appointment.");
        toast.error(data.error || "Could not create appointment.");
        return;
      }
      setSaved(true);
      toast.success(mode === "admin" ? "Appointment created." : "Appointment request sent.");
      setNotes("");
      if (usesSlotPicker) {
        setSelectedSlot("");
        setRefreshKey((key) => key + 1);
      }
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
      className="panel p-6 overflow-hidden relative"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-primary/80" aria-hidden />
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/45">
            Scheduler
          </p>
          <h2 className="mt-2 text-xl font-bold font-manrope tracking-tight">
            {mode === "admin" ? "Create appointment" : "Request an appointment"}
          </h2>
          <p className="text-sm text-foreground/55 mt-1">
            {mode === "admin"
              ? "Book directly into the clinic schedule."
              : "Pick a doctor, date, and one of their available times."}
          </p>
        </div>
        {selectedDoctor ? (
          <motion.div
            layout
            className="rounded-xl bg-primary/10 text-primary px-4 py-3 min-w-44"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70">
              Selected
            </p>
            <p className="font-bold font-manrope text-sm mt-1 truncate">
              {selectedDoctor.name}
            </p>
          </motion.div>
        ) : null}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {mode === "admin" ? (
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-foreground/60 inline-flex items-center gap-1.5">
              <UserRound size={14} /> Patient
            </span>
            {patients.length > 0 ? (
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="h-11 rounded-lg bg-surface-low border border-primary/[0.1] px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={patientName}
                onChange={(e) => {
                  setPatientName(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, patientName: "" }));
                }}
                placeholder="Patient name"
                className={`h-11 rounded-lg bg-surface-low border px-3 text-sm outline-none focus:ring-2 ${
                  fieldErrors.patientName
                    ? "border-red-500 bg-red-50/50 focus:ring-red-500/25"
                    : "border-primary/[0.1] focus:ring-primary/20"
                }`}
              />
            )}
            {fieldErrors.patientName ? (
              <p className="text-xs text-red-600">{fieldErrors.patientName}</p>
            ) : null}
          </label>
        ) : null}

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-foreground/60 inline-flex items-center gap-1.5">
            <Stethoscope size={14} /> Doctor
          </span>
          <select
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            className="h-11 rounded-lg bg-surface-low border border-primary/[0.1] px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">
              {mode === "admin" ? "Care team can assign" : "Choose a doctor"}
            </option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.title ? `${doctor.name} · ${doctor.title}` : doctor.name}
              </option>
            ))}
          </select>
        </label>

        {usesSlotPicker ? (
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-foreground/60 inline-flex items-center gap-1.5">
              <Clock size={14} /> Visit length
            </span>
            <select
              value={durationMinutes}
              onChange={(e) => {
                setDurationMinutes(Number(e.target.value));
                setSelectedSlot("");
              }}
              className="h-11 rounded-lg bg-surface-low border border-primary/[0.1] px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            >
              {DURATION_OPTIONS.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes} minutes
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      {usesSlotPicker ? (
        <div className="mt-5 rounded-2xl bg-surface-low p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-foreground/45 inline-flex items-center gap-1.5">
                <CalendarPlus size={14} /> Choose a date
              </p>
              <p className="text-xs text-foreground/50 mt-1">
                Slot availability is calculated for a {durationMinutes}-minute visit.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setMonthDate((current) => {
                    const next = new Date(current);
                    next.setMonth(current.getMonth() - 1);
                    return next;
                  })
                }
                className="w-9 h-9 rounded-lg border border-primary/[0.08] text-foreground/65 hover:bg-surface-lowest inline-flex items-center justify-center"
                aria-label="Previous month"
              >
                <ChevronLeft size={17} />
              </button>
              <div className="min-w-32 text-center text-sm font-bold font-manrope">
                {monthTitle(monthDate)}
              </div>
              <button
                type="button"
                onClick={() =>
                  setMonthDate((current) => {
                    const next = new Date(current);
                    next.setMonth(current.getMonth() + 1);
                    return next;
                  })
                }
                className="w-9 h-9 rounded-lg border border-primary/[0.08] text-foreground/65 hover:bg-surface-lowest inline-flex items-center justify-center"
                aria-label="Next month"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] font-semibold text-foreground/55">
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

          <div className="mt-4 grid grid-cols-7 rounded-2xl overflow-hidden border border-primary/[0.06] bg-surface-lowest">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div
                key={day}
                className="px-2 py-2 text-center text-[10px] font-bold uppercase tracking-widest text-foreground/45 bg-surface-low"
              >
                {day}
              </div>
            ))}
            {bookingDates.map((day) => {
              const value = keyForDate(day);
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
                  whileTap={disabled ? undefined : { scale: 0.97 }}
                  disabled={disabled}
                  onClick={() => {
                    setDate(value);
                    setSelectedSlot("");
                    setFieldErrors((prev) => ({ ...prev, selectedSlot: "" }));
                  }}
                  className={`min-h-[4.6rem] border-t border-r border-primary/[0.06] p-2 text-left transition-colors disabled:cursor-not-allowed ${
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
            })}
          </div>
        </div>
      ) : null}

      {usesSlotPicker ? (
        <div
          className={`mt-4 rounded-2xl bg-surface-low p-4 ${
            fieldErrors.selectedSlot ? "ring-2 ring-red-500/30" : ""
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-foreground/45">
                Available times
              </p>
              <p className="text-xs text-foreground/50 mt-1">
                {slotsSource === "override"
                  ? "Showing custom hours for this date."
                  : slotsSource === "unavailable"
                    ? "This doctor is unavailable on this date."
                    : "Showing the doctor's default availability."}
              </p>
            </div>
            {selectedSlot ? (
              <span className="rounded-full bg-primary/10 text-primary px-3 py-1.5 text-xs font-semibold">
                Selected {new Date(selectedSlot).toLocaleTimeString(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                })} · {durationMinutes} min
              </span>
            ) : null}
          </div>

          <div className="mt-4">
            {slotsLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-10 rounded-xl bg-surface-high animate-pulse"
                  />
                ))}
              </div>
            ) : !doctorId ? (
              <p className="text-sm text-foreground/50">Choose a doctor to see times.</p>
            ) : slots.length === 0 ? (
              <p className="text-sm text-foreground/50">
                No open slots for this date. Try another day or doctor.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {slots.map((slot, index) => {
                  const active = selectedSlot === slot.startsAt;
                  return (
                    <motion.button
                      key={`${slot.startsAt}-${index}`}
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setSelectedSlot(slot.startsAt);
                        setFieldErrors((prev) => ({ ...prev, selectedSlot: "" }));
                      }}
                      className={`h-10 rounded-xl text-sm font-semibold transition-colors ${
                        active
                          ? "bg-primary text-white shadow-sm shadow-primary/20"
                          : "bg-surface-lowest border border-primary/[0.08] text-foreground/70 hover:border-primary/25"
                      }`}
                    >
                      {slot.label}
                    </motion.button>
                  );
                })}
              </div>
            )}
            {fieldErrors.selectedSlot ? (
              <p className="text-xs text-red-600 mt-3">{fieldErrors.selectedSlot}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      <label className="mt-4 flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-foreground/60 inline-flex items-center gap-1.5">
          <FileText size={14} /> {usesSlotPicker ? "Describe the problem" : "Notes"}
        </span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder={
            usesSlotPicker
              ? "Tell the doctor what you need help with, symptoms, duration, or accessibility needs..."
              : "Reason for visit, symptoms, accessibility needs..."
          }
          className="rounded-lg bg-surface-low border border-primary/[0.1] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-y"
        />
      </label>

      <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3">
        <motion.button
          type="submit"
          whileTap={{ scale: 0.98 }}
          disabled={pending || (usesSlotPicker && !selectedSlot)}
          className="h-11 px-5 rounded-lg bg-primary text-white text-sm font-semibold shadow-sm shadow-primary/20 hover:bg-primary-container transition-colors disabled:opacity-50"
        >
          {pending ? "Saving..." : mode === "admin" ? "Create appointment" : "Send request"}
        </motion.button>
        <AnimatePresence mode="wait">
          {saved ? (
            <motion.p
              key="saved"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="text-sm font-semibold text-secondary inline-flex items-center gap-1.5"
            >
              <CheckCircle2 size={16} /> Appointment saved.
            </motion.p>
          ) : error ? (
            <motion.p
              key="error"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="text-sm text-red-600"
            >
              {error}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.form>
  );
}
