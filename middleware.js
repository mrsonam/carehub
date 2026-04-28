import { NextResponse } from "next/server";
import { getSessionCookieName, verifySessionToken } from "@/lib/auth";

const ROLE_HOME = {
  ADMIN: "/admin/dashboard",
  DOCTOR: "/doctor/dashboard",
  PATIENT: "/patient/dashboard",
};

const ROLE_ROOT = {
  ADMIN: "/admin",
  DOCTOR: "/doctor",
  PATIENT: "/patient",
};

function isUnderRoleArea(pathname, base) {
  return pathname === base || pathname.startsWith(`${base}/`);
}

function isProtectedPath(pathname) {
  return ["/dashboard", "/admin", "/doctor", "/patient"].some((base) =>
    isUnderRoleArea(pathname, base)
  );
}

function legacyDashboardRedirect(pathname) {
  const legacy = [
    { from: "/dashboard/admin", to: "/admin" },
    { from: "/dashboard/doctor", to: "/doctor" },
    { from: "/dashboard/patient", to: "/patient" },
  ];

  for (const item of legacy) {
    if (!isUnderRoleArea(pathname, item.from)) continue;
    if (pathname === item.from) return `${item.to}/dashboard`;
    return `${item.to}${pathname.slice(item.from.length)}`;
  }

  return null;
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get(getSessionCookieName())?.value;
  if (!token) {
    const u = req.nextUrl.clone();
    u.pathname = "/login";
    u.searchParams.set("next", pathname);
    return NextResponse.redirect(u);
  }

  const session = await verifySessionToken(token).catch(() => null);
  if (!session) {
    const u = req.nextUrl.clone();
    u.pathname = "/login";
    u.searchParams.set("next", pathname);
    return NextResponse.redirect(u);
  }

  const home = ROLE_HOME[session.role];
  if (!home) {
    const u = req.nextUrl.clone();
    u.pathname = "/login";
    u.search = "";
    return NextResponse.redirect(u);
  }

  const { mustChangePassword, needsProfile, role } = session;
  const isSetup = pathname.startsWith("/dashboard/setup");

  if (isSetup) {
    if (pathname.startsWith("/dashboard/setup/password")) {
      if (mustChangePassword) {
        return NextResponse.next();
      }
      if (needsProfile && role === "DOCTOR") {
        return NextResponse.redirect(new URL("/dashboard/setup/profile", req.url));
      }
      return NextResponse.redirect(new URL(home, req.url));
    }
    if (pathname.startsWith("/dashboard/setup/profile")) {
      if (role === "DOCTOR" && needsProfile) {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL(home, req.url));
    }
    return NextResponse.redirect(
      new URL(
        mustChangePassword ? "/dashboard/setup/password" : home,
        req.url
      )
    );
  }

  if (mustChangePassword) {
    return NextResponse.redirect(new URL("/dashboard/setup/password", req.url));
  }
  if (needsProfile && role === "DOCTOR") {
    return NextResponse.redirect(new URL("/dashboard/setup/profile", req.url));
  }

  const legacyPath = legacyDashboardRedirect(pathname);
  if (legacyPath) {
    return NextResponse.redirect(new URL(legacyPath, req.url));
  }

  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    return NextResponse.next();
  }

  const allowed = isUnderRoleArea(pathname, ROLE_ROOT[role]);
  if (!allowed) {
    return NextResponse.redirect(new URL(home, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/doctor/:path*", "/patient/:path*"],
};
