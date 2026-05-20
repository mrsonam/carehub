import { sendContactFormEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_MESSAGE = 8000;
const MAX_NAME = 200;

export async function POST(req) {
  const body = await req.json().catch(() => null);
  const senderName = body?.name?.trim?.();
  const senderEmail = body?.email?.trim?.().toLowerCase?.();
  const message = body?.message?.trim?.();

  const fieldErrors = {};
  if (!senderName) fieldErrors.name = "Name is required.";
  else if (senderName.length > MAX_NAME) fieldErrors.name = "Name is too long.";
  if (!senderEmail) fieldErrors.email = "Email is required.";
  else if (!/^\S+@\S+\.\S+$/.test(senderEmail)) {
    fieldErrors.email = "Enter a valid email address.";
  }
  if (!message) fieldErrors.message = "Message is required.";
  else if (message.length > MAX_MESSAGE) {
    fieldErrors.message = `Message must be ${MAX_MESSAGE} characters or fewer.`;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return Response.json(
      { ok: false, error: "Please fix the highlighted fields.", fieldErrors },
      { status: 400 }
    );
  }

  const result = await sendContactFormEmail({
    senderName,
    senderEmail,
    message,
  });

  if (!result.ok) {
    return Response.json(
      { ok: false, error: result.error || "Could not send message." },
      { status: 503 }
    );
  }

  return Response.json({ ok: true });
}
