"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { useToast } from "@/app/components/toast/ToastProvider";

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
  ADMIN: "/admin/dashboard",
  DOCTOR: "/doctor/dashboard",
  PATIENT: "/patient/dashboard",
};

export default function SetupPasswordForm({ userRole }) {
  const toast = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [pending, setPending] = useState(false);
  const checks = [
    { label: "At least 8 characters", ok: newPassword.length >= 8 },
    { label: "Matches confirmation", ok: newPassword.length > 0 && newPassword === confirm },
    { label: "Different from current", ok: newPassword.length > 0 && newPassword !== currentPassword },
  ];

  const finishRedirect = () => {
    if (userRole === "DOCTOR") {
      window.location.assign("/dashboard/setup/profile");
    } else {
      window.location.assign(ROLE_HOME[userRole] ?? "/dashboard");
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!currentPassword) nextErrors.currentPassword = "Current password is required.";
    if (!newPassword) nextErrors.newPassword = "New password is required.";
    else if (newPassword.length < 8) nextErrors.newPassword = "Use at least 8 characters.";
    else if (newPassword === currentPassword) nextErrors.newPassword = "Use a different password.";
    if (!confirm) nextErrors.confirm = "Please confirm your new password.";
    else if (newPassword !== confirm) nextErrors.confirm = "New passwords do not match.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
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
        toast.error(data.error || "Could not update password.");
        return;
      }
      toast.success("Password updated.");
      finishRedirect();
    } finally {
      setPending(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
      className="w-full max-w-xl"
    >
      <div className="mb-7 text-center sm:text-left">
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
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                setErrors((prev) => ({ ...prev, currentPassword: "" }));
              }}
              className={`h-11 px-3 rounded-lg bg-surface-low border text-sm outline-none focus:ring-2 ${
                errors.currentPassword
                  ? "border-red-500 bg-red-50/50 focus:ring-red-500/25"
                  : "border-primary/[0.1] focus:ring-primary/20"
              }`}
            />
            {errors.currentPassword ? (
              <p className="text-xs text-red-600">{errors.currentPassword}</p>
            ) : null}
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
              onChange={(e) => {
                setNewPassword(e.target.value);
                setErrors((prev) => ({ ...prev, newPassword: "" }));
              }}
              className={`h-11 px-3 rounded-lg bg-surface-low border text-sm outline-none focus:ring-2 ${
                errors.newPassword
                  ? "border-red-500 bg-red-50/50 focus:ring-red-500/25"
                  : "border-primary/[0.1] focus:ring-primary/20"
              }`}
            />
            {errors.newPassword ? (
              <p className="text-xs text-red-600">{errors.newPassword}</p>
            ) : null}
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
              onChange={(e) => {
                setConfirm(e.target.value);
                setErrors((prev) => ({ ...prev, confirm: "" }));
              }}
              className={`h-11 px-3 rounded-lg bg-surface-low border text-sm outline-none focus:ring-2 ${
                errors.confirm
                  ? "border-red-500 bg-red-50/50 focus:ring-red-500/25"
                  : "border-primary/[0.1] focus:ring-primary/20"
              }`}
            />
            {errors.confirm ? <p className="text-xs text-red-600">{errors.confirm}</p> : null}
          </motion.div>
        </motion.div>

        <div className="mt-4 flex flex-wrap gap-2">
          {checks.map((check) => (
            <span
              key={check.label}
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
                check.ok
                  ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                  : "bg-surface-low text-foreground/55 border-primary/[0.1]"
              }`}
            >
              {check.label}
            </span>
          ))}
        </div>

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
    </motion.section>
  );
}
