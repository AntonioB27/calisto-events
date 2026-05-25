# Design: Update Stale Landing Page Copy (Localization)

**Date:** 2026-05-25
**Approach:** B — values-only update, no type restructuring

## Context

The landing page has full i18n for `en`, `hr`, and `de` via `lib/i18n.ts`. After replacing the waitlist section with a "Try the demo" CTA, several components were updated with hardcoded English strings instead of using the copy keys. This design re-wires those components to use the existing keys and updates the values for all three locales.

## What changes

### 1. `lib/i18n.ts` — update values only

Three key groups updated across all three locales (`en`, `hr`, `de`):

| Key | Old value (en) | New value (en) |
|-----|---------------|----------------|
| `heroPrimaryCta` | "Join the waitlist" | "Try the demo" |
| `joinWaitlistShort` | "Join waitlist" | "Try the demo" |
| `waitlist.title` | "Join the waitlist" | "Try the demo." |
| `waitlist.description` | "Be first to know when Calisto opens…" | "See Calisto in action — no sign-up needed. Explore the event view as an organizer or guest." |
| `waitlist.buttonIdle` | "Join the waitlist" | "Try the demo" |

Croatian and German equivalents translated accordingly. All other `waitlist.*` fields and dead keys remain in the type untouched.

### 2. `components/Hero.tsx`

Replace hardcoded `"Try the demo"` with `{copy.heroPrimaryCta}` on the primary CTA button.

### 3. `components/SiteHeader.tsx`

Replace hardcoded `"Try the demo"` with `{copy.joinWaitlistShort}` on both the desktop (`hidden sm:inline-flex`) and mobile (`sm:hidden`) CTA buttons.

### 4. `components/WaitlistForm.tsx`

Wire up the three strings now visible in the TryDemo section:
- Heading → `copy.title` (from `LandingCopy["waitlist"]`)
- Body paragraph → `copy.description`
- Button label → `copy.buttonIdle`

## What does NOT change

- `LandingCopy` type definition — no fields added or removed
- Dead keys (`waitlist.discount`, `waitlist.submitted`, `waitlist.submitFailed`, `waitlist.note`, `heroAuroraCardBlurb`, `footerText`, `heroMock*`, `popularBadge`, etc.) stay in the type
- Demo pages — still hardcoded English, out of scope
- Routing / locale detection — already working
