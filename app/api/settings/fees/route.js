import { getSessionUserOrErrorResponse } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { ALLOWED_DURATIONS } from "@/lib/payments/fees.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FEE_FIELDS = {
  15: "fee15Cents",
  30: "fee30Cents",
  45: "fee45Cents",
  60: "fee60Cents",
};

export async function GET() {
  const auth = await getSessionUserOrErrorResponse();
  if (auth.response) return auth.response;

  const schedule = await prisma.clinicFeeSchedule.findUnique({ where: { id: "default" } });
  if (!schedule) {
    return Response.json({ ok: false, error: "Fee schedule not found." }, { status: 404 });
  }
  return Response.json({ ok: true, schedule });
}

export async function PATCH(request) {
  const auth = await getSessionUserOrErrorResponse();
  if (auth.response) return auth.response;
  if (auth.user.role !== "ADMIN") {
    return Response.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const data = {};
  for (const minutes of ALLOWED_DURATIONS) {
    const key = FEE_FIELDS[minutes];
    if (body[key] !== undefined) {
      const cents = Number(body[key]);
      if (!Number.isInteger(cents) || cents < 0) {
        return Response.json({ ok: false, error: `Invalid ${key}.` }, { status: 400 });
      }
      data[key] = cents;
    }
  }
  if (Object.keys(data).length === 0) {
    return Response.json({ ok: false, error: "Nothing to update." }, { status: 400 });
  }

  const schedule = await prisma.clinicFeeSchedule.update({
    where: { id: "default" },
    data,
  });
  return Response.json({ ok: true, schedule });
}
