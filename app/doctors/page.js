import { prisma } from "@/lib/prisma";
import DoctorsPageClient from "./DoctorsPageClient";

const DOCTOR_IMAGES = ["/doctor-sarah.png", "/doctor-robert.png", "/doctor-elena.png"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function labelTime(minutes) {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const hour12 = hour % 12 || 12;
  const ampm = hour >= 12 ? "PM" : "AM";
  return `${hour12}:${String(minute).padStart(2, "0")} ${ampm}`;
}

function formatAvailability(rules) {
  if (!rules?.length) return "Not available";
  const first = rules[0];
  return `${WEEKDAYS[first.weekday]} ${labelTime(first.startMinutes)} - ${labelTime(first.endMinutes)}`;
}

function mapCategory(title) {
  const text = String(title || "").toLowerCase();
  if (text.includes("pediatric")) return "Pediatrics";
  if (text.includes("women")) return "General";
  if (text.includes("internal") || text.includes("sports")) return "Specialized";
  return "General";
}

function mapSpecialty(title) {
  const text = String(title || "").toLowerCase();
  if (text.includes("pediatric")) return "Pediatrics";
  if (text.includes("sports")) return "Sports Medicine";
  if (text.includes("internal")) return "Internal Medicine";
  if (text.includes("women")) return "Women's Health";
  return "General Medicine";
}

export default async function DoctorsPage() {
  const doctors = await prisma.user.findMany({
    where: { role: "DOCTOR" },
    select: {
      id: true,
      name: true,
      title: true,
      bio: true,
      availabilityRules: {
        select: { weekday: true, startMinutes: true, endMinutes: true },
        orderBy: [{ weekday: "asc" }, { startMinutes: "asc" }],
      },
    },
    orderBy: { name: "asc" },
  });

  const mapped = doctors.map((doctor, index) => ({
    id: doctor.id,
    name: doctor.name,
    title: doctor.title || "Doctor",
    specialty: mapSpecialty(doctor.title),
    category: mapCategory(doctor.title),
    bio: doctor.bio || "Profile details will be updated soon.",
    availability: `Next: ${formatAvailability(doctor.availabilityRules)}`,
    image: DOCTOR_IMAGES[index % DOCTOR_IMAGES.length],
  }));

  return <DoctorsPageClient doctors={mapped} />;
}
