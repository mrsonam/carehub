import { prisma } from "@/lib/prisma";
import {
  ALLOWED_BOOKING_DURATIONS,
  computeAvailableSlots,
  normalizeBookingDate,
} from "@/lib/booking/slots";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const date = normalizeBookingDate(searchParams.get("date"));
  const durationMinutes = Number(searchParams.get("duration") ?? 15);

  if (!date) {
    return Response.json({ ok: false, error: "Choose a valid date." }, { status: 400 });
  }
  if (!ALLOWED_BOOKING_DURATIONS.has(durationMinutes)) {
    return Response.json({ ok: false, error: "Choose a valid duration." }, { status: 400 });
  }

  const doctor = await prisma.user.findFirst({
    where: { id, role: "DOCTOR" },
    select: { id: true, name: true },
  });
  if (!doctor) {
    return Response.json({ ok: false, error: "Doctor not found." }, { status: 404 });
  }

  const { source, slots } = await computeAvailableSlots(prisma, {
    doctorId: doctor.id,
    date,
    durationMinutes,
  });

  return Response.json({
    ok: true,
    doctor,
    date,
    durationMinutes,
    source,
    slots,
  });
}
