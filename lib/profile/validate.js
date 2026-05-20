import {
  DOCTOR_PATCH_KEYS,
  MAX_BIO,
  MAX_LINE,
  MAX_NAME,
  MAX_PHONE,
  MAX_POSTAL,
  MAX_TITLE,
  PATIENT_PATCH_KEYS,
} from "./constants.js";
import { AU_STATE_VALUES, GENDER_VALUES } from "./patient-options.js";

function trimOrNull(value) {
  if (value == null) return null;
  const s = String(value).trim();
  return s === "" ? null : s;
}

function trimRequired(value, field, errors) {
  const s = trimOrNull(value);
  if (!s) errors[field] = "This field is required.";
  return s;
}

function maxLen(value, max, field, errors) {
  if (value && value.length > max) {
    errors[field] = `Must be ${max} characters or fewer.`;
  }
}

function parseDateOfBirth(raw) {
  if (raw == null || raw === "") return null;
  const s = String(raw).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return { error: "Use YYYY-MM-DD format." };
  const d = new Date(`${s}T12:00:00`);
  if (Number.isNaN(d.getTime())) return { error: "Invalid date." };
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (d > today) return { error: "Date of birth cannot be in the future." };
  const min = new Date();
  min.setFullYear(min.getFullYear() - 120);
  if (d < min) return { error: "Date of birth is too far in the past." };
  return { value: d };
}

export function patientProfileComplete(data) {
  return Boolean(
    data.dateOfBirth &&
      data.addressLine1 &&
      data.city &&
      data.state &&
      data.postalCode
  );
}

/**
 * @param {"DOCTOR"|"PATIENT"} role
 * @param {Record<string, unknown>} body
 * @returns {{ ok: true, data: object } | { ok: false, errors: Record<string, string> }}
 */
export function validateProfilePatch(role, body) {
  const errors = {};
  const allowed = role === "DOCTOR" ? DOCTOR_PATCH_KEYS : PATIENT_PATCH_KEYS;

  for (const key of Object.keys(body ?? {})) {
    if (!allowed.includes(key)) {
      return { ok: false, errors: { _: "Unknown field in request." } };
    }
  }

  const data = {};

  if (role === "DOCTOR") {
    data.name = trimRequired(body.name, "name", errors);
    data.phone = trimRequired(body.phone, "phone", errors);
    data.title = trimRequired(body.title, "title", errors);
    data.bio = trimOrNull(body.bio);
    data.specialty = trimOrNull(body.specialty);
    data.department = trimOrNull(body.department);

    maxLen(data.name, MAX_NAME, "name", errors);
    maxLen(data.phone, MAX_PHONE, "phone", errors);
    maxLen(data.title, MAX_TITLE, "title", errors);
    maxLen(data.bio, MAX_BIO, "bio", errors);
    maxLen(data.specialty, MAX_LINE, "specialty", errors);
    maxLen(data.department, MAX_LINE, "department", errors);
  } else {
    data.name = trimRequired(body.name, "name", errors);
    data.phone = trimOrNull(body.phone);
    maxLen(data.name, MAX_NAME, "name", errors);
    maxLen(data.phone, MAX_PHONE, "phone", errors);

    const dob = parseDateOfBirth(body.dateOfBirth);
    if (dob?.error) errors.dateOfBirth = dob.error;
    else data.dateOfBirth = dob?.value ?? null;

    const gender = trimOrNull(body.gender);
    if (gender && !GENDER_VALUES.has(gender)) {
      errors.gender = "Select a valid option.";
    } else {
      data.gender = gender;
    }

    data.addressLine1 = trimOrNull(body.addressLine1);
    data.addressLine2 = trimOrNull(body.addressLine2);
    data.city = trimOrNull(body.city);
    const state = trimOrNull(body.state);
    if (state && !AU_STATE_VALUES.has(state)) {
      errors.state = "Select a valid state or territory.";
    } else {
      data.state = state;
    }
    data.postalCode = trimOrNull(body.postalCode);
    data.emergencyContactName = trimOrNull(body.emergencyContactName);
    data.emergencyContactPhone = trimOrNull(body.emergencyContactPhone);

    maxLen(data.addressLine1, MAX_LINE, "addressLine1", errors);
    maxLen(data.addressLine2, MAX_LINE, "addressLine2", errors);
    maxLen(data.city, MAX_LINE, "city", errors);
    maxLen(data.postalCode, MAX_POSTAL, "postalCode", errors);
    maxLen(data.emergencyContactName, MAX_NAME, "emergencyContactName", errors);
    maxLen(data.emergencyContactPhone, MAX_PHONE, "emergencyContactPhone", errors);

    const ecName = data.emergencyContactName;
    const ecPhone = data.emergencyContactPhone;
    if (ecName && !ecPhone) errors.emergencyContactPhone = "Phone is required when a contact name is set.";
    if (ecPhone && !ecName) errors.emergencyContactName = "Name is required when a contact phone is set.";

    if (patientProfileComplete(data)) {
      data.profileCompletedAt = new Date();
    }
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data };
}
