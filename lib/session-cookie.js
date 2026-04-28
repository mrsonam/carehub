import { cookies } from "next/headers";
import { getSessionCookieName, getSessionCookieOptions, signSessionTokenForUser } from "@/lib/auth";

/**
 * Re-issue the session cookie from a full User row (after login or profile/password updates).
 * @param {import("@prisma/client").User} user
 */
export async function setSessionFromUser(user) {
  const token = await signSessionTokenForUser(user);
  const cookieStore = await cookies();
  cookieStore.set(getSessionCookieName(), token, {
    ...getSessionCookieOptions(process.env.NODE_ENV === "production"),
  });
}
