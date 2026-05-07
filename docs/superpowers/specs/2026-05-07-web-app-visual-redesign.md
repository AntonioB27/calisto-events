# Calisto Web App — Visual Redesign Spec

## Overview

Implement the visual design from `Calisto Web App.html` (exported from Claude Design) across all authenticated app routes. The marketing landing page (`app/[locale]/page.tsx` and its components) is out of scope and must not be modified.

Screens in scope:
- Welcome page (`app/welcome/page.tsx`) — pre-auth entry point
- Auth: Login, Register, Forgot Password
- App shell: top-bar nav + mobile floating dock
- Dashboard (event list)
- Event Detail (overview, stats, access code, featured photos)
- Gallery (masonry grid + lightbox)
- Create Event (form + plan cards)
- Join Event (code input)

---

## Design Tokens

New CSS variables added to `app/globals.css` alongside the existing tokens. They respect the existing `[data-theme="light"]` / default-dark split.

| Variable | Dark (default) | Light (`[data-theme="light"]`) |
|---|---|---|
| `--app-bg` | `#0C0A0F` (= `--ink`) | `#ECE4D9` |
| `--app-bg-deep` | `#141019` (= `--ink-2`) | `#E2D8CC` |
| `--app-card` | `rgba(255,255,255,0.05)` | `#FAF7F3` |
| `--app-text` | `#F4EAD9` (= `--cream`) | `#221509` |
| `--app-muted` | `#B5AB99` (= `--cream-3`) | `#9A8570` |
| `--app-gold` | `#F0B34B` (= `--amber`) | `#C5922A` |
| `--app-purple` | `#8B6A8C` (= `--plum`) | `#5B2D8E` |
| `--app-border` | `rgba(244,234,217,0.08)` (= `--hair`) | `#DDD4C5` |

---

## Typography

### Font loading
Add `Playfair+Display:ital,wght@0,400;0,700;1,400;1,700` to the existing Google Fonts `<link>` in `app/layout.tsx`. This is additive — Lora stays for the landing page.

### Scoped override
The `(app)` layout wrapper div gets class `app-shell`. In `globals.css`:

```css
.app-shell {
  --font-display: 'Playfair Display', Georgia, serif;
  background: var(--app-bg);
  color: var(--app-text);
  min-height: 100vh;
}
```

Landing page components use `--font-display: Lora` inherited from `:root` — unaffected.

---

## App Shell — Top-Bar Nav

**File:** `app/(app)/layout.tsx` — wrap children in `AppShell` client component.

**New file:** `components/AppShell.tsx` (client component for active-nav state).

**Server/client split:** `app/(app)/layout.tsx` remains a server component (auth guard, Supabase session check). It renders `<AppShell>` as a child, passing the user's display name as a prop. `AppShell` is the only client component in the shell — it holds `usePathname()` for active-link highlighting.

### Structure

```
<div class="app-shell" style="height:100vh; display:flex; flex-direction:column; overflow:hidden">
  <TopBar />                      ← 64px, sticky
  {isEventScreen && <SubBar />}   ← 44px breadcrumb, event screens only
  <main style="flex:1; overflow-y:auto">
    <div style="max-width:1040px; margin:0 auto; padding:0 32px">
      {children}
    </div>
  </main>
  <MobileDock />                  ← fixed bottom, visible below md breakpoint
</div>
```

### TopBar

- Height 64px, background `var(--app-card)`, bottom border `var(--app-border)`
- **Left**: "Calisto" in Playfair italic 26px + 6px gold dot (`var(--app-gold)`)
- **Centre**: nav links — Home (`/dashboard`), Events (`/events`), Gallery, Guests. Active = `var(--app-purple)` tint bg + purple text. Hidden below `md`.
- **Right**: "Join" outlined gold button → `/join`; "New Event" purple gradient button → `/events/new`; avatar circle (purple gradient, user initial). Hidden links replaced by avatar + New Event on mobile.

### Sub-bar (event screens)

Shown when path matches `/events/[id]*`:
- "← Home" button, "/" separator, event emoji + name
- Right side: "event · gallery · guests" tab pills

### Mobile dock

Fixed bottom centre, hidden above `md`:
- Dark glass pill (`rgba(34,21,9,0.9)` dark / `rgba(34,21,9,0.85)` light with blur)
- Icons: Home, Gallery, Create (+), Guests, Join
- Active icon = gold filled bubble

---

## Welcome Page

**File:** `app/welcome/page.tsx`

Standalone pre-auth entry point (not wrapped in AppShell). Same full-screen cream background as the auth pages.

```
[gold bar]
Calisto.   ← 56px Playfair italic
[Aurora mascot 80×80]
"Collect photos from everyone at your event."

[Create organizer account]  ← purple gradient button
[I already have an account] ← ghost button
[I have an event code]      ← text/muted link
```

---

## Auth Pages

