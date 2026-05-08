# Parity Pages Visual Redesign — Spec

**Date:** 2026-05-08  
**Branch:** feat/event-media-web-port  
**Goal:** Apply the existing app-ui design system (CSS vars, Playfair Display, AppCard/AppBtn/AppInput atoms) to the eight parity-era pages that were written before the visual redesign landed. Results must be visually consistent with the already-redesigned tabs (OverviewTab, ShareTab, GalleryManager, EventAdminTabs) and auth pages (login, register, forgot-password).

---

## Design system reference

Tokens live in `app/globals.css` under the `/* App shell design tokens */` block.  
Atoms: `components/app-ui/{AppCard,AppBtn,AppInput,GoldBar,FieldLabel,StatRing}.tsx`  
Pattern: Tailwind only for layout (flex, grid, gap, padding). All colors/typography via `var(--app-*)` inline styles.

Key tokens:
| Token | Role |
|---|---|
| `var(--app-bg)` | Page/shell background |
| `var(--app-card)` | Card/surface fill |
| `var(--app-card-solid)` | Opaque card variant |
| `var(--app-text)` | Primary text |
| `var(--app-muted)` | Secondary/label text |
| `var(--app-gold)` | Gold accent (CTA, selected, highlights) |
| `var(--app-purple)` | Purple accent (role labels, decorative) |
| `var(--app-border)` | Subtle border |
| `var(--font-display)` | `'Playfair Display', Georgia, serif` |

---

## Scope

Eight files touched. Thin wrappers (`GalleryTab.tsx`, `GuestsTab.tsx`) need no changes.

### Group 1 — Thin wrappers (settings/page, onboarding/organizer/page)

**Files:** `app/(app)/settings/page.tsx`, `app/(app)/onboarding/organizer/page.tsx`

Remove `bg-[#1a0a2e]` and any `min-h-screen bg-*` from `<main>`. The `(app)/layout.tsx` `AppShell` already provides the background. No other changes.

---

### Group 2 — GuestsManager.tsx

**File:** `app/(app)/events/[id]/_tabs/GuestsManager.tsx`

- **Section header:** vertical `GoldBar` + Playfair Display italic bold `"Guests"` (reuse `SectionHeader` pattern from `OverviewTab.tsx`).
- **Member count:** `var(--app-muted)` text below header.
- **Refresh button:** `AppBtn` with `variant="ghost"`.
- **Member rows:** inline AppCard-style container — `var(--app-card)` background, `1.5px solid var(--app-border)` border, `border-radius: 18`.
  - Display name: `var(--app-text)`, bold.
  - "(you)" tag: `var(--app-gold)` text.
  - User ID: monospace, `var(--app-muted)`.
  - Upload counts: `var(--app-muted)`, small.
- **Role badge:** gold pill (`var(--app-gold)` text, gold bg at 12% opacity) for `organizer`/`co_organizer`; muted pill for `guest`.
- **Promote/demote button:** `AppBtn variant="ghost"`.
- **Remove button:** destructive inline style — `rgba(224,82,82,0.10)` background, `rgba(224,82,82,0.4)` border, `#fca5a5` text. (Same pattern as delete buttons in GalleryManager.)
- **Error message:** red inline pill, same as login page.

---

### Group 3 — OrganizeOnboardingForm.tsx + onboarding/organizer/page.tsx

**Files:** `app/(app)/onboarding/organizer/OrganizeOnboardingForm.tsx`, `app/(app)/onboarding/organizer/page.tsx`

**page.tsx:** This route is inside `(app)/layout.tsx` so AppShell already provides the shell background. Remove `bg-[#1a0a2e]` and `min-h-screen` from `<main>`. Keep padding. Replace the existing card `<div>` with an unstyled `<div className="mx-auto max-w-lg">` — the form provides its own card container.

