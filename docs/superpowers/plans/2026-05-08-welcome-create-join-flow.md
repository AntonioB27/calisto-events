# Welcome Create/Join Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users choose **Create** or **Join** from `/welcome`, support **unauthenticated event creation draft** persisted in localStorage until login/payment, and change **join** to validate code then ask “account or guest?” on the same page.

**Architecture:** Keep existing routes (`/welcome`, `/events/new`, `/join`, `/join/[accessCode]`) and add a small public API for join preview. Persist create wizard state in localStorage (`calisto_create_event_draft_v1`) and “resume” it after auth via `returnTo=/events/new?resume=1`. Gate the final create step when signed out by redirecting to auth while keeping the draft.

**Tech Stack:** Next.js App Router, React client components, Supabase (DB + Auth), Vitest.

---

## File map (new + modified)

**Modify**
- `app/welcome/page.tsx` — update buttons: Create / Join
- `app/(app)/events/new/page.tsx` — wire `resume` param + draft hydration into query defaults (name/date/plan)
- `app/(app)/events/new/_steps/Step1Details.tsx` — save draft on change/next
- `app/(app)/events/new/_steps/Step2Plan.tsx` — save draft on change/next
- `app/(app)/events/new/_steps/Step3Payment.tsx` — if no user, show “Log in / Create account” gating UI and route using `returnTo=/events/new?resume=1`
- `app/join/JoinCodeForm.tsx` — change flow: submit triggers preview fetch; if found, show account choice; only then navigate to `/auth/login?returnTo=/join/[code]` or `/join/[code]`

**Create**
- `lib/create-event-draft.ts` — draft type, read/write/clear helpers, query <-> draft mapping
- `app/api/join/preview/route.ts` — public preview lookup by access code
- `app/api/join/preview/route.test.ts` — unit test for route behavior (valid/invalid/not-found)
- `lib/create-event-draft.test.ts` — unit test draft helpers

---

### Task 1: Update `/welcome` actions (Create / Join)

**Files:**
- Modify: `app/welcome/page.tsx`

- [ ] **Step 1: Update button labels + hrefs**

Replace the three actions block with:

```tsx
<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
  <Link href="/events/new" className={appButtonClassNames({ variant: "primary", size: "lg" })}>
    Create an event
  </Link>
  <Link href="/join" className={appButtonClassNames({ variant: "outline", size: "lg" })}>
    Join an event
  </Link>
</div>
```

- [ ] **Step 2: Verify page still builds**

Run:

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add app/welcome/page.tsx
git commit -m "ui: update welcome to create/join actions"
```

---

### Task 2: Add local create-event draft helpers

**Files:**
- Create: `lib/create-event-draft.ts`
- Test: `lib/create-event-draft.test.ts`

- [ ] **Step 1: Write failing tests for draft helpers**

Create `lib/create-event-draft.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  CREATE_EVENT_DRAFT_KEY,
  type CreateEventDraft,
  decodeCreateEventDraft,
  encodeCreateEventDraft,
} from "./create-event-draft";

describe("create-event draft", () => {
  it("roundtrips via encode/decode", () => {
    const draft: CreateEventDraft = {
      v: 1,
      savedAt: "2026-05-08T12:00:00.000Z",
      step: "2",
      name: "My Event",
      date: "2026-05-08",
      planId: "plus",
    };
    const encoded = encodeCreateEventDraft(draft);
    const decoded = decodeCreateEventDraft(encoded);
    expect(decoded).toEqual(draft);
  });

  it("rejects invalid payloads", () => {
    expect(decodeCreateEventDraft("{not json")).toBeNull();
    expect(decodeCreateEventDraft(JSON.stringify({ v: 999 }))).toBeNull();
  });

  it("exports stable localStorage key", () => {
    expect(CREATE_EVENT_DRAFT_KEY).toMatch("calisto_create_event_draft_v1");
  });
});
```

- [ ] **Step 2: Run tests to confirm failure**

Run:

```bash
npm test
```

Expected: FAIL because `lib/create-event-draft.ts` doesn’t exist.

- [ ] **Step 3: Implement draft helpers**

Create `lib/create-event-draft.ts`:

```ts
import type { PlanId } from "./plan-limits";

