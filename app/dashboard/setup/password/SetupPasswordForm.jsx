"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowRight, ShieldCheck } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.2, 0, 0, 1] } },
};

const ROLE_HOME = {
  ADMIN: "/dashboard/admin",
  DOCTOR: "/dashboard/doctor",
  PATIENT: "/dashboard/patient",
};

export default function SetupPasswordForm({ userRole }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const finishRedirect = () => {
    if (userRole === "DOCTOR") {
      window.location.assign("/dashboard/setup/profile");
    } else {
      window.location.assign(ROLE_HOME[userRole] ?? "/dashboard");
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirm) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Use at least 8 characters for your new password.");
      return;
    }
    if (pending) return;
    setPending(true);
    try {
      const r = await fetch("/api/auth/setup/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(data.error || "Could not update password.");
        return;
      }
      finishRedirect();
    } finally {
      setPending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
      className="w-full"
    >
      <div className="mb-8 text-center sm:text-left">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="inline-flex w-14 h-14 rounded-2xl bg-primary/10 text-primary items-center justify-center mb-4"
        >
          <Lock size={26} />
        </motion.div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-manrope tracking-tight">
          Set a new password
        </h1>
        <p className="text-sm text-foreground/55 mt-2 max-w-md">
          Your administrator shared a temporary password. Replace it with a
          strong one you haven&apos;t used elsewhere.
        </p>
        <p className="text-xs text-foreground/45 mt-3 inline-flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-secondary shrink-0" />
          This window uses the same security standard as the rest of CareHub.
        </p>
      </div>

      <form onSubmit={submit} className="panel p-6 sm:p-8">
        <motion.div
          className="flex flex-col gap-5"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item} className="flex flex-col gap-1.5">
            <label
              htmlFor="cur-pw"
              className="text-xs font-bold uppercase tracking-[0.16em] text-foreground/45"
            >
              Current password
            </label>
            <input
              id="cur-pw"
              type="password"
              required
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="h-11 px-3 rounded-lg bg-surface-low border border-primary/[0.1] text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </motion.div>
          <motion.div variants={item} className="flex flex-col gap-1.5">
            <label
              htmlFor="new-pw"
              className="text-xs font-bold uppercase tracking-[0.16em] text-foreground/45"
            >
              New password
            </label>
            <input
              id="new-pw"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-11 px-3 rounded-lg bg-surface-low border border-primary/[0.1] text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </motion.div>
          <motion.div variants={item} className="flex flex-col gap-1.5">
            <label
              htmlFor="new-pw2"
              className="text-xs font-bold uppercase tracking-[0.16em] text-foreground/45"
            >
              Confirm new password
            </label>
            <input
              id="new-pw2"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="h-11 px-3 rounded-lg bg-surface-low border border-primary/[0.1] text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </motion.div>
        </motion.div>

        {error ? (
          <p
            className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200/80 rounded-lg px-3 py-2"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <motion.button
          type="submit"
          disabled={pending}
          whileTap={{ scale: 0.98 }}
          className="mt-8 w-full h-12 rounded-xl bg-primary text-white text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary-container transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
        >
          {pending ? "Saving…" : "Continue"}
          {!pending ? <ArrowRight size={16} /> : null}
        </motion.button>
      </form>
    </motion.div>
  );
}
