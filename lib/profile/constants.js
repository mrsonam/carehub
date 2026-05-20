export const MAX_NAME = 120;
export const MAX_PHONE = 32;
export const MAX_TITLE = 80;
export const MAX_BIO = 2000;
export const MAX_LINE = 120;
export const MAX_STATE = 64;
export const MAX_POSTAL = 24;

export const DOCTOR_PATCH_KEYS = ["name", "phone", "title", "bio", "specialty", "department"];
export const PATIENT_PATCH_KEYS = [
  "name",
  "phone",
  "dateOfBirth",
  "gender",
  "addressLine1",
  "addressLine2",
  "city",
  "state",
  "postalCode",
  "emergencyContactName",
  "emergencyContactPhone",
];

/** @param {"DOCTOR"|"PATIENT"} role @param {Record<string, unknown>} form */
export function profilePatchPayload(role, form) {
  const keys = role === "DOCTOR" ? DOCTOR_PATCH_KEYS : PATIENT_PATCH_KEYS;
  return Object.fromEntries(keys.map((key) => [key, form[key]]));
}
