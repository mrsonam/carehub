import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { getSessionCookieName, verifySessionToken } from "@/lib/auth";
import { loadAdminAnalytics } from "@/lib/admin-analytics";
import { PanelHead } from "../../components/dashboard/DashboardPanels";
import {
  AnalyticsKpiGrid,
  VolumeAreaChart,
  RevenueBarsChart,
  StatusDonutChart,
  HourlyDemandChart,
  DurationMixChart,
  PaymentInsightsPanel,
  DoctorLeaderboard,
} from "../../components/admin/analytics/AdminAnalyticsCharts";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const session = token ? await verifySessionToken(token).catch(() => null) : null;
  if (!session) redirect("/login?next=/admin/analytics");
  if (session.role !== "ADMIN") redirect("/dashboard");

  const data = await loadAdminAnalytics();
  const statusTotal = data.statusItems.reduce((s, i) => s + i.count, 0);
  const periodVolume = data.kpis.find((k) => k.id === "volume")?.value ?? 0;

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-8">
      <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/45">
            Intelligence
          </p>
          <h1 className="mt-2 text-3xl lg:text-4xl font-extrabold font-manrope tracking-tight">
            Clinic analytics
          </h1>
          <p className="text-foreground/55 mt-1.5 text-sm max-w-2xl">
            {data.periodLabel} of operational, clinical, and payment data. Deltas compare to the
            prior 30-day window.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/appointments"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-white text-sm font-semibold shadow-sm shadow-primary/20 hover:bg-primary-container transition-colors duration-200 active:scale-[0.98]"
          >
            <CalendarDays size={15} aria-hidden />
            Appointments
          </Link>
        </div>
      </header>

      <AnalyticsKpiGrid kpis={data.kpis} />

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="panel p-6 xl:col-span-2">
          <PanelHead
            eyebrow="Volume"
            title="Daily appointments"
            legend={[
              { label: "Scheduled", tone: "secondary" },
              { label: "Completed", tone: "primary" },
            ]}
          />
          <div className="mt-6">
            <VolumeAreaChart days={data.volumeByDay} />
          </div>
        </div>

        <div className="panel p-6">
          <PanelHead eyebrow="Payments" title="Revenue trend" />
          <div className="mt-6">
            <RevenueBarsChart months={data.revenueByMonth} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="panel p-6">
          <PanelHead eyebrow="Pipeline" title="Status mix" />
          <div className="mt-6">
            <StatusDonutChart items={data.statusItems} total={statusTotal} />
          </div>
        </div>

        <div className="panel p-6">
          <PanelHead eyebrow="Demand" title="Busiest hours" />
          <div className="mt-6">
            <HourlyDemandChart buckets={data.hourBuckets} peakHour={data.peakHour} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="panel p-6">
          <PanelHead eyebrow="Scheduling" title="Visit length mix" />
          <div className="mt-6">
            <DurationMixChart items={data.durationItems} />
          </div>
        </div>

        <div className="panel p-6 lg:col-span-2">
          <PanelHead eyebrow="Billing" title="Payment performance" />
          <div className="mt-6">
            <PaymentInsightsPanel
              summary={data.paymentSummary}
              paymentMethodItems={data.paymentMethodItems}
              paymentStatusItems={data.paymentStatusItems}
            />
          </div>
        </div>
      </section>

      <section className="panel p-6">
        <PanelHead
          eyebrow="Capacity"
          title="Doctor workload"
          action={{ href: "/admin/doctors", label: "Manage doctors" }}
        />
        <DoctorLeaderboard items={data.doctorItems} totalAppointments={periodVolume} />
      </section>

      <p className="text-[11px] text-foreground/40 text-center pb-2">
        Figures use clinic timezone (Australia/Sydney). Revenue reflects collected fees on paid
        appointments only.
      </p>
    </div>
  );
}
