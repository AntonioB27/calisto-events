# Event Creation Funnel Tracking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add PostHog funnel tracking to the event creation flow so drop-off by step is visible in PostHog's funnel analysis.

**Architecture:** A single `PostHogProvider` client component initializes `posthog-js` and wraps the app in `app/layout.tsx`. Each step component calls `usePostHog().capture()` on mount (viewed) and on the relevant user action (completed). Event name strings live in `lib/analytics-events.ts` to keep them consistent across files.

**Tech Stack:** `posthog-js` (npm), PostHog cloud (EU), Next.js App Router, Vitest

## Global Constraints

- Event names must match exactly: see `lib/analytics-events.ts` — no inline string literals in components
- Use `posthog-js/react` (`usePostHog`, `PostHogProvider`) — not the `posthog-node` package
- Env vars: `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` (both `NEXT_PUBLIC_` prefix, client-safe)
- Default host: `https://eu.i.posthog.com`
- Never fire events in catch blocks or error paths — only on successful user actions
- `capture_pageview: true` in PostHog init — do not add manual pageview events

---

## File Map

| File | Status | Responsibility |
|------|--------|----------------|
| `lib/analytics-events.ts` | Create | Event name constants |
| `components/PostHogProvider.tsx` | Create | Init PostHog, export `PostHogProvider` wrapper |
| `app/layout.tsx` | Modify | Wrap children with `PostHogProvider` |
| `app/events/new/_steps/Step1Details.tsx` | Modify | Capture step1 viewed + completed |
| `app/events/new/_steps/Step2Plan.tsx` | Modify | Capture step2 viewed + completed |
| `app/events/new/_steps/Step3Payment.tsx` | Modify | Capture step3 viewed + completed |
| `app/events/new/complete/CompleteCheckoutClient.tsx` | Modify | Capture create_event_completed |

---

### Task 1: Install PostHog, create event constants and provider, wire layout

**Files:**
- Create: `lib/analytics-events.ts`
- Create: `components/PostHogProvider.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Produces: `ANALYTICS_EVENTS` object exported from `lib/analytics-events.ts`
- Produces: `PostHogProvider` component exported from `components/PostHogProvider.tsx`

- [ ] **Step 1: Install posthog-js**

```bash
npm install posthog-js
```

Expected: package added to `node_modules`, `package.json` updated.

- [ ] **Step 2: Add env vars to .env.local**

Open `.env.local` and append:

```
NEXT_PUBLIC_POSTHOG_KEY=phc_YOUR_KEY_HERE
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
```

Replace `phc_YOUR_KEY_HERE` with the project API key from posthog.com → Project Settings → Project API Key.

- [ ] **Step 3: Write the test for analytics-events constants**

Create `lib/analytics-events.test.ts`:

```typescript
import { describe, expect, it } from "vitest";
import { ANALYTICS_EVENTS } from "./analytics-events";

