# User profile pages (doctor & patient)

**Date:** 2026-05-20  
**Status:** Approved in brainstorming (pending implementation plan)

## Summary

Add self-service profile pages for doctors and patients to edit extended account details and upload a profile photo via Supabase Storage. Email and password changes stay out of scope on this page (existing password flow only).

## Goals

- Doctors and patients can view and update their own profile fields after sign-in.
- Profile photos upload to Supabase Storage; URL stored on `User`.
- Extended fields per role (see Data model).
- Doctor photos appear in patient-facing doctor listings; patient photos appear in doctor patient list when set.
- Reuse existing doctor onboarding data; profile page is the ongoing editor.

## Non-goals (v1)

- Admin editing another user’s profile.
- Email change on profile page.
- Password change on profile page (link to `/dashboard/setup/password` only).
- Image cropping UI.
- Blocking patient onboarding wizard (optional dashboard banner only).

## Decisions (from brainstorming)

| Topic | Decision |
|-------|----------|
| Who can edit | Self only (A) |
| Photo storage | Supabase Storage (C) — new integration in repo |
| Field scope | Extended both roles (C) |
| Account security on profile | Profile fields only; password elsewhere (A) |
| Architecture | Role routes + shared profile shell on `User` (Approach 1) |
| Avatar URLs | Public-read bucket; server-side upload with service role |
| Doctor sees patient avatar | Yes, in doctor patient list when uploaded |

## Data model

Extend `User` in Prisma (all new fields nullable unless noted):

### Shared

| Field | Type | Notes |
|-------|------|--------|
| `avatarUrl` | `String?` | Public URL from Supabase after upload |
| `name` | existing | Editable |
| `phone` | existing | Editable |
| `email` | existing | **Read-only** in profile UI |

### Patient-only

| Field | Type | Notes |
|-------|------|--------|
| `dateOfBirth` | `DateTime?` | Date only semantics |
| `addressLine1` | `String?` | Required for profile completion |
| `addressLine2` | `String?` | Optional |
| `city` | `String?` | Required for completion |
| `state` | `String?` | Required for completion |
| `postalCode` | `String?` | Required for completion |
| `emergencyContactName` | `String?` | Paired with phone |
| `emergencyContactPhone` | `String?` | Required if name set |
| `profileCompletedAt` | existing | Set when completion rules satisfied |

### Doctor-only

| Field | Type | Notes |
|-------|------|--------|
| `title` | existing | Required |
| `bio` | existing | Optional, max length enforced in API |
| `specialty` | `String?` | New |
| `department` | `String?` | New |
| `profileCompletedAt` | existing | Unchanged; wizard + profile share fields |

No separate `PatientProfile` / `DoctorProfile` tables in v1.

## Supabase Storage

### Configuration

- Package: `@supabase/supabase-js`
- Env (server): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- Bucket: `avatars` (name fixed in code/config)
- Object path: `{userId}/avatar.{ext}` where `ext` derived from detected MIME (not client filename)

### Upload flow

1. Client selects image (JPEG, PNG, WebP; max 2–5 MB).
2. `POST /api/me/profile/avatar` — multipart, session auth.
3. Server validates MIME/size, uploads with service role, deletes prior object for that user if present.
4. Server sets `User.avatarUrl`, returns `{ avatarUrl }`.
5. `DELETE /api/me/profile/avatar` — clears DB field and removes object.

### Access model

- Bucket allows public **read** for served images (simple `<img src>`).
- **Writes** only via server API (no anon client upload in v1).
- RLS/policy documented in README or setup notes for Supabase project.

### Fallback UI

- Shared `UserAvatar` component: image if `avatarUrl`, else initials from `name`.

## API

All routes use session `userId` only (ignore any `userId` in body). Allowed roles: `DOCTOR`, `PATIENT` (403 for `ADMIN`).

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/me/profile` | Current user’s editable profile payload |
| `PATCH` | `/api/me/profile` | Partial update; role-scoped field allowlist |
| `POST` | `/api/me/profile/avatar` | Upload/replace avatar |
| `DELETE` | `/api/me/profile/avatar` | Remove avatar |

### PATCH validation (high level)

- **Doctor:** `name`, `phone`, `title`, `bio`, `specialty`, `department`; `phone` and `title` required.
- **Patient:** `name`, `phone`, address fields, `dateOfBirth`, emergency contact; completion sets `profileCompletedAt` when `addressLine1`, `city`, `state`, `postalCode`, and `dateOfBirth` are valid.
- **Both:** reject unknown keys; trim strings; max lengths on text fields.
- **Patient DOB:** not future; reasonable minimum age (e.g. 120 years).
- **Emergency contact:** if either name or phone provided, both required.

Response shape consistent with existing API (`ok`, `error`, field errors where applicable).

## UI

### Routes

- `/doctor/profile` — `DashboardChrome`, doctor field groups
- `/patient/profile` — same shell, patient field groups

### Shared component

- `ProfileSettingsForm` (`role` prop): avatar block, field sections, save button, toast on success/error.
- Link: “Change password” → `/dashboard/setup/password`.

### Navigation

- Add **Profile** item to `DashboardNav` for `DOCTOR` and `PATIENT` (`User` icon).

### Doctor onboarding

- Keep `/dashboard/setup/profile` wizard for `needsProfile` gate.
- Wizard and profile share the same PATCH API or overlapping field set.
- After `profileCompletedAt` is set, `/doctor/profile` is the place to edit.

### Patient prompts

- Optional non-blocking banner on patient dashboard when profile incomplete.

### Avatar visibility (read paths)

- **Patient → Doctors** list/booking: show doctor `avatarUrl` via `UserAvatar`.
- **Doctor → Patients** list: show patient `avatarUrl` when set.

## Error handling

- 401 / 403 as above; 400 with validation messages.
- Upload errors: user-safe message; log details server-side.
- No optimistic avatar URL until upload succeeds.

## Security

- Server-only Supabase writes.
- MIME allowlist and size limit on uploads.
- Optional light rate limit on avatar POST (nice-to-have v1).

## Testing

- Unit tests for validation helpers (doctor vs patient allowlists, completion rules, emergency contact pairing).
- API tests with mocked Supabase client for avatar upload/delete.
- Manual: upload, replace, remove; verify directory/list avatars.

## Migration & rollout

1. Prisma migration for new columns.
2. Supabase bucket + env vars in deployment docs.
3. Ship pages + API + nav.
4. Update doctor/patient list components to use `UserAvatar`.

## Open questions (resolved)

None — brainstorming decisions captured above.
