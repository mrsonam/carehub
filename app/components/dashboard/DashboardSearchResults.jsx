import Link from "next/link";
import { CalendarClock, Stethoscope, UserRound } from "lucide-react";
import { AppointmentStatusBadge } from "@/app/components/appointments/AppointmentStatusBadge";
import { formatApptTime } from "@/lib/dashboard-format";

function Section({ title, count, children }) {
  if (!count) return null;
  return (
    <section className="panel p-5 sm:p-6">
      <h2 className="text-sm font-bold font-manrope text-foreground">
        {title}
        <span className="ml-2 text-foreground/45 font-semibold">({count})</span>
      </h2>
      <ul className="mt-4 divide-y divide-primary/[0.06]">{children}</ul>
    </section>
  );
}

function RowLink({ href, icon: Icon, title, meta, badge }) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-3 py-3.5 text-sm first:pt-0 last:pb-0 hover:bg-surface-low/60 -mx-2 px-2 rounded-lg transition-colors"
      >
        <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Icon size={16} aria-hidden />
        </span>
        <span className="flex-1 min-w-0">
          <span className="font-semibold text-foreground block truncate">{title}</span>
          {meta ? <span className="text-xs text-foreground/50 block truncate mt-0.5">{meta}</span> : null}
        </span>
        {badge ?? null}
      </Link>
    </li>
  );
}

/**
 * @param {{
 *   query: string;
 *   patients?: Array<{ id: string; name: string; email?: string | null; href: string }>;
 *   doctors?: Array<{ id: string; name: string; title?: string | null; href: string }>;
 *   appointments?: Array<{ id: string; patientName: string; doctorName?: string | null; scheduledAt: string; status: string; href: string }>;
 * }} props
 */
export function DashboardSearchResults({ query, patients = [], doctors = [], appointments = [] }) {
  const total = patients.length + doctors.length + appointments.length;

  if (!query) {
    return (
      <div className="panel p-8 text-center text-sm text-foreground/55">
        Type a name, email, or keyword and press Enter to search across your workspace.
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="panel p-8 text-center text-sm text-foreground/55">
        No results for <span className="font-semibold text-foreground">&ldquo;{query}&rdquo;</span>.
        Try another spelling or a shorter term.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Section title="Patients" count={patients.length}>
        {patients.map((p) => (
          <RowLink
            key={p.id}
            href={p.href}
            icon={UserRound}
            title={p.name}
            meta={p.email ?? undefined}
          />
        ))}
      </Section>

      <Section title="Doctors" count={doctors.length}>
        {doctors.map((d) => (
          <RowLink
            key={d.id}
            href={d.href}
            icon={Stethoscope}
            title={d.name}
            meta={d.title ?? "Clinician"}
          />
        ))}
      </Section>

      <Section title="Appointments" count={appointments.length}>
        {appointments.map((a) => (
          <RowLink
            key={a.id}
            href={a.href}
            icon={CalendarClock}
            title={a.patientName}
            meta={`${formatApptTime(a.scheduledAt)}${a.doctorName ? ` · Dr. ${a.doctorName}` : ""}`}
            badge={<AppointmentStatusBadge status={a.status} />}
          />
        ))}
      </Section>
    </div>
  );
}