export const CREATE_EVENT_DRAFT_KEY = "calisto_create_event_draft_v1";

export type CreateEventDraft = Readonly<{
  v: 1;
  savedAt: string;
  step: "1" | "2" | "3";
  name: string;
  date: string;
  planId: PlanId;
}>;

function isPlanId(value: unknown): value is PlanId {
  return (
    value === "free" ||
    value === "standard" ||
    value === "plus" ||
    value === "premium" ||
    value === "max"
  );
}

export function encodeCreateEventDraft(draft: CreateEventDraft): string {
  return JSON.stringify(draft);
}

export function decodeCreateEventDraft(raw: string): CreateEventDraft | null {
  try {
    const parsed = JSON.parse(raw) as Partial<CreateEventDraft>;
    if (parsed.v !== 1) return null;
    if (typeof parsed.savedAt !== "string") return null;
    if (parsed.step !== "1" && parsed.step !== "2" && parsed.step !== "3") return null;
    if (typeof parsed.name !== "string") return null;
    if (typeof parsed.date !== "string") return null;
    if (!isPlanId(parsed.planId)) return null;
    return parsed as CreateEventDraft;
  } catch {
    return null;
  }
}

export function readCreateEventDraftFromStorage(): CreateEventDraft | null {
  try {
    const raw = window.localStorage.getItem(CREATE_EVENT_DRAFT_KEY);
    if (!raw) return null;
    return decodeCreateEventDraft(raw);
  } catch {
    return null;
  }
}

export function writeCreateEventDraftToStorage(draft: Omit<CreateEventDraft, "savedAt" | "v">) {
  const full: CreateEventDraft = {
    v: 1,
    savedAt: new Date().toISOString(),
    ...draft,
  };
  try {
    window.localStorage.setItem(CREATE_EVENT_DRAFT_KEY, encodeCreateEventDraft(full));
  } catch {
    // ignore
  }
}

export function clearCreateEventDraftFromStorage() {
  try {
    window.localStorage.removeItem(CREATE_EVENT_DRAFT_KEY);
  } catch {
    // ignore
  }
}
```

- [ ] **Step 4: Run tests to confirm pass**

Run:

```bash
npm test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/create-event-draft.ts lib/create-event-draft.test.ts
git commit -m "feat: add local create-event draft helpers"
```

---

### Task 3: Persist draft during `/events/new` wizard steps

**Files:**
- Modify: `app/(app)/events/new/_steps/Step1Details.tsx`
- Modify: `app/(app)/events/new/_steps/Step2Plan.tsx`

- [ ] **Step 1: Add a small helper in each step to save draft**

In `Step1Details.tsx`, after computing the next URL (or in submit handler), call:

```ts
writeCreateEventDraftToStorage({ step: "1", name, date, planId: "free" });
```

Then when navigating to step 2, also write:

```ts
writeCreateEventDraftToStorage({ step: "2", name, date, planId: currentPlanId });
```

In `Step2Plan.tsx`, whenever plan changes and on “Continue”, call:

```ts
writeCreateEventDraftToStorage({ step: "2", name, date, planId: selectedPlanId });
```

Notes:
- Import from `lib/create-event-draft`.
- Keep writes best-effort (no thrown errors).

- [ ] **Step 2: Run tests**

Run:

```bash
npm test
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add app/(app)/events/new/_steps/Step1Details.tsx app/(app)/events/new/_steps/Step2Plan.tsx
git commit -m "feat: persist create wizard draft in localStorage"
```

---

### Task 4: Hydrate wizard query params from draft when `?resume=1`

**Files:**
- Modify: `app/(app)/events/new/page.tsx`

- [ ] **Step 1: Read `resume` param and apply draft defaults**

Because `page.tsx` is a server component, we can’t read localStorage here. Instead:
- Add a small **client wrapper** in a new file that runs on mount, checks `resume=1`, loads draft from localStorage, and if present, **replaces the URL** with draft-backed query params (`step`, `name`, `date`, `planId`) using `router.replace`.

Create:
- `app/(app)/events/new/ResumeDraftClient.tsx` (client component)

Example code:

```tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { readCreateEventDraftFromStorage } from "@/lib/create-event-draft";

