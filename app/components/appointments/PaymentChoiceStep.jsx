"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Banknote, CreditCard } from "lucide-react";
import { formatMoney } from "@/lib/payments/fees.js";
import { useToast } from "@/app/components/toast/ToastProvider";

export function PaymentChoiceStep({ appointmentId, feeAmountCents, onComplete }) {
  const toast = useToast();
  const [pending, setPending] = useState("");

  const payNow = async () => {
    if (pending) return;
    setPending("checkout");
    try {
      const r = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data.url) {
        toast.error(data.error || "Could not start checkout.");
        return;
      }
      window.location.href = data.url;
    } finally {
      setPending("");
    }
  };

  const payAtCounter = async () => {
    if (pending) return;
    setPending("counter");
    try {
      const r = await fetch(`/api/appointments/${appointmentId}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: "PAY_AT_COUNTER" }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        toast.error(data.error || "Could not save payment choice.");
        return;
      }
      toast.success("You can pay at the front desk before your visit.");
      onComplete?.();
    } finally {
      setPending("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
      className="mt-5 rounded-2xl border border-primary/[0.1] bg-surface-low p-5"
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/45">
        Appointment fee
      </p>
      <p className="mt-2 text-2xl font-black font-manrope tracking-tight">
        {formatMoney(feeAmountCents)}
      </p>
      <p className="mt-1 text-sm text-foreground/55">
        Your appointment is booked. Choose how you would like to pay.
      </p>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: 0.05 }}
        className="mt-4 flex flex-col sm:flex-row gap-3"
      >
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          disabled={Boolean(pending)}
          onClick={payNow}
          className="h-11 px-5 rounded-lg bg-primary text-white text-sm font-semibold shadow-sm shadow-primary/20 hover:bg-primary-container transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
        >
          <CreditCard size={16} />
          {pending === "checkout" ? "Redirecting..." : "Pay now"}
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          disabled={Boolean(pending)}
          onClick={payAtCounter}
          className="h-11 px-5 rounded-lg border border-primary/[0.12] bg-surface-lowest text-sm font-semibold text-foreground/75 hover:bg-surface-low transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
        >
          <Banknote size={16} />
          {pending === "counter" ? "Saving..." : "Pay at counter"}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
