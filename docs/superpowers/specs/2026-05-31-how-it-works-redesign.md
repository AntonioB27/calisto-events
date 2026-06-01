# How It Works — Section Redesign

**Date:** 2026-05-31
**Status:** Approved

## Goal

Redesign the "How it works" landing page section so that the step visuals show the real app UI rather than abstract placeholders, and the overall section layout matches modern SaaS feature-showcase conventions.

## Context

The current section renders 3 horizontal cards, each with a simplified HTML mockup inside a dark frame. The mockups don't match the current app design. The user also has a separate "App preview" section (AppScreens/AppPreviewWindow) that shows static screenshots — the How It Works section must stay distinct from it by using phone-framed interactive-looking mockups with step context rather than a screenshot gallery.

## Design

### Header

Keep: section label (`3 · How it works`), the "How it works?" title, and Aurora's mascot.

Changes:
- Title is full-width and larger — no mascot competing on the same row
- Aurora moves to a small decorative accent (reduced size, not a layout column)
- The commented-out description stays removed

### Step Layout

Three full-width rows in alternating left/right arrangement:

| Step | Text side | Phone side |
|------|-----------|------------|
| 1 | Left | Right |
| 2 | Right | Left |
| 3 | Left | Right |

A thin vertical gold line (`var(--gold)` or `#C5922A`) runs down the left edge of the step list, connecting all three rows as a timeline.

**Text block** per step:
- Step number: large italic serif (`DM Serif Display`), e.g. `01`, gold color
- Title: from existing `item.title` i18n copy
- Description: from existing `item.description` i18n copy

**Phone frame** per step:
- Height: ~500px, width: ~260px
- Dark rounded shell (~38px border-radius), subtle inner glow
- Notch/pill at top center
- Light warm beige interior (`#F4F0EA` background) contrasts the dark landing page
- All content inside uses the app's real CSS variables and font stack

**Mobile:** Single column, phone above text for each step.

### Phone Mockup Content

All three are static HTML — no live data or Supabase calls.

**Step 1 — Event creation form**
Recreates `app/events/new/_steps/Step1Details.tsx` appearance:
- Gold "NEW EVENT" eyebrow + `01 DETAILS | 02 PLAN | 03 REVIEW` step progress
- Ring emoji (💍) in its selector card with "EVENT ICON" label
- EVENT TITLE input: placeholder "e.g. Kyle & Laura"
- EVENT DATE input with a sample date
- Purple "Continue to plan →" CTA button at bottom

**Step 2 — Access code + QR**
Recreates the Access Card from `OverviewTab`:
- Calisto top bar (logo + icons)
- "ACCESS CODE" label
- Code in dashed-border monospace block: `DEMO00`
- "Copy code" (glass) + "Show QR" (purple gradient) buttons
- QR code expanded below (using `react-qr-code` with a demo join URL)
- "Scan to join" italic hint

**Step 3 — Gallery grid**
Recreates `DemoGalleryTab` appearance:
- "All memories" heading + Aurora camera mascot + avatar stack
- All / Photos / Videos filter tabs
- 3-column photo grid using `DEMO_PHOTOS` images (first 9)

All mockup content uses `var(--app-text)`, `var(--app-border)`, `var(--app-muted)`, `DM Serif Display`, `DM Sans` to match the real app exactly.

## Files Changed

| File | Action |
|------|--------|
| `components/HowItWorks.tsx` | Full rewrite — new layout + 3 phone mockup sub-components |

The existing i18n copy keys (`howItems`, `howTitle`, `howSectionLabel`, `howStepPrefix`, `howDemoCta`) are reused as-is. No i18n changes needed.

## Out of Scope

- The "App preview" section (AppScreens/AppPreviewWindow) — separate redesign later
- Any interactivity inside the phone mockups (buttons are visual only)
- Responsive behaviour below 320px
