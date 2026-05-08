# Web vs phone app — parity progress tracker

**Purpose:** Track remaining work to align `calisto-landing` (Next.js) with `event-media-app` (Expo) where parity is intended. Update checkboxes as work lands; link PRs or commits in the notes column when useful.

**Related docs**


| Doc                                                                         | Role                        |
| --------------------------------------------------------------------------- | --------------------------- |
| [Event media port design](../specs/2026-05-05-event-media-port-design.md)   | Scope: in/out, architecture |
| [Port implementation plan](./2026-05-05-event-media-port-implementation.md) | Original phased plan        |
| [Parity checklist](./2026-05-05-event-media-parity-checklist.md)            | Smoke-style gates           |


**Legend:** `[ ]` not started · `[~]` in progress · `[x]` done · `—` not applicable (see notes)

---

## A. Auth & account


| Status | Item                                                | Phone reference                     | Notes                                                 |
| ------ | --------------------------------------------------- | ----------------------------------- | ----------------------------------------------------- |
| [x]    | Forgot password (request email)                     | `(auth)/forgot-password.tsx`        | `/auth/forgot-password` — `resetPasswordForEmail`     |
| [x]    | Reset password (form + token handling)              | `(auth)/reset-password.tsx`         | `/auth/reset-password` — code exchange + `updateUser` |
| [x]    | Reset success confirmation                          | `(auth)/reset-password-success.tsx` | `/auth/reset-password/success`                        |
| [x]    | App-level settings (profile, sign out, preferences) | `(app)/settings.tsx`                | `/settings` — email, theme, sign out                  |


---

## B. Onboarding & first-run


| Status | Item                       | Phone reference              | Notes                                                                                                              |
| ------ | -------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| [x]    | Welcome / entry routing    | `welcome.tsx`, `index.tsx`   | `/welcome` — create account, login, or enter code                                                                  |
| [x]    | Organizer onboarding steps | `onboarding/organizer-*.tsx` | `/onboarding/organizer` — kind + optional display name; gates `(app)` until `profiles.onboarding_completed_at` set |
| [x]    | Guest onboarding steps     | `onboarding/guest-*.tsx`     | `/join` — enter code → `/join/:code`; full guest UX on `[accessCode]`                                              |


---

## C. Organizer — home & discovery


| Status | Item                             | Phone reference                              | Notes                                              |
| ------ | -------------------------------- | -------------------------------------------- | -------------------------------------------------- |
| [x]    | Plan tiers / comparison screen   | `(app)/plan-tiers.tsx`                       | `/plan-tiers` (basic summary)                      |
| [x]    | My events: custom order          | `(app)/index.tsx` + `lib/my-events-order.ts` | Dashboard ↑/↓ buttons; persisted in `localStorage` |
| [x]    | My events: hide / restore events | `lib/my-events-visibility.ts`                | Hide/unhide + “Show hidden” toggle                 |


---

## D. Organizer — event admin


| Status | Item                                                        | Phone reference                           | Notes                                                                        |
| ------ | ----------------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------- |
| [ ]    | Event overview: upload missions & task UI                   | `event/[eventId].tsx` + `upload-missions` | YAGNI option: skip missions on web v1                                        |
| [ ]    | Event overview: plan upgrade CTAs                           | same                                      | Match caps / next-tier rules from app                                        |
| [ ]    | Per-event settings screen                                   | `event/[eventId]/settings.tsx`            | Edit title, date, etc., if DB supports                                       |
| [x]    | Tabs: Overview / Guests / Gallery / Share                   | bottom nav → screens                      | Web: `/events/[id]` tabs — baseline exists                                   |
| [x]    | Share: QR code display (and optional modal)                 | `event/[eventId]/share.tsx`               | Inline QR via `react-qr-code`                                                |
| [x]    | Share: invite message templates (short / friendly / formal) | share screen + `SHARE_TEMPLATE_KEY`       | `localStorage` + `lib/join-link.ts`                                          |
| [x]    | Share: copy link + copy message + Web Share API             | share screen                              | Clipboard + `navigator.share` fallbacks                                      |
| [x]    | Share: absolute join URL                                    | —                                         | `lib/public-origin.ts` + `getWebJoinUrl`; set `NEXT_PUBLIC_SITE_URL` in prod |
| [x]    | Print / QR poster (A4-style, print-friendly page)           | `event/[eventId]/print.tsx`               | `/events/:id/print` (browser print)                                          |
| [x]    | Gallery: delete / moderate media (if app has it)            | `gallery.tsx`                             | Organizer Gallery tab now supports delete (DB row + Storage object)          |
| [x]    | Guests: actions parity (remove, roles if any)               | `guests.tsx`                              | Organizer can remove + promote/demote via RPCs                               |


