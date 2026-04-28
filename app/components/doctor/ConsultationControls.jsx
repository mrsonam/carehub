"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardPenLine, Play, UserX, CheckCircle2, ExternalLink } from "lucide-react";
import { isWithinConsultationActionWindow } from "@/lib/appointment-lifecycle";
import { useToast } from "@/app/components/toast/ToastProvider";

const ACTIONS = {
  REQUESTED: [
    { status: "CONFIRMED", label: "Confirm", icon: CheckCircle2, tone: "primary" },
    { status: "CANCELLED", label: "Cancel", icon: UserX, tone: "danger" },
  ],
  CONFIRMED: [
    { status: "ONGOING", label: "Start consultation", icon: Play, tone: "primary" },
    { status: "NO_SHOW", label: "Mark no-show", icon: UserX, tone: "muted" },
    { status: "CANCELLED", label: "Cancel", icon: UserX, tone: "danger" },
  ],
  ONGOING: [
    { status: "OPEN", label: "Open consultation", icon: ExternalLink, tone: "primary" },
  ],
};

function buttonClass(tone) {
  if (tone === "danger") {
    return "border border-red-500/20 text-red-700 hover:bg-red-500/10";
  }
  if (tone === "muted") {
    return "border border-primary/[0.12] text-foreground/70 hover:bg-surface-low";
  }
  return "bg-primary text-white hover:bg-primary-container shadow-sm shadow-primary/20";
}

export function ConsultationControls({ appointment }) {
  const router = useRouter();
  const toast = useToast();
  const patientConcern = appointment.patientNotes ?? appointment.notes ?? "";
  const [pending, setPending] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const actions = ACTIONS[appointment.status] ?? [];
  const isOngoing = appointment.status === "ONGOING";
  const inWindow = isWithinConsultationActionWindow(appointment);

  const patchAppointment = async ({ status }) => {
    if (pending) return;
    if (status === "OPEN") {
      router.push(`/doctor/consultations/${appointment.id}`);
      return;
    }
    setPending(status);
    setMessage("");
    setError("");
    try {
      const r = await fetch(`/api/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(data.error || "Could not update consultation.");
        toast.error(data.error || "Could not update consultation.");
        return;
      }
      if (status === "ONGOING") {
        toast.success("Consultation started.");
        router.push(`/doctor/consultations/${appointment.id}`);
        return;
      }
      setMessage("Appointment updated.");
      toast.success("Appointment updated.");
      router.refresh();
    } finally {
      setPending("");
    }
  };

  return (
    <motion.div
      layout
      className={`rounded-xl border p-4 ${
        isOngoing
          ? "border-primary/20 bg-primary/[0.035]"
          : "border-primary/[0.08] bg-surface-lowest/70"
      }`}
    >
      <div className="flex items-center gap-2 text-sm font-bold font-manrope">
        <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <ClipboardPenLine size={16} />
        </span>
        Consultation
        {isOngoing ? (
          <span className="ml-auto rounded-full bg-primary text-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest">
            Live
          </span>
        ) : null}
      </div>

      {patientConcern ? (
        <div className="mt-3 rounded-lg bg-surface-low border border-primary/[0.08] px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">
            Patient concern
          </p>
          <p className="mt-1 text-sm text-foreground/65 leading-relaxed">
            {patientConcern}
          </p>
        </div>
      ) : null}

      <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => {
            const requiresWindow = action.status === "ONGOING" || action.status === "NO_SHOW";
            const disabled = Boolean(pending) || (requiresWindow && !inWindow);
            const Icon = action.icon;
            return (
              <motion.button
                key={action.status}
                type="button"
                whileTap={{ scale: 0.97 }}
                disabled={disabled}
                onClick={() => patchAppointment({ status: action.status })}
                className={`inline-flex items-center gap-1.5 h-9 rounded-lg px-3 text-xs font-semibold transition-colors disabled:opacity-50 ${buttonClass(
                  action.tone
                )}`}
              >
                <Icon size={14} />
                {pending === action.status ? "Saving..." : action.label}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {error ? (
            <motion.p
              key="error"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="text-xs text-red-600"
            >
              {error}
            </motion.p>
          ) : message ? (
            <motion.p
              key="message"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="text-xs font-semibold text-secondary"
            >
              {message}
            </motion.p>
          ) : !inWindow && appointment.status === "CONFIRMED" ? (
            <motion.p
              key="window"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="text-xs text-foreground/55"
            >
              Start consultation and no-show are only available from 10 minutes before
              to 10 minutes after the scheduled time.
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
