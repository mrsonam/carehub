"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");

    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password || !confirmPassword) {
      setMessage("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
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
        setMessage(err instanceof Error ? err.message : "Registration failed.");
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
              <h1 className="mb-2 text-3xl font-extrabold font-manrope text-foreground">Create an Account</h1>
              <p className="text-sm text-foreground/60">
                Join CareHub to manage your healthcare services
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                className="w-full rounded-lg border border-outline-variant/40 bg-surface-lowest px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                className="w-full rounded-lg border border-outline-variant/40 bg-surface-lowest px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full rounded-lg border border-outline-variant/40 bg-surface-lowest px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                className="w-full rounded-lg border border-outline-variant/40 bg-surface-lowest px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-primary px-4 py-3 font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Register"}
              </button>
            </form>

            {message && <p className="mt-4 text-center text-sm text-red-600">{message}</p>}

            <p className="mt-5 text-center text-sm text-foreground/70">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-primary transition hover:text-primary-container">
                Sign In
              </Link>
            </p>
          </div>

          {/* Image column (desktop only) */}
          <div className="hidden lg:flex">
            <div className="w-full rounded-xl bg-primary/5 p-6 shadow-lg">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-surface-lowest">
                <img
                  src="/auth-illustration.svg"
                  alt="Healthcare illustration"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="mt-4 text-left">
                <p className="text-sm font-bold text-foreground/80">Fast setup, better care</p>
                <p className="mt-1 text-sm text-foreground/60">
                  Create your account and start booking instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

