import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck2,
  CalendarClock,
  Contact,
  Stethoscope,
  User,
} from "lucide-react";
import { Metric, PanelHead } from "@/app/components/dashboard/DashboardPanels";
import { AppointmentStatusBadge } from "@/app/components/appointments/AppointmentStatusBadge";
import {
  AppointmentList,
  AppointmentListIcon,
  AppointmentListRow,
} from "@/app/components/appointments/AppointmentListRow";
import { UserAvatar } from "@/app/components/profile/UserAvatar";
import { formatApptTime, formatTimeOnly, greetingForHour } from "@/lib/dashboard-format";

function formatDoctorLabel(name) {
  if (!name) return "Your clinician";
  return name.toLowerCase().startsWith("dr") ? name : `Dr. ${name}`;
}

/**
 * @param {{
 *   firstName: string;
 *   profileComplete: boolean;
 *   weekCount: number;
 *   upcoming: Array<object>;
 *   pastVisits: Array<object>;
 *   doctorsInNetwork: number;
 *   nextAppt: object | null;
 *   nextDoctor: { name: string; title?: string | null; avatarUrl?: string | null } | null;
 * }} props
 */
export function PatientDashboardHome({
  firstName,
  profileComplete,
  weekCount,
  upcoming,
  pastVisits,
  doctorsInNetwork,
  nextAppt,
  nextDoctor,
}) {
  const greet = greetingForHour();
  const moreUpcoming = upcoming.length > 1 ? upcoming.slice(1) : [];

  const quickActions = [
    {
      label: "Book appointment",
      href: "/patient/appointments",
      icon: CalendarClock,
      primary: true,
    },
    {
      label: "Browse doctors",
      href: "/patient/doctors",
      icon: Stethoscope,
    },
    {
      label: "All visits",
      href: "/patient/appointments",
      icon: CalendarCheck2,
    },
    ...(!profileComplete
      ? [{ label: "Complete profile", href: "/patient/profile", icon: User }]
      : []),
    { label: "Contact clinic", href: "/contact", icon: Contact },
  ];

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-8">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/45">
          {greet}
        </p>
        <h1 className="mt-1.5 text-2xl sm:text-3xl font-extrabold font-manrope tracking-tight text-foreground">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1.5 text-sm text-foreground/55 max-w-xl">
          View upcoming visits, book with your care team, and review your appointment history.
        </p>
      </header>

      {!profileComplete ? (
        <div
          className="rounded-2xl border border-primary/15 bg-primary/[0.04] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          role="status"
        >
          <p className="text-sm text-foreground/70 leading-relaxed">
            Add your address and emergency contact so the clinic has your details on file.
          </p>
          <Link
            href="/patient/profile"
            className="h-10 px-4 rounded-xl bg-primary text-white text-sm font-semibold inline-flex items-center justify-center shrink-0 cursor-pointer transition-colors duration-200 hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            Complete profile
          </Link>
        </div>
      ) : null}

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4" aria-label="Overview">
        <Metric
          icon={CalendarClock}
          label="This week"
          value={weekCount}
          hint={weekCount === 1 ? "1 visit scheduled" : weekCount ? `${weekCount} visits scheduled` : "Nothing scheduled yet"}
        />
        <Metric
          icon={CalendarCheck2}
          label="Upcoming"
          value={upcoming.length}
          hint="Active appointments ahead"
        />
        <Metric
          icon={Stethoscope}
          label="Care network"
          value={doctorsInNetwork}
          hint="Clinicians you can book with"
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="panel p-6 lg:col-span-2 flex flex-col min-h-[280px]">
          <PanelHead eyebrow="Next visit" title={nextAppt ? "Your upcoming appointment" : "No visits scheduled"} />
          {nextAppt ? (
            <div className="mt-5 flex flex-col sm:flex-row gap-5 flex-1">
              <div className="flex items-start gap-4 sm:gap-5">
                <UserAvatar
                  name={nextDoctor?.name ?? nextAppt.doctorName ?? "Clinician"}
                  avatarUrl={nextDoctor?.avatarUrl ?? null}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full ring-2 ring-surface-low shadow-sm"
                  textClassName="text-lg"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold font-manrope tracking-tight">
                      {formatDoctorLabel(nextDoctor?.name ?? nextAppt.doctorName)}
                    </h2>
                    <AppointmentStatusBadge status={nextAppt.status} />
                  </div>
                  {nextDoctor?.title ? (
                    <p className="text-sm text-foreground/55 mt-1">{nextDoctor.title}</p>
                  ) : null}
                  <p className="text-sm text-foreground/60 mt-2">
                    {formatApptTime(nextAppt.scheduledAt)}
                  </p>
                  <p className="text-xs text-foreground/45 mt-1">
                    {formatTimeOnly(nextAppt.scheduledAt)} · {nextAppt.durationMinutes ?? 15} min · In person
                  </p>
                  {nextAppt.patientNotes ? (
                    <p className="mt-3 text-sm text-foreground/65 line-clamp-2 rounded-lg bg-surface-low border border-primary/[0.06] px-3 py-2">
                      {nextAppt.patientNotes}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:flex-col sm:justify-end sm:items-stretch sm:min-w-[10rem]">
                <Link
                  href={`/patient/appointments?focus=${nextAppt.id}`}
                  className="inline-flex items-center justify-center h-10 px-4 rounded-xl bg-primary text-white text-sm font-semibold cursor-pointer transition-colors duration-200 hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  View details
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center h-10 px-4 rounded-xl text-sm font-medium text-foreground/75 border border-primary/[0.1] bg-surface-low cursor-pointer transition-colors duration-200 hover:border-primary/20 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  Need to reschedule?
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-6 flex flex-col items-start flex-1">
              <span className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <CalendarClock size={22} aria-hidden />
              </span>
              <p className="mt-4 text-sm text-foreground/55 max-w-md leading-relaxed">
                When you book a visit, it will appear here with your clinician and time.
              </p>
              <Link
                href="/patient/appointments"
                className="mt-5 inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-primary text-white text-sm font-semibold cursor-pointer transition-colors duration-200 hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                Book appointment
                <ArrowRight size={16} aria-hidden />
              </Link>
            </div>
          )}
        </div>

        <div className="panel p-6 flex flex-col">
          <PanelHead eyebrow="Shortcuts" title="Quick actions" />
          <ul className="mt-4 flex flex-col gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <li key={action.label}>
                  <Link
                    href={action.href}
                    className={[
                      "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold cursor-pointer transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                      action.primary
                        ? "bg-primary text-white hover:bg-primary-container"
                        : "text-foreground/80 border border-primary/[0.08] bg-surface-low hover:bg-surface-high/80 hover:text-foreground",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                        action.primary ? "bg-white/15 text-white" : "bg-primary/[0.08] text-primary",
                      ].join(" ")}
                    >
                      <Icon size={17} aria-hidden />
                    </span>
                    {action.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {moreUpcoming.length > 0 ? (
        <section className="panel p-6">
          <PanelHead
            eyebrow="Schedule"
            title="More upcoming"
            action={{ href: "/patient/appointments", label: "View all" }}
          />
          <AppointmentList className="mt-4">
            {moreUpcoming.map((appt) => (
              <li key={appt.id} className="list-none">
                <AppointmentListRow
                  icon={
                    <AppointmentListIcon>
                      <CalendarClock size={16} aria-hidden />
                    </AppointmentListIcon>
                  }
                  title={formatDoctorLabel(appt.doctorName)}
                  subtitle={`${formatApptTime(appt.scheduledAt)} · ${appt.durationMinutes ?? 15} min`}
                  badges={<AppointmentStatusBadge status={appt.status} />}
                  actions={
                    <Link
                      href={`/patient/appointments?focus=${appt.id}`}
                      className="text-xs font-semibold text-primary hover:text-primary-container cursor-pointer transition-colors duration-200 whitespace-nowrap"
                    >
                      Details
                    </Link>
                  }
                />
              </li>
            ))}
          </AppointmentList>
        </section>
      ) : null}

      <section className="panel p-6">
        <PanelHead
          eyebrow="History"
          title="Recent visits"
          action={{ href: "/patient/appointments", label: "All visits" }}
        />
        {pastVisits.length === 0 ? (
          <p className="mt-5 text-sm text-foreground/50 leading-relaxed">
            Completed and past appointments will show here once you have visit history on file.
          </p>
        ) : (
          <ul className="mt-5 divide-y divide-primary/[0.06]">
            {pastVisits.slice(0, 6).map((v) => (
              <li key={v.id}>
                <Link
                  href={`/patient/appointments?focus=${v.id}`}
                  className="flex items-start gap-3 py-3.5 text-sm cursor-pointer rounded-lg -mx-1 px-1 transition-colors duration-200 hover:bg-surface-low/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  <span className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0">
                    <CalendarCheck2 size={16} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold font-manrope truncate">
                      {formatDoctorLabel(v.doctorName)}
                    </p>
                    <p className="text-xs text-foreground/50 mt-0.5">{formatApptTime(v.scheduledAt)}</p>
                    {(v.patientNotes || v.notes) && (
                      <p className="text-xs text-foreground/55 mt-1 line-clamp-1">
                        {v.patientNotes || v.notes}
                      </p>
                    )}
                  </div>
                  <span
                    className={`text-[11px] font-semibold shrink-0 mt-0.5 ${
                      v.status === "NO_SHOW" ? "text-slate-600" : "text-emerald-700"
                    }`}
                  >
                    {v.status === "NO_SHOW" ? "No show" : "Completed"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
