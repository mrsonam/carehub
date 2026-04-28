"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/app/components/toast/ToastProvider";

export default function RegisterForm() {
  const router = useRouter();
  const toast = useToast();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
    <div className="flex min-h-screen flex-col bg-gray-50">
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-2">Create an Account</h1>
          <p className="text-gray-600 text-center mb-6">Join CareHub to manage your healthcare services</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className={`w-full p-3 border rounded-lg outline-none focus:ring-2 ${
                errors.name
                  ? "border-red-500 bg-red-50/60 focus:ring-red-500/25"
                  : "border-primary/[0.15] focus:ring-primary/20"
              }`}
              value={formData.name}
              onChange={handleChange}
              required
            />
            {errors.name ? <p className="text-xs text-red-600 -mt-2">{errors.name}</p> : null}

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              className={`w-full p-3 border rounded-lg outline-none focus:ring-2 ${
                errors.email
                  ? "border-red-500 bg-red-50/60 focus:ring-red-500/25"
                  : "border-primary/[0.15] focus:ring-primary/20"
              }`}
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email ? <p className="text-xs text-red-600 -mt-2">{errors.email}</p> : null}

            <input
              type="password"
              name="password"
              placeholder="Password"
              className={`w-full p-3 border rounded-lg outline-none focus:ring-2 ${
                errors.password
                  ? "border-red-500 bg-red-50/60 focus:ring-red-500/25"
                  : "border-primary/[0.15] focus:ring-primary/20"
              }`}
              value={formData.password}
              onChange={handleChange}
              required
            />
            {errors.password ? (
              <p className="text-xs text-red-600 -mt-2">{errors.password}</p>
            ) : null}

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className={`w-full p-3 border rounded-lg outline-none focus:ring-2 ${
                errors.confirmPassword
                  ? "border-red-500 bg-red-50/60 focus:ring-red-500/25"
                  : "border-primary/[0.15] focus:ring-primary/20"
              }`}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            {errors.confirmPassword ? (
              <p className="text-xs text-red-600 -mt-2">{errors.confirmPassword}</p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="text-center text-sm mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

