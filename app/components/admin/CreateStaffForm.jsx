"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/components/toast/ToastProvider";

export default function CreateStaffForm() {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("DOCTOR");
  const [errors, setErrors] = useState({});
  const [pending, setPending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (pending) return;
    const nextErrors = {};
    const normalizedEmail = email.trim();
    if (!name.trim()) nextErrors.name = "Full name is required.";
    if (!normalizedEmail) nextErrors.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) nextErrors.email = "Enter a valid email.";
    if (!password) nextErrors.password = "Initial password is required.";
    else if (password.length < 8) nextErrors.password = "Use at least 8 characters.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setPending(true);
    try {
      const r = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        toast.error(data.error || "Could not create account.");
        return;
      }
      const roleLabel = data.user?.role === "ADMIN" ? "Admin" : "Doctor";
      if (data.emailWarning) {
        toast.success(`Created ${data.user?.name} (${roleLabel}).`);
        toast.error(`Welcome email could not be sent: ${data.emailWarning}`);
      } else {
        toast.success(
          `Created ${data.user?.name} (${roleLabel}). A welcome email with the temporary password and next steps was sent.`
        );
      }
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
          The new team member receives an email with the temporary password, sign-in link,
          and steps to set a new password. Keep the password confidential until they confirm access.
        </p>
      </div>

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
          onChange={(e) => {
            setName(e.target.value);
            setErrors((prev) => ({ ...prev, name: "" }));
          }}
          className={`h-10 px-3 rounded-lg bg-surface-lowest border text-sm outline-none focus:ring-2 ${
            errors.name
              ? "border-red-500 bg-red-50/50 focus:ring-red-500/25"
              : "border-primary/[0.12] focus:ring-primary/15"
          }`}
        />
        {errors.name ? <p className="text-xs text-red-600">{errors.name}</p> : null}
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
          onChange={(e) => {
            setEmail(e.target.value);
            setErrors((prev) => ({ ...prev, email: "" }));
          }}
          className={`h-10 px-3 rounded-lg bg-surface-lowest border text-sm outline-none focus:ring-2 ${
            errors.email
              ? "border-red-500 bg-red-50/50 focus:ring-red-500/25"
              : "border-primary/[0.12] focus:ring-primary/15"
          }`}
        />
        {errors.email ? <p className="text-xs text-red-600">{errors.email}</p> : null}
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
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors((prev) => ({ ...prev, password: "" }));
          }}
          className={`h-10 px-3 rounded-lg bg-surface-lowest border text-sm outline-none focus:ring-2 ${
            errors.password
              ? "border-red-500 bg-red-50/50 focus:ring-red-500/25"
              : "border-primary/[0.12] focus:ring-primary/15"
          }`}
        />
        <p className={`text-xs ${errors.password ? "text-red-600" : "text-foreground/45"}`}>
          {errors.password || "At least 8 characters."}
        </p>
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
