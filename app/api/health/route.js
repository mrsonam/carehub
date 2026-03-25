export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  // Some build pipelines may attempt to evaluate routes during `next build`.
  // Never block the build on external DB connectivity.
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return Response.json({ ok: true, skipped: "build" });
  }

  try {
    const { prisma } = await import("@/lib/prisma");
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

