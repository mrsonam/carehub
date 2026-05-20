import { prisma } from "@/lib/prisma";
import { startOfDay } from "@/lib/dashboard-format";

const TERMINAL = ["CANCELLED", "COMPLETED", "NO_SHOW"];
const STATUS_ORDER = ["REQUESTED", "CONFIRMED", "ONGOING", "COMPLETED", "CANCELLED", "NO_SHOW"];
const DURATION_ORDER = [15, 30, 45, 60];

function dayKey(d) {
  const x = startOfDay(d);
  return x.toISOString().slice(0, 10);
}

function formatShortDay(d) {
  return new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Sydney",
    weekday: "short",
    day: "numeric",
  }).format(d);
}

function formatMonthLabel(d) {
  return new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Sydney",
    month: "short",
  }).format(d);
}

function pctChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function centsToAud(cents) {
  return (cents / 100).toLocaleString("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  });
}

export async function loadAdminAnalytics() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const rangeEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const periodDays = 30;
  const periodStart = startOfDay(new Date(todayStart.getTime() - (periodDays - 1) * 24 * 60 * 60 * 1000));
  const priorPeriodStart = startOfDay(
    new Date(periodStart.getTime() - periodDays * 24 * 60 * 60 * 1000)
  );

  const [
    totalAppointments,
    periodAppointments,
    priorPeriodAppointments,
    allInRange,
    statusGroups,
    durationGroups,
    doctorGroups,
    paymentStatusGroups,
    paymentMethodPaid,
    patientsTotal,
    patientsNewPeriod,
    patientsNewPrior,
    doctorsTotal,
  ] = await Promise.all([
    prisma.appointment.count(),
    prisma.appointment.count({
      where: { scheduledAt: { gte: periodStart, lt: rangeEnd } },
    }),
    prisma.appointment.count({
      where: {
        scheduledAt: { gte: priorPeriodStart, lt: periodStart },
      },
    }),
    prisma.appointment.findMany({
      where: { scheduledAt: { gte: priorPeriodStart, lt: rangeEnd } },
      select: {
        scheduledAt: true,
        status: true,
        durationMinutes: true,
        feeAmountCents: true,
        paymentStatus: true,
        paymentMethod: true,
        paidAt: true,
        doctorName: true,
      },
    }),
    prisma.appointment.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.appointment.groupBy({
      by: ["durationMinutes"],
      _count: { _all: true },
    }),
    prisma.appointment.groupBy({
      by: ["doctorName"],
      _count: { _all: true },
      where: { doctorName: { not: null } },
      orderBy: { _count: { doctorName: "desc" } },
      take: 8,
    }),
    prisma.appointment.groupBy({
      by: ["paymentStatus"],
      _count: { _all: true },
    }),
    prisma.appointment.groupBy({
      by: ["paymentMethod"],
      _count: { _all: true },
      where: { paymentStatus: "PAID", paymentMethod: { not: null } },
    }),
    prisma.user.count({ where: { role: "PATIENT" } }),
    prisma.user.count({
      where: { role: "PATIENT", createdAt: { gte: periodStart } },
    }),
    prisma.user.count({
      where: {
        role: "PATIENT",
        createdAt: { gte: priorPeriodStart, lt: periodStart },
      },
    }),
    prisma.user.count({ where: { role: "DOCTOR" } }),
  ]);

  const periodRows = allInRange.filter((r) => r.scheduledAt >= periodStart);
  const priorRows = allInRange.filter(
    (r) => r.scheduledAt >= priorPeriodStart && r.scheduledAt < periodStart
  );

  const completed = periodRows.filter((r) => r.status === "COMPLETED").length;
  const priorCompleted = priorRows.filter((r) => r.status === "COMPLETED").length;
  const noShows = periodRows.filter((r) => r.status === "NO_SHOW").length;
  const priorNoShows = priorRows.filter((r) => r.status === "NO_SHOW").length;
  const cancelled = periodRows.filter((r) => r.status === "CANCELLED").length;

  const completionRate =
    periodRows.length > 0 ? Math.round((completed / periodRows.length) * 100) : 0;
  const noShowRate =
    periodRows.length > 0 ? Math.round((noShows / periodRows.length) * 100) : 0;

  const revenueCents = periodRows
    .filter((r) => r.paymentStatus === "PAID")
    .reduce((s, r) => s + (r.feeAmountCents || 0), 0);
  const priorRevenueCents = priorRows
    .filter((r) => r.paymentStatus === "PAID")
    .reduce((s, r) => s + (r.feeAmountCents || 0), 0);

  const paidOnline = periodRows.filter(
    (r) => r.paymentStatus === "PAID" && r.paymentMethod === "STRIPE"
  ).length;
  const paidCounter = periodRows.filter(
    (r) => r.paymentStatus === "PAID" && r.paymentMethod === "PAY_AT_COUNTER"
  ).length;
  const unpaidFees = periodRows.filter(
    (r) => r.paymentStatus === "UNPAID" && r.feeAmountCents > 0
  ).length;

  const volumeByDay = Array.from({ length: periodDays }, (_, i) => {
    const d = new Date(periodStart.getTime() + i * 24 * 60 * 60 * 1000);
    return {
      key: dayKey(d),
      label: formatShortDay(d),
      scheduled: 0,
      completed: 0,
      cancelled: 0,
    };
  });
  const dayIndex = new Map(volumeByDay.map((b, i) => [b.key, i]));

  for (const row of periodRows) {
    const idx = dayIndex.get(dayKey(row.scheduledAt));
    if (idx === undefined) continue;
    volumeByDay[idx].scheduled += 1;
    if (row.status === "COMPLETED") volumeByDay[idx].completed += 1;
    if (row.status === "CANCELLED") volumeByDay[idx].cancelled += 1;
  }

  const revenueByMonth = [];
  for (let m = 5; m >= 0; m -= 1) {
    const d = new Date(todayStart.getFullYear(), todayStart.getMonth() - m, 1);
    const monthStart = startOfDay(d);
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const cents = allInRange
      .filter(
        (r) =>
          r.paymentStatus === "PAID" &&
          r.paidAt &&
          r.paidAt >= monthStart &&
          r.paidAt < monthEnd
      )
      .reduce((s, r) => s + (r.feeAmountCents || 0), 0);
    revenueByMonth.push({
      label: formatMonthLabel(d),
      cents,
      highlight: m === 0,
    });
  }

  const hourBuckets = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    label: `${String(h).padStart(2, "0")}:00`,
    count: 0,
  }));
  for (const row of periodRows) {
    const h = new Date(row.scheduledAt).getHours();
    hourBuckets[h].count += 1;
  }
  const peakHour = hourBuckets.reduce(
    (best, b) => (b.count > best.count ? b : best),
    hourBuckets[0]
  );

  const statusItems = STATUS_ORDER.map((status) => {
    const found = statusGroups.find((g) => g.status === status);
    return { status, count: found?._count._all ?? 0 };
  }).filter((s) => s.count > 0);

  const durationItems = DURATION_ORDER.map((minutes) => {
    const found = durationGroups.find((g) => g.durationMinutes === minutes);
    return { minutes, count: found?._count._all ?? 0 };
  });

  const paymentStatusItems = paymentStatusGroups.map((g) => ({
    status: g.paymentStatus,
    count: g._count._all,
  }));

  const paymentMethodItems = [
    { method: "STRIPE", label: "Online (Stripe)", count: 0 },
    { method: "PAY_AT_COUNTER", label: "At counter", count: 0 },
  ];
  for (const g of paymentMethodPaid) {
    const item = paymentMethodItems.find((p) => p.method === g.paymentMethod);
    if (item) item.count = g._count._all;
  }

  const doctorItems = doctorGroups
    .filter((g) => g.doctorName)
    .map((g) => ({
      name: g.doctorName,
      count: g._count._all,
    }));

  const avgDuration =
    periodRows.length > 0
      ? Math.round(
          periodRows.reduce((s, r) => s + (r.durationMinutes || 15), 0) / periodRows.length
        )
      : 15;

  return {
    generatedAt: now.toISOString(),
    periodLabel: `Last ${periodDays} days`,
    kpis: [
      {
        id: "volume",
        label: "Appointments",
        value: periodAppointments,
        hint: `${totalAppointments} all time`,
        delta: pctChange(periodAppointments, priorPeriodAppointments),
      },
      {
        id: "completed",
        label: "Completed",
        value: completed,
        hint: `${completionRate}% completion rate`,
        delta: pctChange(completed, priorCompleted),
      },
      {
        id: "revenue",
        label: "Revenue collected",
        value: centsToAud(revenueCents),
        hint: `${paidOnline + paidCounter} paid visits`,
        delta: pctChange(revenueCents, priorRevenueCents),
        numeric: false,
      },
      {
        id: "noshow",
        label: "No-show rate",
        value: `${noShowRate}%`,
        hint: `${noShows} no-shows · ${cancelled} cancelled`,
        delta: pctChange(noShows, priorNoShows),
        invertDelta: true,
      },
      {
        id: "patients",
        label: "New patients",
        value: patientsNewPeriod,
        hint: `${patientsTotal} registered`,
        delta: pctChange(patientsNewPeriod, patientsNewPrior),
      },
      {
        id: "duration",
        label: "Avg visit length",
        value: `${avgDuration} min`,
        hint: `${doctorsTotal} active doctors`,
        delta: null,
        numeric: false,
      },
    ],
    volumeByDay,
    revenueByMonth,
    hourBuckets,
    peakHour: peakHour.count > 0 ? peakHour : null,
    statusItems,
    durationItems,
    paymentStatusItems,
    paymentMethodItems,
    doctorItems,
    paymentSummary: {
      revenueCents,
      revenueFormatted: centsToAud(revenueCents),
      paidOnline,
      paidCounter,
      unpaidFees,
      collectionRate:
        periodRows.filter((r) => r.feeAmountCents > 0).length > 0
          ? Math.round(
              ((paidOnline + paidCounter) /
                periodRows.filter((r) => r.feeAmountCents > 0).length) *
                100
            )
          : 0,
    },
  };
}
