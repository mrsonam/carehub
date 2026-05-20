"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Banknote } from "lucide-react";
import { useToast } from "@/app/components/toast/ToastProvider";

export function AppointmentMarkPaidAtCounter({ appointmentId }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const markPaid = async () => {
    if (pending) return;
    setPending(true);
    try {
      const r = await fetch(`/api/appointments/${appointmentId}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_paid_at_counter" }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(data.error || "Could not mark as paid.");
        return;
      }
      toast.success("Marked as paid at counter.");
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  return (
    <motion.div className="mt-3 flex flex-col gap-1.5 w-fit">
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        disabled={pending}
        onClick={markPaid}
        className="h-10 px-4 rounded-lg border border-primary/[0.12] bg-surface-lowest text-sm font-semibold text-foreground/80 hover:bg-surface-low transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
      >
        <Banknote size={15} />
        {pending ? "Saving..." : "Mark paid at counter"}
      </motion.button>
      {error ? (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </motion.div>
  );
}
