# Demo Route Design

**Date:** 2026-05-22
**Branch:** feature/demo (separate from main)
**Status:** Approved for implementation

---

## Overview

Add a read-only marketing demo to the app at `/demo` and `/demo/demoevent`. The demo showcases a pre-populated wedding event with no auth required, no DB calls, and no writes. Users can switch between the organizer and guest perspectives using a persistent role toggle. Any interactive element that would normally trigger a write shows a "this is a demo" toast instead.

This will be used for marketing before the full public launch in ~2 weeks.

**UI implementation note:** The `frontend-design` skill must be invoked for all new UI components in this feature — `/demo` landing, `DemoRoleToggle`, `DemoGuestView`, `DemoOrganizerView`, `DemoToastProvider`, and the demo tab variants. The goal is production-grade, distinctive design consistent with the app's editorial almanac aesthetic.

---

## Routes

| Route | Purpose |
|---|---|
| `/demo` | Minimal landing page — brief description + two CTAs |
| `/demo/demoevent?role=organizer` | Demo event in organizer view (default) |
| `/demo/demoevent?role=guest` | Demo event in guest view |

Role state lives entirely in the `?role=` URL search param. No session, no auth, no cookies.

---

## `/demo` Landing Page

Three elements only:
1. Headline: *"See Calisto in action"*
2. Two sentences: what the demo is, that no account is needed.
3. Two CTA buttons side by side:
   - **"See as Organizer →"** → `/demo/demoevent?role=organizer`
   - **"See as Guest →"** → `/demo/demoevent?role=guest`

Styled with the app's existing editorial almanac aesthetic. No nav, no footer clutter.

---

## `/demo/demoevent` Page

### Role Toggle (`DemoRoleToggle`)

- Pill-shaped toggle pinned at the top of the page, always visible while scrolling
- Two segments: "Organizer" and "Guest"
- Active segment uses gold accent; inactive uses glass/muted style — consistent with the app palette
- Label above: *"You're viewing as:"*
- Clicking updates `?role=` param and re-renders the view (no page reload — client-side navigation)

### Organizer View

Renders the same `EventAdminTabs` shell the real event page uses, with four tabs visible:
- **Overview** — reuses real `OverviewTab` with static props
- **Gallery** — `DemoGalleryTab`: static photo grid, organizer delete affordances wired to demo toast
- **Guests** — `DemoGuestsTab`: static guest list styled identically to the real tab
- **Share** — reuses real `ShareTab` with static props

Settings tab is hidden (matches the real app for co-organizer role, and avoids exposing complexity that doesn't aid the demo).

### Guest View

Mirrors `GuestEventPage` exactly but with no auth or membership logic:
- Event hero banner (same design)
- Date display
- Upload zone — visible and styled correctly, click → demo toast
- `DemoMediaGrid` — static photo grid with the same layout as `MediaGrid`
- No "leave event" or sign-in modal (not relevant for a demo visitor)

---

## Static Demo Data

All data lives in `app/demo/demoevent/_data/demo-event.ts`. Nothing is fetched from Supabase.

```ts
event: {
  name: "Ana & Marco's Wedding",
  emoji: "💍",
  date: "2025-06-14",
  accessCode: "DEMO00",
  plan: "pro",
}

guests: 8–10 entries with realistic names, roles (guest / co_organizer), photo counts

photos: derived from images the developer drops into /public/demo/
         (filename convention: photo-01.jpg, photo-02.jpg, ...)
```

Photo filenames are declared in the data file so the developer controls order and attribution. The `/public/demo/` folder is the source of truth for actual images.

---

## Demo Toast (`DemoToastProvider`)

A React context wrapping the entire `/demo/demoevent` route. Exposes `triggerDemoToast()`.

Any interactive element that would trigger a write calls this instead of the real handler:
- Upload zone click/drop
- Gallery delete/manage actions
- Any settings or guest management actions

Toast message: *"This is a demo — sign up to try it for real!"*
Toast includes a link to `/auth/register`.
Toast is fixed at the bottom of the screen, auto-dismisses after ~3 seconds.

---

## File Structure

```
app/
  demo/
    page.tsx                          ← /demo landing
    demoevent/
      page.tsx                        ← role toggle + conditional view
      _data/
        demo-event.ts                 ← all static event/guest/photo data
      _components/
        DemoRoleToggle.tsx             ← persistent pill toggle
        DemoToastProvider.tsx          ← context + toast UI
        DemoOrganizerView.tsx          ← organizer shell
        DemoGuestView.tsx              ← guest shell
        DemoMediaGrid.tsx              ← static photo grid (used in both views)
        DemoGalleryTab.tsx             ← organizer gallery tab (static)
        DemoGuestsTab.tsx              ← organizer guests tab (static)

public/
  demo/
    photo-01.jpg                      ← wedding photos (developer provides)
    photo-02.jpg
    ...
```

---

## Component Reuse Strategy

| Component | Strategy | Reason |
|---|---|---|
| `EventAdminTabs` | Reuse directly | Prop-driven, no internal data fetching |
| `OverviewTab` | Reuse directly | Server component, purely prop-driven |
| `ShareTab` | Reuse directly | Server component, purely prop-driven |
| `GalleryTab` / `GalleryManager` | Demo variant (`DemoGalleryTab`) | Internally fetches from Supabase |
| `GuestsTab` / `GuestsManager` | Demo variant (`DemoGuestsTab`) | Internally fetches from Supabase |
| `GuestEventPage` | Demo variant (`DemoGuestView`) | Heavy auth/membership effects |
| `MediaGrid` | Demo variant (`DemoMediaGrid`) | Fetches from Supabase, real-time |
| `UploadZone` | Wrap in `DemoGuestView` | Render real component with `disabled` + intercept click via overlay to trigger toast |

---

## Constraints

- No Supabase calls anywhere under `/demo/**`
- No auth required — all demo routes are publicly accessible
- No writes of any kind — all mutation affordances lead to the demo toast
- Visual output must be 1:1 with the real app (same components/styles where possible)
- Photos are static assets in `/public/demo/` — users cannot upload in demo mode
- This work lives on a separate branch from `main`
- The `frontend-design` skill must be invoked for all new UI components
