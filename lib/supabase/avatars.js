import { getSupabaseAdmin } from "./admin.js";

export const AVATAR_BUCKET = "avatars";
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

/** @type {Record<string, string>} */
export const AVATAR_EXT_BY_MIME = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

let bucketEnsured = false;

/**
 * Creates the public avatars bucket if missing (service role).
 * @param {import("@supabase/supabase-js").SupabaseClient} supabase
 */
export async function ensureAvatarBucket(supabase) {
  if (bucketEnsured) return;

  const { data: bucket } = await supabase.storage.getBucket(AVATAR_BUCKET);
  if (bucket) {
    bucketEnsured = true;
    return;
  }

  const { error } = await supabase.storage.createBucket(AVATAR_BUCKET, {
    public: true,
    fileSizeLimit: AVATAR_MAX_BYTES,
    allowedMimeTypes: Object.keys(AVATAR_EXT_BY_MIME),
  });

  if (error) {
    const msg = error.message?.toLowerCase() ?? "";
    if (!msg.includes("already exists") && !msg.includes("duplicate")) {
      throw new Error(
        `Supabase bucket "${AVATAR_BUCKET}" is missing and could not be created: ${error.message}. ` +
          `In the Supabase dashboard, open Storage → New bucket → name it "${AVATAR_BUCKET}" and enable public access.`
      );
    }
  }

  bucketEnsured = true;
}

/**
 * @param {string} userId
 * @param {Buffer} buffer
 * @param {string} mime
 * @returns {Promise<string>} public URL
 */
export async function uploadUserAvatar(userId, buffer, mime) {
  const ext = AVATAR_EXT_BY_MIME[mime];
  if (!ext) throw new Error("Unsupported image type.");
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Storage is not configured.");

  await ensureAvatarBucket(supabase);

  const path = `${userId}/avatar.${ext}`;

  for (const other of Object.values(AVATAR_EXT_BY_MIME)) {
    if (other === ext) continue;
    await supabase.storage.from(AVATAR_BUCKET).remove([`${userId}/avatar.${other}`]);
  }

  const { error } = await supabase.storage.from(AVATAR_BUCKET).upload(path, buffer, {
    contentType: mime,
    upsert: true,
  });

  if (error) {
    if (error.message?.toLowerCase().includes("bucket not found")) {
      bucketEnsured = false;
      await ensureAvatarBucket(supabase);
      const retry = await supabase.storage.from(AVATAR_BUCKET).upload(path, buffer, {
        contentType: mime,
        upsert: true,
      });
      if (retry.error) throw new Error(retry.error.message);
    } else {
      throw new Error(error.message);
    }
  }

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** @param {string} userId */
export async function deleteUserAvatar(userId) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  await ensureAvatarBucket(supabase).catch(() => {});
  const paths = Object.values(AVATAR_EXT_BY_MIME).map((ext) => `${userId}/avatar.${ext}`);
  await supabase.storage.from(AVATAR_BUCKET).remove(paths);
}
