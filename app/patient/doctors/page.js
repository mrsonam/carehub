import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  CalendarClock,
  Stethoscope,
  Users,
  Video,
} from "lucide-react";
import { getSessionCookieName, verifySessionToken } from "@/lib/auth";
import { readSearchQuery } from "@/lib/dashboard-search";
import { prisma } from "@/lib/prisma";
import { avatarDisplayUrl } from "@/lib/profile/avatar-url";
import { Metric, PanelHead } from "../../components/dashboard/DashboardPanels";
import { PatientDoctorsDirectory } from "../../components/patient/PatientDoctorsDirectory";

export const dynamic = "force-dynamic";

const TERMINAL = new Set(["CANCELLED", "COMPLETED", "NO_SHOW"]);

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

export default async function PatientDoctorsPage({ searchParams }) {
  const sp = await Promise.resolve(searchParams);
  const initialQuery = readSearchQuery(sp?.q);
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
        avatarUrl: true,
        updatedAt: true,
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
      avatarUrl: avatarDisplayUrl(doc.avatarUrl, doc.updatedAt),
      hasRules: rulesByDoctor.has(doc.id),
      visitCountWithYou,
      upcomingWithYou,
      lastVisitAt,
    };
  });

  const myDoctorCount = doctors.filter((d) => d.visitCountWithYou > 0).length;
  const withSlots = doctors.filter((d) => d.hasRules).length;

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-8">
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <PatientDoctorsDirectory doctors={doctors} initialQuery={initialQuery} />
        </div>
      </section>
    </div>
  );
}
