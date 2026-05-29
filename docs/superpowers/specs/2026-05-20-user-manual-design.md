# CareHub User Manual — Design Spec

**Status:** Approved (brainstorming)  
**Date:** 2026-05-20  
**Owner:** CareHub team  

## Summary

A single **combined user manual** for CareHub with sections for the public site, patients, doctors, and admins. Source content lives in **repo Markdown** (per-chapter files). **Screenshots and numbered highlight callouts** are produced by a **fully scripted pipeline** (Playwright capture + programmatic overlays). A local build produces **`CareHub-User-Manual.docx`** for handout/distribution. **Generated artifacts are not committed**—only sources, scripts, and build docs are tracked in git.

## Decisions (locked)

| Topic | Choice |
|-------|--------|
| Audience / structure | One manual, **Part 0–4 + appendix** (combined guide) |
| Source format | Markdown in `docs/user-manual/` |
| Handout | **DOCX only** (no PDF in v1) |
| Screenshots | **Fully scripted** capture + programmatic callouts |
| Generated outputs | **Build locally; do not commit** `.md` assembly, `.docx`, or raw assets |

## Goals

- Walk users through **every major workflow** with step-by-step instructions.
- Pair each major step with a **screenshot** and **numbered highlights** aligned to step text.
- Allow the team to **refresh** the manual after UI changes with one command.
- Keep prose **editable in git** without requiring Word for day-to-day updates.

## Non-goals (v1)

- Hosted in-app help center (`/help`) — out of scope unless added later.
- PDF export.
- Translating the manual to other languages.
- Covering internal developer/setup docs (use README / CONTEXT for that).
- Real patient data or production screenshots.

## Document structure

### Part 0 — Getting started

- What CareHub is and who it is for (patient, doctor, admin).
- Supported browsers and demo-only data disclaimer.
- Demo accounts (from seed): `patient@carehub.local`, doctor emails, `admin@carehub.local`, password `admin123`.
- How to run the app locally for screenshot capture (pointer to repo README).

### Part 1 — Public website (not logged in)

| Task ID | Task |
|---------|------|
| PUB-01 | Browse home page and understand CTAs (book → login message) |
| PUB-02 | View public doctors directory (`/doctors`) |
| PUB-03 | Browse services and about pages |
| PUB-04 | Submit contact inquiry form |
| PUB-05 | Read privacy policy |
| PUB-06 | Register a new patient account |
| PUB-07 | Sign in and sign out |

### Part 2 — Patient

| Task ID | Task |
|---------|------|
| PAT-01 | Patient dashboard overview |
| PAT-02 | Open profile; update details and photo |
| PAT-03 | Find a doctor (`/patient/doctors`) |
| PAT-04 | Book an appointment (slot selection, notes) |
| PAT-05 | Choose payment: Pay now (Stripe) vs pay at counter |
| PAT-06 | View appointments list and appointment detail |
| PAT-07 | Understand appointment status and payment badges |
| PAT-08 | Return from Stripe / payment confirmation behavior |

### Part 3 — Doctor

| Task ID | Task |
|---------|------|
| DOC-01 | First login: change password (if required) |
| DOC-02 | One-time profile setup wizard |
| DOC-03 | Doctor dashboard overview |
| DOC-04 | Manage weekly availability and date overrides |
| DOC-05 | View schedule / calendar |
| DOC-06 | Open appointment detail; start consultation (payment gate) |
| DOC-07 | Consultation workspace: notes, complete, no-show |
| DOC-08 | Patient directory |
| DOC-09 | Doctor profile settings |

### Part 4 — Admin

| Task ID | Task |
|---------|------|
| ADM-01 | Admin dashboard overview |
| ADM-02 | Create staff account (doctor/admin) |
| ADM-03 | View and manage all appointments; create appointment |
| ADM-04 | Mark appointment paid at counter |
| ADM-05 | Patients and doctors directories |
| ADM-06 | Fee schedule settings |
| ADM-07 | Analytics overview |

### Appendix

- Glossary: appointment statuses, payment statuses/methods.
- Troubleshooting: login failures, booking conflicts, payment not confirmed.
- Regenerating the manual (`npm run docs:build`).

### Step template (every task)

1. **Goal** — one sentence  
2. **Before you start** — role, login state, prerequisites  
3. **Steps** — numbered; text references callout numbers on the image  
4. **Figure** — annotated screenshot (`![Figure PAT-04-03](...)`)  
5. **Expected result**  
6. **If something goes wrong** — 1–3 bullets  

## Technical architecture

### Pipeline overview

```
npm run docs:build
  ├─ prerequisites: localhost:3000 + seeded DB
  ├─ capture-all.mjs      → assets/raw/*.png
  ├─ apply-callouts.mjs   → assets/final/*.png
  ├─ assemble-manual.mjs  → CareHub-User-Manual.md (local)
  └─ pandoc               → CareHub-User-Manual.docx (local)
```

### Dependencies (dev)

