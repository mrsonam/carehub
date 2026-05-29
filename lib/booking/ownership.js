export function patientOwnsAppointment(user, appointment) {
  if (user.role !== "PATIENT") return false;
  if (appointment.patientId) return appointment.patientId === user.id;
  return appointment.patientName?.toLowerCase() === user.name.toLowerCase();
}

export function doctorManagesAppointment(user, appointment) {
  if (user.role !== "DOCTOR") return false;
  if (appointment.doctorId) return appointment.doctorId === user.id;
  return appointment.doctorName?.toLowerCase() === user.name.toLowerCase();
}

export function canManageAppointment(user, appointment) {
  if (user.role === "ADMIN") return true;
  if (user.role === "DOCTOR") return doctorManagesAppointment(user, appointment);
  if (user.role === "PATIENT") return patientOwnsAppointment(user, appointment);
  return false;
}
