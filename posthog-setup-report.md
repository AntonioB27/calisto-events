# PostHog post-wizard report

The wizard completed a deep integration of PostHog analytics into the Calisto events app. The project already had a substantial analytics foundation in place (posthog-js and posthog-node installed, analytics-events.ts constants, and capture calls scattered across auth, event creation, guest, and organizer flows). The wizard supplemented and completed the integration by:

- **Reverse proxy**: Added `/ingest/*` rewrites to `next.config.ts` so all PostHog traffic tunnels through the app's own domain, bypassing ad blockers and improving data quality.
- **Client init**: Updated `instrumentation-client.ts` to route through `/ingest` and set `ui_host` to `https://eu.posthog.com` for the EU region.
- **Environment variables**: Wrote `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` into `.env.local` with the correct EU values.
- **Event plan**: Expanded `.posthog-events.json` to include the full event creation funnel steps (step1–step3 viewed/completed, create_event_completed).

All event capture calls and user identification were already wired across the codebase. The table below covers every tracked event.

| Event name | Description | File |
|---|---|---|
| `user_logged_in` | User successfully signed in with email and password. | `app/auth/_components/AuthCombinedForm.tsx` |
| `user_registered` | User successfully created a new account. | `app/auth/_components/AuthCombinedForm.tsx` |
| `user_oauth_started` | User initiated Google OAuth sign-in flow. | `app/auth/_components/AuthCombinedForm.tsx` |
| `create_event_step1_viewed` | Organizer viewed step 1 (event details) of the creation funnel. | `app/events/new/_steps/Step1Details.tsx` |
| `create_event_step1_completed` | Organizer submitted step 1 details and advanced to step 2. | `app/events/new/_steps/Step1Details.tsx` |
| `create_event_step2_viewed` | Organizer viewed step 2 (plan selection) of the creation funnel. | `app/events/new/_steps/Step2Plan.tsx` |
| `create_event_step2_completed` | Organizer selected a plan and advanced to step 3. | `app/events/new/_steps/Step2Plan.tsx` |
| `create_event_step3_viewed` | Organizer viewed step 3 (payment confirmation) of the creation funnel. | `app/events/new/_steps/Step3Payment.tsx` |
| `create_event_step3_completed` | Organizer confirmed payment and triggered event creation or Stripe checkout. | `app/events/new/_steps/Step3Payment.tsx` |
| `create_event_completed` | Event was successfully created (free plan or after Stripe checkout success). | `app/events/new/complete/CompleteCheckoutClient.tsx` |
| `guest_code_submitted` | Guest submitted a join code to look up an event. | `app/join/JoinCodeForm.tsx` |
| `guest_joined_event` | Guest chose to continue joining an event without logging in. | `app/join/JoinCodeForm.tsx` |
| `guest_media_uploaded` | Guest successfully uploaded a photo or video to an event. | `app/join/[accessCode]/_components/UploadZone.tsx` |
| `organizer_invite_shared` | Organizer used the native share sheet or clipboard to share the invite link. | `app/(app)/events/[id]/_tabs/ShareTab.tsx` |
| `organizer_code_copied` | Organizer copied the access code or invite link to clipboard. | `app/(app)/events/[id]/_tabs/ShareTab.tsx` |
| `server_event_created` | Server confirmed a paid event was created after Stripe webhook. | `app/api/stripe/webhook/route.ts` |

## Next steps

We've built some insights and a dashboard to keep an eye on user behavior:

- [Analytics basics (wizard) — Dashboard](https://eu.posthog.com/project/212936/dashboard/783927)
- [Event Creation Funnel (wizard)](https://eu.posthog.com/project/212936/insights/x7CGUHgS)
- [New Registrations & Logins (wizard)](https://eu.posthog.com/project/212936/insights/57wA78qt)
- [Guest Activity (wizard)](https://eu.posthog.com/project/212936/insights/GQd9XcTS)
- [Organizer Invite Sharing (wizard)](https://eu.posthog.com/project/212936/insights/DnuAXzlF)
- [Paid Events Created (wizard)](https://eu.posthog.com/project/212936/insights/ckls791j)

## Verify before merging

- [ ] Run a full production build (`npm run build`) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` to `.env.example` and any onboarding scripts so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or your bundler's upload step) into CI so production stack traces de-minify in PostHog error tracking.
- [ ] Confirm the returning-visitor path also calls `posthog.identify()` — the current implementation only identifies on a fresh login or registration; returning users who resume a session via Supabase's auto-refresh may remain on anonymous distinct IDs.

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
