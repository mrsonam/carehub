import { prisma } from "@/lib/prisma";
import { getProfileEditorOrErrorResponse } from "@/lib/auth-server";
import { profileSelect, serializeProfile } from "@/lib/profile/serialize";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import {
  AVATAR_EXT_BY_MIME,
  AVATAR_MAX_BYTES,
  deleteUserAvatar,
  uploadUserAvatar,
} from "@/lib/supabase/avatars";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  const auth = await getProfileEditorOrErrorResponse();
  if ("response" in auth) return auth.response;

  if (!isSupabaseConfigured()) {
    return Response.json(
      { ok: false, error: "Photo upload is not configured on this server." },
      { status: 503 }
    );
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || typeof file === "string") {
    return Response.json({ ok: false, error: "No image file provided." }, { status: 400 });
  }

  const mime = file.type;
  if (!AVATAR_EXT_BY_MIME[mime]) {
    return Response.json(
      { ok: false, error: "Use a JPEG, PNG, or WebP image." },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length > AVATAR_MAX_BYTES) {
    return Response.json(
      { ok: false, error: "Image must be 5 MB or smaller." },
      { status: 400 }
    );
  }

  try {
    const avatarUrl = await uploadUserAvatar(auth.user.id, buffer, mime);
    const user = await prisma.user.update({
      where: { id: auth.user.id },
      data: { avatarUrl },
      select: profileSelect,
    });
    return Response.json({ ok: true, avatarUrl, profile: serializeProfile(user) });
  } catch (err) {
    console.error("avatar upload failed", err);
    const message = err?.message ?? "";
    const userMessage = message.includes("Bucket")
      ? 'Photo storage is not set up yet. Create a public Supabase bucket named "avatars", or run: node scripts/ensure-avatar-bucket.mjs'
      : message.includes("not configured")
        ? "Photo upload is not configured on this server."
        : "Could not upload photo. Try again later.";
    return Response.json({ ok: false, error: userMessage }, { status: 500 });
  }
}

export async function DELETE() {
  const auth = await getProfileEditorOrErrorResponse();
  if ("response" in auth) return auth.response;

  try {
    await deleteUserAvatar(auth.user.id);
  } catch (err) {
    console.error("avatar delete failed", err);
  }

  const user = await prisma.user.update({
    where: { id: auth.user.id },
    data: { avatarUrl: null },
    select: profileSelect,
  });

  return Response.json({ ok: true, profile: serializeProfile(user) });
}
