import { AppointmentStatusBadge } from "./AppointmentStatusBadge";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { AppointmentPatientPayment } from "./AppointmentPatientPayment";
import { AppointmentMarkPaidAtCounter } from "./AppointmentMarkPaidAtCounter";
import { formatApptTime, formatDateTimeMedium } from "@/lib/dashboard-format";
import { formatMoney } from "@/lib/payments/fees.js";
import { CalendarClock, CreditCard, FileText, Stethoscope, UserRound } from "lucide-react";

function EventRow({ label, value, done }) {
  return (
    <li className="relative pl-7 pb-4 last:pb-0">
      <span
        className={`absolute left-0 top-1.5 w-3 h-3 rounded-full border ${
          done
            ? "bg-primary border-primary/40"
            : "bg-surface-lowest border-primary/[0.18]"
        }`}
      />
      <span className="absolute left-[5px] top-5 bottom-0 w-px bg-primary/[0.12] last:hidden" />
      <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/45">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground/80">{value}</p>
    </li>
  );
}

export function AppointmentDetailsPanel({
  appointment,
  canPayOnline = false,
  canMarkPaid = false,
  role,
}) {
  const feeAmountCents = Number(appointment.feeAmountCents ?? 0);
  const showPayment =
    feeAmountCents > 0 || appointment.paymentStatus === "WAIVED";
  const showPayActions =
    canPayOnline &&
    appointment.paymentStatus === "UNPAID" &&
    feeAmountCents > 0;
  const showMarkPaid =
    canMarkPaid &&
    appointment.paymentStatus === "UNPAID" &&
    feeAmountCents > 0;
  const patientConcern = appointment.patientNotes ?? appointment.notes ?? "";
  const timeline = [
    { label: "Requested", value: formatDateTimeMedium(appointment.createdAt), done: true },
    { label: "Confirmed", value: formatDateTimeMedium(appointment.confirmedAt), done: Boolean(appointment.confirmedAt) },
    {
      label: "Consultation started",
      value: formatDateTimeMedium(appointment.consultationStartedAt),
      done: Boolean(appointment.consultationStartedAt),
    },
    {
      label: "Consultation ended",
      value: formatDateTimeMedium(appointment.consultationEndedAt),
      done: Boolean(appointment.consultationEndedAt),
    },
  ];
  return (
    <section className="panel p-6 lg:p-7">
      <div className="rounded-2xl border border-primary/[0.08] bg-surface-low p-5 lg:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary inline-flex items-center justify-center">
            <CalendarClock size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/45">
              Appointment
            </p>
            <h1 className="text-2xl font-extrabold font-manrope tracking-tight">
              Appointment details
            </h1>
          </div>
          <AppointmentStatusBadge status={appointment.status} />
        </div>
        <p className="mt-3 text-sm text-foreground/60">
          {formatApptTime(appointment.scheduledAt)} · {appointment.durationMinutes ?? 15} min
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-primary/[0.08] bg-surface-low p-4 lg:col-span-1">
          <p className="text-xs font-bold uppercase tracking-widest text-foreground/45 inline-flex items-center gap-1.5">
            <UserRound size={14} />
            People
          </p>
          <div className="mt-3 grid gap-3 text-sm">
            <p>
              <span className="text-foreground/55">Patient</span>
              <span className="block font-semibold mt-0.5">{appointment.patientName}</span>
            </p>
            <p>
              <span className="text-foreground/55">Doctor</span>
              <span className="block font-semibold mt-0.5">{appointment.doctorName ?? "Unassigned"}</span>
            </p>
            <p>
              <span className="text-foreground/55">Confirmed by</span>
              <span className="block font-semibold mt-0.5">{appointment.confirmedByName ?? "Not confirmed yet"}</span>
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-primary/[0.08] bg-surface-low p-4 lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-widest text-foreground/45 inline-flex items-center gap-1.5">
            <Stethoscope size={14} />
            Timeline
          </p>
          <ul className="mt-4">
            {timeline.map((item) => (
              <EventRow key={item.label} label={item.label} value={item.value} done={item.done} />
            ))}
          </ul>
        </div>
      </div>

      {showPayment ? (
        <div className="mt-4 rounded-xl border border-primary/[0.08] bg-surface-low p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-foreground/45 inline-flex items-center gap-1.5">
            <CreditCard size={14} />
            Payment
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {feeAmountCents > 0 ? (
              <p className="text-lg font-bold font-manrope">{formatMoney(feeAmountCents)}</p>
            ) : null}
            <PaymentStatusBadge paymentStatus={appointment.paymentStatus} />
          </div>
          {showPayActions ? (
            <AppointmentPatientPayment
              appointmentId={appointment.id}
              paymentMethod={appointment.paymentMethod}
            />
          ) : showMarkPaid ? (
            <AppointmentMarkPaidAtCounter appointmentId={appointment.id} />
          ) : appointment.paymentMethod === "PAY_AT_COUNTER" &&
            appointment.paymentStatus === "UNPAID" &&
            feeAmountCents > 0 ? (
            <p className="mt-3 text-sm text-foreground/60">
              You chose to pay at the front desk. Payment is still due before your visit.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-primary/[0.08] bg-surface-low p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-foreground/45 inline-flex items-center gap-1.5">
            <FileText size={14} />
            Patient concern
          </p>
          <p className="mt-3 text-sm text-foreground/70 whitespace-pre-wrap leading-relaxed">
            {patientConcern || "No patient concern provided."}
          </p>
        </div>
        <div className="rounded-xl border border-primary/[0.08] bg-surface-low p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-foreground/45 inline-flex items-center gap-1.5">
            <FileText size={14} />
            Consultation notes
          </p>
          <p className="mt-3 text-sm text-foreground/70 whitespace-pre-wrap leading-relaxed">
            {appointment.doctorNotes || "No consultation notes yet."}
          </p>
        </div>
      </div>
    </section>
  );
}
