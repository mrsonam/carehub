import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarClock, CalendarCheck2 } from "lucide-react";
import { getSessionCookieName, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PanelHead } from "../../components/DashboardPanels";
import { formatApptTime } from "@/lib/dashboard-format";

export const dynamic = "force-dynamic";

function scopeForPatient(name) {
  return { patientName: { equals: name, mode: "insensitive" } };
}

export default async function PatientAppointmentsPage({ searchParams }) {
  const sp = await Promise.resolve(searchParams);
  const focus = sp?.focus;

  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const session = token ? await verifySessionToken(token).catch(() => null) : null;
  if (!session) redirect("/login?next=/dashboard/patient/appointments");
  if (session.role !== "PATIENT") redirect("/dashboard");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true },
  });
  if (!user) redirect("/login?next=/dashboard/patient/appointments");

  const w = scopeForPatient(user.name);
  const now = new Date();

  const [upcoming, past] = await Promise.all([
    prisma.appointment.findMany({
      where: { ...w, scheduledAt: { gte: now } },
      orderBy: { scheduledAt: "asc" },
    }),
    prisma.appointment.findMany({
      where: { ...w, scheduledAt: { lt: now } },
      orderBy: { scheduledAt: "desc" },
      take: 50,
    }),
  ]);

  return (
    <div className="max-w-3xl mx-auto w-full flex flex-col gap-8">
      <div>
        <Link
          href="/dashboard/patient"
          className="text-xs font-semibold text-primary hover:text-primary-container"
        >
          ← Back to overview
        </Link>
        <h1 className="mt-3 text-2xl font-extrabold font-manrope tracking-tight">
          Your appointments
        </h1>
        <p className="text-sm text-foreground/55 mt-1">
          Visits tied to your name on file.
        </p>
      </div>

      <section className="panel p-6">
        <PanelHead eyebrow="Upcoming" title="Scheduled ahead" />
        {upcoming.length === 0 ? (
          <p className="mt-4 text-sm text-foreground/50">None scheduled.</p>
        ) : (
          <ul className="mt-4 divide-y divide-primary/[0.06]">
            {upcoming.map((a) => (
              <li
                key={a.id}
                id={a.id}
                className={`flex gap-3 py-3.5 text-sm first:pt-0 last:pb-0 ${
                  focus === a.id ? "bg-primary/[0.04] -mx-2 px-2 rounded-md" : ""
                }`}
              >
                <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <CalendarClock size={16} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{formatApptTime(a.scheduledAt)}</p>
                  <p className="text-xs text-foreground/50 mt-0.5">
                    {a.doctorName ? `with ${a.doctorName}` : "Clinician TBD"}
                    {a.notes ? ` · ${a.notes}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel p-6">
        <PanelHead eyebrow="Past" title="Visit history" />
        {past.length === 0 ? (
          <p className="mt-4 text-sm text-foreground/50">No past visits yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-primary/[0.06]">
            {past.map((a) => (
              <li
                key={a.id}
                className="flex gap-3 py-3.5 text-sm first:pt-0 last:pb-0"
              >
                <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <CalendarCheck2 size={16} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{formatApptTime(a.scheduledAt)}</p>
                  <p className="text-xs text-foreground/50 mt-0.5">
                    {a.doctorName ? `with ${a.doctorName}` : "Clinician"}
                    {a.notes ? ` · ${a.notes}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
