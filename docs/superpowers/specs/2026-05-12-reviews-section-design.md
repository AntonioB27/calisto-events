# Reviews Section Design

**Date:** 2026-05-12
**Status:** Approved

## Goal

Replace the `WaitlistForm` section at the bottom of the landing page with a `Reviews` section showing made-up testimonials from event organizers, localized in all three supported languages (en, hr, de).

## Scope

- Create: `components/Reviews.tsx`
- Modify: `app/[locale]/page.tsx` — remove `WaitlistForm`, add `Reviews`
- No changes to `lib/i18n.ts`

## Data

A `REVIEWS` constant at the top of `components/Reviews.tsx`, typed as `Record<Locale, ReviewEntry[]>`. Each entry:

```typescript
type ReviewEntry = {
  name: string;
  role: string;        // e.g. "Wedding organizer"
  quote: string;       // the testimonial text
  initials: string;    // 2 chars for avatar circle
  accentColor: string; // one of the existing plan palette colors
};
```

Rating is always 5 stars — no field needed, rendered as a fixed 5-star row.

Six reviews per locale (2 per column on a 3-column desktop grid).

Accent colors drawn from the existing plan palette:
- `#9FC58D` (free/green)
- `#86A9F9` (standard/blue)
- `#B89BC4` (plus/purple)
- `#E6A760` (premium/gold)
- `#E97AA4` (max/pink)
- `#86A9F9` (reuse blue for 6th)

## Component Interface

```typescript
type ReviewsProps = { locale: Locale };
export function Reviews({ locale }: ReviewsProps) { ... }
```

No `copy` prop — all content is self-contained in `REVIEWS`.

## Layout

**Section header** (matches existing section pattern):
- Mono uppercase label: `"6 · Reviews"` / `"6 · Recenzije"` / `"6 · Bewertungen"`
- Display-font h2: `"What organizers say"` / `"Što kažu organizatori"` / `"Was Organisatoren sagen"`
- Both strings hardcoded in the component per locale (same `REVIEWS` locale key approach, or a small `SECTION_COPY` const)

**Card grid:**
- `maxWidth: 1280`, `padding: 0 32px`, `gap: 18`
- Desktop: 3 columns (`grid-template-columns: repeat(3, 1fr)`)
- Tablet (≤900px): 2 columns
- Mobile (≤580px): 1 column

**Each card:**
- Dark background (`var(--ink)`) with subtle border (`1px solid` at ~0.3 opacity using the entry's `accentColor`)
- `borderRadius: 16`, `padding: 22px`
- Top row: avatar circle (40×40, colored bg at 15% opacity, initials in `accentColor`) + name + role (mono, small)
- 5 gold star icons (`★` unicode or inline SVG, `color: var(--gold, #E6A760)`)
- Quote: display font, italic, `clamp(15px, 2vw, 17px)`
- Subtle panel background gradient (same technique as plan cards)

## Page Wiring

In `app/[locale]/page.tsx`:
- Remove `import { WaitlistForm }` and its JSX
- Add `import { Reviews }` and `<Reviews locale={locale as Locale} />` in the same position (before `SiteFooter`)

## What Does Not Change

- `lib/i18n.ts` — untouched
- `WaitlistForm.tsx` — file kept, just removed from page
- All other sections, styling, CSS variables
