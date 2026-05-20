import { FORM_ERROR_KEY } from "@/lib/forms/validate";

export { FORM_ERROR_KEY };

/**
 * @param {boolean} hasError
 * @param {string} [extra]
 */
export function formInputClass(hasError, extra = "") {
  return [
    "text-sm transition-colors outline-none focus:ring-2 bg-surface-lowest border",
    hasError
      ? "border-red-400/80 bg-red-50/50 focus:ring-red-500/25 focus:border-red-400"
      : "border-primary/[0.12] focus:border-primary/30 focus:ring-primary/15",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * @param {{ error?: string; id?: string }} props
 */
export function FormErrorMessage({ error, id }) {
  if (!error) return null;
  return (
    <p id={id} className="mt-1.5 text-xs text-red-600" role="alert">
      {error}
    </p>
  );
}

/**
 * @param {{ message?: string; className?: string }} props
 */
export function FormAlert({ message, className = "" }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className={`rounded-xl border border-red-500/25 bg-red-50/60 px-4 py-3 text-sm text-red-800 leading-relaxed ${className}`}
    >
      {message}
    </p>
  );
}

/**
 * @param {{
 *   label: string;
 *   htmlFor?: string;
 *   error?: string;
 *   hint?: string;
 *   children: import("react").ReactNode;
 *   className?: string;
 *   labelClassName?: string;
 * }} props
 */
export function FormField({
  label,
  htmlFor,
  error,
  hint,
  children,
  className = "",
  labelClassName = "text-xs font-bold uppercase tracking-wider text-foreground/45",
}) {
  const errorId = error && htmlFor ? `${htmlFor}-error` : undefined;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={htmlFor} className={labelClassName}>
        {label}
      </label>
      {children}
      <FormErrorMessage error={error} id={errorId} />
      {hint && !error ? <p className="text-xs text-foreground/45">{hint}</p> : null}
    </div>
  );
}