describe("ANALYTICS_EVENTS", () => {
  it("has all required funnel event names as non-empty strings", () => {
    const required = [
      "create_event_step1_viewed",
      "create_event_step1_completed",
      "create_event_step2_viewed",
      "create_event_step2_completed",
      "create_event_step3_viewed",
      "create_event_step3_completed",
      "create_event_completed",
    ];
    for (const name of required) {
      expect(Object.values(ANALYTICS_EVENTS)).toContain(name);
    }
  });

  it("has no duplicate values", () => {
    const values = Object.values(ANALYTICS_EVENTS);
    expect(new Set(values).size).toBe(values.length);
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

```bash
npx vitest run lib/analytics-events.test.ts
```

Expected: FAIL — `Cannot find module './analytics-events'`

- [ ] **Step 5: Create lib/analytics-events.ts**

```typescript
export const ANALYTICS_EVENTS = {
  CREATE_STEP1_VIEWED:    "create_event_step1_viewed",
  CREATE_STEP1_COMPLETED: "create_event_step1_completed",
  CREATE_STEP2_VIEWED:    "create_event_step2_viewed",
  CREATE_STEP2_COMPLETED: "create_event_step2_completed",
  CREATE_STEP3_VIEWED:    "create_event_step3_viewed",
  CREATE_STEP3_COMPLETED: "create_event_step3_completed",
  CREATE_COMPLETED:       "create_event_completed",
} as const;
```

- [ ] **Step 6: Run test to verify it passes**

```bash
npx vitest run lib/analytics-events.test.ts
```

Expected: PASS — 2 tests passed.

- [ ] **Step 7: Create components/PostHogProvider.tsx**

```tsx
"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com",
      capture_pageview: true,
      capture_pageleave: true,
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
```

- [ ] **Step 8: Wrap children in app/layout.tsx**

Current `app/layout.tsx` body:
```tsx
      <body className="min-h-full flex flex-col">
        <CalistoThemeInit />
        <AppUiProvider value={{ locale, ...dict }}>{children}</AppUiProvider>
        <Analytics />
      </body>
```

Add the import and wrap `AppUiProvider`:
```tsx
import { PostHogProvider } from "@/components/PostHogProvider";
```

```tsx
      <body className="min-h-full flex flex-col">
        <CalistoThemeInit />
        <PostHogProvider>
          <AppUiProvider value={{ locale, ...dict }}>{children}</AppUiProvider>
        </PostHogProvider>
        <Analytics />
      </body>
```

- [ ] **Step 9: Verify the dev server starts without errors**

```bash
npm run dev
```

Expected: server starts, no TypeScript or import errors in the console. Open `http://localhost:3000` and check the browser Network tab — you should see a request to `eu.i.posthog.com` after a few seconds.

- [ ] **Step 10: Commit**

```bash
git add lib/analytics-events.ts lib/analytics-events.test.ts components/PostHogProvider.tsx app/layout.tsx package.json package-lock.json
git commit -m "feat: add PostHog provider and analytics event constants"
```

---

### Task 2: Track Step 1 (event details)

**Files:**
- Modify: `app/events/new/_steps/Step1Details.tsx`

**Interfaces:**
- Consumes: `ANALYTICS_EVENTS` from `lib/analytics-events.ts`
- Consumes: `usePostHog` from `posthog-js/react`

- [ ] **Step 1: Add imports to Step1Details.tsx**

At the top of `app/events/new/_steps/Step1Details.tsx`, after existing imports:

```tsx
import { usePostHog } from "posthog-js/react";
import { ANALYTICS_EVENTS } from "@/lib/analytics-events";
```

- [ ] **Step 2: Add posthog hook and viewed event inside Step1Details**

Inside `export function Step1Details(...)`, after the existing hook declarations (`useAppUi`, `useState`, etc.), add:

```tsx
  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture(ANALYTICS_EVENTS.CREATE_STEP1_VIEWED);
  }, [posthog]);
```

- [ ] **Step 3: Fire completed event on form submit**

The existing `onSubmit` on the `<form>` element is:

```tsx
        onSubmit={(event) => {
          const formData = new FormData(event.currentTarget);
          const name = String(formData.get("name") ?? "");
          const date = String(formData.get("date") ?? "");
          writeStep2Draft(name, date);
        }}
```

Replace it with:

```tsx
        onSubmit={(event) => {
          const formData = new FormData(event.currentTarget);
          const name = String(formData.get("name") ?? "");
          const date = String(formData.get("date") ?? "");
          writeStep2Draft(name, date);
          posthog.capture(ANALYTICS_EVENTS.CREATE_STEP1_COMPLETED, {
            has_emoji: emoji !== "📅",
            moderation_enabled: moderationEnabled,
          });
        }}
```

- [ ] **Step 4: Verify manually**

Start the dev server (`npm run dev`), go to `http://localhost:3000/events/new?step=1`, open PostHog Live Events (posthog.com → your project → Activity → Live events). You should see `create_event_step1_viewed` appear. Fill in the form and hit Continue — you should see `create_event_step1_completed`.

- [ ] **Step 5: Commit**

```bash
git add app/events/new/_steps/Step1Details.tsx
git commit -m "feat: track step 1 viewed and completed events"
```

---

### Task 3: Track Step 2 (plan selection)

**Files:**
- Modify: `app/events/new/_steps/Step2Plan.tsx`

**Interfaces:**
- Consumes: `ANALYTICS_EVENTS` from `lib/analytics-events.ts`
- Consumes: `usePostHog` from `posthog-js/react`

- [ ] **Step 1: Add imports to Step2Plan.tsx**

The existing React import in `Step2Plan.tsx` is `import { useMemo, useState } from "react"`. Update it to include `useEffect`:

```tsx
import { useEffect, useMemo, useState } from "react";
```

Then after the other existing imports add:

```tsx
import { usePostHog } from "posthog-js/react";
import { ANALYTICS_EVENTS } from "@/lib/analytics-events";
```

- [ ] **Step 2: Add posthog hook and viewed event**

Inside `export function Step2Plan(...)`, after existing hook declarations (`useAppUi`, `useState`, `useMemo`):

```tsx
  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture(ANALYTICS_EVENTS.CREATE_STEP2_VIEWED);
  }, [posthog]);
```

- [ ] **Step 3: Fire completed event on continue button click**

The continue button's existing `onClick` is:

```tsx
            onClick={(event) => {
              const form = event.currentTarget.form;
              if (!form) return;
              const planInput = form.elements.namedItem("planId");
              const current = planInput instanceof HTMLInputElement ? (planInput.value as PlanId) : selected;
              writeStep2Draft(current);
            }}
```

Replace it with:

```tsx
            onClick={(event) => {
              const form = event.currentTarget.form;
              if (!form) return;
              const planInput = form.elements.namedItem("planId");
              const current = planInput instanceof HTMLInputElement ? (planInput.value as PlanId) : selected;
              writeStep2Draft(current);
              posthog.capture(ANALYTICS_EVENTS.CREATE_STEP2_COMPLETED, { plan_id: current });
            }}
```

- [ ] **Step 4: Verify manually**

Go to `http://localhost:3000/events/new?step=2&name=Test`. PostHog Live Events should show `create_event_step2_viewed`. Select a plan and click Continue — `create_event_step2_completed` should appear with `plan_id` in its properties.

- [ ] **Step 5: Commit**

```bash
git add app/events/new/_steps/Step2Plan.tsx
git commit -m "feat: track step 2 viewed and completed events"
```

---

### Task 4: Track Step 3 and completion

**Files:**
- Modify: `app/events/new/_steps/Step3Payment.tsx`
- Modify: `app/events/new/complete/CompleteCheckoutClient.tsx`

**Interfaces:**
- Consumes: `ANALYTICS_EVENTS` from `lib/analytics-events.ts`
- Consumes: `usePostHog` from `posthog-js/react`

- [ ] **Step 1: Add imports to Step3Payment.tsx**

After existing imports:

```tsx
import { usePostHog } from "posthog-js/react";
import { ANALYTICS_EVENTS } from "@/lib/analytics-events";
```

- [ ] **Step 2: Add posthog hook and viewed event to Step3Payment**

Inside `export function Step3Payment(...)`, after the existing hook declarations:

```tsx
  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture(ANALYTICS_EVENTS.CREATE_STEP3_VIEWED, { plan_id: planId });
  }, [posthog, planId]);
```

- [ ] **Step 3: Fire completed event at start of onConfirm**

The existing `onConfirm` begins:

```tsx
  async function onConfirm() {
    setBusy(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setRequiresAuth(true); setBusy(false); return; }

      if (isPaidPlanForCheckout(planId)) {
```

Add the capture call after the auth check passes (user is confirmed), before the paid/free branch:

```tsx
  async function onConfirm() {
    setBusy(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setRequiresAuth(true); setBusy(false); return; }

      posthog.capture(ANALYTICS_EVENTS.CREATE_STEP3_COMPLETED, {
        plan_id: planId,
        is_paid: isPaidPlanForCheckout(planId),
      });

      if (isPaidPlanForCheckout(planId)) {
```

- [ ] **Step 4: Add imports to CompleteCheckoutClient.tsx**

After existing imports:

```tsx
import { usePostHog } from "posthog-js/react";
import { ANALYTICS_EVENTS } from "@/lib/analytics-events";
```

- [ ] **Step 5: Add posthog hook and fire completed event in CompleteCheckoutClient**

Inside `export function CompleteCheckoutClient()`, after the existing hook declarations:

```tsx
  const posthog = usePostHog();
```

Inside the `finish` async function, right before `router.replace(...)`:

```tsx
      const planId = searchParams.get("plan_id");
      posthog.capture(ANALYTICS_EVENTS.CREATE_COMPLETED, {
        ...(planId ? { plan_id: planId } : {}),
      });
      clearCreateEventDraftFromStorage();
      router.replace(`/events/${payload.eventId}?tab=share`);
```

Note: `plan_id` is not currently passed as a query param to the complete page. If you want it, pass it through from Step3Payment when building the Stripe return URL or free-event redirect. If not available, the event still fires without `plan_id` — that's fine.

- [ ] **Step 6: Verify manually**

Go through the full creation flow (use a free plan to avoid Stripe). PostHog Live Events should show all 6 events in sequence: `step1_viewed`, `step1_completed`, `step2_viewed`, `step2_completed`, `step3_viewed`, `step3_completed`, then `create_event_completed` on the complete page.

- [ ] **Step 7: Commit**

```bash
git add app/events/new/_steps/Step3Payment.tsx app/events/new/complete/CompleteCheckoutClient.tsx
git commit -m "feat: track step 3 viewed, completed, and event creation completed"
```

---

### Task 5: Set up PostHog funnel

This task is done in the PostHog UI — no code changes.

- [ ] **Step 1: Open PostHog → Insights → New insight → Funnel**

- [ ] **Step 2: Add funnel steps in this order**

1. `create_event_step1_viewed`
2. `create_event_step2_viewed`
3. `create_event_step3_viewed`
4. `create_event_completed`

Set conversion window to 7 days.

- [ ] **Step 3: Save as "Event Creation Funnel"**

- [ ] **Step 4: Create a second funnel for mid-step abandonment**

Steps:
1. `create_event_step1_viewed`
2. `create_event_step1_completed`
3. `create_event_step2_viewed`
4. `create_event_step2_completed`
5. `create_event_step3_viewed`
6. `create_event_step3_completed`
7. `create_event_completed`

Save as "Event Creation Funnel (Detailed)".
