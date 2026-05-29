const SEARCHABLE_BY_ROLE = {
  ADMIN: ["/admin/patients", "/admin/doctors", "/admin/appointments"],
  DOCTOR: ["/doctor/patients", "/doctor/schedule"],
  PATIENT: ["/patient/doctors", "/patient/appointments"],
};

const SEARCH_HOME_BY_ROLE = {
  ADMIN: "/admin/search",
  DOCTOR: "/doctor/search",
  PATIENT: "/patient/search",
};

/** @param {string} role @param {string} pathname @param {string} query */
export function resolveSearchHref(role, pathname, query) {
  const trimmed = query.trim();
  const param = trimmed ? `?q=${encodeURIComponent(trimmed)}` : "";
  const routes = SEARCHABLE_BY_ROLE[role] ?? [];
  const home = SEARCH_HOME_BY_ROLE[role] ?? "/dashboard";

  for (const route of routes) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      return `${route}${param}`;
    }
  }

  if (pathname.endsWith("/search")) {
    return `${pathname.split("?")[0]}${param}`;
  }

  return `${home}${param}`;
}

export function readSearchQuery(value) {
  return typeof value === "string" ? value.trim() : "";
}
