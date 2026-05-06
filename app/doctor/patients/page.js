import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CalendarClock, ClipboardList, UserRound, Users } from "lucide-react";
import { getSessionCookieName, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Metric, PanelHead } from "../../components/dashboard/DashboardPanels";
import { DoctorPatientDirectory } from "../../components/doctor/DoctorPatientDirectory";
import { DoctorPatientsAnalytics } from "../../components/doctor/DoctorPatientsAnalytics";

export const dynamic = "force-dynamic";

const TERMINAL = new Set(["CANCELLED", "COMPLETED", "NO_SHOW"]);
const FETCH_LIMIT = 800;
const STATUS_ORDER = ["REQUESTED", "CONFIRMED", "ONGOING", "COMPLETED", "CANCELLED", "NO_SHOW"];

function doctorScope(user) {
  return {
    OR: [
      { doctorId: user.id },
      { doctorName: { equals: user.name, mode: "insensitive" } },
    ],
  };
}

function noteText(a) {
  return (a.patientNotes ?? a.notes ?? "").trim();
}

function buildPatientSummaries(appointments) {
  const now = Date.now();
  const byName = new Map();

  for (const a of appointments) {
    const name = a.patientName.trim();
    if (!byName.has(name)) byName.set(name, []);
    byName.get(name).push(a);
  }

  const rows = [];

  for (const [, appts] of byName) {
    const visitCount = appts.length;
    const lastTouch = new Date(
      Math.max(...appts.map((x) => new Date(x.updatedAt).getTime()))
    );

    const nonTerminal = appts.filter((a) => !TERMINAL.has(a.status));
    const ongoing = nonTerminal.find((a) => a.status === "ONGOING");
    const futureActive = nonTerminal
      .filter((a) => a.status !== "ONGOING" && new Date(a.scheduledAt).getTime() >= now)
      .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
    const pastActive = nonTerminal
      .filter((a) => a.status !== "ONGOING" && new Date(a.scheduledAt).getTime() < now)
      .sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt));

    const nextAppt = ongoing ?? futureActive[0] ?? pastActive[0] ?? null;

    const urgent = appts.some((a) => noteText(a).toLowerCase().includes("urgent"));
    const withNotes = appts.filter((a) => noteText(a));
    const preview = withNotes.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )[0];
    const rawPreview = preview ? noteText(preview) : "";
    const notePreview = rawPreview.length > 120 ? `${rawPreview.slice(0, 120)}…` : rawPreview;

    const latest = [...appts].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )[0];

    let primaryHref = `/doctor/appointments/${latest.id}`;
    let primaryLabel = "View record";

    if (ongoing) {
      primaryHref = `/doctor/consultations/${ongoing.id}`;
      primaryLabel = "Open consultation";
    } else if (futureActive[0]) {
      primaryHref = `/doctor/appointments/${futureActive[0].id}`;
      primaryLabel = "Next visit";
    } else if (pastActive[0]) {
      primaryHref = `/doctor/appointments/${pastActive[0].id}`;
      primaryLabel = "Resume queue";
    }

    const patientId = appts.find((a) => a.patientId)?.patientId ?? null;

    rows.push({
      patientName: appts[0].patientName.trim(),
      patientId,
      visitCount,
      lastTouch: lastTouch.toISOString(),
      ongoing: Boolean(ongoing),
      urgent,
      notePreview: preview ? notePreview : null,
      nextAppt: nextAppt
        ? {
            id: nextAppt.id,
            scheduledAt: new Date(nextAppt.scheduledAt).toISOString(),
            status: nextAppt.status,
          }
        : null,
      primaryHref,
      primaryLabel,
    });
  }

  rows.sort((a, b) => new Date(b.lastTouch) - new Date(a.lastTouch));
  return rows;
}

function buildMonthlyVolume(appointments) {
  const now = new Date();
  const buckets = [];
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    buckets.push({
      label: start.toLocaleDateString(undefined, { month: "short" }),
      count: 0,
      highlight: i === 0,
      startMs: start.getTime(),
      endMs: end.getTime(),
    });
  }
  for (const a of appointments) {
    const ts = new Date(a.scheduledAt).getTime();
    for (const b of buckets) {
      if (ts >= b.startMs && ts < b.endMs) {
        b.count += 1;
        break;
      }
    }
  }
  return buckets.map(({ label, count, highlight }) => ({ label, count, highlight }));
}

function buildStatusSlices(appointments) {
  const counts = Object.fromEntries(STATUS_ORDER.map((s) => [s, 0]));
  for (const a of appointments) {
    if (counts[a.status] !== undefined) counts[a.status] += 1;
  }
  return STATUS_ORDER.map((status) => ({ status, count: counts[status] }));
}

export default async function DoctorPatientsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const session = token ? await verifySessionToken(token).catch(() => null) : null;
  if (!session) redirect("/login?next=/doctor/patients");
  if (session.role !== "DOCTOR") redirect("/dashboard");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true },
  });
  if (!user) redirect("/login?next=/doctor/patients");

  const scope = doctorScope(user);
  const appointments = await prisma.appointment.findMany({
    where: scope,
    orderBy: { updatedAt: "desc" },
    take: FETCH_LIMIT,
    select: {
      id: true,
      patientName: true,
      patientId: true,
      scheduledAt: true,
      updatedAt: true,
      status: true,
      patientNotes: true,
      notes: true,
    },
  });

  const patients = buildPatientSummaries(appointments);

  const now = Date.now();
  const withUpcoming = patients.filter((p) => {
    if (p.ongoing) return true;
    if (!p.nextAppt) return false;
    return new Date(p.nextAppt.scheduledAt).getTime() >= now && !TERMINAL.has(p.nextAppt.status);
  }).length;

  const flagged = patients.filter((p) => p.urgent).length;

  const monthlyVolume = buildMonthlyVolume(appointments);
  const statusSlices = buildStatusSlices(appointments);
  const topPatients = [...patients]
    .sort((a, b) => b.visitCount - a.visitCount)
    .slice(0, 5)
    .map((p) => ({ patientName: p.patientName, visitCount: p.visitCount }));

  return (
    <div className="max-w-5xl mx-auto w-full flex flex-col gap-8">
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric
          icon={Users}
          label="Unique patients"
          value={patients.length}
          hint="Distinct names on your appointments"
        />
        <Metric
          icon={CalendarClock}
          label="Upcoming / live"
          value={withUpcoming}
          hint="Active visits still on the calendar"
        />
        <Metric
          icon={ClipboardList}
          label="Flagged notes"
          value={flagged}
          hint="“Urgent” mentioned in a chart note"
        />
        <Metric
          icon={UserRound}
          label="Appointments loaded"
          value={appointments.length}
          hint={
            appointments.length >= FETCH_LIMIT
              ? `Showing latest ${FETCH_LIMIT} touches`
              : "All assigned touches"
          }
        />
      </section>

      <DoctorPatientsAnalytics
        monthlyVolume={monthlyVolume}
        statusSlices={statusSlices}
        topPatients={topPatients}
      />

      <section className="panel p-6">
        <PanelHead
          eyebrow="Directory"
          title="Patient list"
          action={{ href: "/doctor/dashboard", label: "Back to overview" }}
        />
        <p className="text-xs text-foreground/50 mt-1">
          Names and visits come from appointments assigned to you. Links favor the next open visit, then
          the most recent record.
        </p>
        <div className="mt-6">
          <DoctorPatientDirectory patients={patients} />
        </div>
      </section>
    </div>
  );
}