- `@playwright/test` or `playwright` — browser automation  
- `sharp` — image compositing for callout overlays  
- **Pandoc** — system install, documented in `docs/user-manual/README.md`  

Optional: `cross-env` for `DOCS_CAPTURE_DATE` fixed calendar snapshots.

### Capture conventions

- Viewport: **1280×800** (desktop manual v1; mobile appendix note only).  
- Base URL: `http://localhost:3000` (configurable `DOCS_BASE_URL`).  
- Auth: programmatic login via UI or session cookie helper using seed credentials.  
- Filenames: `{part}-{task}-{step}.png` (e.g. `patient-book-03.png`).  
- Wait for network idle / specific selectors before screenshot.  

### Callout system

Per-image `callouts.json`:

```json
{
  "image": "patient-book-03.png",
  "callouts": [
    {
      "id": 1,
      "selector": "[data-testid='doctor-card']",
      "label": "Select a doctor",
      "style": "primary"
    }
  ]
}
```

**Resolution order:**

1. If `selector` present → Playwright `boundingBox` at capture time, store normalized coords in manifest cache OR resolve live during overlay pass from saved box in JSON.  
2. Else `box` as fractions of image width/height `{ x, y, w, h }` (0–1).  

**Overlay rendering (`apply-callouts.mjs`):**

- Semi-transparent fill + 2px border (brand primary / accent for emphasis).  
- Numbered circle badge (1, 2, 3…) top-left of region.  
- Optional legend strip below image for callout labels (DOCX readability).  

### UI stability (`data-testid`)

Add minimal test IDs only where capture is brittle:

- Booking form steps, doctor cards, slot picker, payment buttons.  
- Main nav items per role.  
- Admin “Create appointment”, “Mark paid at counter”.  

Document required test IDs in `docs/user-manual/README.md`.

### Deterministic dates

- Env `DOCS_CAPTURE_DATE=2026-06-15` (example) passed to app via query/cookie mock or seed alignment so calendar screenshots are stable across runs.

## Repository layout

```
docs/
  superpowers/
    specs/
      2026-05-20-user-manual-design.md   # this file
  user-manual/
    README.md                            # prerequisites, npm run docs:build
    parts/
      00-getting-started/chapter.md
      01-public-site/chapter.md + capture.mjs + callouts/
      02-patient/...
      03-doctor/...
      04-admin/...
      appendix/chapter.md
    scripts/                             # or repo-root scripts/docs/ — pick one at implement time
      capture-all.mjs
      apply-callouts.mjs
      assemble-manual.mjs
      lib/{auth,overlay,manifest}.mjs
```

### Gitignore (add to root `.gitignore`)

```
docs/user-manual/CareHub-User-Manual.md
docs/user-manual/CareHub-User-Manual.docx
docs/user-manual/assets/raw/
docs/user-manual/assets/final/
docs/user-manual/.cache/
```

**Committed:** chapter markdown, callout JSON schemas, capture scripts, README, this design spec.  
**Not committed:** assembled MD, DOCX, PNG outputs.

## DOCX export

- Command: `pandoc docs/user-manual/CareHub-User-Manual.md -o docs/user-manual/CareHub-User-Manual.docx --resource-path=docs/user-manual`
- Reference doc (optional v2): `reference.docx` for CareHub fonts/styles.
- Images embedded from `assets/final/` relative paths in Markdown.

## Implementation phases (for writing-plans)

1. **Scaffold** — folders, gitignore, README, npm script stub, Pandoc check.  
2. **Overlay library** — callout renderer + sample image test.  
3. **Capture foundation** — login helpers, one public + one patient flow end-to-end.  
4. **Author parts** — chapter.md for all tasks (prose first, placeholder images).  
5. **Expand capture** — all task IDs; add `data-testid` as needed.  
6. **Callout manifests** — per screenshot JSON.  
7. **Assemble + DOCX** — full `docs:build` verified on clean machine.  

## Risks and mitigations

| Risk | Mitigation |
|------|------------|
| UI changes break selectors | Prefer `data-testid`; small focused PRs when changing captured screens |
| Large repo if PNGs committed | Gitignore final assets; build locally only |
| Pandoc not installed | README prerequisite check in `docs:build` |
| Stripe/payment flows hard to capture | Mock paid state in seed; document “demo only” in manual |
| Doctor setup wizard blocks capture | Use seed users with `profileCompletedAt` / `mustChangePassword: false` |

## Success criteria

- [ ] `npm run docs:build` completes without manual steps after seed + dev server.  
- [ ] DOCX opens in Word with all parts, images, and readable callout numbers.  
- [ ] Every task ID in Parts 1–4 has ≥1 annotated screenshot.  
- [ ] No generated manual files appear in `git status` after build.  

## Spec self-review

- No TBD sections; task inventory is explicit.  
- Git policy matches user request (local build, no commit of outputs).  
- Scope is one deliverable (manual pipeline), not in-app help.  
- Ambiguity resolved: DOCX only; combined guide; scripted callouts.  

---

**Next step:** User reviews this spec, then invoke **writing-plans** skill for implementation plan.
