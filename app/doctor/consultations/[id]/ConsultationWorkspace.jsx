"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ClipboardPenLine, Pill, UserX } from "lucide-react";
import { useToast } from "@/app/components/toast/ToastProvider";

function actionClass(tone) {
  if (tone === "danger") {
    return "border border-red-500/20 text-red-700 hover:bg-red-500/10";
  }
  return "bg-primary text-white hover:bg-primary-container shadow-sm shadow-primary/20";
}

export function ConsultationWorkspace({ appointment }) {
  const router = useRouter();
  const toast = useToast();
  const [doctorNotes, setDoctorNotes] = useState(appointment.doctorNotes ?? "");
  const [pending, setPending] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const patientConcern = appointment.patientNotes ?? appointment.notes ?? "";

  const patchAppointment = async ({ status }) => {
    if (pending) return;
    setPending(status);
    setMessage("");
    setError("");
    try {
      const r = await fetch(`/api/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(status ? { status } : {}),
          doctorNotes,
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(data.error || "Could not update consultation.");
        toast.error(data.error || "Could not update consultation.");
        return;
      }
      setMessage("Consultation updated.");
      toast.success(
        status === "COMPLETED"
          ? "Consultation completed."
          : status === "NO_SHOW"
            ? "Marked as no-show."
            : "Consultation updated."
      );
      router.refresh();
      if (status === "COMPLETED" || status === "NO_SHOW") {
        router.push("/doctor/schedule");
      }
    } finally {
      setPending("");
    }
  };

  const actions = [
    { status: "COMPLETED", label: "Complete visit", icon: CheckCircle2, tone: "primary" },
    { status: "NO_SHOW", label: "Mark no-show", icon: UserX, tone: "danger" },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_22rem] gap-6">
      <section className="panel p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/45">
              Consultation workspace
            </p>
            <h2 className="mt-1.5 text-xl font-bold font-manrope tracking-tight">
              Doctor notes and plan
            </h2>
            <p className="mt-1 text-sm text-foreground/55">
              Document assessment, advice, prescriptions, and follow-up. These notes
              stay out of schedule summaries.
            </p>
          </div>
          <span className="rounded-full bg-primary text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
            {appointment.status.toLowerCase()}
          </span>
        </div>

        {patientConcern ? (
          <div className="mt-6 rounded-2xl bg-surface-low border border-primary/[0.08] p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">
              Patient-described problem
            </p>
            <p className="mt-2 text-sm text-foreground/70 leading-relaxed">
              {patientConcern}
            </p>
          </div>
        ) : null}

        <label className="mt-5 grid gap-2">
          <span className="text-sm font-bold font-manrope inline-flex items-center gap-2">
            <ClipboardPenLine size={17} className="text-primary" />
            Clinical notes
          </span>
          <textarea
            value={doctorNotes}
            onChange={(e) => setDoctorNotes(e.target.value)}
            rows={12}
            placeholder="Assessment, differential, clinical suggestions, prescription details, follow-up instructions..."
            className="w-full rounded-2xl bg-surface-low border border-primary/[0.1] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-y min-h-[20rem]"
          />
        </label>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.status}
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  disabled={Boolean(pending)}
                  onClick={() => patchAppointment({ status: action.status })}
                  className={`inline-flex items-center gap-2 h-10 rounded-xl px-4 text-sm font-semibold transition-colors disabled:opacity-50 ${actionClass(
                    action.tone
                  )}`}
                >
                  <Icon size={15} />
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
                className="text-sm text-red-600"
              >
                {error}
              </motion.p>
            ) : message ? (
              <motion.p
                key="message"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="text-sm font-semibold text-secondary"
              >
                {message}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>
      </section>

      <aside className="grid gap-4 content-start">
        <div className="panel p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/45">
            Patient snapshot
          </p>
          <h3 className="mt-2 text-lg font-bold font-manrope">{appointment.patientName}</h3>
          <dl className="mt-4 grid gap-3 text-sm">
            <div>
              <dt className="text-xs text-foreground/45">Email</dt>
              <dd className="font-medium">{appointment.patient?.email ?? "Not linked"}</dd>
            </div>
            <div>
              <dt className="text-xs text-foreground/45">Phone</dt>
              <dd className="font-medium">{appointment.patient?.phone ?? "Not provided"}</dd>
            </div>
            <div>
              <dt className="text-xs text-foreground/45">Appointment</dt>
              <dd className="font-medium">
                {new Date(appointment.scheduledAt).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </dd>
            </div>
          </dl>
        </div>

        <div className="panel p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/45">
            Prescriptions
          </p>
          <div className="mt-4 flex gap-3 rounded-2xl bg-surface-low p-4">
            <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Pill size={16} />
            </span>
            <p className="text-sm text-foreground/60 leading-relaxed">
              Use the clinical notes field for prescription details for now. A
              structured prescription workflow can be connected next.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
