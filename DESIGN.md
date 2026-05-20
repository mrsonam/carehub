---
name: CareHub
description: Friendly, direct clinical scheduling with calm surfaces and clear status.
colors:
  background: "#f7f9fb"
  foreground: "#191c1e"
  primary: "#00488d"
  primary-container: "#005fb8"
  secondary: "#006a6a"
  secondary-container: "#8cf3f3"
  surface: "#f7f9fb"
  surface-low: "#f2f4f6"
  surface-lowest: "#ffffff"
  surface-high: "#eceef0"
  outline: "#727783"
  outline-variant: "#c2c6d4"
typography:
  display:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontWeight: 700
    fontSize: "1.5rem"
    lineHeight: 1.2
  title:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontWeight: 600
    fontSize: "1.125rem"
    lineHeight: 1.3
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontWeight: 400
    fontSize: "1rem"
    lineHeight: 1.6
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontWeight: 600
    fontSize: "0.625rem"
    lineHeight: 1.2
    letterSpacing: "0.08em"
rounded:
  md: "0.375rem"
  lg: "0.5rem"
  xl: "0.75rem"
  card-lg: "0.875rem"
  pill: "9999px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
  xl: "1.5rem"
  field-height: "2.75rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface-lowest}"
    rounded: "{rounded.lg}"
    padding: "0.75rem 1.5rem"
  button-primary-hover:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.surface-lowest}"
    rounded: "{rounded.lg}"
    padding: "0.75rem 1.5rem"
  button-secondary:
    backgroundColor: "{colors.surface-lowest}"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: "0.5rem 0.75rem"
  input-default:
    backgroundColor: "{colors.surface-lowest}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "0 0.875rem"
    height: "{spacing.field-height}"
---

# Design System: CareHub

## Overview

**Creative North Star: "The Calm Front Desk"**

CareHub looks like a well-run community clinic desk: organized, unhurried, and clear about what happens next. Surfaces stay light and breathable; color marks actions and status, not decoration. Marketing may use motion and larger radii; logged-in product surfaces stay flat, scannable, and free of ERP grey chrome.

The system rejects hospital ERP density, generic SaaS hero metrics, and wellness-startup pastel theater. Depth comes from tonal steps and hairline borders, not stacked grey boxes or decorative glass.

**Key Characteristics:**

- Restrained clinical blue accent on a cool neutral surface stack
- Manrope for headings, Inter for body and UI chrome
- Flat panels (`.panel`) for data; hover lift reserved for marketing `.tonal-card` only
- Status always labeled (badge text + color), never color alone
- Primary-tinted hairlines (`border-primary/[0.06–0.12]`) instead of harsh grey outlines

## Colors

A cool, lightly tinted neutral field with one trustworthy blue primary and a teal secondary for accents and success-adjacent moments.

### Primary

- **Clinical Blue** (`#00488d`): Primary actions, links, active nav, confirmed appointment states. The anchor of trust without corporate navy heaviness.
- **Clinical Blue Deep** (`#005fb8`): Hover and pressed primary buttons; slightly richer, never neon.

### Secondary

- **Reef Teal** (`#006a6a`): Secondary emphasis, decorative gradients on marketing, balance to blue without becoming "wellness mint."
- **Aqua Mist** (`#8cf3f3`): Sparingly on marketing highlights (hero accent spans); never as a full dashboard background.

### Neutral

- **Mist Canvas** (`#f7f9fb`): Page background (`--background`, `--surface`).
- **Soft Slate** (`#f2f4f6`): Inset sections, sidebar hover (`surface-low`).
- **Paper White** (`#ffffff`): Cards, inputs, panels (`surface-lowest`).
- **Cool Veil** (`#eceef0`): Placeholder blocks, image wells (`surface-high`).
- **Ink** (`#191c1e`): Primary text.
- **Steel Label** (`#727783`): Secondary text, icons (`outline`).
- **Hairline Fog** (`#c2c6d4`): Rare structural borders; prefer `border-primary/[0.08]` on product surfaces.

### Named Rules

**The One Voice Rule.** Primary blue appears on actions, key links, and active wayfinding only. It should not flood backgrounds or body text blocks.

**The Status Triad Rule.** Semantic colors (amber, emerald, red, slate) appear only inside badges, alerts, and inline validation. Never use them as page chrome.

## Typography

**Display Font:** Manrope (system-ui fallback)  
**Body Font:** Inter (system-ui fallback)

**Character:** Rounded geometric display paired with neutral UI sans. Friendly without playful; clinical without cold.

### Hierarchy

- **Display** (800, clamp 2.5–3.75rem, line-height 1.1): Marketing heroes only; `font-manrope`, tight tracking.
- **Headline** (700–800, 1.5–2rem, line-height 1.2): Page titles in dashboards and auth (`text-2xl`–`text-3xl font-extrabold font-manrope`).
- **Title** (600–700, 1.125–1.25rem): Card titles, doctor names, section headers.
- **Body** (400, 1rem, line-height 1.6): Descriptions, form help; cap line length at 65–75ch in prose blocks.
- **Label** (600, 0.625rem, uppercase, letter-spacing 0.08em): Badges, table headers, metadata chips.

