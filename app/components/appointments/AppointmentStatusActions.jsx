"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useToast } from "@/app/components/toast/ToastProvider";

const LABELS = {
  REQUESTED: "Request",
  CONFIRMED: "Confirm",
  ONGOING: "Start",
  CANCELLED: "Cancel",
  COMPLETED: "Complete",
  NO_SHOW: "No-show",
};

export function AppointmentStatusActions({ appointmentId, actions = [] }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, setPending] = useState("");
  const [error, setError] = useState("");

  const updateStatus = async (status) => {
    if (pending) return;
    setPending(status);
    setError("");
    try {
      const r = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(data.error || "Could not update appointment.");
        toast.error(data.error || "Could not update appointment.");
        return;
      }
      toast.success("Appointment updated.");
      router.refresh();
    } finally {
      setPending("");
    }
  };

  if (actions.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {actions.map((status) => (
          <motion.button
            key={status}
            type="button"
            whileTap={{ scale: 0.97 }}
            disabled={Boolean(pending)}
            onClick={() => updateStatus(status)}
            className={`h-8 rounded-lg px-3 text-xs font-semibold transition-colors disabled:opacity-50 ${
              status === "CANCELLED"
                ? "border border-red-500/20 text-red-700 hover:bg-red-500/10"
                : status === "NO_SHOW"
                  ? "border border-primary/[0.12] text-foreground/70 hover:bg-surface-low"
                  : "bg-primary text-white hover:bg-primary-container"
            }`}
          >
            {pending === status ? "Saving..." : LABELS[status] ?? status}
          </motion.button>
        ))}
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
