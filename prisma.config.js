// Prisma config (JavaScript-only).
// Uses DIRECT_URL for migrations (direct connection),
// while the app uses DATABASE_URL (pooler/pgbouncer) at runtime.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js",
  },
  datasource: {
    url: process.env.DIRECT_URL,
  },
});

