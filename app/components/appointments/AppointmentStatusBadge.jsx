const STYLES = {
  REQUESTED: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  CONFIRMED: "bg-primary/10 text-primary border-primary/20",
  ONGOING: "bg-primary/10 text-primary border-primary/20",
  CANCELLED: "bg-red-500/10 text-red-700 border-red-500/20",
  COMPLETED: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  NO_SHOW: "bg-slate-500/10 text-slate-700 border-slate-500/20",
};

export function AppointmentStatusBadge({ status }) {
  const label = String(status ?? "REQUESTED").replace("_", " ");
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
        STYLES[status] ?? STYLES.REQUESTED
      }`}
    >
      {label}
    </span>
  );
}
