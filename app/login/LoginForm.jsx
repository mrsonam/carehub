"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Activity, ArrowRight, Check, LayoutDashboard, Lock, Mail, Shield } from "lucide-react";
import { useToast } from "@/app/components/toast/ToastProvider";

const fieldClass = (hasError) =>
  `w-full h-11 px-3.5 rounded-lg border text-sm transition-colors outline-none focus:ring-2 bg-surface-lowest ${
    hasError
      ? "border-red-400/80 bg-red-50/50 focus:ring-red-500/25 focus:border-red-400"
      : "border-primary/[0.12] focus:border-primary/30 focus:ring-primary/15"
  }`;

export default function LoginForm() {
  const router = useRouter();
  const toast = useToast();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const registerHref = useMemo(() => {
    const n = searchParams.get("next");
    return n ? `/register?next=${encodeURIComponent(n)}` : "/register";
  }, [searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) nextErrors.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) nextErrors.email = "Enter a valid email.";
    if (!password) nextErrors.password = "Password is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalizedEmail, password }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.ok) {
          throw new Error(data?.error || "Login failed.");
        }
        window.dispatchEvent(new Event("auth-changed"));
        router.push(next);
        router.refresh();
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Login failed.");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col bg-surface relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_480px_at_85%_-10%,rgba(0,72,141,0.11),transparent_55%),radial-gradient(700px_400px_at_0%_25%,rgba(0,106,106,0.08),transparent_50%)]"
        aria-hidden
      />

      <main className="relative flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
          className="w-full max-w-[440px]"
        >
          <div className="rounded-[1.35rem] border border-primary/[0.1] bg-surface-lowest/95 shadow-[0_4px_24px_-8px_rgba(0,72,141,0.12),0_1px_2px_rgba(16,24,40,0.04)] backdrop-blur-sm px-6 py-8 sm:px-9 sm:py-10">
            <div className="flex flex-col items-center text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl border border-primary/[0.1] bg-primary/5 px-3 py-2 text-primary hover:bg-primary/10 transition-colors mb-5"
              >
                <span className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm shadow-primary/25">
                  <Activity size={18} aria-hidden />
                </span>
                <span className="font-bold font-manrope text-lg tracking-tight">CareHub</span>
              </Link>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/45">Welcome back</p>
              <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold font-manrope tracking-tight text-foreground">
                Sign in
              </h1>
              <p className="mt-2 text-sm text-foreground/55 leading-relaxed max-w-sm">
                Use the email and password for your patient, doctor, or admin account. We will take you to
                the right dashboard after sign-in.
              </p>
            </div>

            <ul className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] font-semibold text-foreground/50">
              <li className="inline-flex items-center gap-1.5">
                <Shield size={12} className="text-primary shrink-0" aria-hidden />
                Secure session
              </li>
              <li className="inline-flex items-center gap-1.5">
                <LayoutDashboard size={12} className="text-secondary shrink-0" aria-hidden />
                Role-aware home
              </li>
              <li className="inline-flex items-center gap-1.5">
                <Check size={12} className="text-emerald-600 shrink-0" aria-hidden />
                Built for care teams
              </li>
            </ul>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="login-email" className="block text-xs font-bold uppercase tracking-wider text-foreground/45 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/35 pointer-events-none"
                    aria-hidden
                  />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={`${fieldClass(Boolean(errors.email))} pl-10`}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors((prev) => ({ ...prev, email: "" }));
                    }}
                    required
                  />
                </div>
                {errors.email ? <p className="mt-1.5 text-xs text-red-600">{errors.email}</p> : null}
              </div>

              <div>
                <label htmlFor="login-password" className="block text-xs font-bold uppercase tracking-wider text-foreground/45 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/35 pointer-events-none"
                    aria-hidden
                  />
                  <input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Your password"
                    className={`${fieldClass(Boolean(errors.password))} pl-10`}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, password: "" }));
                    }}
                    required
                  />
                </div>
                {errors.password ? (
                  <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>
                ) : (
                  <p className="mt-1.5 text-[11px] text-foreground/45">
                    First time here?{" "}
                    <Link href={registerHref} className="font-semibold text-primary hover:text-primary-container">
                      Create an account
                    </Link>{" "}
                    as a patient.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group w-full h-12 rounded-xl bg-primary text-white text-sm font-semibold shadow-md shadow-primary/20 hover:bg-primary-container transition-colors disabled:opacity-55 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {loading ? (
                  "Signing in…"
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-foreground/50 leading-relaxed">
              Staff accounts are created by your clinic administrator. If you were invited, use the email
              from that invite.
            </p>

            <p className="mt-5 text-center text-sm text-foreground/60">
              New to CareHub?{" "}
              <Link href={registerHref} className="font-semibold text-primary hover:text-primary-container transition-colors">
                Register as a patient
              </Link>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
