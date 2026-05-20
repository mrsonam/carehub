function normalizeForMatch(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** If the user names one or more doctors, narrow the roster to those matches; otherwise show everyone. */
export function pickDoctorsMatchingQuery(message, doctors) {
  if (!Array.isArray(doctors) || doctors.length === 0) return doctors;
  const text = normalizeForMatch(message);
  const matches = doctors.filter((d) => doctorNameMatchesQuery(text, d.name));
  if (matches.length >= 1) return matches;
  return doctors;
}

function doctorNameMatchesQuery(normalizedMessageText, rawName) {
  const n = normalizeForMatch(rawName);
  if (n.length >= 4 && normalizedMessageText.includes(n)) return true;

  const significantParts = n.split(/\s+/).filter((p) => p.length >= 4);
  if (significantParts.length === 0) return false;
  return significantParts.every((part) => normalizedMessageText.includes(part));
}

export function formatDoctorStructuredReply({ doctors, queryMessage, totalDoctorsInDirectory }) {
  if (!Array.isArray(doctors) || doctors.length === 0) {
    return [
      "I couldn't find doctor profiles in our directory right now.",
      "Please visit our Doctors page for the latest profiles and booking options.",
    ].join("\n");
  }

  const selected =
    queryMessage && typeof queryMessage === "string"
      ? pickDoctorsMatchingQuery(queryMessage, doctors)
      : doctors;

  const rosterSize =
    typeof totalDoctorsInDirectory === "number" ? totalDoctorsInDirectory : doctors.length;
  const headline =
    rosterSize > 1 && selected.length === 1
      ? `Here's what we have for ${selected[0].name}:`
      : "Here are our doctors and availability:";

  const lines = [headline, ""];

  selected.forEach((doctor, index) => {
    lines.push(`${index + 1}. ${doctor.name}`);
    lines.push(`- Title: ${doctor.title || "Not available"}`);
    lines.push(`- Bio: ${doctor.bio || "Not available"}`);
    lines.push(`- Availability: ${doctor.availability || "Not available"}`);
    lines.push("- Booking: /doctors or /patient/appointments");
    lines.push("");
  });

  lines.push(
    rosterSize > 1
      ? "Ask us about a specific doctor by name to see their full profile."
      : "Visit our Doctors page for the latest availability and booking.",
  );
  return lines.join("\n");
}
