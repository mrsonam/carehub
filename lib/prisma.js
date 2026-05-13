import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis;

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.warn("[Prisma] DATABASE_URL is not set. Prisma will not connect.");
  }

  const pool = new pg.Pool({
    connectionString,
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

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }

  return prisma;
}

export const prisma = resolvePrismaClient();

