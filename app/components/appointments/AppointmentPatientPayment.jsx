"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Banknote, CreditCard } from "lucide-react";
import { useToast } from "@/app/components/toast/ToastProvider";

export function AppointmentPatientPayment({
  appointmentId,
  paymentMethod,
}) {
  const toast = useToast();
  const router = useRouter();
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
      router.refresh();
    } finally {
      setPending("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.2, 0, 0, 1] }}
      className="mt-4 flex flex-col sm:flex-row gap-3"
    >
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        disabled={Boolean(pending)}
        onClick={payNow}
        className="h-10 px-4 rounded-lg bg-primary text-white text-sm font-semibold shadow-sm shadow-primary/20 hover:bg-primary-container transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2 w-fit"
      >
        <CreditCard size={15} />
        {pending === "checkout" ? "Redirecting..." : "Pay now"}
      </motion.button>
      {paymentMethod !== "PAY_AT_COUNTER" ? (
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          disabled={Boolean(pending)}
          onClick={payAtCounter}
          className="h-10 px-4 rounded-lg border border-primary/[0.12] bg-surface-lowest text-sm font-semibold text-foreground/75 hover:bg-surface-low transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2 w-fit"
        >
          <Banknote size={15} />
          {pending === "counter" ? "Saving..." : "Pay at counter"}
        </motion.button>
      ) : null}
      {paymentMethod === "PAY_AT_COUNTER" ? (
        <p className="text-sm text-foreground/60">
          You chose to pay at the front desk. Payment is still due before your visit.
        </p>
      ) : null}
    </motion.div>
  );
}
