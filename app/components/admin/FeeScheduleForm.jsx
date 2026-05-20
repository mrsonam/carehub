"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/app/components/toast/ToastProvider";

const DURATION_FIELDS = [
  { minutes: 15, key: "fee15Cents", label: "15 minutes" },
  { minutes: 30, key: "fee30Cents", label: "30 minutes" },
  { minutes: 45, key: "fee45Cents", label: "45 minutes" },
  { minutes: 60, key: "fee60Cents", label: "60 minutes" },
];

function centsToDollarInput(cents) {
  return (cents / 100).toFixed(2);
}

function dollarInputToCents(value) {
  const parsed = Number.parseFloat(String(value).trim());
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.round(parsed * 100);
}

export default function FeeScheduleForm() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [fees, setFees] = useState({
    fee15Cents: "",
    fee30Cents: "",
    fee45Cents: "",
    fee60Cents: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/settings/fees");
        const data = await r.json().catch(() => ({}));
        if (!r.ok || !data.schedule) {
          if (!cancelled) toast.error(data.error || "Could not load fee schedule.");
          return;
        }
        if (!cancelled) {
          setFees({
            fee15Cents: centsToDollarInput(data.schedule.fee15Cents),
            fee30Cents: centsToDollarInput(data.schedule.fee30Cents),
            fee45Cents: centsToDollarInput(data.schedule.fee45Cents),
            fee60Cents: centsToDollarInput(data.schedule.fee60Cents),
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const submit = async (e) => {
    e.preventDefault();
    if (pending || loading) return;

    const nextErrors = {};
    const payload = {};
    for (const { key, label } of DURATION_FIELDS) {
      const cents = dollarInputToCents(fees[key]);
      if (cents === null) {
        nextErrors[key] = `Enter a valid amount for ${label}.`;
      } else {
        payload[key] = cents;
      }
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setPending(true);
    try {
      const r = await fetch("/api/settings/fees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        toast.error(data.error || "Could not save fee schedule.");
        return;
      }
      if (data.schedule) {
        setFees({
          fee15Cents: centsToDollarInput(data.schedule.fee15Cents),
          fee30Cents: centsToDollarInput(data.schedule.fee30Cents),
          fee45Cents: centsToDollarInput(data.schedule.fee45Cents),
          fee60Cents: centsToDollarInput(data.schedule.fee60Cents),
        });
      }
      toast.success("Fee schedule saved.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="panel p-6 flex flex-col gap-5 max-w-lg">
      <div>
        <h2 className="text-lg font-bold font-manrope">Appointment fees</h2>
        <p className="text-sm text-foreground/55 mt-1">
          Set the upfront fee for each appointment length. Amounts are in Australian dollars;
          new patient bookings use these values.
        </p>
      </div>

      {DURATION_FIELDS.map(({ minutes, key, label }) => (
        <div key={key} className="flex flex-col gap-1.5">
          <label
            htmlFor={`fee-${minutes}`}
            className="text-xs font-bold uppercase tracking-widest text-foreground/45"
          >
            {label}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-foreground/45">
              $
            </span>
            <input
              id={`fee-${minutes}`}
              name={key}
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              disabled={loading}
              value={fees[key]}
              onChange={(e) => {
                setFees((prev) => ({ ...prev, [key]: e.target.value }));
                setErrors((prev) => ({ ...prev, [key]: "" }));
              }}
              className={`h-10 w-full pl-7 pr-3 rounded-lg bg-surface-lowest border text-sm outline-none focus:ring-2 ${
                errors[key]
                  ? "border-red-500 bg-red-50/50 focus:ring-red-500/25"
                  : "border-primary/[0.12] focus:ring-primary/15"
              }`}
            />
          </div>
          {errors[key] ? <p className="text-xs text-red-600">{errors[key]}</p> : null}
        </div>
      ))}

      <button
        type="submit"
        disabled={pending || loading}
        className="h-10 px-4 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-container transition-colors disabled:opacity-50"
      >
        {loading ? "Loading…" : pending ? "Saving…" : "Save fees"}
      </button>
    </form>
  );
}
