import { SignJWT, jwtVerify } from "jose";

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

export async function signSessionToken({ userId, role }) {
  const secret = getAuthSecret();
  return await new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySessionToken(token) {
  const secret = getAuthSecret();
  const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
  const userId = payload.sub;
  const role = payload.role;

  if (!userId || typeof userId !== "string") return null;
  if (role !== "PATIENT" && role !== "DOCTOR" && role !== "ADMIN") return null;

  return { userId, role };
}

