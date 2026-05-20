"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Camera, Loader2, Trash2, User } from "lucide-react";
import { useToast } from "@/app/components/toast/ToastProvider";
import { FormAlert, FORM_ERROR_KEY } from "@/app/components/forms/FormField";
import { errorsFromApiResponse } from "@/lib/forms/validate";
import { UserAvatar } from "./UserAvatar";
import { profilePatchPayload } from "@/lib/profile/constants";
import { AU_STATE_OPTIONS, GENDER_OPTIONS } from "@/lib/profile/patient-options";

function Field({ label, error, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-foreground/60">{label}</span>
      {children}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </label>
  );
}

const inputClass =
  "h-11 rounded-lg bg-surface-low border border-primary/[0.1] px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20";

const selectClass = `${inputClass} w-full`;

/**
 * @param {{ role: "DOCTOR" | "PATIENT"; initialProfile: object }} props
 */
export function ProfileSettingsForm({ role, initialProfile }) {
  const router = useRouter();
  const toast = useToast();
  const fileRef = useRef(null);
  const [profile, setProfile] = useState(initialProfile);
  const [fieldErrors, setFieldErrors] = useState({});
  const [photoError, setPhotoError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState(() => ({
    name: initialProfile.name ?? "",
    phone: initialProfile.phone ?? "",
    title: initialProfile.title ?? "",
    bio: initialProfile.bio ?? "",
    specialty: initialProfile.specialty ?? "",
    department: initialProfile.department ?? "",
    dateOfBirth: initialProfile.dateOfBirth ?? "",
    gender: initialProfile.gender ?? "",
    addressLine1: initialProfile.addressLine1 ?? "",
    addressLine2: initialProfile.addressLine2 ?? "",
    city: initialProfile.city ?? "",
    state: initialProfile.state ?? "",
    postalCode: initialProfile.postalCode ?? "",
    emergencyContactName: initialProfile.emergencyContactName ?? "",
    emergencyContactPhone: initialProfile.emergencyContactPhone ?? "",
  }));

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const save = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setFieldErrors({});
    try {
      const r = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profilePatchPayload(role, form)),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setFieldErrors(errorsFromApiResponse(data, "Could not save profile."));
        return;
      }
      setProfile(data.profile);
      router.refresh();
      toast.success("Profile saved.");
    } finally {
      setSaving(false);
    }
  };

  const onPickPhoto = () => fileRef.current?.click();

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setPhotoError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const r = await fetch("/api/me/profile/avatar", { method: "POST", body });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setPhotoError(data.error || "Could not upload photo.");
        return;
      }
      setProfile(data.profile);
      router.refresh();
      toast.success("Photo updated.");
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async () => {
    if (uploading) return;
    setUploading(true);
    setPhotoError("");
    try {
      const r = await fetch("/api/me/profile/avatar", { method: "DELETE" });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setPhotoError(data.error || "Could not remove photo.");
        return;
      }
      setProfile(data.profile);
      router.refresh();
      toast.success("Photo removed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <UserAvatar
            name={profile.name}
            avatarUrl={profile.avatarUrl}
            className="w-20 h-20 rounded-full text-lg"
            textClassName="text-lg"
          />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/45">
              Profile photo
            </p>
            <p className="text-xs text-foreground/50 mt-1">JPEG, PNG, or WebP · max 5 MB</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onPickPhoto}
                disabled={uploading}
                className="h-9 px-3 rounded-lg bg-primary text-white text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                {uploading ? "Uploading…" : "Upload"}
              </button>
              {profile.avatarUrl ? (
                <button
                  type="button"
                  onClick={removePhoto}
                  disabled={uploading}
                  className="h-9 px-3 rounded-lg border border-primary/[0.12] text-xs font-semibold text-foreground/70 inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              ) : null}
            </div>
            {photoError ? (
              <p className="mt-2 text-xs text-red-600" role="alert">
                {photoError}
              </p>
            ) : null}
          </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={onFileChange}
      />

      <form onSubmit={save} className="panel p-6 flex flex-col gap-6" noValidate>
        <FormAlert message={fieldErrors[FORM_ERROR_KEY]} />

        <div className="flex items-center gap-2 text-foreground/45">
          <User size={16} />
          <p className="text-[11px] font-bold uppercase tracking-widest">Account details</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full name" error={fieldErrors.name}>
            <input
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              className={`${inputClass} ${fieldErrors.name ? "border-red-500" : ""}`}
              autoComplete="name"
            />
          </Field>
          <Field label="Email" error={undefined}>
            <input
              value={profile.email}
              readOnly
              className={`${inputClass} bg-surface-lowest text-foreground/55 cursor-not-allowed`}
            />
          </Field>
          <Field label="Phone" error={fieldErrors.phone}>
            <input
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              className={`${inputClass} ${fieldErrors.phone ? "border-red-500" : ""}`}
              autoComplete="tel"
            />
          </Field>
        </div>

        {role === "DOCTOR" ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Professional title" error={fieldErrors.title}>
                <input
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  className={`${inputClass} ${fieldErrors.title ? "border-red-500" : ""}`}
                  placeholder="e.g. General Practitioner"
                />
              </Field>
              <Field label="Specialty" error={fieldErrors.specialty}>
                <input
                  value={form.specialty}
                  onChange={(e) => setField("specialty", e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Family medicine"
                />
              </Field>
              <Field label="Department" error={fieldErrors.department}>
                <input
                  value={form.department}
                  onChange={(e) => setField("department", e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Primary care"
                />
              </Field>
            </div>
            <Field label="Bio" error={fieldErrors.bio}>
              <textarea
                value={form.bio}
                onChange={(e) => setField("bio", e.target.value)}
                rows={4}
                className={`${inputClass} min-h-[6rem] py-2 resize-y`}
                placeholder="Short summary for patients"
              />
            </Field>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Date of birth" error={fieldErrors.dateOfBirth}>
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => setField("dateOfBirth", e.target.value)}
                  className={`${inputClass} ${fieldErrors.dateOfBirth ? "border-red-500" : ""}`}
                />
              </Field>
              <Field label="Gender" error={fieldErrors.gender}>
                <select
                  value={form.gender}
                  onChange={(e) => setField("gender", e.target.value)}
                  className={`${selectClass} ${fieldErrors.gender ? "border-red-500" : ""}`}
                >
                  <option value="">Select gender</option>
                  {GENDER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Address line 1" error={fieldErrors.addressLine1}>
                <input
                  value={form.addressLine1}
                  onChange={(e) => setField("addressLine1", e.target.value)}
                  className={inputClass}
                  autoComplete="address-line1"
                />
              </Field>
              <Field label="Address line 2" error={fieldErrors.addressLine2}>
                <input
                  value={form.addressLine2}
                  onChange={(e) => setField("addressLine2", e.target.value)}
                  className={inputClass}
                  autoComplete="address-line2"
                />
              </Field>
              <Field label="City" error={fieldErrors.city}>
                <input
                  value={form.city}
                  onChange={(e) => setField("city", e.target.value)}
                  className={inputClass}
                  autoComplete="address-level2"
                />
              </Field>
              <Field label="State / territory" error={fieldErrors.state}>
                <select
                  value={form.state}
                  onChange={(e) => setField("state", e.target.value)}
                  className={`${selectClass} ${fieldErrors.state ? "border-red-500" : ""}`}
                  autoComplete="address-level1"
                >
                  <option value="">Select state</option>
                  {AU_STATE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Postal code" error={fieldErrors.postalCode}>
                <input
                  value={form.postalCode}
                  onChange={(e) => setField("postalCode", e.target.value)}
                  className={inputClass}
                  autoComplete="postal-code"
                />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Emergency contact name" error={fieldErrors.emergencyContactName}>
                <input
                  value={form.emergencyContactName}
                  onChange={(e) => setField("emergencyContactName", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Emergency contact phone" error={fieldErrors.emergencyContactPhone}>
                <input
                  value={form.emergencyContactPhone}
                  onChange={(e) => setField("emergencyContactPhone", e.target.value)}
                  className={inputClass}
                  autoComplete="tel"
                />
              </Field>
            </div>
          </>
        )}

        <motion.button
          type="submit"
          disabled={saving}
          whileTap={{ scale: 0.98 }}
          className="h-11 rounded-xl bg-primary text-white text-sm font-semibold shadow-sm shadow-primary/20 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save profile"}
        </motion.button>
      </form>
    </div>
  );
}
