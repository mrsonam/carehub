"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Phone, Stethoscope, FileText, Sparkles, Check } from "lucide-react";

const steps = [
  { id: 1, label: "Role" },
  { id: 2, label: "About" },
  { id: 3, label: "Done" },
];

const slideFade = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.2, 0, 0, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

export default function SetupProfileWizard({ userName, userEmail }) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const go = (n) => {
    setStep(n);
  };

  const submitFinal = async () => {
    setError("");
    if (pending) return;
    if (!title.trim() || !phone.trim()) {
      setError("Title and phone are required.");
      return;
    }
    setPending(true);
    try {
      const r = await fetch("/api/auth/setup/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), phone: phone.trim(), bio: bio.trim() }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(data.error || "Could not save profile.");
        return;
      }
      go(3);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="w-full">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center sm:text-left mb-10"
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/45">
          One-time setup
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-manrope tracking-tight mt-2">
          Your clinical profile
        </h1>
        <p className="text-sm text-foreground/55 mt-2 max-w-md mx-auto sm:mx-0">
          Patients and staff will see this on schedules and visit summaries. You
          can refine it anytime later.
        </p>
        <p className="text-xs text-foreground/40 mt-2">
          {userName} · {userEmail}
        </p>
      </motion.header>

      <div className="flex items-center justify-center gap-0 mb-8">
        {steps.map((s, i) => {
          const done = step === 3 || step > s.id;
          const active = step === s.id && step < 3;
          return (
            <div key={s.id} className="flex items-center">
              {i > 0 ? (
                <motion.div
                  className="h-px w-6 sm:w-10 bg-primary/[0.15] mx-1"
                  initial={false}
                  animate={{
                    scaleX: done ? 1 : 0.88,
                    opacity: done ? 0.5 : 0.35,
                  }}
                />
              ) : null}
              <div className="flex flex-col items-center gap-1.5 min-w-[3.5rem]">
                <motion.div
                  className={[
                    "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold font-manrope",
                    done
                      ? "bg-primary text-white"
                      : active
                        ? "bg-primary/15 text-primary ring-2 ring-primary/30"
                        : "bg-surface-high text-foreground/40",
                  ].join(" ")}
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                >
                  {done ? <Check size={16} /> : s.id}
                </motion.div>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider ${
                    active ? "text-primary" : "text-foreground/40"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="panel p-6 sm:p-8 min-h-[320px] relative overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="s1"
              variants={slideFade}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col gap-5"
            >
              <div className="flex items-center gap-2 text-primary">
                <Stethoscope size={18} />
                <span className="text-sm font-bold font-manrope">Professional title</span>
              </div>
              <p className="text-xs text-foreground/50 -mt-2">
                e.g. MD, General Practitioner, or how you want to appear to patients
              </p>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. MD, FRACGP"
                className="h-11 px-3 rounded-lg bg-surface-low border border-primary/[0.1] text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
              <div className="flex items-center gap-2 text-primary pt-2">
                <Phone size={18} />
                <span className="text-sm font-bold font-manrope">Direct phone</span>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Clinic or mobile number for care team"
                className="h-11 px-3 rounded-lg bg-surface-low border border-primary/[0.1] text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (!title.trim() || !phone.trim()) {
                    setError("Please add your title and phone.");
                    return;
                  }
                  setError("");
                  go(2);
                }}
                className="mt-2 h-12 rounded-xl bg-primary text-white text-sm font-semibold shadow-md shadow-primary/20 hover:bg-primary-container transition-colors"
              >
                Next
              </motion.button>
            </motion.div>
          ) : null}

          {step === 2 ? (
            <motion.div
              key="s2"
              variants={slideFade}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col gap-4"
            >
              <div className="flex items-center gap-2 text-primary">
                <FileText size={18} />
                <span className="text-sm font-bold font-manrope">Clinical focus (optional)</span>
              </div>
              <p className="text-xs text-foreground/50 -mt-1">
                A short line for the directory — special interests, languages, or care philosophy.
              </p>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={5}
                placeholder="E.g. Chronic disease, preventive care, and shared decision-making. Languages: English, Hindi."
                className="w-full px-3 py-2.5 rounded-lg bg-surface-low border border-primary/[0.1] text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-y min-h-[120px]"
              />
              {error ? (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              ) : null}
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    go(1);
                  }}
                  className="flex-1 h-12 rounded-xl border border-primary/[0.12] text-sm font-semibold text-foreground/80 hover:bg-surface-low transition-colors"
                >
                  Back
                </button>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  disabled={pending}
                  onClick={submitFinal}
                  className="flex-[2] h-12 rounded-xl bg-primary text-white text-sm font-semibold shadow-md shadow-primary/20 hover:bg-primary-container transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  {pending ? "Saving…" : "Complete profile"}
                  {!pending ? <Sparkles size={16} /> : null}
                </motion.button>
              </div>
            </motion.div>
          ) : null}

          {step === 3 ? (
            <motion.div
              key="s3"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="flex flex-col items-center text-center py-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1, stiffness: 500, damping: 24 }}
                className="w-16 h-16 rounded-full bg-secondary-container/50 text-secondary flex items-center justify-center mb-4"
              >
                <User size={32} />
              </motion.div>
              <h2 className="text-xl font-bold font-manrope">You&apos;re ready</h2>
              <p className="text-sm text-foreground/55 mt-2 max-w-sm">
                Your details are on file. Head to your dashboard to review today&apos;s
                schedule.
              </p>
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  window.location.assign("/dashboard/doctor");
                }}
                className="mt-8 h-12 px-8 rounded-xl bg-primary text-white text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary-container transition-colors"
              >
                Open dashboard
              </motion.button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
