"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateStaffForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("DOCTOR");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (pending) return;
    setError("");
    setSuccess("");
    setPending(true);
    try {
      const r = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(data.error || "Could not create account.");
        return;
      }
      setSuccess(
        `Created ${data.user?.name} (${data.user?.role === "ADMIN" ? "Admin" : "Doctor"}). They can sign in with this email.`
      );
      setName("");
      setEmail("");
      setPassword("");
      setRole("DOCTOR");
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="panel p-6 flex flex-col gap-5 max-w-lg"
    >
      <div>
        <h2 className="text-lg font-bold font-manrope">Create staff account</h2>
        <p className="text-sm text-foreground/55 mt-1">
          New admins and doctors receive a password you set; share it securely. They
          should sign in and change it when your clinic enables that.
        </p>
      </div>

      {error ? (
        <p
          className="text-sm text-red-600 bg-red-50 border border-red-200/80 rounded-lg px-3 py-2"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {success ? (
        <p
          className="text-sm text-secondary bg-secondary-container/30 border border-secondary/20 rounded-lg px-3 py-2"
          role="status"
        >
          {success}
        </p>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="staff-name" className="text-xs font-bold uppercase tracking-widest text-foreground/45">
          Full name
        </label>
        <input
          id="staff-name"
          name="name"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-10 px-3 rounded-lg bg-surface-lowest border border-primary/[0.12] text-sm outline-none focus:ring-2 focus:ring-primary/15"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="staff-email" className="text-xs font-bold uppercase tracking-widest text-foreground/45">
          Email
        </label>
        <input
          id="staff-email"
          name="email"
          type="email"
          required
          autoComplete="off"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10 px-3 rounded-lg bg-surface-lowest border border-primary/[0.12] text-sm outline-none focus:ring-2 focus:ring-primary/15"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="staff-password" className="text-xs font-bold uppercase tracking-widest text-foreground/45">
          Initial password
        </label>
        <input
          id="staff-password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-10 px-3 rounded-lg bg-surface-lowest border border-primary/[0.12] text-sm outline-none focus:ring-2 focus:ring-primary/15"
        />
        <p className="text-xs text-foreground/45">At least 8 characters.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-bold uppercase tracking-widest text-foreground/45">
          Role
        </span>
        <div className="flex gap-4">
          <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="role"
              value="DOCTOR"
              checked={role === "DOCTOR"}
              onChange={() => setRole("DOCTOR")}
              className="text-primary"
            />
            Doctor
          </label>
          <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="role"
              value="ADMIN"
              checked={role === "ADMIN"}
              onChange={() => setRole("ADMIN")}
              className="text-primary"
            />
            Administrator
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="h-10 px-4 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-container transition-colors disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create account"}
      </button>
    </form>
  );
}
