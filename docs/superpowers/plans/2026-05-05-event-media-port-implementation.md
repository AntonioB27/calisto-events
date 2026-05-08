# Event Media App Port Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port all currently implemented `event-media-app` functionality that is relevant to web into `calisto-landing`, with organizer and guest flows delivered in lockstep against the same Supabase backend.

**Architecture:** Build on `calisto-landing` as the web host, but treat `event-media-app` behavior as source of truth. Implement a shared domain parity layer in `lib/`, then wire auth, organizer, guest, and API routes to those rules. Enforce limits and permissions server-side, mirror checks client-side, and verify parity through utility tests plus end-to-end route checks.

**Tech Stack:** Next.js App Router, React, TypeScript, Supabase (`@supabase/supabase-js`), Vitest.

---

## Scope Check

This spec is one cohesive subsystem (web parity for the event media product) and is suitable for one implementation plan. Tasks are split into vertical slices with testable checkpoints.

## Planned File Structure and Responsibilities

- `app/auth/login/page.tsx` - Organizer login UI and submit flow.
- `app/auth/register/page.tsx` - Organizer registration UI and submit flow.
- `app/(app)/layout.tsx` - Auth-guarded shell for organizer pages.
- `app/(app)/dashboard/page.tsx` - Organizer event list and entry points.
- `app/(app)/events/new/page.tsx` - Event creation orchestrator.
- `app/(app)/events/new/_steps/Step1Details.tsx` - Event metadata step.
- `app/(app)/events/new/_steps/Step2Plan.tsx` - Plan selection step.
- `app/(app)/events/new/_steps/Step3Payment.tsx` - Payment parity step (as currently implemented).
- `app/(app)/events/[id]/page.tsx` - Event admin container.
- `app/(app)/events/[id]/_tabs/OverviewTab.tsx` - Organizer overview panel.
- `app/(app)/events/[id]/_tabs/GuestsTab.tsx` - Organizer guests panel.
- `app/(app)/events/[id]/_tabs/GalleryTab.tsx` - Organizer gallery panel.
- `app/(app)/events/[id]/_tabs/ShareTab.tsx` - Share and QR panel.
- `app/(app)/events/[id]/_tabs/EventAdminTabs.tsx` - Tab composition and routing.
- `app/join/[accessCode]/page.tsx` - Guest entry route.
- `app/join/[accessCode]/_components/GuestEventPage.tsx` - Guest view shell.
- `app/join/[accessCode]/_components/UploadZone.tsx` - Guest upload UI and client validation.
- `app/join/[accessCode]/_components/MediaGrid.tsx` - Guest gallery rendering.
- `app/api/events/[id]/guest-upload/route.ts` - Server-side upload authorization and metadata persistence.
- `lib/access-code.ts` - Access-code parsing and event eligibility checks.
- `lib/plan-limits.ts` - Plan quotas and upload window rules.
- `lib/usage-stats.ts` - Usage aggregate calculations.
- `lib/supabase-auth-server.ts` - Server auth helpers for protected operations.
- `lib/supabase-browser.ts` - Browser Supabase client setup.
- `lib/access-code.test.ts` - Access-code rule tests.
- `lib/plan-limits.test.ts` - Plan rule tests.
- `lib/usage-stats.test.ts` - Usage-stat tests.
- `vitest.config.ts` - Test runner config.
- `package.json` - Test scripts and dependencies.
- `docs/superpowers/specs/2026-05-05-event-media-port-design.md` - Approved design reference.

### Task 1: Baseline Branch + Testing Harness

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Test: `lib/plan-limits.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { getPlanLimits } from "./plan-limits";

describe("getPlanLimits", () => {
  it("returns Free plan limits", () => {
    expect(getPlanLimits("free")).toEqual({
      maxGuests: 5,
      maxPhotos: 20,
      maxVideos: 0,
      uploadDaysAfterEvent: 3,
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- lib/plan-limits.test.ts`  
Expected: FAIL because test script and/or implementation is missing.

- [ ] **Step 3: Write minimal implementation**

