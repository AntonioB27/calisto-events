# Plan Cards Hover Reveal

**Date:** 2026-05-12  
**Status:** Approved

## Goal

Plan cards currently show all detail rows (Photos, Videos, Guest limit, ZIP export, Upload window, Event deletion) at once. The goal is to surface only the three most scannable limits by default and reveal the rest on hover (desktop) or tap (mobile), reducing visual noise and encouraging engagement.

## Scope

Single file change: `components/PlanCards.tsx`. No changes to i18n, CSS files, or other components.

## Data Split

Within the existing `restRows` array (all rows after price), rows are split at render time by label match:

- **Primary rows** (always visible): `"Photos"`, `"Videos"`, `"Guest limit"`
- **Secondary rows** (hidden by default): `"ZIP export"`, `"Upload window"`, `"Event deletion"`

The split uses `Array.filter` on label, keeping it automatically in sync with any i18n copy changes.

## Desktop — Hover Reveal

Secondary rows are wrapped in `<div className="plan-secondary-rows">`.

Default CSS state:
```
max-height: 0;
overflow: hidden;
opacity: 0;
transition: max-height 280ms ease, opacity 220ms ease;
```

On `.plan-card:hover .plan-secondary-rows` and `.plan-card:focus-within .plan-secondary-rows`:
```
max-height: 200px;
opacity: 1;
```

A subtle hint element (e.g. `···`) sits below the primary rows with `opacity: 1` by default and fades to `opacity: 0` on hover, signaling there is more to reveal.

## Mobile — Tap to Expand

- `PlanCards` holds a `expandedPlans` state: `Record<string, boolean>`, keyed by `plan.id`.
- On mobile (`≤780px`), the secondary rows toggle via `isExpanded` rather than hover.
- A "Show more ↓" / "Show less ↑" button renders below the primary rows on mobile only (hidden on desktop via CSS).
- The same `max-height` transition is used, driven by an `is-expanded` data attribute on the wrapper.

## Accessibility

- The expand button has `aria-expanded` reflecting current state.
- `focus-within` on the card triggers the hover reveal on desktop, so keyboard users get the same experience.
- `prefers-reduced-motion` already suppresses all transitions — secondary rows will be always visible when motion is reduced (override `max-height: none; opacity: 1` under that media query).

## What Does Not Change

- Card layout (two-column summary + details)
- Styling, colors, animations of existing elements
- i18n structure
- Mobile scroll-based active plan detection
