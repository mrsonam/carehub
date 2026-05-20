import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CalendarDays, Clock3, Repeat2 } from "lucide-react";
import { getSessionCookieName, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Metric } from "../../components/dashboard/DashboardPanels";
import { AvailabilityPlanner } from "./AvailabilityPlanner";

export const dynamic = "force-dynamic";

function serializeRule(rule) {
  return {
    id: rule.id,
    weekday: rule.weekday,
    startMinutes: rule.startMinutes,
    endMinutes: rule.endMinutes,
  };
}

function serializeOverride(override) {
  return {
    id: override.id,
    date: override.date.toISOString(),
    isUnavailable: override.isUnavailable,
    startMinutes: override.startMinutes,
    endMinutes: override.endMinutes,
  };
}

export default async function DoctorAvailabilityPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const session = token ? await verifySessionToken(token).catch(() => null) : null;
  if (!session) redirect("/login?next=/doctor/availability");
  if (session.role !== "DOCTOR") redirect("/dashboard");

  const doctor = await prisma.user.findFirst({
    where: { id: session.userId, role: "DOCTOR" },
    select: { id: true, name: true },
  });
  if (!doctor) redirect("/dashboard");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [rules, overrides] = await Promise.all([
    prisma.doctorAvailabilityRule.findMany({
      where: { doctorId: doctor.id },
      orderBy: [{ weekday: "asc" }, { startMinutes: "asc" }],
    }),
    prisma.doctorAvailabilityOverride.findMany({
      where: {
        doctorId: doctor.id,
        date: { gte: today },
      },
      orderBy: [{ date: "asc" }, { startMinutes: "asc" }],
    }),
  ]);

  const activeDays = new Set(rules.map((rule) => rule.weekday)).size;
  const overrideDays = new Set(overrides.map((override) => override.date.toISOString().slice(0, 10))).size;
  const defaultBlocks = rules.length;

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/45">
            Availability
          </p>
          <h1 className="mt-2 text-3xl lg:text-4xl font-extrabold font-manrope tracking-tight">
            Manage your schedule
          </h1>
          <p className="text-foreground/55 mt-1.5 text-sm max-w-2xl">
            Define weekly defaults, then override specific dates for leave, extra clinics, or short days.
          </p>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Metric
          icon={Repeat2}
          label="Default days"
          value={activeDays}
          hint="days with weekly availability"
        />
        <Metric
          icon={CalendarDays}
          label="Overrides"
          value={overrideDays}
          hint="future dates customized"
        />
        <Metric
          icon={Clock3}
          label="Default blocks"
          value={defaultBlocks}
          hint="weekly time blocks"
        />
      </section>

      <AvailabilityPlanner
        rules={rules.map(serializeRule)}
        overrides={overrides.map(serializeOverride)}
      />
    </div>
  );
}
