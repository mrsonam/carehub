/** Key for form-level (non-field) errors shown above the submit button. */
export const FORM_ERROR_KEY = "_form";

export function isValidEmail(value) {
  return /^\S+@\S+\.\S+$/.test(String(value ?? "").trim());
}

/** @returns {string | null} */
export function validateRequired(value, message = "This field is required.") {
  return String(value ?? "").trim() ? null : message;
}

/** @returns {string | null} */
export function validateEmail(value) {
  const required = validateRequired(value, "Email is required.");
  if (required) return required;
  return isValidEmail(value) ? null : "Enter a valid email address.";
}

/** @returns {string | null} */
export function validatePassword(value, minLength = 8) {
  const required = validateRequired(value, "Password is required.");
  if (required) return required;
  if (String(value).length < minLength) {
    return `Use at least ${minLength} characters.`;
  }
  return null;
}

/** @returns {string | null} */
export function validateMessage(value, maxLength = 8000) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return "Message is required.";
  if (trimmed.length > maxLength) {
    return `Message must be ${maxLength} characters or fewer.`;
  }
  return null;
}

/**
 * Map an API error payload to field errors for inline display.
 * @param {Record<string, unknown> | null | undefined} data
 * @param {string} [fallback]
 * @returns {Record<string, string>}
 */
export function errorsFromApiResponse(data, fallback = "Something went wrong. Please try again.") {
  if (data?.fieldErrors && typeof data.fieldErrors === "object") {
    return /** @type {Record<string, string>} */ (data.fieldErrors);
  }
  const message = typeof data?.error === "string" ? data.error : fallback;
  return { [FORM_ERROR_KEY]: message };
}

/** @param {Record<string, string>} errors */
export function hasFieldErrors(errors) {
  return Object.values(errors).some((message) => Boolean(message));
}