### Named Rules

**The Manrope Boundary Rule.** Manrope is for headings and brand moments; Inter carries paragraphs, inputs, tables, and sidebar labels.

## Elevation

**Tonal flat by default.** Product dashboards use `.panel`: white surface, 14px corner radius, a single soft compound shadow, no hover transform. Depth is communicated with `surface-low` / `surface-high` steps and `hairline` borders (`rgba(0, 72, 141, 0.06)`), not layered grey cards.

Marketing may use `.tonal-card` with hover lift (`translateY(-8px)`) and stronger blue-tinted shadow. Do not apply tonal-card hover motion inside admin, doctor, or patient workspaces.

### Shadow Vocabulary

- **Panel rest** (`0 1px 2px rgba(16,24,40,0.04), 0 6px 24px -12px rgba(0,72,141,0.06)`): Static data panels, workspace shells.
- **Card marketing** (`0 4px 20px rgba(0,72,141,0.03)` → hover `0 20px 40px rgba(0,72,141,0.06)`): Landing and contact feature cards only.
- **Primary glow** (`shadow-primary/20` on buttons): Subtle action emphasis, not global elevation.

### Named Rules

**The Flat-By-Default Rule.** If a surface holds a table, form, or appointment list, it uses `.panel` or flat `surface-lowest` with hairline border. No hover jump.

**The Glass Sparingly Rule.** `.glass` and `backdrop-blur` are allowed on auth cards and marketing overlays only, never as the default dashboard container.

## Components

### Buttons

- **Shape:** Gently rounded (8px / `rounded-lg`); primary CTAs may use 12px (`rounded-xl`) on marketing.
- **Primary:** Clinical Blue background, white text, semibold; padding ~12px 24px; `shadow-sm shadow-primary/20`.
- **Hover / Focus:** Background shifts to Clinical Blue Deep; focus ring `ring-2 ring-primary/15`; no bounce easing.
- **Secondary / Ghost:** White or `surface-low` fill, `border-primary/[0.12–0.15]`, primary text; hover `bg-primary/10`.

### Chips

- **Style:** Pill (`rounded-full`), 10px uppercase label typography, tinted background + matching border (`bg-primary/10 border-primary/20` for neutral filters).
- **State:** Active filter = primary fill + white text; inactive = border + `surface-low` background.

### Cards / Containers

- **Corner Style:** 14px (`.panel`), up to 48px on marketing (`rounded-[2rem]`–`rounded-[3rem]`).
- **Background:** `surface-lowest` on product; `surface-low` for inset marketing blocks.
- **Shadow Strategy:** See Elevation; product = panel shadow only.
- **Border:** `border-primary/[0.08]` preferred over `outline-variant` on product UI.
- **Internal Padding:** 24–40px on marketing cards; 16–24px on dashboard panels.

### Inputs / Fields

- **Style:** Height 44px (`h-11`), `rounded-lg`, `bg-surface-lowest`, `border-primary/[0.12]`, subtle top shadow on search fields.
- **Focus:** `focus:border-primary/30 focus:ring-2 focus:ring-primary/15`.
- **Error:** `border-red-400/80`, `bg-red-50/50`, `focus:ring-red-500/25`; message in plain language below field.

### Navigation

- **Marketing:** Top navbar, primary CTA button, transparent/surface background.
- **Dashboard:** Sidebar with 32px primary logo tile, Manrope wordmark, `rounded-md` nav items, active = `bg-surface-low` + foreground text; mobile sheet with same tokens.
- **Mobile:** Full-height drawer; body scroll lock when open; Escape closes.

### Appointment status badge

- **Style:** `rounded-full`, 10px semibold uppercase, border + tinted fill per status (amber requested, primary confirmed/ongoing, emerald completed, red cancelled).
- **Rule:** Always includes status text; never icon-only status.

## Do's and Don'ts

### Do:

- **Do** use the surface stack (`surface` → `surface-low` → `surface-lowest`) to separate page, section, and card without nested card grids.
- **Do** pair every status color with a text label in badges and payment indicators.
- **Do** keep booking and auth flows within 3–5 steps with immediate toast feedback.
- **Do** use Manrope for page titles and Inter for everything operational.
- **Do** respect `prefers-reduced-motion` and disable Framer hover lift on product routes.

### Don't:

- **Don't** build hospital ERP interfaces: dense grey toolbars, every column equally bold, sterile `#e5e7eb` grids.
- **Don't** use generic SaaS patterns: hero metric tiles, identical icon+title+copy card grids, purple gradients, decorative glass cards on dashboards.
- **Don't** apply wellness-startup clichés: pastel blob heroes, vague "journey" copy, stock-photo warmth without information.
- **Don't** use `border-left` (or `border-right`) greater than 1px as a colored stripe on list rows or alerts.
- **Don't** use gradient text (`background-clip: text`) for headings.
- **Don't** put `.tonal-card` hover lift on appointment tables, admin workspaces, or doctor schedule views.
- **Don't** rely on color alone for appointment or payment state.
