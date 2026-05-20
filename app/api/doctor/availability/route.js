import { getSessionUserOrErrorResponse } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function doctorOnly(auth) {
  if (auth.response) return auth.response;
  if (auth.user.role !== "DOCTOR") {
    return Response.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  return null;
}

function normalizeDate(value) {
  if (typeof value !== "string") return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  return new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00.000Z`);
}

function nextDay(date) {
  const end = new Date(date);
  end.setUTCDate(end.getUTCDate() + 1);
  return end;
}

function numberValue(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function validateTimeBlock({ startMinutes, endMinutes }) {
  if (
    !Number.isInteger(startMinutes) ||
    !Number.isInteger(endMinutes) ||
    startMinutes < 0 ||
    endMinutes > 24 * 60 ||
    startMinutes >= endMinutes
  ) {
    return "Choose a valid start and end time.";
  }
  return null;
}

function parseTimeBlock(body) {
  const startMinutes = numberValue(body.startMinutes);
  const endMinutes = numberValue(body.endMinutes);
  return { startMinutes, endMinutes };
}

function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

function hasOverlap(block, existingBlocks, excludeId = "") {
  return existingBlocks.some((row) => {
    if (excludeId && row.id === excludeId) return false;
    return rangesOverlap(
      block.startMinutes,
      block.endMinutes,
      row.startMinutes ?? 0,
      row.endMinutes ?? 0
    );
  });
}

export async function POST(request) {
  const auth = await getSessionUserOrErrorResponse();
  const blocked = doctorOnly(auth);
  if (blocked) return blocked;

  const body = await request.json().catch(() => ({}));

  if (body.type === "rule") {
    const weekday = numberValue(body.weekday);
    if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
      return Response.json({ ok: false, error: "Choose a valid weekday." }, { status: 400 });
    }
    const block = parseTimeBlock(body);
    const error = validateTimeBlock(block);
    if (error) return Response.json({ ok: false, error }, { status: 400 });
    const existingRules = await prisma.doctorAvailabilityRule.findMany({
      where: { doctorId: auth.user.id, weekday },
      select: { id: true, startMinutes: true, endMinutes: true },
    });
    if (hasOverlap(block, existingRules)) {
      return Response.json(
        { ok: false, error: "This time overlaps with an existing weekly availability block." },
        { status: 400 }
      );
    }

    const rule = await prisma.doctorAvailabilityRule.create({
      data: { doctorId: auth.user.id, weekday, ...block },
    });
    return Response.json({ ok: true, rule }, { status: 201 });
  }

  if (body.type === "override") {
    const date = normalizeDate(body.date);
    if (!date) {
      return Response.json({ ok: false, error: "Choose a valid date." }, { status: 400 });
    }

    if (body.isUnavailable) {
      const dateEnd = nextDay(date);
      await prisma.doctorAvailabilityOverride.deleteMany({
        where: {
          doctorId: auth.user.id,
          date: { gte: date, lt: dateEnd },
        },
      });
      const override = await prisma.doctorAvailabilityOverride.create({
        data: { doctorId: auth.user.id, date, isUnavailable: true },
      });
      return Response.json({ ok: true, override }, { status: 201 });
    }

    const block = parseTimeBlock(body);
    const error = validateTimeBlock(block);
    if (error) return Response.json({ ok: false, error }, { status: 400 });

    const dateEnd = nextDay(date);
    const existingOverrides = await prisma.doctorAvailabilityOverride.findMany({
      where: {
        doctorId: auth.user.id,
        date: { gte: date, lt: dateEnd },
        isUnavailable: false,
      },
      select: { id: true, startMinutes: true, endMinutes: true },
    });
    if (hasOverlap(block, existingOverrides)) {
      return Response.json(
        { ok: false, error: "This time overlaps with an existing override block for this date." },
        { status: 400 }
      );
    }
    await prisma.doctorAvailabilityOverride.deleteMany({
      where: {
        doctorId: auth.user.id,
        date: { gte: date, lt: dateEnd },
        isUnavailable: true,
      },
    });
    const override = await prisma.doctorAvailabilityOverride.create({
      data: { doctorId: auth.user.id, date, isUnavailable: false, ...block },
    });
    return Response.json({ ok: true, override }, { status: 201 });
  }

  return Response.json({ ok: false, error: "Unknown availability type." }, { status: 400 });
}

export async function PATCH(request) {
  const auth = await getSessionUserOrErrorResponse();
  const blocked = doctorOnly(auth);
  if (blocked) return blocked;

  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === "string" ? body.id : "";

  if (body.type === "rule") {
    const block = parseTimeBlock(body);
    const error = validateTimeBlock(block);
    if (error) return Response.json({ ok: false, error }, { status: 400 });
    const existingRule = await prisma.doctorAvailabilityRule.findFirst({
      where: { id, doctorId: auth.user.id },
      select: { id: true, weekday: true },
    });
    if (!existingRule) {
      return Response.json({ ok: false, error: "Availability block not found." }, { status: 404 });
    }
    const existingRules = await prisma.doctorAvailabilityRule.findMany({
      where: { doctorId: auth.user.id, weekday: existingRule.weekday },
      select: { id: true, startMinutes: true, endMinutes: true },
    });
    if (hasOverlap(block, existingRules, id)) {
      return Response.json(
        { ok: false, error: "This time overlaps with an existing weekly availability block." },
        { status: 400 }
      );
    }

    const rule = await prisma.doctorAvailabilityRule.updateMany({
      where: { id, doctorId: auth.user.id },
      data: block,
    });
    if (rule.count === 0) {
      return Response.json({ ok: false, error: "Availability block not found." }, { status: 404 });
    }
    return Response.json({ ok: true });
  }

  if (body.type === "override") {
    const block = parseTimeBlock(body);
    const error = validateTimeBlock(block);
    if (error) return Response.json({ ok: false, error }, { status: 400 });
    const existingOverride = await prisma.doctorAvailabilityOverride.findFirst({
      where: { id, doctorId: auth.user.id },
      select: { id: true, date: true },
    });
    if (!existingOverride) {
      return Response.json({ ok: false, error: "Override block not found." }, { status: 404 });
    }
    const date = new Date(existingOverride.date);
    const dateEnd = nextDay(date);
    const existingOverrides = await prisma.doctorAvailabilityOverride.findMany({
      where: {
        doctorId: auth.user.id,
        date: { gte: date, lt: dateEnd },
        isUnavailable: false,
      },
      select: { id: true, startMinutes: true, endMinutes: true },
    });
    if (hasOverlap(block, existingOverrides, id)) {
      return Response.json(
        { ok: false, error: "This time overlaps with an existing override block for this date." },
        { status: 400 }
      );
    }

    const override = await prisma.doctorAvailabilityOverride.updateMany({
      where: { id, doctorId: auth.user.id },
      data: { isUnavailable: false, ...block },
    });
    if (override.count === 0) {
      return Response.json({ ok: false, error: "Override block not found." }, { status: 404 });
    }
    return Response.json({ ok: true });
  }

  return Response.json({ ok: false, error: "Unknown availability type." }, { status: 400 });
}

export async function DELETE(request) {
  const auth = await getSessionUserOrErrorResponse();
  const blocked = doctorOnly(auth);
  if (blocked) return blocked;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const id = searchParams.get("id") ?? "";

  if (type === "rule") {
    await prisma.doctorAvailabilityRule.deleteMany({
      where: { id, doctorId: auth.user.id },
    });
    return Response.json({ ok: true });
  }

  if (type === "override") {
    await prisma.doctorAvailabilityOverride.deleteMany({
      where: { id, doctorId: auth.user.id },
    });
    return Response.json({ ok: true });
  }

  if (type === "override-day") {
    const date = normalizeDate(searchParams.get("date"));
    if (!date) {
      return Response.json({ ok: false, error: "Choose a valid date." }, { status: 400 });
    }
    const dateEnd = nextDay(date);
    await prisma.doctorAvailabilityOverride.deleteMany({
      where: {
        doctorId: auth.user.id,
        date: { gte: date, lt: dateEnd },
      },
    });
    return Response.json({ ok: true });
  }

  return Response.json({ ok: false, error: "Unknown availability type." }, { status: 400 });
}
