const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const pg = require("pg");
const bcrypt = require("bcryptjs");

function createPrismaClient() {
  const connectionString = process.env.SEED_DATABASE_URL || process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("SEED_DATABASE_URL (or DIRECT_URL / DATABASE_URL) is not set");
  }

  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

async function main() {
  const password = "admin123";
  const passwordHash = await bcrypt.hash(password, 12);

  const users = [
    { name: "Admin User", email: "admin@carehub.local", role: "ADMIN" },
    { name: "Doctor User", email: "doctor@carehub.local", role: "DOCTOR" },
    { name: "Patient User", email: "patient@carehub.local", role: "PATIENT" },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, passwordHash },
      create: { name: u.name, email: u.email, role: u.role, passwordHash },
    });
  }

  console.log("Seeded users:");
  console.log("- admin@carehub.local / admin123 (ADMIN)");
  console.log("- doctor@carehub.local / admin123 (DOCTOR)");
  console.log("- patient@carehub.local / admin123 (PATIENT)");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect().finally(() => process.exit(1));
  });