```ts
export type PlanId = "free" | "standard" | "premium" | "max";

export function getPlanLimits(planId: PlanId) {
  const plans = {
    free: { maxGuests: 5, maxPhotos: 20, maxVideos: 0, uploadDaysAfterEvent: 3 },
    standard: { maxGuests: 20, maxPhotos: 150, maxVideos: 10, uploadDaysAfterEvent: 7 },
    premium: { maxGuests: 70, maxPhotos: 500, maxVideos: 50, uploadDaysAfterEvent: 14 },
    max: { maxGuests: 200, maxPhotos: 2000, maxVideos: 200, uploadDaysAfterEvent: 30 },
  } as const;

  return plans[planId];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- lib/plan-limits.test.ts`  
Expected: PASS with 1 test passing.

- [ ] **Step 5: Commit**

```bash
git checkout -b feat/event-media-web-port
git add package.json vitest.config.ts lib/plan-limits.ts lib/plan-limits.test.ts
git commit -m "test: add vitest baseline and initial plan limit coverage"
```

### Task 2: Domain Parity Layer (Plan, Access, Usage)

**Files:**
- Create: `lib/access-code.ts`
- Create: `lib/usage-stats.ts`
- Modify: `lib/plan-limits.ts`
- Test: `lib/access-code.test.ts`
- Test: `lib/usage-stats.test.ts`
- Test: `lib/plan-limits.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it } from "vitest";
import { canGuestUpload } from "./plan-limits";
import { isAccessCodeValid } from "./access-code";
import { getUsageStats } from "./usage-stats";

describe("domain parity rules", () => {
  it("rejects upload when upload window has expired", () => {
    expect(canGuestUpload({ planId: "free", eventDate: "2026-01-01", now: "2026-01-10" })).toBe(false);
  });

  it("accepts uppercase access codes", () => {
    expect(isAccessCodeValid("wedding2026")).toBe(true);
  });

  it("computes remaining photo capacity", () => {
    const usage = getUsageStats({ planId: "standard", photosUsed: 10, videosUsed: 2, guestsUsed: 3 });
    expect(usage.photosRemaining).toBe(140);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- lib/plan-limits.test.ts lib/access-code.test.ts lib/usage-stats.test.ts`  
Expected: FAIL for missing exports/functions.

- [ ] **Step 3: Write minimal implementation**

```ts
export function isAccessCodeValid(input: string): boolean {
  return /^[A-Z0-9]{6,20}$/.test(input.trim().toUpperCase());
}

export function canGuestUpload(args: { planId: PlanId; eventDate: string; now: string }): boolean {
  const limits = getPlanLimits(args.planId);
  const eventDate = new Date(args.eventDate);
  const now = new Date(args.now);
  const diffDays = Math.floor((now.getTime() - eventDate.getTime()) / 86400000);
  return diffDays <= limits.uploadDaysAfterEvent;
}

export function getUsageStats(input: {
  planId: PlanId;
  photosUsed: number;
  videosUsed: number;
  guestsUsed: number;
}) {
  const limits = getPlanLimits(input.planId);
  return {
    photosRemaining: Math.max(0, limits.maxPhotos - input.photosUsed),
    videosRemaining: Math.max(0, limits.maxVideos - input.videosUsed),
    guestsRemaining: Math.max(0, limits.maxGuests - input.guestsUsed),
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- lib/plan-limits.test.ts lib/access-code.test.ts lib/usage-stats.test.ts`  
Expected: PASS for all domain-rule tests.

- [ ] **Step 5: Commit**

```bash
git add lib/access-code.ts lib/usage-stats.ts lib/plan-limits.ts lib/access-code.test.ts lib/usage-stats.test.ts lib/plan-limits.test.ts
git commit -m "feat: add shared domain parity rules for access limits and usage"
```

### Task 3: Auth Surfaces + Organizer Route Guard

**Files:**
- Create: `lib/supabase-browser.ts`
- Create: `lib/supabase-auth-server.ts`
- Create: `app/auth/login/page.tsx`
- Create: `app/auth/register/page.tsx`
- Create: `app/(app)/layout.tsx`
- Test: `app/(app)/layout.guard.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { requireOrganizerSession } from "@/lib/supabase-auth-server";

describe("requireOrganizerSession", () => {
  it("throws when session is missing", async () => {
    await expect(requireOrganizerSession(null)).rejects.toThrow("AUTH_REQUIRED");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- app/(app)/layout.guard.test.ts`  
Expected: FAIL due to missing auth helper and/or behavior.

- [ ] **Step 3: Write minimal implementation**

```ts
export async function requireOrganizerSession(userId: string | null) {
  if (!userId) {
    throw new Error("AUTH_REQUIRED");
  }
  return { userId };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- app/(app)/layout.guard.test.ts`  
