# Print Page Redesign

**Date:** 2026-06-02
**Status:** Approved

## Goal

Redesign `/events/[id]/print` so it looks polished and works well on mobile. The current page renders a flat wall of text-pill template links and an A4 sheet that is too small to read on a phone screen.

---

## Layout: four zones

### 1 · Top bar

Fixed bar (~56px), `var(--app-surface)` background, thin gold bottom hairline (`1px solid var(--app-gold)` at low opacity).

| Slot | Content |
|---|---|
| Left | Ghost back-arrow link |
| Center | Current template name, small-caps, `var(--app-muted)` color |
| Right | **Themed QR / invitations:** gold "Print" button (`window.print()`). **Classic QR table cards:** "Download PDF" gold button + "Preview" ghost link |

Hidden on `@media print`.

### 2 · Card preview desk

Full-width dark surface (`#1a1a1a`), `border-radius: 16px 16px 0 0`, `overflow: hidden`.

**Mobile (< 640px):**
- Single A5 portrait card, `width: min(90vw, 360px)`, centered.
- Card renders portrait-up directly (no rotation wrapper).
- Desk height: `min(90vw * 1.414, 520px)`.
- Card has multi-layer box-shadow to look like it's sitting on the desk.

**Desktop (≥ 640px):**
- Full A4 sheet (`max-width: 210mm`), centered in the desk.
- Existing rotation slots + cut line unchanged.
- Desk gets `padding: 32px 24px 40px`.

### 3 · "Change theme" + secondary controls

Sits below the desk on the page background, `padding: 16px 20px 32px`, max-width 420px, centered.

- **"Change theme" button** — full-width, gold-outlined, shows current template name + swap icon. Opens bottom sheet.
- **Secondary controls row** (small muted pills below the button):
  - Classic QR table cards: language picker (EN / HR / DE)
  - All types: paper size toggle (A4 / Letter)
  - Themed QR + invitations: no language picker

### 4 · Bottom sheet (template picker)

Client component. Spring easing slide-up. `max-height: 85vh`, scrollable.

**Structure:**
- Semi-transparent backdrop (tap to dismiss)
- Sheet: `border-radius: 20px 20px 0 0`, drag-handle pill at top
- Header: "Choose a theme" left, × close right
- Scrollable body with labelled sections:
  - **QR Card Themes** — 6 cards (Simple, Romantic, Luxurious, Botanical, Art Deco, Playful)
  - **Classic QR** — 5 cards (Clean, Gold, Dark, Minimal, Bold)
  - **Invitations** — 10 cards, shown only for `eventKind === "wedding"`

**Each thumbnail:**
- 2-column grid
- `aspect-ratio: 148 / 210` (A5 portrait)
- Actual card component rendered inside `transform: scale(X)` to fit thumbnail
- Active: gold ring border + gold label
- Inactive: muted border
- Label in small-caps below
- Tapping navigates (`router.push`) to the template URL and closes the sheet

---

## Files touched

| File | Change |
|---|---|
| `app/(app)/events/[id]/print/EventPrintToolbar.tsx` | Full redesign — top bar + "Change theme" button + secondary controls |
| `app/(app)/events/[id]/print/TemplatePicker.tsx` | **New** — bottom sheet client component with thumbnail grid |
| `app/(app)/events/[id]/print/print-sheet.css` | Add mobile card preview styles, desk responsive rules |
| `app/(app)/events/[id]/print/page.tsx` | Pass new props; adjust wrapper layout |
| `app/(app)/events/[id]/print/QrThemedPrintSheet.tsx` | Mobile single-card view (skip rotation on mobile) |

---

## Out of scope

- Invitation setup wizard (`/prints/setup`) — untouched
- PrintsTab "coming soon" polaroid in the event dashboard — untouched
- Any changes to the card components themselves
- Any changes to the PDF API route