---

## E. Guest flow


| Status | Item                                               | Phone reference  | Notes                                      |
| ------ | -------------------------------------------------- | ---------------- | ------------------------------------------ |
| [x]    | Join by access code                                | `join.tsx`       | Web: `/join/[accessCode]`                  |
| [x]    | Upload + gallery (eligible window)                 | upload + gallery | Web: guest-upload API + UI                 |
| [x]    | Return to join after login/register (`?returnTo=`) | —                | `lib/safe-return-path.ts` + auth pages     |
| [x]    | Ensure membership after email/password session     | —                | `join_event_with_code` on `GuestEventPage` |
| [x]    | Plan `plus` + limits aligned with mobile           | `plan-limits`    | Guest + create-event + API                 |
| [x]    | Gallery uses `mime_type` (DB); videos playable     | gallery          | `MediaGrid` + organizer `GalleryTab`       |
| [x]    | Upload quota counts match DB (`mime_type`)         | —                | guest-upload route                         |
| [x]    | Upload window closed UX                            | —                | Banner + disabled `UploadZone`             |
| [x]    | Friendly errors (quota / closed / auth)            | —                | `UploadZone` `mapUploadError`              |


---

## F. Device-only — web substitute or skip


| Status | Item                  | Phone reference      | Web approach                                                                         |
| ------ | --------------------- | -------------------- | ------------------------------------------------------------------------------------ |
| [ ]    | Scan QR to join       | camera / linking     | Optional: document “open link” only, or add `/join` QR scanner via browser API later |
| [ ]    | Push notifications    | `expo-notifications` | `—` or email/push product decision                                                   |
| [ ]    | Save image to gallery | `expo-media-library` | Download link / share file where applicable                                          |
| [ ]    | Native share sheet    | `Share`              | Web Share API + clipboard fallbacks                                                  |


---

## G. Verification


| Status | Item                                                                                    | Notes |
| ------ | --------------------------------------------------------------------------------------- | ----- |
| [ ]    | Update [parity checklist](./2026-05-05-event-media-parity-checklist.md) when gates pass |       |
| [ ]    | Spot-check against Supabase RLS + same project as mobile                                |       |


---

## Recommended implementation batches (suggested order)

1. **Share & discoverability** — QR, absolute join URL, copy buttons, template picker, Web Share where available (`D` Share rows).
2. **Account recovery** — Forgot + reset password (`A`).
3. **Print / poster** — Print route or PDF for organizers (`D` print row).
4. **Dashboard polish** — Reorder + hide events (`C`).
5. **Event settings + missions** — Only if product confirms (`D` overview/settings).
6. **Onboarding** — If still required for web (`B`).

Adjust order if support load or launch priorities dictate (e.g. password reset before QR).

---

## Changelog


| Date       | Change                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| 2026-05-06 | Initial tracker from gap analysis                                                                       |
| 2026-05-06 | Sprint A (share): QR, templates, copy, Web Share, absolute URLs                                         |
| 2026-05-06 | Guest flow: returnTo auth, membership RPC, plus plan, mime quotas, gallery video, upload UX             |
| 2026-05-06 | Auth & account: forgot/reset password, success page, `/settings` (theme + sign out), README redirects   |
| 2026-05-06 | Onboarding B: `/welcome`, `/join` code entry, organizer one-screen + profile gate, `OnboardingRedirect` |
