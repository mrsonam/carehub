"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BarChart3, Clock, CreditCard, Info, Receipt, Store } from "lucide-react";
import { useToast } from "@/app/components/toast/ToastProvider";
import { FormAlert, FORM_ERROR_KEY } from "@/app/components/forms/FormField";
import { errorsFromApiResponse, hasFieldErrors } from "@/lib/forms/validate";

const EASE_OUT = [0.23, 1, 0.32, 1];

const TIER_CARD_CLASS =
  "rounded-2xl border border-primary/[0.1] bg-surface-low p-5 flex flex-col gap-4";

const DURATION_TIERS = [
  { minutes: 15, key: "fee15Cents", label: "15 min", hint: "Quick consult" },
  { minutes: 30, key: "fee30Cents", label: "30 min", hint: "Standard visit" },
  { minutes: 45, key: "fee45Cents", label: "45 min", hint: "Extended visit" },
  { minutes: 60, key: "fee60Cents", label: "60 min", hint: "Full session" },
];

function centsToDollarInput(cents) {
  return (cents / 100).toFixed(2);
}

function dollarInputToCents(value) {
  const parsed = Number.parseFloat(String(value).trim());
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.round(parsed * 100);
}

function scheduleToForm(schedule) {
  if (!schedule) {
    return { fee15Cents: "", fee30Cents: "", fee45Cents: "", fee60Cents: "" };
  }
  return {
    fee15Cents: centsToDollarInput(schedule.fee15Cents),
    fee30Cents: centsToDollarInput(schedule.fee30Cents),
    fee45Cents: centsToDollarInput(schedule.fee45Cents),
    fee60Cents: centsToDollarInput(schedule.fee60Cents),
  };
}

function formSnapshot(fees) {
  return JSON.stringify(fees);
}