export function ResumeDraftClient() {
  const router = useRouter();
  const sp = useSearchParams();
  useEffect(() => {
    if (sp.get("resume") !== "1") return;
    const draft = readCreateEventDraftFromStorage();
    if (!draft) return;
    const next = new URLSearchParams(sp);
    next.set("step", draft.step);
    next.set("name", draft.name);
    next.set("date", draft.date);
    next.set("planId", draft.planId);
    next.delete("resume");
    router.replace(`/events/new?${next.toString()}`);
  }, [router, sp]);
  return null;
}
```

Then in `app/(app)/events/new/page.tsx`, render it once near the top:

```tsx
import { ResumeDraftClient } from "./ResumeDraftClient";

export default async function NewEventPage(...) {
  ...
  return (
    <>
      <ResumeDraftClient />
      <div ...>...</div>
    </>
  );
}
```

- [ ] **Step 2: Run build**

Run:

```bash
npm run build
```

Expected: PASS (ensure no Server/Client boundary issues).

- [ ] **Step 3: Commit**

```bash
git add app/(app)/events/new/page.tsx app/(app)/events/new/ResumeDraftClient.tsx
git commit -m "feat: resume create wizard from local draft after auth"
```

---

### Task 5: Gate Step 3 when signed out (log in / register, keep draft)

**Files:**
- Modify: `app/(app)/events/new/_steps/Step3Payment.tsx`

- [ ] **Step 1: Add signed-out gating UI**

In `onConfirm`, it currently throws `"You must be signed in."`. Replace this pattern:
- Before attempting create, if no user:
  - Write draft (`step: "3"`, current fields)
  - Redirect to auth with `returnTo=/events/new?resume=1`

Implementation sketch:

```ts
const returnTo = "/events/new?resume=1";
// show card with buttons (no need to trigger onConfirm)
```

UI (inside render) for signed-out:
- A card with copy + two buttons:
  - `href={`/auth/login?returnTo=${encodeURIComponent(returnTo)}`}`
  - `href={`/auth/register?returnTo=${encodeURIComponent(returnTo)}`}`

Also ensure draft is saved before leaving this step:

```ts
writeCreateEventDraftToStorage({ step: "3", name, date, planId });
```

- [ ] **Step 2: After successful event creation, redirect to Share tab and clear draft**

Change:

```ts
router.push(`/events/${data.id}`);
```

to:

```ts
clearCreateEventDraftFromStorage();
router.push(`/events/${data.id}?tab=share`);
```

- [ ] **Step 3: Run tests and build**

Run:

```bash
npm test
npm run build
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add app/(app)/events/new/_steps/Step3Payment.tsx
git commit -m "feat: gate event creation behind auth and redirect to share"
```

---

### Task 6: Add join preview API (`GET /api/join/preview?code=...`)

**Files:**
- Create: `app/api/join/preview/route.ts`
- Test: `app/api/join/preview/route.test.ts`

- [ ] **Step 1: Write failing test**

Create `app/api/join/preview/route.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase-auth-server", () => ({
  createSupabaseAuthServerClient: vi.fn(async () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: null, error: null }),
        }),
      }),
    }),
  })),
}));

