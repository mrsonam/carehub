import { Resend } from "resend";
import { getAppBaseUrl } from "@/lib/app-url";
import { getContactInboxEmail } from "@/lib/site-contact";

function getResendClient() {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

/** Use a verified-domain address in production; Resend only allows test sends to your account email otherwise. */
function getFromAddress() {
  const from = process.env.EMAIL_FROM?.trim();
  return from || "CareHub <onboarding@resend.dev>";
}

const SITE_NAME = "CareHub";

/** Resend: unverified `from` only delivers to the account email; surface a clear fix for admins/UI. */
function emailSendErrorForClient(error) {
  const raw =
    (error && typeof error.message === "string" && error.message) ||
    "Failed to send email.";
  if (
    /verify a domain/i.test(raw) ||
    /only send testing emails/i.test(raw) ||
    /own email address/i.test(raw)
  ) {
    return "Email is limited by Resend until you verify a domain: resend.com/domains — then set EMAIL_FROM to an address on that domain (e.g. noreply@yourclinic.com).";
  }
  return raw;
}

/**
 * @param {{ senderName: string; senderEmail: string; message: string }} params
 */
export async function sendContactFormEmail({ senderName, senderEmail, message }) {
  const resend = getResendClient();
  if (!resend) {
    console.error("sendContactFormEmail: RESEND_API_KEY is not set");
    return { ok: false, error: "Email is not configured on the server." };
  }

  const to = getContactInboxEmail();
  const from = getFromAddress();

  const { error } = await resend.emails.send({
    from,
    to: [to],
    replyTo: senderEmail,
    subject: `${SITE_NAME} contact: ${senderName}`,
    text: [
      `New inquiry via ${SITE_NAME} website.`,
      ``,
      `Name: ${senderName}`,
      `Email: ${senderEmail}`,
      ``,
      `Message:`,
      message,
    ].join("\n"),
  });

  if (error) {
    console.error("sendContactFormEmail:", error);
    return { ok: false, error: emailSendErrorForClient(error) };
  }
  return { ok: true };
}

function roleLabel(role) {
  if (role === "ADMIN") return "Administrator";
  if (role === "DOCTOR") return "Doctor";
  return role;
}

/**
 * @param {{ to: string; name: string; role: string; temporaryPassword: string; loginUrl?: string }} params
 */
export async function sendStaffWelcomeEmail({
  to,
  name,
  role,
  temporaryPassword,
  loginUrl,
}) {
  const resend = getResendClient();
  if (!resend) {
    console.error("sendStaffWelcomeEmail: RESEND_API_KEY is not set");
    return { ok: false, error: "Email is not configured on the server." };
  }

  const from = getFromAddress();
  const resolvedLoginUrl = loginUrl || `${getAppBaseUrl()}/login`;
  const r = roleLabel(role);

  const nextSteps = [
    `1. Open: ${resolvedLoginUrl}`,
    `2. Sign in with your email and the temporary password below.`,
    `3. You will be prompted to set a new password before continuing (required for your role).`,
    `4. If you did not expect this account, contact your clinic administrator.`,
  ].join("\n");

  const body = hiBlock(name, r, temporaryPassword, nextSteps, resolvedLoginUrl);

  const { error } = await resend.emails.send({
    from,
    to: [to],
    subject: `Your ${SITE_NAME} staff account`,
    text: body,
  });

  if (error) {
    console.error("sendStaffWelcomeEmail:", error);
    return { ok: false, error: emailSendErrorForClient(error) };
  }
  return { ok: true };
}

function hiBlock(name, roleLabelText, temporaryPassword, nextSteps, loginUrl) {
  return [
    `Hi ${name},`,
    ``,
    `An administrator has created a ${SITE_NAME} account for you.`,
    ``,
    `Role: ${roleLabelText}`,
    `Sign-in page: ${loginUrl}`,
    ``,
    `Temporary password (use once, then change it):`,
    temporaryPassword,
    ``,
    `Next steps:`,
    nextSteps,
    ``,
    `— ${SITE_NAME}`,
  ].join("\n");
}
