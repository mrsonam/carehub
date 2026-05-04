import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  CalendarClock,
  CalendarPlus,
  Sparkles,
  Stethoscope,
  Users,
  Video,
} from "lucide-react";
import { getSessionCookieName, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Metric, PanelHead } from "../../components/dashboard/DashboardPanels";
import { PatientDoctorsDirectory } from "../../components/patient/PatientDoctorsDirectory";

export const dynamic = "force-dynamic";

const TERMINAL = new Set(["CANCELLED", "COMPLETED", "NO_SHOW"]);

const DOCTOR_IMAGES = [
  "/doctor-sarah.png",
  "/doctor-robert.png",
  "/doctor-elena.png",
  "/clinic-office.png",
];

function pickImage(seed) {
  let h = 0;
  const s = String(seed ?? "");
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return DOCTOR_IMAGES[h % DOCTOR_IMAGES.length];
}

function patientScope(user) {
  return {
    OR: [
      { patientId: user.id },
      { patientName: { equals: user.name, mode: "insensitive" } },
    ],
  };
}

function apptMatchesDoctor(appt, doctor) {
  if (appt.doctorId && appt.doctorId === doctor.id) return true;
  const dn = appt.doctorName?.trim().toLowerCase() ?? "";
  return !appt.doctorId && dn && dn === doctor.name.trim().toLowerCase();
}

export default async function PatientDoctorsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const session = token ? await verifySessionToken(token).catch(() => null) : null;
  if (!session) redirect("/login?next=/patient/doctors");
  if (session.role !== "PATIENT") redirect("/dashboard");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true },
  });
  if (!user) redirect("/login?next=/patient/doctors");

  const now = new Date();
  const w = patientScope(user);

  const [doctorRows, ruleGroups, patientAppts, upcomingWithCareTeam] = await Promise.all([
    prisma.user.findMany({
      where: { role: "DOCTOR" },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        title: true,
        bio: true,
      },
    }),
    prisma.doctorAvailabilityRule.groupBy({
      by: ["doctorId"],
      _count: { _all: true },
    }),
    prisma.appointment.findMany({
      where: w,
      select: {
        doctorId: true,
        doctorName: true,
        scheduledAt: true,
        status: true,
      },
    }),
    prisma.appointment.count({
      where: {
        ...w,
        scheduledAt: { gte: now },
        status: { notIn: [...TERMINAL] },
      },
    }),
  ]);

  const rulesByDoctor = new Set(ruleGroups.map((g) => g.doctorId));

  const doctors = doctorRows.map((doc) => {
    const mine = patientAppts.filter((a) => apptMatchesDoctor(a, doc));
    const visitCountWithYou = mine.length;
    const upcomingWithYou = mine.filter(
      (a) => !TERMINAL.has(a.status) && new Date(a.scheduledAt) >= now
    ).length;
    const pastOrDone = mine.filter(
      (a) => TERMINAL.has(a.status) || new Date(a.scheduledAt) < now
    );
    const lastVisitAt =
      pastOrDone.length > 0
        ? new Date(
            Math.max(...pastOrDone.map((a) => new Date(a.scheduledAt).getTime()))
          ).toISOString()
        : mine.length > 0
          ? new Date(
              Math.max(...mine.map((a) => new Date(a.scheduledAt).getTime()))
            ).toISOString()
          : null;

    const rawBio = doc.bio?.trim() ?? "";
    const bioPreview =
      rawBio.length > 180 ? `${rawBio.slice(0, 177).trim()}…` : rawBio || null;

    return {
      id: doc.id,
      name: doc.name,
      title: doc.title,
      bioPreview,
      image: pickImage(doc.id),
      hasRules: rulesByDoctor.has(doc.id),
      visitCountWithYou,
      upcomingWithYou,
      lastVisitAt,
    };
  });

  const myDoctorCount = doctors.filter((d) => d.visitCountWithYou > 0).length;
  const withSlots = doctors.filter((d) => d.hasRules).length;
  const firstName = user.name.split(/\s+/)[0] ?? user.name;

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-8">
      <header className="relative overflow-hidden rounded-2xl border border-primary/[0.08] bg-gradient-to-br from-primary/[0.06] via-surface-lowest to-surface-lowest p-6 sm:p-8">
        <div
          className="pointer-events-none absolute -right-8 -top-6 h-36 w-36 rounded-full bg-primary/[0.1] blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/45">
              <Sparkles size={14} className="text-primary/80" aria-hidden />
              Care network
            </p>
            <h1 className="mt-2 text-3xl lg:text-4xl font-extrabold font-manrope tracking-tight">
              Your doctors, {firstName}
            </h1>
            <p className="text-foreground/55 mt-2 text-sm max-w-2xl leading-relaxed">
              Everyone on staff you can book with. Filters show who you have already seen, who has online
              scheduling, and who has a future visit with you. Booking opens the appointment form with that
              clinician pre-selected.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Link
              href="/patient/appointments"
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary-container transition-colors"
            >
              <CalendarPlus size={18} />
              Book appointment
            </Link>
            <Link
              href="/doctors"
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl border border-primary/[0.15] text-primary text-sm font-semibold hover:bg-primary/10 transition-colors"
            >
              Clinic stories
            </Link>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric
          icon={Stethoscope}
          label="In network"
          value={doctors.length}
          hint="Active clinician profiles"
        />
        <Metric
          icon={Users}
          label="Your doctors"
          value={myDoctorCount}
          hint="You share visit history"
        />
        <Metric
          icon={Video}
          label="Self-serve slots"
          value={withSlots}
          hint="Pick times online"
        />
        <Metric
          icon={CalendarClock}
          label="Upcoming for you"
          value={upcomingWithCareTeam}
          hint="Across all clinicians"
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="panel p-6 lg:col-span-2 flex flex-col sm:flex-row gap-5">
          <div className="relative w-full sm:w-48 shrink-0 aspect-[4/5] sm:aspect-auto sm:h-56 rounded-xl overflow-hidden bg-surface-high ring-1 ring-primary/[0.06]">
            <Image
              src="/doctor-sarah.png"
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 192px"
            />
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/45">
              Tip
            </p>
            <h2 className="mt-2 text-lg font-bold font-manrope tracking-tight">
              Prefer video or after-hours?
            </h2>
            <p className="text-sm text-foreground/55 mt-2 leading-relaxed">
              Add a short note when you request a visit so the front desk can match you with the right clinician
              and modality. You can always message through{" "}
              <Link href="/contact" className="font-semibold text-primary hover:underline">
                Contact
              </Link>
              .
            </p>
            <Link
              href="/patient/appointments"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-container w-fit"
            >
              Go to appointments
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>

        <div className="panel p-6 flex flex-col justify-center">
          <PanelHead eyebrow="Shortcuts" title="Quick links" />
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link
                href="/patient/dashboard"
                className="font-medium text-primary hover:underline"
              >
                Patient home
              </Link>
            </li>
            <li>
              <Link href="/patient/appointments" className="font-medium text-primary hover:underline">
                Request or change visits
              </Link>
            </li>
            <li>
              <Link href="/services" className="font-medium text-primary hover:underline">
                Services & pricing
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <section className="panel p-6">
        <PanelHead
          eyebrow="Directory"
          title="Clinicians you can book"
          action={{ href: "/patient/appointments", label: "Open booking" }}
        />
        <p className="text-xs text-foreground/50 mt-1">
          Search and filter the roster. “Book visit” opens your appointment form with that doctor selected.
        </p>
        <div className="mt-6">
          <PatientDoctorsDirectory doctors={doctors} />
        </div>
      </section>
    </div>
  );
}