describe("/api/join/preview", () => {
  it("returns 404 for not found", async () => {
    const { GET } = await import("./route");
    const res = await GET(new Request("http://localhost/api/join/preview?code=CALISTO"));
    expect(res.status).toBe(404);
  });
});
```

- [ ] **Step 2: Implement route**

Create `app/api/join/preview/route.ts`:

```ts
import { NextResponse } from "next/server";

import { isAccessCodeValid, normalizeAccessCode } from "@/lib/access-code";
import { createSupabaseAuthServerClient } from "@/lib/supabase-auth-server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const raw = url.searchParams.get("code") ?? "";
  const code = normalizeAccessCode(raw);
  if (!isAccessCodeValid(code)) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const supabase = await createSupabaseAuthServerClient();
  const { data, error } = await supabase
    .from("events")
    .select("id, title, event_date, plan")
    .eq("access_code", code)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({
    title: data.title,
    eventDate: data.event_date,
    planId: data.plan,
  });
}
```

- [ ] **Step 3: Run tests**

```bash
npm test
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add app/api/join/preview/route.ts app/api/join/preview/route.test.ts
git commit -m "feat: add public join preview endpoint"
```

---

### Task 7: Change `/join` to “code → choice” on the same page

**Files:**
- Modify: `app/join/JoinCodeForm.tsx`

- [ ] **Step 1: Replace `router.push(/join/[code])` with preview fetch + state machine**

State to add:
- `stage: "enter" | "choice"`
- `preview: { title: string; eventDate?: string | null } | null`
- `normalizedCode: string`

Pseudo-implementation:

```ts
const [stage, setStage] = useState<"enter" | "choice">("enter");
const [preview, setPreview] = useState<{ title: string; eventDate?: string | null } | null>(null);
const [normalizedCode, setNormalizedCode] = useState<string>("");
```

On submit:

```ts
const normalized = normalizeAccessCode(code);
...
const res = await fetch(`/api/join/preview?code=${encodeURIComponent(normalized)}`);
if (!res.ok) { setError("That code didn’t match an event."); return; }
const body = await res.json();
setPreview({ title: body.title, eventDate: body.eventDate ?? null });
setNormalizedCode(normalized);
setStage("choice");
```

UI:
- When `stage === "choice"`:
  - Show event title (and date if present)
  - Two buttons:
    - “I have an account” → `router.push(/auth/login?returnTo=/join/[code])`
    - “Continue as guest” → `router.push(/join/[code])`
  - A “Change code” ghost button that resets stage to `"enter"`.

- [ ] **Step 2: Replace remote mascot image with local asset**

Replace the `<img src="https://www.calisto-events.com/...aurora_key.png">` with local:

```tsx
<img src="/brand/mascot/aurora_key.png" ... />
```

- [ ] **Step 3: Run tests and build**

```bash
npm test
npm run build
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add app/join/JoinCodeForm.tsx
git commit -m "feat: join flow asks account choice after code"
```

---

### Task 8: Manual verification checklist

**No code changes required.**

- [ ] **Create flow**:
  - Go to `/welcome` signed out
  - Click **Create an event**
  - Fill steps 1–2
  - On step 3, verify you see auth prompt (log in / register)
  - Log in, return to `/events/new?resume=1`, verify fields are restored
  - Complete “payment/create”, verify redirect to `/events/[id]?tab=share`

- [ ] **Join flow**:
  - Go to `/welcome` → **Join an event**
  - Enter valid code, verify event title appears + two choices
  - Choose “I have an account” and verify returnTo goes to `/join/[code]`
  - Choose “Continue as guest” and verify it proceeds to `/join/[code]`

---

## Plan self-review checklist (filled)
- Spec coverage: welcome buttons, create unauth draft/resume, join code→choice, redirect to share, public preview route
- Placeholder scan: none (“TBD/TODO/handle edge cases” removed; explicit steps/code provided)
- Type consistency: `PlanId` matches existing `plan-limits` usage; draft `step` matches existing `"1"|"2"|"3"` query param

