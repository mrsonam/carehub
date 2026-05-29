import { formatApptTime } from "@/lib/dashboard-format";
import { prisma } from "@/lib/prisma";

function contains(value) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return { contains: trimmed, mode: "insensitive" };
}

/** @param {string} query */
export async function searchAdminResults(query) {
  const needle = contains(query);
  if (!needle) {
    return { patients: [], doctors: [], appointments: [] };
  }

  const [patients, doctors, appointments] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: "PATIENT",
        OR: [{ name: needle }, { email: needle }, { phone: needle }],
      },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
      take: 12,
    }),
    prisma.user.findMany({
      where: {
        role: "DOCTOR",
        OR: [{ name: needle }, { title: needle }, { email: needle }],
      },
      select: { id: true, name: true, title: true },
      orderBy: { name: "asc" },
      take: 12,
    }),
    prisma.appointment.findMany({
      where: {
        OR: [
          { patientName: needle },
          { doctorName: needle },
          { patientNotes: needle },
          { doctorNotes: needle },
          { notes: needle },
        ],
      },
      orderBy: { scheduledAt: "desc" },
      take: 15,
      select: {
        id: true,
        patientName: true,
        doctorName: true,
        scheduledAt: true,
        status: true,
      },
    }),
  ]);

  return {
    patients: patients.map((p) => ({
      ...p,
      href: `/admin/patients?q=${encodeURIComponent(query)}`,
    })),
    doctors: doctors.map((d) => ({
      ...d,
      href: `/admin/doctors?q=${encodeURIComponent(query)}`,
    })),
    appointments: appointments.map((a) => ({
      ...a,
      scheduledAt: a.scheduledAt.toISOString(),
      href: `/admin/appointments/${a.id}`,
    })),
  };
}

/** @param {string} query @param {{ id: string; name: string }} doctor */
export async function searchDoctorResults(query, doctor) {
  const needle = contains(query);
  if (!needle) {
    return { patients: [], doctors: [], appointments: [] };
  }

  const scope = {
    OR: [{ doctorId: doctor.id }, { doctorName: { equals: doctor.name, mode: "insensitive" } }],
  };

  const appointments = await prisma.appointment.findMany({
    where: {
      AND: [
        scope,
        {
          OR: [
            { patientName: needle },
            { patientNotes: needle },
            { doctorNotes: needle },
            { notes: needle },
          ],
        },
      ],
    },
    orderBy: { scheduledAt: "desc" },
    take: 20,
    select: {
      id: true,
      patientName: true,
      doctorName: true,
      scheduledAt: true,
      status: true,
    },
  });

  const patientNames = [...new Set(appointments.map((a) => a.patientName.trim()).filter(Boolean))];
  const patients = patientNames.slice(0, 12).map((name, index) => ({
    id: `patient-${index}-${name}`,
    name,
    href: `/doctor/patients?q=${encodeURIComponent(name)}`,
  }));

  return {
    patients,
    doctors: [],
    appointments: appointments.map((a) => ({
      ...a,
      scheduledAt: a.scheduledAt.toISOString(),
      href: `/doctor/appointments/${a.id}`,
    })),
  };
}

/** @param {string} query @param {{ id: string; name: string }} patient */
export async function searchPatientResults(query, patient) {
  const needle = contains(query);
  if (!needle) {
    return { patients: [], doctors: [], appointments: [] };
  }

  const scope = {
    OR: [{ patientId: patient.id }, { patientName: { equals: patient.name, mode: "insensitive" } }],
  };

  const [doctors, appointments] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: "DOCTOR",
        OR: [{ name: needle }, { title: needle }, { bio: needle }],
      },
      select: { id: true, name: true, title: true },
      orderBy: { name: "asc" },
      take: 12,
    }),
    prisma.appointment.findMany({
      where: {
        AND: [
          scope,
          {
            OR: [
              { doctorName: needle },
              { patientNotes: needle },
              { doctorNotes: needle },
              { notes: needle },
            ],
          },
        ],
      },
      orderBy: { scheduledAt: "desc" },
      take: 15,
      select: {
        id: true,
        patientName: true,
        doctorName: true,
        scheduledAt: true,
        status: true,
      },
    }),
  ]);

  return {
    patients: [],
    doctors: doctors.map((d) => ({
      ...d,
      href: `/patient/doctors?q=${encodeURIComponent(query)}`,
    })),
    appointments: appointments.map((a) => ({
      ...a,
      scheduledAt: a.scheduledAt.toISOString(),
      href: `/patient/appointments/${a.id}`,
    })),
  };
}

const TYPE_LABEL = {
  patient: "Patient",
  doctor: "Doctor",
  appointment: "Appointment",
};

/** Flat list for the header typeahead dropdown. */
export function flattenSearchResults(
  { patients = [], doctors = [], appointments = [] },
  { limitPerGroup = 4 } = {}
) {
  /** @type {Array<{ id: string; type: string; typeLabel: string; label: string; meta?: string; href: string; status?: string }>} */
  const items = [];

  for (const p of patients.slice(0, limitPerGroup)) {
    items.push({
      id: `patient-${p.id}`,
      type: "patient",
      typeLabel: TYPE_LABEL.patient,
      label: p.name,
      meta: p.email ?? undefined,
      href: p.href,
    });
  }
  for (const d of doctors.slice(0, limitPerGroup)) {
    items.push({
      id: `doctor-${d.id}`,
      type: "doctor",
      typeLabel: TYPE_LABEL.doctor,
      label: d.name,
      meta: d.title ?? "Clinician",
      href: d.href,
    });
  }
  for (const a of appointments.slice(0, limitPerGroup)) {
    items.push({
      id: `appt-${a.id}`,
      type: "appointment",
      typeLabel: TYPE_LABEL.appointment,
      label: a.patientName,
      meta: `${formatApptTime(a.scheduledAt)}${a.doctorName ? ` · Dr. ${a.doctorName}` : ""}`,
      status: a.status,
      href: a.href,
    });
  }

  return items;
}

/** @param {string} role @param {string} query @param {{ id: string; name: string }} user */
export async function searchDashboardResults(role, query, user) {
  if (role === "ADMIN") {
    return flattenSearchResults(await searchAdminResults(query));
  }
  if (role === "DOCTOR") {
    return flattenSearchResults(await searchDoctorResults(query, user));
  }
  if (role === "PATIENT") {
    return flattenSearchResults(await searchPatientResults(query, user));
  }
  return [];
}