**Files modified:** `app/auth/login/page.tsx`, `app/auth/register/page.tsx`, `app/auth/forgot-password/page.tsx`

### Layout

- Full-screen, `background: var(--app-bg)`, flex-centred
- Max-width 420px card

### Login / Register

```
[32px gold bar]
"Welcome to"  ← 11px uppercase muted
Calisto.      ← 56px Playfair italic bold
[Aurora mascot 90×90]

Card (padding 32px):
  [Sign In | Register] pill tab switcher
  Name field (register only)
  Email field
  Password field
  Full-width primary button
  "Forgot password?" / "Already have an account?" link
```

- Inputs: `background: var(--app-bg)`, border `var(--app-border)`, gold border on focus
- Tab active: white bg card, shadow

---

## Dashboard

**File:** `app/(app)/dashboard/DashboardClient.tsx`

```
[gold bar]
"Hello, {name} 👋"  ← 44px Playfair italic
"Your shared albums…"  ← 16px Playfair italic muted

                       [Join with code ◻]  [+ Create event]

─── MY EVENTS (uppercase label + 3px gold pill) ───
EventCard × N
EmptyState card (Aurora key mascot + italic hint text)
```

### EventCard

- White card, border, hover lift + shadow
- Left: 48×48 emoji square (purple→gold gradient bg, 24px emoji)
- Centre: Playfair italic title (truncated), date + role in 12px muted
- Right: plan badge (gold tint bg + border) + chevron

---

## Event Detail

**File:** `app/(app)/events/[id]/_tabs/OverviewTab.tsx` + new sub-components

Two-column `auto-fit minmax(280px, 1fr)` grid:

### Info card
Plan badge (gold), role (purple italic), date row, divider, deadline rows (amber warning), delete date (muted), summary sentence.

### Stats card
Section header with gold vertical bar + "Statistics" Playfair italic.
Three SVG progress rings side by side: Photos (purple), Videos (grey/muted), Guests (gold).
Each ring: 76×76 SVG, 5.5px stroke, icon centred, value + label + "of N" below.

### Access Code card
Large monospaced code display in `var(--app-bg)` box.
"Show QR Invite" primary button. QR panel expands inline (white card, placeholder SVG pattern).

### Featured Photos card
Empty state: Aurora camera mascot + italic hint + "Go to Gallery" ghost button.

---

## Gallery

**File:** `app/(app)/events/[id]/_tabs/GalleryTab.tsx`

Page header with filter pill group (all / photos / videos, active = purple), Sort button, Upload button.

CSS columns masonry grid (`columns: auto 220px; gap: 12px`):
- Each photo: `break-inside: avoid`, rounded-14, overflow hidden
- Gradient overlay bottom: uploader name + eye icon
- Hover: scale(1.03) on img
- Click: lightbox overlay (rgba black 85%, centred image, uploader badge, × button)

---

## Create Event

**File:** `app/(app)/events/new/_steps/Step1Details.tsx` + `Step2Plan.tsx`

Max-width 640px centred. Two cards stacked:

**Card 1 — Details**
- Event title input
- Emoji picker: 9 emoji buttons, selected = gold border + gold tint bg
- Event date input

**Card 2 — Plan**
2×2 grid of plan cards:
- Free (grey gradient), Standard (blue gradient), Premium (red gradient), Max (gold gradient)
- Unselected: outline border, `var(--app-bg)` bg
- Selected: gradient fill, white text, scale(1.02), coloured shadow
- Each card: label (15px bold), guest count (italic 11px), price (12px bold)

Full-width "Create Event →" primary button below cards.

---

## Join Event

**File:** `app/join/page.tsx` + `app/join/JoinCodeForm.tsx`

Centred, max-width 480px, text-centre:

```
[gold bar]
[Aurora key mascot 100×100]
"Join Event"    ← 40px Playfair italic
"Enter the code…" ← italic muted

Card (padding 36px):
  ACCESS CODE label
  Large input: 22px, centred, gold border when value.length > 5
  "Hint: codes look like CALISTO-S2UAQ4"
  [Join Event →] primary button
```

---

## Shared Components

New file: `components/app-ui/index.tsx` (or individual files)

- `GoldBar` — 32×3px gold pill
- `GoldSectionBar` — 3×16px vertical gold accent
- `AppCard` — white card, border, hover shadow/lift
- `AppBtn` — variants: primary (purple gradient), gold (outline), ghost (muted outline)
- `AppInput` — gold focus border, themed background
- `FieldLabel` — 10px uppercase tracking-wide muted
- `StatRing` — SVG progress ring with centred icon

---

## Out of Scope

- `app/[locale]/page.tsx` and all landing page components — no changes
- `app/layout.tsx` body/html attributes — only the font `<link>` href extended
- `app/globals.css` existing tokens — additive only, no modifications to existing variables
- Guests tab (data model not ready)
- Real QR code generation (placeholder SVG pattern used)
- Upload functionality (existing implementation preserved)
