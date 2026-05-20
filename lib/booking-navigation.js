/** Patient-facing booking directory (choose doctor + book). */
export const PATIENT_BOOKING_PATH = "/patient/doctors";

export const BOOK_LOGIN_REASON = "book";

export function loginUrlForBooking() {
  const params = new URLSearchParams({
    next: PATIENT_BOOKING_PATH,
    reason: BOOK_LOGIN_REASON,
  });
  return `/login?${params.toString()}`;
}

/** @param {string | undefined} role */
export function bookingPathForRole(role) {
  if (role === "ADMIN") return "/admin/appointments";
  if (role === "PATIENT") return PATIENT_BOOKING_PATH;
  return PATIENT_BOOKING_PATH;
}
