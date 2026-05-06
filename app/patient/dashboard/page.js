import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  CalendarClock,
  CalendarCheck2,
  Stethoscope,
  Brain,
  Baby,
  Sparkles,
  Heart,
  Pill,
  ChevronRight,
} from "lucide-react";
import { getSessionCookieName, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PanelHead } from "../../components/dashboard/DashboardPanels";
import { formatApptTime, formatTimeOnly } from "@/lib/dashboard-format";

export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

const DOCTOR_IMAGES = [
  "/doctor-sarah.png",
  "/doctor-robert.png",
  "/doctor-elena.png",
  "/clinic-office.png",
];

function scopeForPatient(user) {
  return {
    OR: [
      { patientId: user.id },
      { patientName: { equals: user.name, mode: "insensitive" } },
    ],
  };
}

function pickImage(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return DOCTOR_IMAGES[h % DOCTOR_IMAGES.length];
}

function formatDoctorLabel(name) {
  if (!name) return "Your care team";
  return name.toLowerCase().startsWith("dr") ? name : `Dr. ${name}`;
}

async function loadPatientDashboard(user) {
  const w = scopeForPatient(user);
  const now = new Date();
  const weekEnd = new Date(now.getTime() + 7 * DAY_MS);
  const terminalStatuses = ["CANCELLED", "COMPLETED", "NO_SHOW"];

  const [upcoming, pastVisits, weekCount, doctors, totalDoctors] = await Promise.all([
    prisma.appointment.findMany({
      where: { ...w, scheduledAt: { gte: now }, status: { notIn: terminalStatuses } },
      orderBy: { scheduledAt: "asc" },
      take: 20,
    }),
    prisma.appointment.findMany({
      where: {
        AND: [
          w,
          { OR: [{ status: { in: ["COMPLETED", "NO_SHOW"] } }, { scheduledAt: { lt: now } }] },
          { status: { not: "CANCELLED" } },
        ],
      },
      orderBy: { scheduledAt: "desc" },
      take: 8,
    }),
    prisma.appointment.count({
      where: {
        ...w,
        scheduledAt: { gte: now, lte: weekEnd },
        status: { notIn: terminalStatuses },
      },
    }),
    prisma.user.findMany({
      where: { role: "DOCTOR" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
      take: 8,
    }),
    prisma.user.count({ where: { role: "DOCTOR" } }),
  ]);

  const nextAppt = upcoming[0] ?? null;

  return {
    upcoming,
    nextAppt,
    pastVisits,
    weekCount,
    doctors,
    totalDoctors,
  };
}

export default async function PatientDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const session = token ? await verifySessionToken(token).catch(() => null) : null;
  if (!session) redirect("/login?next=/patient/dashboard");
  if (session.role !== "PATIENT") redirect("/dashboard");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true },
  });
  if (!user) redirect("/login?next=/patient/dashboard");

  const data = await loadPatientDashboard(user);
  const first = user.name.split(/\s+/)[0] ?? user.name;

  const specialties = [
    { name: "Neurology", href: "/patient/doctors", icon: Brain, blurb: `${Math.max(1, Math.floor(data.totalDoctors / 4))}+ in network` },
    { name: "Pediatrics", href: "/patient/doctors", icon: Baby, blurb: `${Math.max(1, Math.floor(data.totalDoctors / 3))}+ in network` },
    { name: "Dermatology", href: "/patient/doctors", icon: Sparkles, blurb: "Referrals available" },
    { name: "Mental health", href: "/patient/doctors", icon: Heart, blurb: "Care navigation" },
  ];

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-8">
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="panel p-6 lg:col-span-2 flex flex-col sm:flex-row gap-6">
          {data.nextAppt ? (
            <>
              <div className="relative w-full sm:w-44 shrink-0 aspect-[4/5] sm:aspect-auto sm:h-52 rounded-xl overflow-hidden bg-surface-high">
                <Image
                  src={pickImage(data.nextAppt.doctorName ?? data.nextAppt.id)}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 176px"
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/45">
                  Upcoming next
                </p>
                <h2 className="mt-2 text-xl font-bold font-manrope tracking-tight">
                  {formatDoctorLabel(data.nextAppt.doctorName)}
                </h2>
                <p className="text-sm text-foreground/55 mt-1">
                  General practice · {formatApptTime(data.nextAppt.scheduledAt)} · {data.nextAppt.durationMinutes ?? 15} min
                </p>
                <p className="text-xs text-foreground/45 mt-3">
                  {formatTimeOnly(data.nextAppt.scheduledAt)} · In person
                </p>
                <div className="mt-auto pt-6 flex flex-wrap gap-2">
                  <Link
                    href={`/patient/appointments?focus=${data.nextAppt.id}`}
                    className="inline-flex items-center h-10 px-4 rounded-lg bg-primary text-white text-sm font-semibold shadow-sm shadow-primary/20 hover:bg-primary-container transition-colors"
                  >
                    Prepare for visit
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center h-10 px-4 rounded-lg text-sm font-medium text-foreground/80 bg-surface-low border border-primary/[0.08] hover:border-primary/20 transition-colors"
                  >
                    Reschedule
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-start justify-center py-4 w-full">
              <span className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <CalendarClock size={22} />
              </span>
              <h2 className="mt-4 text-lg font-bold font-manrope">
                Nothing on your calendar
              </h2>
              <p className="text-sm text-foreground/55 mt-1 max-w-md">
                Bookings where your name matches this account will show here. Use
                Book appointment to find a time.
              </p>
              <Link
                href="/patient/appointments"
                className="mt-5 inline-flex items-center h-10 px-4 rounded-lg bg-primary text-white text-sm font-semibold shadow-sm shadow-primary/20 hover:bg-primary-container transition-colors"
              >
                Book appointment
              </Link>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl bg-primary text-white p-6 shadow-sm shadow-primary/25 flex flex-col min-h-[200px]">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">
              Wellness index
            </p>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-black font-manrope tabular-nums">92</span>
              <span className="text-lg font-semibold text-white/80">/100</span>
            </div>
            <p className="mt-3 text-sm text-white/85 leading-relaxed">
              Keep your visits and vitals current to maintain a strong score.
            </p>
            <div className="mt-auto pt-4 h-1.5 rounded-full bg-white/20 overflow-hidden">
              <div className="h-full w-[92%] rounded-full bg-white/90" aria-hidden />
            </div>
          </div>

          <div className="panel p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/45">
              Daily vitals
            </p>
            <p className="text-xs text-foreground/50 mt-1">
              Last captured at a clinic visit. Not a substitute for home monitoring.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-foreground/50">Heart rate</p>
                <p className="text-lg font-bold font-manrope tabular-nums mt-0.5">
                  72 <span className="text-sm font-medium text-foreground/45">BPM</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-foreground/50">Blood pressure</p>
                <p className="text-lg font-bold font-manrope tabular-nums mt-0.5">
                  120/80 <span className="text-sm font-medium text-foreground/45">mmHg</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <PanelHead eyebrow="Care network" title="Find a specialist" action={{ href: "/patient/doctors", label: "Browse all" }} />
        <p className="text-xs text-foreground/50 mt-1">
          Filter in the full directory. Counts are illustrative for this demo.
        </p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {specialties.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.name}
                href={s.href}
                className="panel p-5 flex flex-col gap-3 hover:shadow-md transition-shadow group"
              >
                <div className="w-10 h-10 rounded-lg bg-surface-high flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="font-bold font-manrope">{s.name}</p>
                  <p className="text-xs text-foreground/50 mt-0.5">{s.blurb}</p>
                </div>
                <span className="text-xs font-semibold text-primary inline-flex items-center gap-0.5 mt-auto">
                  View
                  <ChevronRight size={12} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="panel p-6">
        <PanelHead eyebrow="Today" title="Available in our network" action={{ href: "/patient/doctors", label: "See directory" }} />
        {data.doctors.length === 0 ? (
          <p className="mt-4 text-sm text-foreground/50">No clinicians are listed yet.</p>
        ) : (
          <ul className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {data.doctors.map((d, i) => (
              <li key={d.id} className="flex gap-3 p-3 rounded-lg border border-primary/[0.06] bg-surface-lowest/50">
                <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 bg-surface-high">
                  <Image
                    src={DOCTOR_IMAGES[i % DOCTOR_IMAGES.length]}
                    alt=""
                    width={56}
                    height={56}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold font-manrope text-sm truncate">{d.name}</p>
                  <p className="text-xs text-foreground/50">General practice</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {["9:00", "11:30", "2:15"].map((t) => (
                      <span key={t} className="text-[10px] font-semibold tabular-nums px-2 py-0.5 rounded bg-primary/10 text-primary">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="panel p-6">
          <PanelHead eyebrow="History" title="Recent visits" action={{ href: "/patient/appointments", label: "All visits" }} />
          {data.pastVisits.length === 0 ? (
            <p className="mt-4 text-sm text-foreground/50">
              No past visits on file. Completed appointments appear here.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-primary/[0.06]">
              {data.pastVisits.slice(0, 5).map((v) => (
                <li key={v.id} className="flex items-start gap-3 py-3.5 text-sm first:pt-0 last:pb-0">
                  <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <CalendarCheck2 size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">
                      {v.patientNotes?.slice(0, 40) || v.notes?.slice(0, 40) || "Routine visit"}
                    </p>
                    <p className="text-xs text-foreground/50 mt-0.5">
                      {formatApptTime(v.scheduledAt)} · {formatDoctorLabel(v.doctorName)}
                    </p>
                  </div>
                  <span className="text-[11px] text-secondary font-semibold shrink-0">
                    Done
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel p-6">
          <PanelHead eyebrow="Pharmacy" title="Active prescriptions" action={{ href: "/contact", label: "Pharmacy help" }} />
          <div className="mt-4 flex gap-3 p-4 rounded-lg bg-surface-high/80">
            <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Pill size={16} />
            </span>
            <p className="text-sm text-foreground/65 leading-relaxed">
              e-Prescribing and refills are <span className="font-semibold text-foreground">out of scope for this MVP</span>.
              Contact your care team for medications and refills.
            </p>
          </div>
          <p className="text-xs text-foreground/45 mt-4">
            This area is ready to connect when your clinic enables prescription integration.
          </p>
        </div>
      </section>
    </div>
  );
}
