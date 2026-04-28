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

  const seededUsers = {};
  for (const u of users) {
    const profileDone =
      u.role === "DOCTOR" || u.role === "ADMIN" ? new Date() : null;
    seededUsers[u.role] = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        role: u.role,
        passwordHash,
        mustChangePassword: false,
        ...(u.role === "DOCTOR" || u.role === "ADMIN"
          ? { profileCompletedAt: profileDone }
          : {}),
      },
      create: {
        name: u.name,
        email: u.email,
        role: u.role,
        passwordHash,
        mustChangePassword: false,
        profileCompletedAt: profileDone,
      },
    });
  }

  const existingAppointments = await prisma.appointment.count();
  if (existingAppointments === 0) {
    const now = new Date();
    const appointmentFixtures = [
      {
        patientId: seededUsers.PATIENT.id,
        doctorId: seededUsers.DOCTOR.id,
        patientName: seededUsers.PATIENT.name,
        doctorName: seededUsers.DOCTOR.name,
        status: "CONFIRMED",
        scheduledAt: new Date(now.getTime() + 2 * 60 * 60 * 1000),
        patientNotes: "Annual check-in and care plan review.",
      },
      {
        patientId: seededUsers.PATIENT.id,
        doctorId: seededUsers.DOCTOR.id,
        patientName: seededUsers.PATIENT.name,
        doctorName: seededUsers.DOCTOR.name,
        status: "REQUESTED",
        scheduledAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        patientNotes: "Follow-up on recent bloodwork.",
      },
      {
        patientId: seededUsers.PATIENT.id,
        doctorId: seededUsers.DOCTOR.id,
        patientName: seededUsers.PATIENT.name,
        doctorName: seededUsers.DOCTOR.name,
        status: "COMPLETED",
        scheduledAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        patientNotes: "Routine visit completed.",
        doctorNotes: "No acute concerns. Continue current care plan.",
      },
    ];

    await prisma.appointment.createMany({ data: appointmentFixtures });
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

