/**
 * Main “home” route inside the authenticated app shell for each role.
 */
export function dashboardHomeForRole(role) {
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "DOCTOR") return "/doctor/dashboard";
  if (role === "PATIENT") return "/patient/dashboard";
  return "/dashboard";
}
