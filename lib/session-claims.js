/**
 * Derive JWT onboarding flags from the database row.
 */
export function sessionClaimsFromUser(user) {
  return {
    mustChangePassword: Boolean(user.mustChangePassword),
    needsProfile: user.role === "DOCTOR" && user.profileCompletedAt == null,
  };
}
