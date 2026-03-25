import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const rows = await prisma.$queryRaw`SELECT 1 AS ok`;
    return Response.json({
      ok: true,
      dbOk: rows?.[0]?.ok === 1,
    });
  } catch (err) {
    return Response.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}

