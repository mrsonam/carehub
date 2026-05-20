# Product

## Register

product

## Users

CareHub serves a small community clinic (3–5 doctors, ~30–60 appointments per day) with three roles of equal design importance:

- **Patients** book, reschedule, and cancel online; they need fast clarity without phone calls or paperwork.
- **Doctors** manage availability, daily schedules, and visit status; they glance at screens between patients.
- **Admins** oversee users, appointments, fees, and counter payments; they need trustworthy system state at a glance.

Everyone uses the product under time pressure: patients between errands, clinicians between rooms, admin during front-desk rushes. The interface should reduce anxiety, not add cognitive load.

## Product Purpose

Replace manual scheduling (phone, paper, spreadsheets) with a single web platform for booking, schedule management, and role-based dashboards. Success means no double bookings, fewer missed appointments, lower admin workload, and patients who feel booking was easier than calling the clinic.

This is an MVP within a 12-week academic scope: web-only, no real patient data, core workflows over feature breadth.

## Brand Personality

**Friendly · Direct · Efficient**

- **Friendly:** Approachable copy and calm surfaces; healthcare without cold institutional tone.
- **Direct:** Plain language, obvious next steps, no jargon walls.
- **Efficient:** Minimal steps to complete tasks; optimistic feedback where safe.

**Reference feel:** Apple Health — spacious hierarchy, human scale, low cognitive load on dense information.

**Emotional goal on first booking:** Relief — "that was easier than calling the clinic."

## Anti-references

- **Hospital ERP:** Dense grey chrome, overwhelming tables, clinical sterility, everything looks equally urgent.
- **Generic SaaS dashboards:** Hero metrics, identical icon cards, purple gradients, decorative glass for its own sake.
- **Wellness startup clichés:** Pastel blob heroes, vague "journey" copy, stock-photo warmth without substance.

Marketing pages may be expressive; logged-in product surfaces prioritize clarity over spectacle.

## Design Principles

1. **Relief is the metric.** Every flow should feel shorter and clearer than the old phone-and-paper habit. If a screen needs explanation, simplify the screen.
2. **Balanced roles, one system.** Patient, doctor, and admin surfaces share the same visual language and density rules so the clinic feels like one product, not three skins.
3. **State before story.** Show appointment, payment, and schedule status explicitly; never make users infer what happened from layout alone.
4. **Direct paths, no mazes.** Core tasks (book, reschedule, mark paid, set availability) stay within a few obvious steps; secondary actions stay secondary.
5. **Calm under load.** Admin and doctor views stay scannable when lists grow; motion and decoration never compete with the next action.

## Accessibility & Inclusion

- **Target:** WCAG 2.1 **AA minimum** across auth, booking, dashboards, and forms; **AAA where practical** (contrast, focus visibility, touch targets, error association).
- **Motion:** Respect `prefers-reduced-motion`; avoid motion that communicates required information.
- **Color:** Do not rely on color alone for status (appointments, payments); pair with text labels or icons.
- **Demo data only:** No real PHI; keep language plain for diverse literacy levels.
