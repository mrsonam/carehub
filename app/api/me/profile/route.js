import { prisma } from "@/lib/prisma";
import { getProfileEditorOrErrorResponse } from "@/lib/auth-server";
import { profileSelect, serializeProfile } from "@/lib/profile/serialize";
import { validateProfilePatch } from "@/lib/profile/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await getProfileEditorOrErrorResponse();
  if ("response" in auth) return auth.response;

  const user = await prisma.user.findUnique({
    where: { id: auth.user.id },
    select: profileSelect,
  });
  if (!user) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  return Response.json({ ok: true, profile: serializeProfile(user) });
}

export async function PATCH(req) {
  const auth = await getProfileEditorOrErrorResponse();
  if ("response" in auth) return auth.response;

  const body = await req.json().catch(() => null);
  const validated = validateProfilePatch(auth.user.role, body ?? {});
  if (!validated.ok) {
    return Response.json(
      { ok: false, error: "Validation failed.", fieldErrors: validated.errors },
      { status: 400 }
    );
  }

  const user = await prisma.user.update({
    where: { id: auth.user.id },
    data: validated.data,
    select: profileSelect,
  });

  return Response.json({ ok: true, profile: serializeProfile(user) });
}
