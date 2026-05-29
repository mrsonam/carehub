import Link from "next/link";
import { CalendarClock, Search, Stethoscope, UserRound } from "lucide-react";
import { AppointmentStatusBadge } from "@/app/components/appointments/AppointmentStatusBadge";
import { formatApptTime } from "@/lib/dashboard-format";

function Section({ title, count, children }) {
  if (!count) return null;
  return (
    <section className="panel overflow-hidden">
      <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-primary/[0.06] bg-surface-lowest/50">
        <h2 className="text-sm font-bold font-manrope text-foreground tracking-tight">
          {title}
          <span className="ml-2 text-foreground/45 font-semibold">({count})</span>
        </h2>
      </div>
      <ul className="divide-y divide-primary/[0.06] px-3 py-2 sm:px-4 sm:py-3">{children}</ul>
    </section>
  );
}

function RowLink({ href, icon: Icon, title, meta, badge }) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-4 py-4 px-2 sm:px-3 text-sm rounded-xl hover:bg-surface-low/70 transition-colors"
      >
        <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Icon size={17} aria-hidden />
        </span>
        <span className="flex-1 min-w-0">
          <span className="font-semibold text-foreground block truncate leading-snug">{title}</span>
          {meta ? (
            <span className="text-xs text-foreground/50 block truncate mt-1 leading-relaxed">{meta}</span>
          ) : null}
        </span>
        {badge ? <span className="shrink-0 ml-2">{badge}</span> : null}
      </Link>
    </li>
  );
}

function EmptyState({ icon: Icon, children }) {
  return (
    <div className="panel px-6 py-14 sm:py-16 text-center">
      <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5">
        <Icon size={22} aria-hidden />
      </div>
      <p className="text-sm text-foreground/55 leading-relaxed max-w-md mx-auto">{children}</p>
    </div>
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
      <EmptyState icon={Search}>
        Type a name, email, or keyword in the search bar above and press Enter to search across
        your workspace.
      </EmptyState>
    );
  }

  if (total === 0) {
    return (
      <EmptyState icon={Search}>
        No results for <span className="font-semibold text-foreground">&ldquo;{query}&rdquo;</span>.
        Try another spelling or a shorter term.
      </EmptyState>
    );
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <p className="text-sm text-foreground/55 px-1">
        <span className="font-semibold text-foreground">{total}</span>{" "}
        {total === 1 ? "result" : "results"} for{" "}
        <span className="font-semibold text-foreground">&ldquo;{query}&rdquo;</span>
      </p>

      <div className="flex flex-col gap-5 sm:gap-6">
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
    </div>
  );
}
