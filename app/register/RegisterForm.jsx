"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Activity, ArrowRight, Check, Lock, Mail, Shield, UserRound } from "lucide-react";
import { useToast } from "@/app/components/toast/ToastProvider";

const fieldClass = (hasError) =>
  `w-full h-11 px-3.5 rounded-lg border text-sm transition-colors outline-none focus:ring-2 bg-surface-lowest ${
    hasError
      ? "border-red-400/80 bg-red-50/50 focus:ring-red-500/25 focus:border-red-400"
      : "border-primary/[0.12] focus:border-primary/30 focus:ring-primary/15"
  }`;

export default function RegisterForm() {
  const router = useRouter();
  const toast = useToast();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const loginHref = useMemo(() => {
    const n = searchParams.get("next");
    return n ? `/login?next=${encodeURIComponent(n)}` : "/login";
  }, [searchParams]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const pwdStrength =
    formData.password.length >= 12
      ? { label: "Strong", tone: "text-emerald-700", bar: "w-full bg-emerald-500" }
      : formData.password.length >= 8
        ? { label: "Good", tone: "text-primary", bar: "w-3/4 bg-primary" }
        : formData.password.length > 0
          ? { label: "Too short", tone: "text-amber-700", bar: "w-1/3 bg-amber-500" }
          : null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    const { name, email, password, confirmPassword } = formData;
    const nextErrors = {};

    if (!name.trim()) nextErrors.name = "Full name is required.";
    if (!email.trim()) nextErrors.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) nextErrors.email = "Enter a valid email.";
    if (!password) nextErrors.password = "Password is required.";
    else if (password.length < 8) nextErrors.password = "Use at least 8 characters.";
    if (!confirmPassword) nextErrors.confirmPassword = "Please confirm your password.";
    else if (password !== confirmPassword) nextErrors.confirmPassword = "Passwords do not match.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.ok) {
          throw new Error(data?.error || "Registration failed.");
        }
        window.dispatchEvent(new Event("auth-changed"));
        router.push(next);
        router.refresh();
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Registration failed.");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col bg-surface relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_480px_at_15%_-10%,rgba(0,72,141,0.11),transparent_55%),radial-gradient(700px_400px_at_100%_20%,rgba(0,106,106,0.08),transparent_50%)]"
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
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/45">Patient access</p>
              <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold font-manrope tracking-tight text-foreground">
                Create your account
              </h1>
              <p className="mt-2 text-sm text-foreground/55 leading-relaxed max-w-sm">
                Book visits, message your care team, and keep your health information in one secure place.
              </p>
            </div>

            <ul className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] font-semibold text-foreground/50">
              <li className="inline-flex items-center gap-1.5">
                <Check size={12} className="text-secondary shrink-0" aria-hidden />
                Free to join
              </li>
              <li className="inline-flex items-center gap-1.5">
                <Shield size={12} className="text-primary shrink-0" aria-hidden />
                Encrypted sign-in
              </li>
            </ul>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="reg-name" className="block text-xs font-bold uppercase tracking-wider text-foreground/45 mb-1.5">
                  Full name
                </label>
                <div className="relative">
                  <UserRound
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/35 pointer-events-none"
                    aria-hidden
                  />
                  <input
                    id="reg-name"
                    type="text"
                    name="name"
                    autoComplete="name"
                    placeholder="e.g. Jordan Lee"
                    className={`${fieldClass(Boolean(errors.name))} pl-10`}
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                {errors.name ? <p className="mt-1.5 text-xs text-red-600">{errors.name}</p> : null}
              </div>

              <div>
                <label htmlFor="reg-email" className="block text-xs font-bold uppercase tracking-wider text-foreground/45 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/35 pointer-events-none"
                    aria-hidden
                  />
                  <input
                    id="reg-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={`${fieldClass(Boolean(errors.email))} pl-10`}
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                {errors.email ? <p className="mt-1.5 text-xs text-red-600">{errors.email}</p> : null}
              </div>

              <div>
                <label htmlFor="reg-password" className="block text-xs font-bold uppercase tracking-wider text-foreground/45 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/35 pointer-events-none"
                    aria-hidden
                  />
                  <input
                    id="reg-password"
                    type="password"
                    name="password"
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    className={`${fieldClass(Boolean(errors.password))} pl-10`}
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                {errors.password ? (
                  <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>
                ) : pwdStrength ? (
                  <div className="mt-2 space-y-1">
                    <div className="h-1 rounded-full bg-surface-low overflow-hidden border border-primary/[0.06]">
                      <div className={`h-full rounded-full transition-all duration-300 ${pwdStrength.bar}`} />
                    </div>
                    <p className={`text-[11px] font-semibold ${pwdStrength.tone}`}>{pwdStrength.label}</p>
                  </div>
                ) : (
                  <p className="mt-1.5 text-[11px] text-foreground/45">Use 8+ characters; 12+ is stronger.</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="reg-confirm"
                  className="block text-xs font-bold uppercase tracking-wider text-foreground/45 mb-1.5"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/35 pointer-events-none"
                    aria-hidden
                  />
                  <input
                    id="reg-confirm"
                    type="password"
                    name="confirmPassword"
                    autoComplete="new-password"
                    placeholder="Re-enter password"
                    className={`${fieldClass(Boolean(errors.confirmPassword))} pl-10`}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
                {errors.confirmPassword ? (
                  <p className="mt-1.5 text-xs text-red-600">{errors.confirmPassword}</p>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group w-full h-12 rounded-xl bg-primary text-white text-sm font-semibold shadow-md shadow-primary/20 hover:bg-primary-container transition-colors disabled:opacity-55 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {loading ? (
                  "Creating account…"
                ) : (
                  <>
                    Create account
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-foreground/50 leading-relaxed">
              New accounts are <span className="font-semibold text-foreground/65">patients</span> only. Clinic staff are
              invited by an administrator.
            </p>

            <p className="mt-5 text-center text-sm text-foreground/60">
              Already registered?{" "}
              <Link href={loginHref} className="font-semibold text-primary hover:text-primary-container transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