**OrganizeOnboardingForm.tsx:** Renders inside the AppShell, so no `<main>` or `app-shell` wrapper needed — just a `<form>` with a card container:
- **Card container:** `var(--app-card)` background, `var(--app-border)` border, `border-radius: 18`, padding 32px.
- **Header:** horizontal `GoldBar` → `"WELCOME"` uppercase label (`var(--app-muted)`) → Playfair Display italic `"Tell us about your event"` → descriptor paragraph in `var(--app-muted)`.
- **Event kind selector:** 2×2 grid. Each option is a card button:
  - Unselected: `var(--app-card)` bg, `var(--app-border)` border, `var(--app-muted)` text.
  - Selected: subtle gold bg (`color-mix(in srgb, var(--app-gold) 12%, transparent)`), gold border, `var(--app-text)` text.
- **Display name input:** `AppInput`.
- **Submit button:** `AppBtn variant="primary"` full-width, label `"Continue to dashboard"`.
- **Error:** red inline pill.

---

### Group 4 — plan-tiers/page.tsx

**File:** `app/(app)/plan-tiers/page.tsx`

- Remove `bg-[#1a0a2e]` and `text-white` from `<main>` (AppShell provides bg).
- `"PLANS"` label: `var(--app-gold)`, uppercase, tracked.
- `"Plan tiers"` heading: Playfair Display italic bold.
- Descriptor paragraph: `var(--app-muted)`.
- Back link: `var(--app-gold)`.
- Each plan section → `AppCard` (with `hover` prop).
  - Plan name: Playfair Display, `var(--app-text)`.
  - Upload days badge: gold pill (same pattern as role badge above).
  - Stat cells: `var(--app-card-solid)` bg, `var(--app-border)` border, `border-radius: 12`. DT in `var(--app-muted)` uppercase. DD in `var(--app-text)` bold large.

---

### Group 5 — ResetPasswordForm.tsx + success/page.tsx

**Files:** `app/auth/reset-password/ResetPasswordForm.tsx`, `app/auth/reset-password/success/page.tsx`

These are in `app/auth/` outside AppShell so they need their own shell wrapper.

**ResetPasswordForm.tsx:**
- **Outer:** `<main className="app-shell">` with full-height centered column (matches login page).
- **Card:** `var(--app-card)` bg, `var(--app-border)` border, `border-radius: 18`, `max-width: 420px`, padding 32px.
- **Header:** horizontal `GoldBar` → `"ACCOUNT"` uppercase label → Playfair Display italic `"Set a new password"` → descriptor in `var(--app-muted)`.
- **Password fields:** `AppInput` (type="password"), with `onFocus`/`onBlur` gold border highlight (matching login inputs).
- **Submit button:** `AppBtn variant="primary"` full-width.
- **Error:** red inline pill.
- **"Link invalid/expired" state:** same card wrapper → Playfair Display heading `"Link expired"` → muted body text → gold underline link `"Request a new reset link"` → ghost link `"Back to sign in"`.
- **Loading skeleton:** muted text `"Verifying reset link…"` in centered layout.

**success/page.tsx:**
- Same `<main className="app-shell">` centered layout.
- Horizontal `GoldBar` → Playfair Display `"Password updated"` → muted descriptor.
- `AppBtn variant="primary"` → `"Go to sign in"` (navigates to `/auth/login`).

---

## What is NOT changed

- `GalleryTab.tsx`, `GuestsTab.tsx` — thin pass-through wrappers, no UI.
- `GalleryManager.tsx` — already redesigned and committed.
- `components/LanguageSelectorPopup.tsx`, `components/ScrollSpyNav.tsx` — landing page components, out of scope.
- Marketing landing page routes.

---

## Testing

- `npm run build` must pass with no type errors after each group.
- Visual spot-check: each page renders with dark bg (default theme) and warm cream text.
- Light theme spot-check: toggle `data-theme="light"` in devtools — text and backgrounds must invert correctly via CSS vars.
- No regressions in already-redesigned tabs (OverviewTab, ShareTab, GalleryManager).