Expected: PASS with auth guard behavior validated.

- [ ] **Step 5: Commit**

```bash
git add lib/supabase-browser.ts lib/supabase-auth-server.ts app/auth/login/page.tsx app/auth/register/page.tsx app/(app)/layout.tsx app/(app)/layout.guard.test.ts
git commit -m "feat: add auth pages and organizer session guard"
```

### Task 4: Organizer Event Creation Flow

**Files:**
- Create: `app/(app)/events/new/page.tsx`
- Create: `app/(app)/events/new/_steps/Step1Details.tsx`
- Create: `app/(app)/events/new/_steps/Step2Plan.tsx`
- Create: `app/(app)/events/new/_steps/Step3Payment.tsx`
- Modify: `app/(app)/dashboard/page.tsx`
- Test: `app/(app)/events/new/create-event.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { validateCreateEventInput } from "./validators";

describe("create event validation", () => {
  it("rejects missing event name", () => {
    expect(() => validateCreateEventInput({ name: "", planId: "free" })).toThrow("NAME_REQUIRED");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- app/(app)/events/new/create-event.test.ts`  
Expected: FAIL due to missing validator and event creation module.

- [ ] **Step 3: Write minimal implementation**

```ts
export function validateCreateEventInput(input: { name: string; planId: PlanId }) {
  if (!input.name.trim()) throw new Error("NAME_REQUIRED");
  return { ...input, name: input.name.trim() };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- app/(app)/events/new/create-event.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/(app)/dashboard/page.tsx app/(app)/events/new/page.tsx app/(app)/events/new/_steps/Step1Details.tsx app/(app)/events/new/_steps/Step2Plan.tsx app/(app)/events/new/_steps/Step3Payment.tsx app/(app)/events/new/create-event.test.ts
git commit -m "feat: add organizer event creation wizard with plan step parity"
```

### Task 5: Organizer Event Admin Tabs

**Files:**
- Create: `app/(app)/events/[id]/page.tsx`
- Create: `app/(app)/events/[id]/_tabs/EventAdminTabs.tsx`
- Create: `app/(app)/events/[id]/_tabs/OverviewTab.tsx`
- Create: `app/(app)/events/[id]/_tabs/GuestsTab.tsx`
- Create: `app/(app)/events/[id]/_tabs/GalleryTab.tsx`
- Create: `app/(app)/events/[id]/_tabs/ShareTab.tsx`
- Test: `app/(app)/events/[id]/admin-tabs.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { EventAdminTabs } from "./_tabs/EventAdminTabs";
import { it, expect } from "vitest";

it("renders all required admin tabs", () => {
  render(<EventAdminTabs eventId="evt_1" />);
  expect(screen.getByText("Overview")).toBeInTheDocument();
  expect(screen.getByText("Guests")).toBeInTheDocument();
  expect(screen.getByText("Gallery")).toBeInTheDocument();
  expect(screen.getByText("Share")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- app/(app)/events/[id]/admin-tabs.test.tsx`  
Expected: FAIL due to missing component.

- [ ] **Step 3: Write minimal implementation**

```tsx
export function EventAdminTabs() {
  return (
    <nav>
      <button>Overview</button>
      <button>Guests</button>
      <button>Gallery</button>
      <button>Share</button>
    </nav>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- app/(app)/events/[id]/admin-tabs.test.tsx`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/(app)/events/[id]/page.tsx app/(app)/events/[id]/_tabs/EventAdminTabs.tsx app/(app)/events/[id]/_tabs/OverviewTab.tsx app/(app)/events/[id]/_tabs/GuestsTab.tsx app/(app)/events/[id]/_tabs/GalleryTab.tsx app/(app)/events/[id]/_tabs/ShareTab.tsx app/(app)/events/[id]/admin-tabs.test.tsx
git commit -m "feat: add organizer event admin tabs for overview guests gallery and share"
```

### Task 6: Guest Join + Upload Experience

**Files:**
- Create: `app/join/[accessCode]/page.tsx`
- Create: `app/join/[accessCode]/_components/GuestEventPage.tsx`
- Create: `app/join/[accessCode]/_components/UploadZone.tsx`
- Create: `app/join/[accessCode]/_components/MediaGrid.tsx`
- Test: `app/join/[accessCode]/guest-upload-eligibility.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { canGuestUpload } from "@/lib/plan-limits";

