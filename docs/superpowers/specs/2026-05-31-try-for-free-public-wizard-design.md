# Try for Free — Public Event Creation Wizard

**Date:** 2026-05-31
**Status:** Approved

## Problem

The landing page hero CTA says "Try the demo" and links to `/demo`. We want it to say "Try for free" and drop the user directly into the event creation wizard. The wizard currently lives at `app/(app)/events/new/`, which is wrapped by the `(app)` layout that server-redirects unauthenticated users to `/auth/login` before they see anything.

## Goal

Allow unauthenticated users to complete Steps 1 and 2 of the event creation wizard (event name/date and plan selection), then ask for auth at Step 3 (confirmation), and resume seamlessly after sign-in.

## Auth Gate Placement

Auth is required at Step 3 — after the user has entered event details and selected a plan, right before they confirm creation. This is the most natural conversion moment.

Steps 1 and 2 are fully public (no account required).

## Design

### 1. Route restructure

Move `app/(app)/events/new/` → `app/events/new/` (and all contents with it, including the `complete/` sub-route).

This is the only structural change needed. The `(app)` layout's `requireOrganizerSession()` call is what causes the server-side auth redirect — removing the wizard from that group makes Steps 1 and 2 publicly accessible. The wizard renders under the root layout (no AppShell nav), which is better UX for a focused creation flow.

The `(app)/events/[id]/` event management routes are untouched and remain fully protected.

### 2. Hero CTA

- `components/Hero.tsx`: change `href="/demo"` to `href="/events/new"`
- `lib/i18n.ts`: update `heroPrimaryCta` in all 3 locales:
  - EN: `"Try the demo"` → `"Try for free"`
  - HR: `"Isprobaj demo"` → `"Isprobaj besplatno"`
  - DE: `"Demo ausprobieren"` → `"Kostenlos ausprobieren"`

### 3. Auth flow (no changes needed)

`Step3Payment` already has the full client-side auth gate. The existing flow:

1. Guest fills Steps 1 and 2 (unauthenticated, no changes needed)
2. Step 3 loads, detects no session via `supabase.auth.getUser()`
3. Shows login/register card with the `needAuthHeading` / `needAuthBody` copy
4. On button click: `writeCreateEventDraftToStorage({ step: "3", ... })` then `router.push(loginHref)` where `loginHref = /auth/login?returnTo=/events/new?resume=1`
5. After auth, `returnTo` redirects back to `/events/new?resume=1`
6. `ResumeDraftClient` reads the localStorage draft and redirects to the correct step with all params
7. User confirms and the event is created

Nothing in this flow changes.

## What Is Not Changing

- All event management routes (`/events/[id]/*`) remain inside `(app)` and stay auth-protected
- The dashboard "New event" entry point (if any) still points to `/events/new` — works for logged-in users since Step 3 detects a session and skips the auth gate
- The draft save/resume system (`create-event-draft.ts`, `ResumeDraftClient`) is untouched
- The demo route (`/demo`) remains as-is

## Files Changed

1. `app/(app)/events/new/` → `app/events/new/` (folder move, all contents)
2. `components/Hero.tsx` (href change)
3. `lib/i18n.ts` (3 copy string updates)
