# /start Route - Ad Landing Page Design

**Date:** 2026-06-29  
**Status:** Approved

## Problem

High traffic from Instagram/TikTok ads is not converting. Visitors land on the full landing page and don't know what action to take. The event creation form is buried below the fold, past testimonials, feature grids, and other content designed for organic/SEO visitors.

## Solution

Two changes:

1. A dedicated `/start` route - a stripped-down, focused page with a single job: get the visitor to create an event.
2. A hero CTA update on the main landing page pointing non-logged-in visitors to `/start` instead of `#plans`.

---

## Routes

### `app/start/page.tsx`

Detects locale from the `Accept-Language` header (same logic as `app/page.tsx`) and redirects to `/{locale}/start`. This keeps the ad link short and clean: `calisto.events/start`.

### `app/[locale]/start/page.tsx`

The actual focused landing page. Server component. Reads locale, loads copy, checks auth state (same as the main locale page). Renders the `StartPage` layout.

---

## Page Structure: `/start`

Four zones, no distractions. No nav links, no footer links, no testimonials, no FAQ.

### 1. Minimal Header

- Calisto logo only, centered.
- Logo links to `/{locale}` (the main landing page). No other links.

### 2. Headline Block

- **Headline** (`startHeadline`): "Your event, ready in 30 seconds"
- **Subheadline** (`startSubheadline`): "Guests scan a QR code and share photos in real time. You keep everything."
- Short, gives the "aha" moment immediately without scrolling.

### 3. Quick-Start Form + Plan Cards

The polaroid card form (name, date, emoji) immediately followed by the plan cards. This is the entire interaction surface of the page. Form and plans are visible without scrolling on desktop.

Components reused from `PlanCards`:
- Extracted as `PlanQuickStartForm` - the polaroid card with name/date/emoji inputs and emoji picker.
- Extracted as `PlanCardList` - the plan cards with the choose button and expandable detail rows.

The existing `PlanCards` component is refactored to use these two sub-components internally so there is no duplication.

### 4. Micro Trust Bar

Three short trust signals below the plan cards:

- "No credit card until checkout"
- "Setup takes 30 seconds"
- "500+ events hosted"

Rendered as a simple horizontal row of small text items. Removes last-second hesitation before clicking a plan.

---

## Landing Page Hero CTA Change

In `components/Hero.tsx`:

- The `Hero` component receives a `locale` prop (already available from `LocalePage`).
- For non-logged-in visitors, the primary CTA changes:
  - **Text**: "Try for free" → "Create your event"
  - **Link**: `#plans` → `/{locale}/start`
- The secondary CTA "Compare plans" → `#plans` stays unchanged.
- `LocalePage` passes `locale` to `Hero`.

---

## i18n Changes

New keys added to `LandingCopy` in `lib/i18n.ts` for all three locales (en, hr, de):

```ts
startHeadline: string;
startSubheadline: string;
startTrustBar: [string, string, string];
```

**English:**
- `startHeadline`: "Your event, ready in 30 seconds"
- `startSubheadline`: "Guests scan a QR code and share photos in real time. You keep everything."
- `startTrustBar`: ["No credit card until checkout", "Setup takes 30 seconds", "500+ events hosted"]

**Croatian and German:** Equivalent translations to be added.

---

## What Is Not Changing

- The event creation flow (`/events/new`) is unchanged.
- The `buildPlanStartUrl` function is unchanged.
- The main landing page sections (Testimonials, FeatureGrid, HowItWorks, FAQ, WaitlistForm) are unchanged.
- Auth flow and payment step are unchanged.

---

## Component Extraction Plan

`PlanCards.tsx` is refactored into:

| File | Contents |
|------|----------|
| `components/plan-cards/PlanQuickStartForm.tsx` | Polaroid card with name/date/emoji inputs and emoji picker |
| `components/plan-cards/PlanCardList.tsx` | The plan cards grid with choose button and expandable rows |
| `components/PlanCards.tsx` | Thin wrapper composing the two above (unchanged public API) |

The `/start` page imports `PlanQuickStartForm` and `PlanCardList` directly.

---

## Success Criteria

- Visiting `calisto.events/start` redirects to the correct locale and shows the focused page.
- The form on `/start` works identically to the form on the main landing page (same validation, same routing to `/events/new`).
- The main landing page hero primary CTA points to `/{locale}/start` for non-logged-in visitors.
- All three locales (en, hr, de) render correctly on `/start`.
