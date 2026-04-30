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

  if (!senderName || !senderEmail || !message) {
    return Response.json(
      { ok: false, error: "Name, email, and message are required." },
      { status: 400 }
    );
  }
  if (senderName.length > MAX_NAME) {
    return Response.json(
      { ok: false, error: "Name is too long." },
      { status: 400 }
    );
  }
  if (!/^\S+@\S+\.\S+$/.test(senderEmail)) {
    return Response.json(
      { ok: false, error: "Enter a valid email address." },
      { status: 400 }
    );
  }
  if (message.length > MAX_MESSAGE) {
    return Response.json(
      { ok: false, error: "Message is too long." },
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
