/**
 * One-time setup: create the public "avatars" Supabase Storage bucket.
 * Usage: node scripts/ensure-avatar-bucket.mjs
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */
import dotenv from "dotenv";
import { ensureAvatarBucket } from "../lib/supabase/avatars.js";
import { getSupabaseAdmin } from "../lib/supabase/admin.js";

dotenv.config({ path: ".env.local" });
dotenv.config();

const supabase = getSupabaseAdmin();
if (!supabase) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

await ensureAvatarBucket(supabase);
console.log('Bucket "avatars" is ready (public).');
