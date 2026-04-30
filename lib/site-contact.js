/** Default matches marketing copy; override with CONTACT_INBOX_EMAIL in server env. */
export const DEFAULT_CONTACT_INBOX_EMAIL = "info.carehubb@gmail.com";

export function getContactInboxEmail() {
  const fromEnv = process.env.CONTACT_INBOX_EMAIL?.trim();
  return fromEnv || DEFAULT_CONTACT_INBOX_EMAIL;
}
