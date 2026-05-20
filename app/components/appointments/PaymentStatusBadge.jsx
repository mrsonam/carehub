const STYLES = {
  UNPAID: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  PAID: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  WAIVED: "bg-slate-500/10 text-slate-600 border-slate-500/20",
};

const LABELS = {
  UNPAID: "Unpaid",
  PAID: "Paid",
  WAIVED: "No fee",
};

export function PaymentStatusBadge({ paymentStatus, className = "" }) {
  const status = String(paymentStatus ?? "UNPAID");
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
        STYLES[status] ?? STYLES.UNPAID
      } ${className}`.trim()}
    >
      {LABELS[status] ?? LABELS.UNPAID}
    </span>
  );
}
