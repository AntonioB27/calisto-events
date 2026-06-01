# QR Print Redesign

**Date:** 2026-05-31
**Status:** Approved

## Goal

Rework the QR code print page (`/events/[id]/print`) so that:
1. The printed output on A4 is polished and well-designed (2 identical QR half-cards per page, cut in half to get two copies).
2. The on-screen preview looks like a real sheet of paper, not a plain bordered box.
3. Users can choose from multiple visual styles via the existing template picker.

The structural layout (2 half-cards, dashed cut line, A4 `@page` rule) already works correctly and is not changing.

---

## What changes

### 1. Half-card layout redesign (`PosterHalfCard.tsx` + `print-sheet.css`)

Each half of the A4 page becomes a well-proportioned card with a clear visual hierarchy:

| Element | Treatment |
|---|---|
| QR code | Hero — ~55–60% of card height, centered, white frame with thin border and subtle shadow |
| Event name | Above QR, 2-line max, medium-weight clean sans-serif |
| Access code | Below QR in a monospace pill with light border |
| "Scan to join" hint | Tiny muted italic text below the code |
| Join URL | Tiny gray monospace, most recessive element |

The cut line between the two halves gets a light polish: scissor icon + label, slightly more refined dashes.

### 2. Visual style variants

Three template IDs replace (or extend) the existing `table-minimal` / `table-bold` pair:

| ID | Description | Status |
|---|---|---|
| `qr-clean` | Pure white card, black QR, thin `#ddd` border on QR frame, neutral sans-serif. No color ink required. | **Build now (full design)** |
| `qr-gold` | White card, gold accent bar top/bottom, event name in `#C5922A`, gold-bordered code pill. | Add ID to catalog and picker now; CSS falls back to `qr-clean` styles until a future design pass |
| `qr-dark` | Near-black card, white QR, white text, light-bordered code pill. High contrast. | Add ID to catalog and picker now; CSS falls back to `qr-clean` styles until a future design pass |

The existing `table-minimal` and `table-bold` IDs remain in the catalog so existing print URLs don't break. The default template shown when navigating to the print page becomes `qr-clean`.

### 3. Screen preview upgrade

- Page background: dark surface (`#1a1a1a`) so the white paper pops
- A4 sheet wrapper: proper multi-layer `box-shadow` — looks like a physical sheet floating on a desk
- `EventPrintToolbar`: no functional changes; tighten spacing and type consistency only
- On `@media print`: dark background, shadows, and borders are stripped — only white card content prints

---

## Files touched

| File | Change |
|---|---|
| `app/(app)/events/[id]/print/PosterHalfCard.tsx` | Redesign layout; new QR-hero structure; support `qr-clean`, `qr-gold`, `qr-dark` templates |
| `app/(app)/events/[id]/print/print-sheet.css` | Add CSS for three new template styles; update `.print-sheet-outer` preview wrapper |
| `app/(app)/events/[id]/print/EventPrintSheet.tsx` | Pass new default template; minor wrapper class updates if needed |
| `lib/event-print/print-options.ts` | Add `qr-clean`, `qr-gold`, `qr-dark` to `PosterTemplateId` union and catalog |

---

## Out of scope

- Invitation print templates (wedding invites) — untouched
- `PrintsTab.tsx` — untouched (still shows "coming soon")
- Any changes to the join/access-code flow
- Full polish of `qr-gold` and `qr-dark` — wired up but left as placeholder styles for a future pass
