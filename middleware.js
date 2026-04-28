import { NextResponse } from "next/server";
import { getSessionCookieName, verifySessionToken } from "@/lib/auth";

const ROLE_HOME = {
  ADMIN: "/dashboard/admin",
  DOCTOR: "/dashboard/doctor",
  PATIENT: "/dashboard/patient",
};

function isUnderRoleArea(pathname, base) {
  return pathname === base || pathname.startsWith(`${base}/`);
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/dashboard")) {
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

  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    return NextResponse.next();
  }

  const allowed = isUnderRoleArea(pathname, home);
  if (!allowed) {
    return NextResponse.redirect(new URL(home, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
