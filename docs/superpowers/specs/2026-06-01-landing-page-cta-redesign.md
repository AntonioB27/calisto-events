# Landing Page CTA Redesign

**Date:** 2026-06-01  
**Branch:** huston

## Summary

Three related changes to the landing page that move it from a waitlist/marketing page toward a conversion-ready entry point:

1. Auth-aware routing on the nav and hero CTAs
2. An inline event quick-start form embedded in the Plans section
3. Plan cards gain a "Choose" CTA that fires the navigation with pre-filled form data

## Auth-Aware CTA Routing

### Data flow

`[locale]/page.tsx` checks auth server-side via `createSupabaseAuthServerClient` (already imported but unused). It resolves `isLoggedIn: boolean` and passes it as a prop to `SiteHeader`, `Hero`, and `PlanCards`. The page transitions from statically generated to dynamically rendered — acceptable for a pre-launch app.

### Nav CTA (SiteHeader)

Both anchor variants (desktop `sm:inline-flex` and mobile `sm:hidden`) change destination:

| User state | Destination |
|------------|-------------|
| Not logged in | `/welcome` |
| Logged in | `/dashboard` |

Button text (`copy.joinWaitlistShort`) is unchanged.

### Hero "Try for free" CTA

| User state | Destination |
|------------|-------------|
| Not logged in | Smooth-scroll to `#plans` (keeps user on landing page, lands them at the form) |
| Logged in | `/dashboard` |

The secondary "Compare plans" CTA is unchanged (`href="#plans"`).

## Inline Event Starter (Plans Section)

### Layout within the Plans section

```
[Section header — label, title, description]
[──────── Quick-start form ────────────────]
[  Event name input  |  Date input  |  Emoji input  ]
[──────────────────────────────────────────]
[  Plan cards grid  ]
```

The form sits between the section header and the plan cards grid, styled to match the dark landing page aesthetic (matching border/background tokens from the existing plan footnote style).

### Form fields

| Field | Type | Default | Query param |
|-------|------|---------|-------------|
| Event name | Text input | empty | `name` |
| Date | Date input | today | `date` |
| Emoji | Text input (accepts a single emoji character; no custom picker) | empty | `emoji` |

### Form state

`PlanCards` (already `"use client"`) owns the form state via `useState`. No new client component needed.

### Plan card CTA button

Each plan card's summary area gains a "Choose" button with an SVG arrow icon (not a text `→`). The button:

- Sits at the bottom of `.plan-card-summary`, below the `tailoredFor` paragraph
- Uses `e.stopPropagation()` so clicking it does not also toggle the card's expand/collapse
- Is styled using the card's `accentColor` (border + icon tint) to stay visually consistent

### Navigation on plan selection

When the "Choose" button is clicked, auth state does **not** affect the destination — both logged-in and anonymous users go to step 3 with the form data (step 3 handles auth internally). The `isLoggedIn` prop is not used inside `PlanCards`.

1. **Name is empty** → shake/highlight the name input, focus it. No navigation.
2. **Name is filled** → navigate to `/events/new?step=3&name=<name>&date=<date>&emoji=<emoji>&planId=<planId>`

### i18n

One new copy key added to all three locales:

| Key | EN | HR | DE |
|-----|----|----|-----|
| `plansFormNamePlaceholder` | `Event name` | `Naziv događaja` | `Veranstaltungsname` |
| `plansFormDateLabel` | `Date` | `Datum` | `Datum` |
| `plansFormEmojiPlaceholder` | `Emoji` | `Emoji` | `Emoji` |
| `plansFormChooseBtn` | `Choose` | `Odaberi` | `Auswählen` |

## Files Changed

| File | Change |
|------|--------|
| `app/[locale]/page.tsx` | Add auth check, pass `isLoggedIn` to `SiteHeader`, `Hero`, `PlanCards` |
| `components/SiteHeader.tsx` | Accept `isLoggedIn`, conditionally route CTA to `/welcome` or `/dashboard` |
| `components/Hero.tsx` | Accept `isLoggedIn`, route primary CTA to scroll `#plans` or `/dashboard` |
| `components/PlanCards.tsx` | Accept `isLoggedIn`, add form state + form UI above plan grid, add "Choose" button per card |
| `lib/i18n.ts` | Add 4 new copy keys to `LandingCopy` type and all 3 locale objects |

## Out of Scope

- Changes to `/events/new` step 3 (already handles auth and plan preselection via query params)
- Changes to the `/welcome` page
- Mobile-specific layout adjustments beyond what Tailwind responsive classes cover naturally
