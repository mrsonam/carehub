import { SignJWT, jwtVerify } from "jose";
import { sessionClaimsFromUser } from "./session-claims";

const SESSION_COOKIE_NAME = "medisched_session";

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME;
}

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

export function getSessionCookieOptions(secure) {
  return { ...COOKIE_OPTS, secure };
}

/**
 * @param {object} p
 * @param {string} p.userId
 * @param {import("@prisma/client").UserRole | string} p.role
 * @param {boolean} [p.mustChangePassword]
 * @param {boolean} [p.needsProfile]
 */
export async function signSessionToken({
  userId,
  role,
  mustChangePassword = false,
  needsProfile = false,
}) {
  const secret = getAuthSecret();
  return await new SignJWT({
    role,
    mcp: mustChangePassword ? 1 : 0,
    np: needsProfile ? 1 : 0,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

/**
 * @param {Pick<import("@prisma/client").User, "id" | "role" | "mustChangePassword" | "profileCompletedAt">} user
 */
export async function signSessionTokenForUser(user) {
  const { mustChangePassword, needsProfile } = sessionClaimsFromUser(user);
  return signSessionToken({
    userId: user.id,
    role: user.role,
    mustChangePassword,
    needsProfile,
  });
}

export async function verifySessionToken(token) {
  const secret = getAuthSecret();
  const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
  const userId = payload.sub;
  const role = payload.role;

  if (!userId || typeof userId !== "string") return null;
  if (role !== "PATIENT" && role !== "DOCTOR" && role !== "ADMIN") return null;

  const mustChangePassword = Number(payload.mcp) === 1;
  const needsProfile = Number(payload.np) === 1;

  return { userId, role, mustChangePassword, needsProfile };
}
