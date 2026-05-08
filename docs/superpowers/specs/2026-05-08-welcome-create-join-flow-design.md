---
title: Welcome screen create/join flow redesign
date: 2026-05-08
status: draft
---

## Summary
Update the `/welcome` entry to present two primary actions: **Create an event** and **Join an event**, and adjust the flows so:

- **Create**: user can enter full event details *while signed out*, then is prompted to **log in** and **pay**. After payment succeeds, the event is created and the user is redirected to the **Share** tab.
- **Join**: user enters the access code first, then is asked if they already have an account (log in) or want to continue as guest, *on the same page*.

Non-goals:
- No landing page redesign.
- No new theme switcher UI.
- No cross-device draft recovery (device-local draft only).

## Current state (context)
- `/welcome` currently offers “Create organizer account / I already have an account / I have an event code”.
- Event creation exists as `/events/new` wizard (organizer flow).
- Join exists at `/join` and `/join/[accessCode]`, with a guest/anon onboarding modal.

## Goals & success criteria
- **Lower friction**: users can explore and fill event details before committing to auth/payment.
- **Clear intent**: create vs join are distinct on the welcome screen.
- **Preserve work**: create wizard progress is recoverable after auth via a local draft.
- **Safe join preview**: join page can confirm the code maps to a real event and show basic event info.

## UX flows

### 1) Welcome (`/welcome`)
Replace the three actions with:
- Primary button: **Create an event**
- Secondary button: **Join an event**
- Tertiary link: **Back to home**

Routing:
- Create → `/events/new`
- Join → `/join`

### 2) Create flow (signed out allowed)
User path:
1. User starts `/events/new` while signed out.
2. User completes event details steps (same UI as today).
3. When reaching the “commit” point (currently where organizer session/payment is required), show a gated step:
   - Explains: “To create the event and get your share link, sign in and complete payment.”
   - Buttons: **Log in** → `/auth/login?returnTo=/events/new?resume=1`
              **Create account** → `/auth/register?returnTo=/events/new?resume=1`
4. After auth return, `/events/new?resume=1` reloads the draft and continues to payment.
5. Payment succeeds → create the event using the draft payload → redirect to:
   - `/events/[id]?tab=share`
6. Clear local draft after successful creation.

#### Draft storage
- Local storage key: `calisto_create_event_draft_v1`
- Contents (minimum):
  - wizard step index
  - event title, date, kind
  - selected plan tier
  - any additional fields required to create the event as per current schema
  - a `savedAt` timestamp
- Save strategy:
  - Save on each step advance and on field blur/change (debounced if needed).
  - On load, if draft exists and is “recent enough” (e.g. within 7 days), offer to resume automatically when `?resume=1` is present.

#### Edge cases
- If the draft is missing/invalid after returning from auth:
  - Show a clear message and restart the wizard.
- If payment succeeds but event creation fails:
  - Show an error with retry; keep the draft until creation succeeds.
- If user navigates away mid-wizard:
  - Draft persists; returning to `/events/new` can offer resume.

### 3) Join flow (code first, then account choice on same page)
User path:
1. `/join` shows code entry as now.
2. On valid code submit:
   - Do **not** navigate immediately to `/join/[code]`.
   - Validate code and fetch a minimal “event preview”.
3. If preview is found:
   - Show event title (+ optional date) and two buttons:
     - **I have an account** → `/auth/login?returnTo=/join/[code]`
     - **Continue as guest** → navigate to `/join/[code]` and proceed with anon sign-in flow
4. If preview is not found:
   - Show “Invalid code” inline error (stay on `/join`).

#### Public event preview lookup
Add a server route that returns only safe fields:
- Endpoint: `GET /api/join/preview?code=...`
- Response (200):
  - `eventId` (optional; only if safe to expose), or omit if you prefer
  - `title`
  - `eventDate` (optional)
  - `planId` (optional if needed for messaging; otherwise omit)
- Response (404):
  - `{ error: "NOT_FOUND" }`
- Abuse mitigation:
  - Rate limit by IP (basic) or simple in-process throttle if existing middleware allows.
  - Normalize code server-side the same way as client (`normalizeAccessCode` behavior).

#### Edge cases
- If user selects “Continue as guest” and the anon join fails:
  - Show error in the existing guest flow (current behavior).
- If user logs in and returns:
  - `/join/[code]` should behave correctly for authenticated users (current behavior).

## Technical implementation notes (non-code)
- Keep `/events/new` as the wizard route; adjust server guards so it can render unauthenticated.
- “Require organizer session” should only happen at the **finalize/payment/create** portion.
- Prefer reusing existing UI primitives (`AppBtn`, `AppInput`, `AppCard`, `AppFormRow`) and tokens.
- Avoid passing `Link` as a prop across Server/Client boundaries. Use `Link` + `appButtonClassNames` in server components.

## Testing & verification
- Unit tests:
  - Draft serialization/deserialization helpers (new lib functions).
  - Join preview route code normalization and not-found behavior.
- Build verification:
  - `npm test`
  - `npm run build`
- Manual:
  - Welcome → Create: complete steps signed out, return after auth, pay, land on Share.
  - Welcome → Join: enter code, see choice, log in path + guest path.

