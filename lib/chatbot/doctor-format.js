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

/**
 * Short message for the chat bubble only. Title, bio, availability, and booking appear on doctor cards.
 */
export function formatDoctorChatBubbleReply({ doctors, queryMessage, totalDoctorsInDirectory }) {
  if (!Array.isArray(doctors) || doctors.length === 0) {
    return [
      "We couldn't find doctor profiles in our directory right now.",
      "Visit our Doctors page for the latest profiles and booking options.",
    ].join("\n");
  }

  const selected =
    queryMessage && typeof queryMessage === "string"
      ? pickDoctorsMatchingQuery(queryMessage, doctors)
      : doctors;

  const rosterSize =
    typeof totalDoctorsInDirectory === "number" ? totalDoctorsInDirectory : doctors.length;

  if (selected.length === 1) {
    if (rosterSize > 1) {
      return `Here's what we have for ${selected[0].name}. Full details are in the card below.`;
    }
    return `Here's our doctor — full details are in the card below.`;
  }

  return `Here are ${selected.length} doctors. Full details are in the cards below.`;
}
