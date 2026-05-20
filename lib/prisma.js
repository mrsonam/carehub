import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis;

/**
 * Serverless (Vercel, Lambda): one physical connection per instance is enough; a
 * higher default multiplied by concurrency exhausts Postgres (e.g. Supabase EMAXCONN).
 * Override with DATABASE_POOL_MAX for long-lived Node servers.
 */
function defaultPoolMax() {
  const raw = process.env.DATABASE_POOL_MAX;
  if (raw != null && raw !== "") {
    const n = Number.parseInt(raw, 10);
    if (Number.isFinite(n) && n >= 1) return n;
  }
  const serverless =
    Boolean(process.env.VERCEL) || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
  return serverless ? 1 : 10;
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.warn("[Prisma] DATABASE_URL is not set. Prisma will not connect.");
  }

  const max = defaultPoolMax();

  const pool = new pg.Pool({
    connectionString,
    max,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 15_000,
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

/** True when this PrismaClient includes current schema delegates (after `prisma generate`). */
function hasNotificationDelegate(client) {
  return typeof client?.notification?.findMany === "function";
}

function resolvePrismaClient() {
  const cached = globalForPrisma.prisma;
  if (cached && hasNotificationDelegate(cached)) {
    return cached;
  }

  if (cached && !hasNotificationDelegate(cached)) {
    console.warn(
      "[Prisma] Replacing stale global client (missing `notification` delegate). Run `npx prisma generate`, then reload if errors persist."
    );
    cached.$disconnect?.().catch(() => {});
    globalForPrisma.prisma = undefined;
  }

  const prisma = createPrismaClient();

  if (!hasNotificationDelegate(prisma)) {
    console.error(
      "[Prisma] `@prisma/client` is missing the `Notification` model. Run `npx prisma generate` and reinstall if needed."
    );
  }

  // Always cache on globalThis so dev HMR and any double-init reuse one pool (Next.js).
  globalForPrisma.prisma = prisma;

  return prisma;
}

export const prisma = resolvePrismaClient();

