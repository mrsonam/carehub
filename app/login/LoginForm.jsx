"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
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
        setMessage(err instanceof Error ? err.message : "Login failed.");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="grid w-full max-w-5xl grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-10">
          {/* Form column */}
          <div className="mx-auto w-full max-w-md rounded-xl bg-surface-lowest p-8 shadow-lg lg:mx-0">
            <div className="mb-6 text-center">
              <span className="mb-3 inline-flex rounded-full bg-primary/5 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                CareHub
              </span>
              <h1 className="mb-2 text-3xl font-extrabold font-manrope text-foreground">Sign In</h1>
              <p className="text-sm text-foreground/60">Welcome back to Healthcare Booking</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-foreground/80">Email</span>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full rounded-lg border border-outline-variant/40 bg-surface-lowest px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-foreground/80">Password</span>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full rounded-lg border border-outline-variant/40 bg-surface-lowest px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-primary px-4 py-3 font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {message && <p className="mt-4 text-center text-sm text-red-600">{message}</p>}

            <p className="mt-5 text-center text-sm text-foreground/70">
              Don’t have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-primary transition hover:text-primary-container"
              >
                Register
              </Link>
            </p>
          </div>

          {/* Image column (desktop only) */}
          <div className="hidden lg:flex">
            <div className="w-full rounded-xl bg-primary/5 p-6 shadow-lg">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-surface-lowest">
                <img
                  src="/clinic-office.png"
                  alt="Healthcare illustration"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="mt-4 text-left">
                <p className="text-sm font-bold text-foreground/80">Trusted, digital-first care</p>
                <p className="mt-1 text-sm text-foreground/60">
                  Secure login and appointment access in seconds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