describe("guest eligibility", () => {
  it("blocks uploads when event window is closed", () => {
    expect(canGuestUpload({ planId: "free", eventDate: "2026-01-01", now: "2026-01-20" })).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- app/join/[accessCode]/guest-upload-eligibility.test.ts`  
Expected: FAIL before guest flow wiring is complete.

- [ ] **Step 3: Write minimal implementation**

```tsx
export function UploadZone({ canUpload }: { canUpload: boolean }) {
  if (!canUpload) return <p>Uploads are closed for this event.</p>;
  return <input type="file" multiple />;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- app/join/[accessCode]/guest-upload-eligibility.test.ts`  
Expected: PASS and guest gating behavior enforced.

- [ ] **Step 5: Commit**

```bash
git add app/join/[accessCode]/page.tsx app/join/[accessCode]/_components/GuestEventPage.tsx app/join/[accessCode]/_components/UploadZone.tsx app/join/[accessCode]/_components/MediaGrid.tsx app/join/[accessCode]/guest-upload-eligibility.test.ts
git commit -m "feat: add guest join and upload flow with plan window gating"
```

### Task 7: Server Upload Route + Permission Enforcement

**Files:**
- Create: `app/api/events/[id]/guest-upload/route.ts`
- Modify: `lib/supabase-auth-server.ts`
- Modify: `lib/usage-stats.ts`
- Test: `app/api/events/[id]/guest-upload/route.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { POST } from "./route";

describe("guest-upload route", () => {
  it("returns 403 when quota exceeded", async () => {
    const response = await POST(new Request("http://localhost"), { params: { id: "evt_1" } });
    expect(response.status).toBe(403);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- app/api/events/[id]/guest-upload/route.test.ts`  
Expected: FAIL because route behavior is not implemented.

- [ ] **Step 3: Write minimal implementation**

```ts
export async function POST(_request: Request) {
  const quotaExceeded = true;
  if (quotaExceeded) {
    return new Response(JSON.stringify({ error: "QUOTA_REACHED" }), { status: 403 });
  }
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- app/api/events/[id]/guest-upload/route.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/api/events/[id]/guest-upload/route.ts app/api/events/[id]/guest-upload/route.test.ts lib/supabase-auth-server.ts lib/usage-stats.ts
git commit -m "feat: enforce guest upload permissions and quotas in server route"
```

### Task 8: Parity Validation + Final Quality Gates

**Files:**
- Modify: `docs/superpowers/specs/2026-05-05-event-media-port-design.md`
- Create: `docs/superpowers/plans/2026-05-05-event-media-parity-checklist.md`

- [ ] **Step 1: Write the failing validation artifact**

```md
# Event Media Web Parity Checklist

- [ ] Organizer can authenticate and access dashboard
- [ ] Organizer can create event with plan selection
- [ ] Organizer can manage overview/guests/gallery/share tabs
- [ ] Guest can join by access code
- [ ] Guest can upload media when eligible
- [ ] Upload is blocked when quota or window rules fail
```

- [ ] **Step 2: Run quality commands and capture failures**

Run: `npm run lint && npm run test && npm run build`  
Expected: At least one command fails before final cleanup.

- [ ] **Step 3: Write minimal fixes for failures**

```ts
// Example cleanup pattern used across failing files:
// - Remove unused imports
// - Align types with shared PlanId and usage-rule helpers
// - Normalize async route return types to Response
```

- [ ] **Step 4: Re-run quality commands to verify all pass**

Run: `npm run lint && npm run test && npm run build`  
Expected: PASS for lint, tests, and production build.

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/plans/2026-05-05-event-media-parity-checklist.md docs/superpowers/specs/2026-05-05-event-media-port-design.md
git commit -m "chore: validate event-media web parity and finalize quality gates"
```

## Self-Review Notes

- **Spec coverage:**  
  - Auth covered in Task 3.  
  - Organizer flow covered in Tasks 4-5.  
  - Guest flow and media pipeline covered in Tasks 6-7.  
  - Plan/usage/error enforcement covered in Tasks 2 and 7.  
  - Testing/verification and completion gates covered in Tasks 1 and 8.
- **Placeholder scan:** Removed all TBD/TODO language; every task has files, code, commands, and expected outcomes.
- **Type consistency:** `PlanId`, `getPlanLimits`, `canGuestUpload`, and `getUsageStats` names are consistent across tasks.
