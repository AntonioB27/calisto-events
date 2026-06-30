# Event Creation Funnel Tracking Design

## Overview

Add PostHog funnel tracking to the event creation flow to identify where users drop off. Track both step entries and completions so drop-off can be attributed to a specific step, not just the gap between steps.

**Tool:** PostHog (cloud, free tier)
**Approach:** Client-side events via `posthog-js` + `usePostHog()` hook

---

## Funnel Steps

The creation flow lives at `/events/new` with a `step` query param (1, 2, 3), followed by `/events/new/complete`.

| Step | Route | Component |
|------|-------|-----------|
| Landing | `/start` | Auto-captured pageview |
| Step 1 — Details | `/events/new?step=1` | `Step1Details.tsx` |
| Step 2 — Plan | `/events/new?step=2` | `Step2Plan.tsx` |
| Step 3 — Payment | `/events/new?step=3` | `Step3Payment.tsx` |
| Complete | `/events/new/complete` | `CompleteCheckoutClient.tsx` |

---

## Events

| Event Name | Trigger | Properties |
|---|---|---|
| `create_event_step1_viewed` | Step1Details mounts | - |
| `create_event_step1_completed` | Step1 form `onSubmit` | `has_emoji: boolean`, `moderation_enabled: boolean` |
| `create_event_step2_viewed` | Step2Plan mounts | - |
| `create_event_step2_completed` | Step2 continue button clicked | `plan_id: PlanId` |
| `create_event_step3_viewed` | Step3Payment mounts | `plan_id: PlanId` |
| `create_event_step3_completed` | Payment initiated (Stripe redirect or free event creation) | `plan_id: PlanId`, `is_paid: boolean` |
| `create_event_completed` | Fulfillment succeeds, router.replace fires | `plan_id: PlanId` |

PostHog auto-captures pageviews, covering the `/start` landing page without any custom code.

---

## Architecture

### New files

**`components/PostHogProvider.tsx`**
- `'use client'` component
- Initializes PostHog with `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST`
- Wraps children; used once in `app/layout.tsx`

### Modified files

**`app/layout.tsx`**
- Import and render `<PostHogProvider>` inside `<body>`, wrapping existing children

**`app/events/new/_steps/Step1Details.tsx`**
- `useEffect` on mount fires `create_event_step1_viewed`
- `onSubmit` handler fires `create_event_step1_completed` with `has_emoji` and `moderation_enabled`

**`app/events/new/_steps/Step2Plan.tsx`**
- `useEffect` on mount fires `create_event_step2_viewed`
- Continue button handler fires `create_event_step2_completed` with `plan_id`

**`app/events/new/_steps/Step3Payment.tsx`**
- `useEffect` on mount fires `create_event_step3_viewed` with `plan_id`
- Before Stripe redirect or free event creation fires `create_event_step3_completed`

**`app/events/new/complete/CompleteCheckoutClient.tsx`**
- After successful `router.replace` fires `create_event_completed` with `plan_id`

---

## Environment Variables

```
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
```

Both are public (client-side safe). Use the EU host if data residency matters.

---

## PostHog Funnel Setup

After implementation, create a funnel in PostHog with these steps in order:

1. `create_event_step1_viewed`
2. `create_event_step2_viewed`
3. `create_event_step3_viewed`
4. `create_event_completed`

Add a secondary funnel with completion events interleaved to pinpoint mid-step abandonment.

---

## Out of Scope

- Server-side tracking (not needed for drop-off analysis)
- Session replay (can be enabled in PostHog settings without code changes)
- A/B testing or feature flags
- Tracking outside the creation funnel
