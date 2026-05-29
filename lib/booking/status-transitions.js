const TERMINAL_STATUSES = new Set(["CANCELLED", "COMPLETED", "NO_SHOW"]);

/** @returns {string | null} error message, or null if allowed */
export function validateStatusTransition(role, currentStatus, newStatus) {
  if (newStatus === currentStatus) return null;
  if (!currentStatus || TERMINAL_STATUSES.has(currentStatus)) {
    return "This appointment can no longer be updated.";
  }

  if (role === "PATIENT") {
    if (newStatus !== "CANCELLED") {
      return "Patients can only cancel appointments.";
    }
    if (!["REQUESTED", "CONFIRMED"].includes(currentStatus)) {
      return "This appointment can no longer be cancelled.";
    }
    return null;
  }

  return null;
}