export default function FeeScheduleForm({ initialSchedule = null }) {
  const toast = useToast();
  const reduceMotion = useReducedMotion();
  const [loading, setLoading] = useState(!initialSchedule);
  const [pending, setPending] = useState(false);
  const [fees, setFees] = useState(() => scheduleToForm(initialSchedule));
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    formSnapshot(scheduleToForm(initialSchedule))
  );
  const [errors, setErrors] = useState({});
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (initialSchedule) return;
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/settings/fees");
        const data = await r.json().catch(() => ({}));
        if (!r.ok || !data.schedule) {
          if (!cancelled) setLoadError(data.error || "Could not load fee schedule.");
          return;
        }
        if (!cancelled) {
          const next = scheduleToForm(data.schedule);
          setFees(next);
          setSavedSnapshot(formSnapshot(next));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialSchedule, toast]);

  const isDirty = useMemo(
    () => formSnapshot(fees) !== savedSnapshot,
    [fees, savedSnapshot]
  );

  const submit = async (e) => {
    e.preventDefault();
    if (pending || loading) return;

    const nextErrors = {};
    const payload = {};
    for (const { key, label } of DURATION_TIERS) {
      const cents = dollarInputToCents(fees[key]);
      if (cents === null) {
        nextErrors[key] = `Enter a valid amount for ${label}.`;
      } else {
        payload[key] = cents;
      }
    }
    setErrors(nextErrors);
    if (hasFieldErrors(nextErrors)) return;

    setPending(true);
    try {
      const r = await fetch("/api/settings/fees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setErrors(errorsFromApiResponse(data, "Could not save fee schedule."));
        return;
      }
      if (data.schedule) {
        const next = scheduleToForm(data.schedule);
        setFees(next);
        setSavedSnapshot(formSnapshot(next));
      }
      toast.success("Fee schedule saved. New patient bookings will use these amounts.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
      <form
        onSubmit={submit}
        className="panel p-6 lg:p-7 lg:col-span-2 flex flex-col gap-6 max-w-none"
        aria-busy={loading}
        noValidate
      >
        <FormAlert message={loadError || errors[FORM_ERROR_KEY]} />
        <motion.div
          className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE_OUT }}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/45 inline-flex items-center gap-1.5">
              <Receipt size={14} className="text-primary" aria-hidden />
              Fee schedule
            </p>
            <h2 className="mt-1.5 text-xl font-bold font-manrope tracking-tight">
              Set prices by visit length
            </h2>
            <p className="text-sm text-foreground/55 mt-1 max-w-xl">
              Patients see these amounts when paying online or at the counter. Existing
              appointments keep the fee recorded at booking time.
            </p>
          </div>
          {isDirty && !loading ? (
            <span className="inline-flex items-center self-start rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-800">
              Unsaved changes
            </span>
          ) : null}
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" aria-hidden>
            {DURATION_TIERS.map((tier) => (
              <motion.div
                key={tier.key}
                className={`${TIER_CARD_CLASS} h-36 animate-pulse`}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DURATION_TIERS.map((tier, i) => (
              <motion.div
                key={tier.key}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: EASE_OUT, delay: i * 0.05 }}
                className={TIER_CARD_CLASS}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-lowest border border-primary/[0.08] flex items-center justify-center text-primary shrink-0">
                    <Clock size={18} aria-hidden />
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black font-manrope tabular-nums leading-none">
                      {tier.label}
                    </p>
                    <p className="text-[11px] text-foreground/50 mt-0.5">{tier.hint}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor={`fee-${tier.minutes}`}
                    className="text-[11px] font-bold uppercase tracking-widest text-foreground/45"
                  >
                    Fee (AUD)
                  </label>
                  <div className="relative">
                    <span
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-foreground/45"
                      aria-hidden
                    >
                      $
                    </span>
                    <input
                      id={`fee-${tier.minutes}`}
                      name={tier.key}
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      disabled={loading}
                      value={fees[tier.key]}
                      onChange={(e) => {
                        setFees((prev) => ({ ...prev, [tier.key]: e.target.value }));
                        setErrors((prev) => ({ ...prev, [tier.key]: "" }));
                      }}
                      className={`h-11 w-full pl-8 pr-3 rounded-xl bg-surface-lowest border text-sm font-semibold tabular-nums outline-none transition-[box-shadow,border-color] duration-200 focus:ring-2 ${
                        errors[tier.key]
                          ? "border-red-500 bg-red-50/50 focus:ring-red-500/25"
                          : "border-primary/[0.12] focus:ring-primary/20 focus:border-primary/30"
                      }`}
                    />
                  </div>
                  {errors[tier.key] ? (
                    <p className="text-xs text-red-600" role="alert">
                      {errors[tier.key]}
                    </p>
                  ) : null}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2 border-t border-primary/[0.08]"
          initial={false}
        >
          <button
            type="submit"
            disabled={pending || loading || !isDirty}
            className="h-11 px-6 rounded-lg bg-primary text-white text-sm font-semibold shadow-sm shadow-primary/20 hover:bg-primary-container transition-colors duration-200 disabled:opacity-50 cursor-pointer active:scale-[0.98]"
          >
            {pending ? "Saving…" : "Save fee schedule"}
          </button>
          <button
            type="button"
            disabled={pending || loading || !isDirty}
            onClick={() => {
              setFees(JSON.parse(savedSnapshot));
              setErrors({});
            }}
            className="h-11 px-4 rounded-lg text-sm font-medium text-foreground/65 hover:text-foreground hover:bg-surface-lowest transition-colors duration-200 disabled:opacity-40 cursor-pointer active:scale-[0.98]"
          >
            Reset changes
          </button>
        </motion.div>
      </form>

      <aside className="panel p-6 flex flex-col gap-4 h-fit">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/45">
          How billing works
        </p>
        <ul className="flex flex-col gap-3 text-sm text-foreground/65">
          <li className="flex gap-3">
            <CreditCard size={16} className="text-primary shrink-0 mt-0.5" aria-hidden />
            <span>Online checkout uses Stripe; fees are fixed when the appointment is created.</span>
          </li>
          <li className="flex gap-3">
            <Store size={16} className="text-primary shrink-0 mt-0.5" aria-hidden />
            <span>Pay-at-counter visits stay unpaid until you mark them paid in admin.</span>
          </li>
          <li className="flex gap-3">
            <Info size={16} className="text-primary shrink-0 mt-0.5" aria-hidden />
            <span>
              Admin-created appointments use these fees too; the patient pays online or at the
              counter from their appointment details.
            </span>
          </li>
        </ul>
        <Link
          href="/admin/analytics"
          className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-primary/[0.12] bg-surface-low text-sm font-semibold text-primary hover:bg-primary/[0.06] transition-colors duration-200 cursor-pointer active:scale-[0.98]"
        >
          <BarChart3 size={15} aria-hidden />
          View payment analytics
          <ArrowRight size={14} aria-hidden />
        </Link>
      </aside>
    </div>
  );
}
