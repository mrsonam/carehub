/**
 * Shared appointment list layout (patient, admin, doctor records, calendar agenda).
 */

/** @param {string} status */
export function appointmentRowStatusTone(status) {
  if (status === "COMPLETED") return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
  if (status === "CANCELLED") return "bg-red-500/10 text-red-700 border-red-500/20";
  if (status === "NO_SHOW") return "bg-slate-500/10 text-slate-700 border-slate-500/20";
  if (status === "ONGOING") return "bg-primary/10 text-primary border-primary/20";
  return "bg-surface-low text-foreground/60 border-primary/[0.08]";
}

export const appointmentViewLinkClass =
  "inline-flex items-center justify-center w-9 h-9 rounded-lg border border-primary/[0.12] text-primary hover:bg-primary/10 transition-colors duration-200 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

/**
 * @param {{ children: import("react").ReactNode; className?: string }} props
 */
export function AppointmentList({ children, className = "" }) {
  return (
    <ul className={["flex flex-col gap-2.5", className].filter(Boolean).join(" ")}>
      {children}
    </ul>
  );
}

/**
 * @param {{ children: import("react").ReactNode }} props
 */
export function AppointmentListIcon({ children }) {
  return (
    <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
      {children}
    </span>
  );
}

/**
 * @param {{
 *   id?: string;
 *   focused?: boolean;
 *   icon: import("react").ReactNode;
 *   title: import("react").ReactNode;
 *   subtitle?: import("react").ReactNode;
 *   note?: import("react").ReactNode;
 *   badges?: import("react").ReactNode;
 *   actions?: import("react").ReactNode;
 *   className?: string;
 * }} props
 */
export function AppointmentListRow({
  id,
  focused = false,
  icon,
  title,
  subtitle,
  note,
  badges,
  actions,
  className = "",
}) {
  return (
    <div
      id={id}
      className={[
        "rounded-xl border border-primary/[0.06] bg-surface-low/35 p-4",
        "sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-x-5",
        focused ? "bg-primary/[0.06] border-primary/20" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex gap-3.5 min-w-0">
        {icon}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="space-y-1">
            <p className="font-semibold font-manrope leading-snug text-foreground">{title}</p>
            {subtitle ? (
              <p className="text-xs text-foreground/55 leading-relaxed">{subtitle}</p>
            ) : null}
          </div>
          {note ? (
            <p className="text-xs text-foreground/50 leading-relaxed line-clamp-2">{note}</p>
          ) : null}
          {badges ? <div className="flex flex-wrap items-center gap-2">{badges}</div> : null}
        </div>
      </div>
      {actions ? (
        <div className="flex items-center gap-2.5 mt-3 sm:mt-0 sm:justify-end sm:shrink-0">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
