import { prisma } from "../prisma.js";
import { getContactInboxEmail } from "../site-contact.js";
import { WEEKDAY_LABELS_LONG } from "../calendar/weekdays.js";

const WEBSITE_ROUTE_MAP = [
  { path: "/", label: "Home", purpose: "Overview of clinic and booking entry points." },
  { path: "/services", label: "Services", purpose: "Browse clinic services and care offerings." },
  { path: "/doctors", label: "Doctors", purpose: "View doctor cards, profile summaries, and availability cues." },
  { path: "/contact", label: "Contact", purpose: "Contact the clinic team for support or inquiries." },
  { path: "/login", label: "Sign In", purpose: "Access your existing account dashboard." },
  { path: "/register", label: "Register", purpose: "Create a new patient account." },
];

function minutesToLabel(minutes) {
  const safe = Number.isFinite(minutes) ? minutes : 0;
  const hour = Math.floor(safe / 60);
  const minute = safe % 60;
  const hour12 = hour % 12 || 12;
  const ampm = hour >= 12 ? "PM" : "AM";
  return `${hour12}:${String(minute).padStart(2, "0")} ${ampm}`;
}

function buildAvailabilityMap(rules) {
  const grouped = new Map();
  for (const rule of rules) {
    const day = WEEKDAY_LABELS_LONG[rule.weekday] || "Day";
    const range = `${minutesToLabel(rule.startMinutes)} - ${minutesToLabel(rule.endMinutes)}`;
    if (!grouped.has(rule.doctorId)) grouped.set(rule.doctorId, []);
    grouped.get(rule.doctorId).push(`${day}: ${range}`);
  }
  return grouped;
}

function serializeDoctor(doctor, availabilityMap) {
  const ranges = availabilityMap.get(doctor.id) || [];
  return {
    id: doctor.id,
    name: doctor.name,
    title: doctor.title || "Not available",
    bio: doctor.bio || "Not available",
    availability: ranges.length ? ranges.join("; ") : "Not available",
  };
}

export async function listDoctorNamesForClassifier() {
  const rows = await prisma.user.findMany({
    where: { role: "DOCTOR" },
    select: { name: true },
    orderBy: { name: "asc" },
  });

  const hints = new Set();
  for (const row of rows) {
    const full = String(row.name || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
    if (full.length >= 4) hints.add(full);
    const parts = full.split(/\s+/).filter(Boolean);
    const last = parts[parts.length - 1];
    if (last && last.length >= 4) hints.add(last);
  }
  return [...hints];
}

export async function getClinicContext(intent) {
  const includeDoctors = intent === "doctor_info" || intent === "clinic_general";
  const doctors = includeDoctors
    ? await prisma.user.findMany({
        where: { role: "DOCTOR" },
        select: { id: true, name: true, title: true, bio: true },
        orderBy: { name: "asc" },
      })
    : [];

  const doctorIds = doctors.map((doctor) => doctor.id);
  const rules = doctorIds.length
    ? await prisma.doctorAvailabilityRule.findMany({
        where: { doctorId: { in: doctorIds } },
        select: { doctorId: true, weekday: true, startMinutes: true, endMinutes: true },
        orderBy: [{ weekday: "asc" }, { startMinutes: "asc" }],
      })
    : [];

  const availabilityMap = buildAvailabilityMap(rules);

  return {
    doctors: doctors.map((doctor) => serializeDoctor(doctor, availabilityMap)),
    website: WEBSITE_ROUTE_MAP,
    contact: {
      email: getContactInboxEmail(),
      phone: "(02) 5555 1234",
      hours: "Mon-Sat",
      address: "Contact clinic for address details",
    },
  };
}
