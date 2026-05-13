export function formatDoctorStructuredReply({ doctors }) {
  if (!Array.isArray(doctors) || doctors.length === 0) {
    return [
      "I could not find doctor profiles right now.",
      "Please check the Doctors page for latest profiles and booking options.",
    ].join("\n");
  }

  const selected = doctors;
  const lines = ["Doctor details and availability:", ""];

  selected.forEach((doctor, index) => {
    lines.push(`${index + 1}. ${doctor.name}`);
    lines.push(`- Title: ${doctor.title || "Not available"}`);
    lines.push(`- Bio: ${doctor.bio || "Not available"}`);
    lines.push(`- Availability: ${doctor.availability || "Not available"}`);
    lines.push("- Booking: /doctors or /patient/appointments");
    lines.push("");
  });

  lines.push("If you want, tell me a doctor's name and I will show just that profile.");
  return lines.join("\n");
}
