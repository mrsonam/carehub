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
  await prisma.clinicFeeSchedule.upsert({
    where: { id: "default" },
    create: { id: "default" },
    update: {},
  });

  const password = "admin123";
  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@carehub.local" },
    update: {
      name: "Admin User",
      role: "ADMIN",
      passwordHash,
      mustChangePassword: false,
      profileCompletedAt: new Date(),
    },
    create: {
      name: "Admin User",
      email: "admin@carehub.local",
      role: "ADMIN",
      passwordHash,
      mustChangePassword: false,
      profileCompletedAt: new Date(),
    },
  });

  const patient = await prisma.user.upsert({
    where: { email: "patient@carehub.local" },
    update: {
      name: "Patient User",
      role: "PATIENT",
      passwordHash,
      mustChangePassword: false,
    },
    create: {
      name: "Patient User",
      email: "patient@carehub.local",
      role: "PATIENT",
      passwordHash,
      mustChangePassword: false,
    },
  });

  const doctorsSeed = [
    {
      name: "Dr. Amelia Hart",
      email: "amelia.hart@carehub.local",
      title: "General Practitioner (Family Medicine)",
      phone: "(02) 5555 2101",
      bio: "Focuses on preventive family medicine, chronic disease monitoring, and coordinated long-term care plans.",
      category: "General Practice",
      availability: [
        { weekday: 1, startMinutes: 9 * 60, endMinutes: 13 * 60 },
        { weekday: 1, startMinutes: 14 * 60, endMinutes: 17 * 60 },
        { weekday: 3, startMinutes: 9 * 60, endMinutes: 13 * 60 },
        { weekday: 5, startMinutes: 10 * 60, endMinutes: 15 * 60 },
      ],
    },
    {
      name: "Dr. Liam O'Connor",
      email: "liam.oconnor@carehub.local",
      title: "Consultant Pediatrician",
      phone: "(02) 5555 2102",
      bio: "Specializes in infant and child health, developmental screening, and preventive pediatric care.",
      category: "Pediatrics",
      availability: [
        { weekday: 2, startMinutes: 9 * 60, endMinutes: 12 * 60 },
        { weekday: 2, startMinutes: 13 * 60, endMinutes: 17 * 60 },
        { weekday: 4, startMinutes: 9 * 60, endMinutes: 12 * 60 },
        { weekday: 6, startMinutes: 9 * 60, endMinutes: 13 * 60 },
      ],
    },
    {
      name: "Dr. Priya Nair",
      email: "priya.nair@carehub.local",
      title: "Internal Medicine Specialist",
      phone: "(02) 5555 2103",
      bio: "Manages complex adult conditions with emphasis on diabetes, hypertension, and cardiovascular risk reduction.",
      category: "Internal Medicine",
      availability: [
        { weekday: 1, startMinutes: 8 * 60 + 30, endMinutes: 12 * 60 + 30 },
        { weekday: 3, startMinutes: 8 * 60 + 30, endMinutes: 12 * 60 + 30 },
        { weekday: 4, startMinutes: 13 * 60, endMinutes: 17 * 60 },
      ],
    },
    {
      name: "Dr. Mateo Alvarez",
      email: "mateo.alvarez@carehub.local",
      title: "Musculoskeletal and Sports Medicine GP",
      phone: "(02) 5555 2104",
      bio: "Provides evidence-based injury management, rehabilitation planning, and return-to-activity consultations.",
      category: "Sports Medicine",
      availability: [
        { weekday: 2, startMinutes: 10 * 60, endMinutes: 14 * 60 },
        { weekday: 5, startMinutes: 9 * 60, endMinutes: 12 * 60 },
        { weekday: 5, startMinutes: 13 * 60, endMinutes: 16 * 60 },
      ],
    },
    {
      name: "Dr. Chloe Bennett",
      email: "chloe.bennett@carehub.local",
      title: "Women's Health and Preventive Care GP",
      phone: "(02) 5555 2105",
      bio: "Supports women’s health consultations, screening pathways, and preventive lifestyle medicine.",
      category: "Women's Health",
      availability: [
        { weekday: 1, startMinutes: 9 * 60, endMinutes: 12 * 60 },
        { weekday: 3, startMinutes: 13 * 60, endMinutes: 17 * 60 },
        { weekday: 6, startMinutes: 10 * 60, endMinutes: 14 * 60 },
      ],
    },
  ];

  await prisma.user.deleteMany({
    where: { role: "DOCTOR" },
  });

  const seededDoctors = [];
  for (const doctor of doctorsSeed) {
    const created = await prisma.user.create({
      data: {
        name: doctor.name,
        email: doctor.email,
        role: "DOCTOR",
        title: `${doctor.title} • ${doctor.category}`,
        bio: doctor.bio,
        phone: doctor.phone,
        passwordHash,
        mustChangePassword: false,
        profileCompletedAt: new Date(),
      },
    });
    seededDoctors.push(created);

    await prisma.doctorAvailabilityRule.createMany({
      data: doctor.availability.map((rule) => ({
        doctorId: created.id,
        weekday: rule.weekday,
        startMinutes: rule.startMinutes,
        endMinutes: rule.endMinutes,
        slotMinutes: 30,
      })),
    });
  }

  const existingAppointments = await prisma.appointment.count();
  if (existingAppointments === 0) {
    const now = new Date();
    const primaryDoctor = seededDoctors[0];
    const appointmentFixtures = [
      {
        patientId: patient.id,
        doctorId: primaryDoctor.id,
        patientName: patient.name,
        doctorName: primaryDoctor.name,
        status: "CONFIRMED",
        scheduledAt: new Date(now.getTime() + 2 * 60 * 60 * 1000),
        patientNotes: "Annual check-in and care plan review.",
      },
      {
        patientId: patient.id,
        doctorId: primaryDoctor.id,
        patientName: patient.name,
        doctorName: primaryDoctor.name,
        status: "REQUESTED",
        scheduledAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        patientNotes: "Follow-up on recent bloodwork.",
      },
      {
        patientId: patient.id,
        doctorId: primaryDoctor.id,
        patientName: patient.name,
        doctorName: primaryDoctor.name,
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
  console.log("- patient@carehub.local / admin123 (PATIENT)");
  console.log("Seeded doctors:");
  for (const doctor of doctorsSeed) {
    console.log(`- ${doctor.email} / admin123 (DOCTOR)`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect().finally(() => process.exit(1));
  });

