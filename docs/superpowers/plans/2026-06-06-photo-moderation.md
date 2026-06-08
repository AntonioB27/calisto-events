# Photo Moderation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add per-event photo moderation — organizers toggle a mode that holds guest uploads in a pending queue until approved, plus a "new since last visit" badge in open mode.

**Architecture:** A `moderation_status` column on `media_items` (`visible` | `pending` | `approved`) drives all visibility logic at the DB/RLS level. Two new columns on `events` (`moderation_enabled`, `organizer_gallery_reviewed_at`) control mode and the new-items cursor. A single moderation API route handles all organizer actions. The upload route sets the initial status based on the event's current mode.

**Tech Stack:** Next.js App Router, Supabase (Postgres + RLS + Storage), TypeScript, Vitest

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `supabase/migrations/20260606100000_photo_moderation.sql` | Create | DB schema + RLS update |
| `lib/app-ui/en.ts` | Modify | Add moderation copy strings |
| `lib/app-ui/hr.ts` | Modify | Croatian translations |
| `lib/app-ui/de.ts` | Modify | German translations |
| `app/api/events/[id]/guest-upload/route.ts` | Modify | Set moderation_status on insert |
| `app/api/events/[id]/guest-upload/route.test.ts` | Modify | Cover moderation_enabled cases |
| `app/api/events/[id]/moderation/route.ts` | Create | approve / discard / approve_all / toggle_mode / mark_reviewed |
| `app/api/events/[id]/moderation/route.test.ts` | Create | Unit tests for all actions |
| `app/(app)/events/[id]/page.tsx` | Modify | Fetch + pass moderationEnabled, reviewedAt |
| `app/(app)/events/[id]/_tabs/GalleryTab.tsx` | Modify | Accept + forward new props |
| `app/(app)/events/[id]/_tabs/GalleryManager.tsx` | Modify | Review panel, new-items badge, mark_reviewed on mount |
| `app/(app)/events/[id]/_tabs/SettingsTab.tsx` | Modify | Add moderation toggle section |
| `app/join/[accessCode]/_components/MediaGrid.tsx` | Modify | Show pending badge for own items |
| `lib/create-event-draft.ts` | Modify | Add moderationEnabled to draft type |
| `app/events/new/page.tsx` | Modify | Parse moderationEnabled from query |
| `app/events/new/_steps/Step1Details.tsx` | Modify | Add moderation toggle |
| `app/events/new/_steps/Step3Payment.tsx` | Modify | Include moderationEnabled in free-plan insert |

---

### Task 1: DB Migration

**Files:**
- Create: `supabase/migrations/20260606100000_photo_moderation.sql`

- [ ] **Step 1: Write the migration**

```sql
-- Add moderation columns to events
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS moderation_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS organizer_gallery_reviewed_at timestamptz;

-- Add moderation_status to media_items
ALTER TABLE public.media_items
  ADD COLUMN IF NOT EXISTS moderation_status text NOT NULL DEFAULT 'visible';

ALTER TABLE public.media_items
  ADD CONSTRAINT media_items_moderation_status_check
  CHECK (moderation_status IN ('visible', 'pending', 'approved'));

-- Replace the media_items SELECT policy to respect moderation_status.
-- Drop any existing member-select policy by common names (safe if not present).
DROP POLICY IF EXISTS media_items_select ON public.media_items;
DROP POLICY IF EXISTS media_items_select_member ON public.media_items;
DROP POLICY IF EXISTS media_items_select_event_member ON public.media_items;

-- Members see visible/approved + their own pending. Organizer sees everything.
CREATE POLICY media_items_select_with_moderation
ON public.media_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.event_memberships em
    WHERE em.event_id = media_items.event_id
      AND em.user_id = auth.uid()
  )
  AND (
    -- Organizer of this event always sees all
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = media_items.event_id
        AND e.organizer_id = auth.uid()
    )
    OR media_items.moderation_status IN ('visible', 'approved')
    OR media_items.uploaded_by = auth.uid()
  )
);
```

- [ ] **Step 2: Apply the migration**

Run: `npx supabase db push` (or `supabase migration up` if using local dev)

Verify with `npx supabase db diff` — should show no pending changes.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260606100000_photo_moderation.sql
git commit -m "feat: add moderation_status to media_items and moderation columns to events"
```

---

### Task 2: Add i18n strings

**Files:**
- Modify: `lib/app-ui/en.ts`
- Modify: `lib/app-ui/hr.ts`
- Modify: `lib/app-ui/de.ts`

- [ ] **Step 1: Add English strings to `en.ts`**

In `lib/app-ui/en.ts`, add these keys to the `gallery` object (after `columnsLabel`):

```typescript
    // Moderation
    moderationPanelTitle: "Pending approval",
    moderationPanelEmpty: "No pending uploads.",
    moderationApprove: "Approve",
    moderationDiscard: "Discard",
    moderationApproveAll: "Approve all",
    moderationApproveBusy: "…",
    moderationNewBadge: "{count} new",
    moderationPendingBadge: "Pending",
    moderationActionFail: "Could not complete action.",
```

And add a `moderation` section to `settingsTab` (after `scheduleSaveFail`):

```typescript
    moderationHeading: "Photo moderation",
    moderationHint:
      "When on, guest uploads are hidden until you approve them. You can change this at any time.",
    moderationOn: "Moderation on",
    moderationOff: "Moderation off",
    moderationSaveFail: "Could not update moderation setting.",
```

And add to `createStep1` (after `continuePlan`):

```typescript
    moderationToggleLabel: "Review photos before guests can see them",
    moderationToggleHint:
      "You can change this later in Settings.",
```

- [ ] **Step 2: Add Croatian strings to `hr.ts`**

Mirror the same keys in `lib/app-ui/hr.ts`:

In `gallery`:
```typescript
    moderationPanelTitle: "Čeka odobrenje",
    moderationPanelEmpty: "Nema uploada na čekanju.",
    moderationApprove: "Odobri",
    moderationDiscard: "Odbaci",
    moderationApproveAll: "Odobri sve",
    moderationApproveBusy: "…",
    moderationNewBadge: "{count} novo",
    moderationPendingBadge: "Na čekanju",
    moderationActionFail: "Radnja nije uspjela.",
```

In `settingsTab`:
```typescript
    moderationHeading: "Moderacija fotografija",
    moderationHint:
      "Kad je uključeno, uploadi gostiju su skriveni dok ih ne odobriš. Možeš promijeniti u bilo koje vrijeme.",
    moderationOn: "Moderacija uključena",
    moderationOff: "Moderacija isključena",
    moderationSaveFail: "Nije moguće promijeniti postavku moderacije.",
```

In `createStep1`:
```typescript
    moderationToggleLabel: "Pregledaj fotografije prije nego ih gosti vide",
    moderationToggleHint: "Možeš promijeniti kasnije u Postavkama.",
```

- [ ] **Step 3: Add German strings to `de.ts`**

Mirror the same keys in `lib/app-ui/de.ts`:

In `gallery`:
```typescript
    moderationPanelTitle: "Ausstehende Genehmigung",
    moderationPanelEmpty: "Keine ausstehenden Uploads.",
    moderationApprove: "Genehmigen",
    moderationDiscard: "Verwerfen",
    moderationApproveAll: "Alle genehmigen",
    moderationApproveBusy: "…",
    moderationNewBadge: "{count} neu",
    moderationPendingBadge: "Ausstehend",
    moderationActionFail: "Aktion konnte nicht abgeschlossen werden.",
```

In `settingsTab`:
```typescript
    moderationHeading: "Foto-Moderation",
    moderationHint:
      "Wenn aktiv, sind Gäste-Uploads verborgen, bis du sie genehmigst. Jederzeit änderbar.",
    moderationOn: "Moderation an",
    moderationOff: "Moderation aus",
    moderationSaveFail: "Moderationseinstellung konnte nicht gespeichert werden.",
```

In `createStep1`:
```typescript
    moderationToggleLabel: "Fotos prüfen, bevor Gäste sie sehen",
    moderationToggleHint: "Kann später in den Einstellungen geändert werden.",
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors (hr.ts and de.ts must satisfy the same `AppUiDict` type as en.ts)

- [ ] **Step 5: Commit**

```bash
git add lib/app-ui/en.ts lib/app-ui/hr.ts lib/app-ui/de.ts
git commit -m "feat: add moderation i18n strings (en/hr/de)"
```

---

### Task 3: Update guest-upload route to set moderation_status

**Files:**
- Modify: `app/api/events/[id]/guest-upload/route.ts`
- Modify: `app/api/events/[id]/guest-upload/route.test.ts`

- [ ] **Step 1: Write failing tests first**

Add these two test cases to `route.test.ts` inside `describe("guest-upload route", ...)`:

```typescript
it("inserts with moderation_status pending when event moderation is enabled", async () => {
  vi.useFakeTimers({ now: new Date("2026-06-06T12:00:00.000Z") });
  try {
    getEventUploadContextMock.mockResolvedValue({
      planId: "standard",
      eventDate: "2026-07-01T12:00:00.000Z",
      moderationEnabled: true,
    });
    countMediaForQuotaMock.mockResolvedValue(0);
    insertMediaItemMock.mockResolvedValue({ id: "m1", storage_path: "events/e1/f.jpg" });

    const file = new File(["x"], "photo.jpg", { type: "image/jpeg" });
    const form = new FormData();
    form.append("file", file);
    const req = new Request("http://localhost/api/events/e1/guest-upload", {
      method: "POST",
      body: form,
    });
    const res = await POST(req, { params: Promise.resolve({ id: "e1" }) });
    expect(res.status).toBe(201);
    expect(insertMediaItemMock).toHaveBeenCalledWith(
      expect.objectContaining({ moderationStatus: "pending" }),
    );
  } finally {
    vi.useRealTimers();
  }
});

it("inserts with moderation_status visible when event moderation is disabled", async () => {
  vi.useFakeTimers({ now: new Date("2026-06-06T12:00:00.000Z") });
  try {
    getEventUploadContextMock.mockResolvedValue({
      planId: "standard",
      eventDate: "2026-07-01T12:00:00.000Z",
      moderationEnabled: false,
    });
    countMediaForQuotaMock.mockResolvedValue(0);
    insertMediaItemMock.mockResolvedValue({ id: "m2", storage_path: "events/e1/g.jpg" });

    const file = new File(["x"], "photo.jpg", { type: "image/jpeg" });
    const form = new FormData();
    form.append("file", file);
    const req = new Request("http://localhost/api/events/e1/guest-upload", {
      method: "POST",
      body: form,
    });
    const res = await POST(req, { params: Promise.resolve({ id: "e1" }) });
    expect(res.status).toBe(201);
    expect(insertMediaItemMock).toHaveBeenCalledWith(
      expect.objectContaining({ moderationStatus: "visible" }),
    );
  } finally {
    vi.useRealTimers();
  }
});
```

- [ ] **Step 2: Run tests to confirm they fail**

Run: `npx vitest run app/api/events/\\[id\\]/guest-upload/route.test.ts`
Expected: FAIL — `moderationEnabled` not in context, `moderationStatus` not in insertMediaItem params.

- [ ] **Step 3: Update `EventUploadContext` type and `getEventUploadContext`**

In `app/api/events/[id]/guest-upload/route.ts`:

```typescript
// Change EventUploadContext type:
type EventUploadContext = {
  planId: PlanId;
  eventDate: string;
  moderationEnabled: boolean;
};

// Change getEventUploadContext select:
async function getEventUploadContext(eventId: string): Promise<EventUploadContext | null> {
  const db = getSupabaseServerClient();
  const { data, error } = await db
    .from("events")
    .select("id, plan, event_date, moderation_enabled")
    .eq("id", eventId)
    .maybeSingle();

  if (error || !data || typeof data.plan !== "string" || typeof data.event_date !== "string" || !data.event_date) {
    return null;
  }

  const planId = data.plan;
  if (
    planId !== "free" &&
    planId !== "standard" &&
    planId !== "plus" &&
    planId !== "premium" &&
    planId !== "max"
  ) {
    return null;
  }

  return {
    planId,
    eventDate: data.event_date,
    moderationEnabled: Boolean((data as { moderation_enabled?: unknown }).moderation_enabled),
  };
}
```

- [ ] **Step 4: Update `insertMediaItem` to accept `moderationStatus`**

```typescript
async function insertMediaItem(params: {
  eventId: string;
  uploaderId: string;
  filePath: string;
  mimeType: string;
  sizeBytes: number;
  thumbnailPath: string | null;
  moderationStatus: "visible" | "pending";
}) {
  const db = getSupabaseServerClient();
  const { data, error } = await db
    .from("media_items")
    .insert({
      event_id: params.eventId,
      uploaded_by: params.uploaderId,
      storage_path: params.filePath,
      mime_type: params.mimeType,
      size_bytes: params.sizeBytes,
      thumbnail_path: params.thumbnailPath,
      moderation_status: params.moderationStatus,
    })
    .select("id, storage_path")
    .single();

  if (error) {
    throw error;
  }
  return data as { id: string; storage_path: string };
}
```

- [ ] **Step 5: Update the POST handler to pass `moderationStatus`**

In the POST handler, change the `insertMediaItem` call (step 7):

```typescript
  // 7) Insert media row
  // Organizer uploads always land as visible regardless of moderation mode.
  const isOrganizer = user.id === eventContext.organizerId;
  const moderationStatus: "visible" | "pending" =
    eventContext.moderationEnabled && !isOrganizer ? "pending" : "visible";

  try {
    const inserted = await __test.insertMediaItem({
      eventId,
      uploaderId: user.id,
      filePath,
      mimeType: file.type,
      sizeBytes: file.size,
      thumbnailPath,
      moderationStatus,
    });
    return NextResponse.json({ id: inserted.id, file_path: inserted.storage_path }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save upload." }, { status: 500 });
  }
```

Also add `organizerId` to `EventUploadContext` so the route can compare. Update `getEventUploadContext` to also select `organizer_id` and return it:

```typescript
type EventUploadContext = {
  planId: PlanId;
  eventDate: string;
  moderationEnabled: boolean;
  organizerId: string;
};

// In getEventUploadContext, add organizer_id to select and return:
return {
  planId,
  eventDate: data.event_date,
  moderationEnabled: Boolean((data as { moderation_enabled?: unknown }).moderation_enabled),
  organizerId: typeof (data as { organizer_id?: unknown }).organizer_id === "string"
    ? (data as { organizer_id: string }).organizer_id
    : "",
};
```

Update the mock type in `route.test.ts` to include `moderationEnabled` and `organizerId`:

```typescript
const getEventUploadContextMock = vi.fn<
  (eventId: string) => Promise<{ planId: "free" | "standard" | "plus" | "premium" | "max"; eventDate: string; moderationEnabled: boolean; organizerId: string } | null>
>();
```

And update the `insertMediaItemMock` type to include `moderationStatus`:

```typescript
const insertMediaItemMock = vi.fn<
  (params: {
    eventId: string;
    uploaderId: string;
    filePath: string;
    mimeType: string;
    sizeBytes: number;
    thumbnailPath: string | null;
    moderationStatus: "visible" | "pending";
  }) => Promise<{ id: string; storage_path: string }>
>();
```

Update all existing mock setups in `beforeEach` and existing tests that call `getEventUploadContextMock.mockResolvedValue(...)` to include the new fields:

```typescript
// In each existing test's getEventUploadContextMock.mockResolvedValue:
{ planId: "...", eventDate: "...", moderationEnabled: false, organizerId: "org_1" }
```

- [ ] **Step 6: Run tests to confirm they pass**

Run: `npx vitest run app/api/events/\\[id\\]/guest-upload/route.test.ts`
Expected: all PASS

- [ ] **Step 7: Commit**

```bash
git add app/api/events/\[id\]/guest-upload/route.ts app/api/events/\[id\]/guest-upload/route.test.ts
git commit -m "feat: set moderation_status on guest upload based on event moderation mode"
```

---

### Task 4: Create moderation API route

**Files:**
- Create: `app/api/events/[id]/moderation/route.ts`
- Create: `app/api/events/[id]/moderation/route.test.ts`

- [ ] **Step 1: Write failing tests**

Create `app/api/events/[id]/moderation/route.test.ts`:

```typescript
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

vi.mock("@/lib/supabase-auth-server", () => ({
  getSupabaseAuthServerClient: () => ({
    auth: {
      getUser: async () => ({
        data: { user: { id: "organizer_1" } },
      }),
    },
  }),
}));

vi.mock("@/lib/supabase-server", () => ({
  getSupabaseServerClient: () => ({}),
}));

const checkOrganizerMock = vi.fn<
  (eventId: string, userId: string) => Promise<boolean>
>();
const approveItemMock = vi.fn<(eventId: string, mediaItemId: string) => Promise<void>>();
const discardItemMock = vi.fn<
  (eventId: string, mediaItemId: string) => Promise<{ storagePaths: string[] }>
>();
const deleteStorageMock = vi.fn<(paths: string[]) => Promise<void>>();
const approveAllMock = vi.fn<(eventId: string) => Promise<void>>();
const toggleModeMock = vi.fn<(eventId: string, enabled: boolean) => Promise<void>>();
const markReviewedMock = vi.fn<(eventId: string) => Promise<void>>();

beforeEach(() => {
  checkOrganizerMock.mockReset();
  approveItemMock.mockReset();
  discardItemMock.mockReset();
  deleteStorageMock.mockReset();
  approveAllMock.mockReset();
  toggleModeMock.mockReset();
  markReviewedMock.mockReset();

  // Default: is organizer
  checkOrganizerMock.mockResolvedValue(true);

  const { __test } = require("./route") as typeof import("./route");
  __test.checkOrganizer = checkOrganizerMock;
  __test.approveItem = approveItemMock;
  __test.discardItem = discardItemMock;
  __test.deleteStorage = deleteStorageMock;
  __test.approveAll = approveAllMock;
  __test.toggleMode = toggleModeMock;
  __test.markReviewed = markReviewedMock;
});

function makeRequest(body: unknown, eventId = "e1") {
  return new Request(`http://localhost/api/events/${eventId}/moderation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("moderation route", () => {
  it("returns 403 when caller is not the organizer", async () => {
    checkOrganizerMock.mockResolvedValue(false);
    const res = await POST(makeRequest({ action: "mark_reviewed" }), {
      params: Promise.resolve({ id: "e1" }),
    });
    expect(res.status).toBe(403);
  });

  it("approves a single item", async () => {
    approveItemMock.mockResolvedValue(undefined);
    const res = await POST(
      makeRequest({ action: "approve", mediaItemId: "m1" }),
      { params: Promise.resolve({ id: "e1" }) },
    );
    expect(res.status).toBe(200);
    expect(approveItemMock).toHaveBeenCalledWith("e1", "m1");
  });

  it("discards a single item and deletes storage", async () => {
    discardItemMock.mockResolvedValue({ storagePaths: ["events/e1/f.jpg"] });
    deleteStorageMock.mockResolvedValue(undefined);
    const res = await POST(
      makeRequest({ action: "discard", mediaItemId: "m2" }),
      { params: Promise.resolve({ id: "e1" }) },
    );
    expect(res.status).toBe(200);
    expect(discardItemMock).toHaveBeenCalledWith("e1", "m2");
    expect(deleteStorageMock).toHaveBeenCalledWith(["events/e1/f.jpg"]);
  });

  it("approves all pending items", async () => {
    approveAllMock.mockResolvedValue(undefined);
    const res = await POST(
      makeRequest({ action: "approve_all" }),
      { params: Promise.resolve({ id: "e1" }) },
    );
    expect(res.status).toBe(200);
    expect(approveAllMock).toHaveBeenCalledWith("e1");
  });

  it("toggles moderation mode", async () => {
    toggleModeMock.mockResolvedValue(undefined);
    const res = await POST(
      makeRequest({ action: "toggle_mode", enabled: true }),
      { params: Promise.resolve({ id: "e1" }) },
    );
    expect(res.status).toBe(200);
    expect(toggleModeMock).toHaveBeenCalledWith("e1", true);
  });

  it("marks gallery as reviewed", async () => {
    markReviewedMock.mockResolvedValue(undefined);
    const res = await POST(
      makeRequest({ action: "mark_reviewed" }),
      { params: Promise.resolve({ id: "e1" }) },
    );
    expect(res.status).toBe(200);
    expect(markReviewedMock).toHaveBeenCalledWith("e1");
  });

  it("returns 400 for unknown action", async () => {
    const res = await POST(
      makeRequest({ action: "unknown" }),
      { params: Promise.resolve({ id: "e1" }) },
    );
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

Run: `npx vitest run app/api/events/\\[id\\]/moderation/route.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the route**

Create `app/api/events/[id]/moderation/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { getSupabaseAuthServerClient } from "@/lib/supabase-auth-server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type ModerationBody =
  | { action: "approve"; mediaItemId: string }
  | { action: "discard"; mediaItemId: string }
  | { action: "approve_all" }
  | { action: "toggle_mode"; enabled: boolean }
  | { action: "mark_reviewed" };

async function checkOrganizer(eventId: string, userId: string): Promise<boolean> {
  const db = getSupabaseServerClient();
  const { data } = await db
    .from("events")
    .select("organizer_id")
    .eq("id", eventId)
    .maybeSingle();
  return Boolean(data && (data as { organizer_id?: unknown }).organizer_id === userId);
}

async function approveItem(eventId: string, mediaItemId: string): Promise<void> {
  const db = getSupabaseServerClient();
  const { error } = await db
    .from("media_items")
    .update({ moderation_status: "approved" })
    .eq("id", mediaItemId)
    .eq("event_id", eventId)
    .eq("moderation_status", "pending");
  if (error) throw error;
}

async function discardItem(
  eventId: string,
  mediaItemId: string,
): Promise<{ storagePaths: string[] }> {
  const db = getSupabaseServerClient();
  const { data, error } = await db
    .from("media_items")
    .delete()
    .eq("id", mediaItemId)
    .eq("event_id", eventId)
    .select("storage_path, thumbnail_path");
  if (error) throw error;
  const rows = (data ?? []) as Array<{ storage_path: string; thumbnail_path: string | null }>;
  const storagePaths = rows
    .flatMap((r) => [r.storage_path, r.thumbnail_path])
    .filter((p): p is string => Boolean(p));
  return { storagePaths };
}

async function deleteStorage(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const db = getSupabaseServerClient();
  const { error } = await db.storage.from("event-media").remove(paths);
  if (error) throw error;
}

async function approveAll(eventId: string): Promise<void> {
  const db = getSupabaseServerClient();
  const { error } = await db
    .from("media_items")
    .update({ moderation_status: "approved" })
    .eq("event_id", eventId)
    .eq("moderation_status", "pending");
  if (error) throw error;
}

async function toggleMode(eventId: string, enabled: boolean): Promise<void> {
  const db = getSupabaseServerClient();
  // When turning OFF: bulk-approve all pending items first.
  if (!enabled) {
    const { error: bulkErr } = await db
      .from("media_items")
      .update({ moderation_status: "visible" })
      .eq("event_id", eventId)
      .eq("moderation_status", "pending");
    if (bulkErr) throw bulkErr;
  }
  const { error } = await db
    .from("events")
    .update({ moderation_enabled: enabled })
    .eq("id", eventId);
  if (error) throw error;
}

async function markReviewed(eventId: string): Promise<void> {
  const db = getSupabaseServerClient();
  const { error } = await db
    .from("events")
    .update({ organizer_gallery_reviewed_at: new Date().toISOString() })
    .eq("id", eventId);
  if (error) throw error;
}

// Test seams
export const __test = {
  checkOrganizer,
  approveItem,
  discardItem,
  deleteStorage,
  approveAll,
  toggleMode,
  markReviewed,
};

export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: eventId } = await ctx.params;

  const authClient = getSupabaseAuthServerClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const isOrganizer = await __test.checkOrganizer(eventId, user.id);
  if (!isOrganizer) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  let body: ModerationBody;
  try {
    body = (await request.json()) as ModerationBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  try {
    if (body.action === "approve") {
      await __test.approveItem(eventId, body.mediaItemId);
      return NextResponse.json({ ok: true });
    }
    if (body.action === "discard") {
      const { storagePaths } = await __test.discardItem(eventId, body.mediaItemId);
      await __test.deleteStorage(storagePaths);
      return NextResponse.json({ ok: true });
    }
    if (body.action === "approve_all") {
      await __test.approveAll(eventId);
      return NextResponse.json({ ok: true });
    }
    if (body.action === "toggle_mode") {
      await __test.toggleMode(eventId, body.enabled);
      return NextResponse.json({ ok: true });
    }
    if (body.action === "mark_reviewed") {
      await __test.markReviewed(eventId);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Action failed." }, { status: 500 });
  }
}
```

- [ ] **Step 4: Run tests to confirm they pass**

Run: `npx vitest run app/api/events/\\[id\\]/moderation/route.test.ts`
Expected: all PASS

- [ ] **Step 5: Commit**

```bash
git add app/api/events/\[id\]/moderation/route.ts app/api/events/\[id\]/moderation/route.test.ts
git commit -m "feat: add moderation API route (approve/discard/approve_all/toggle_mode/mark_reviewed)"
```

---

### Task 5: Thread moderation props through event page

**Files:**
- Modify: `app/(app)/events/[id]/page.tsx`
- Modify: `app/(app)/events/[id]/_tabs/GalleryTab.tsx`

- [ ] **Step 1: Fetch moderation columns in `page.tsx`**

In `page.tsx`, after the `bannerTheme` fetch block (around line 104), add:

```typescript
  // Fetch moderation columns — safe before migration is applied
  let moderationEnabled = false;
  let organizerGalleryReviewedAt: string | null = null;
  if (event && isPrimaryOrganizer) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: modRow } = await (supabase as any)
        .from("events")
        .select("moderation_enabled, organizer_gallery_reviewed_at")
        .eq("id", id)
        .maybeSingle();
      if (modRow) {
        moderationEnabled = Boolean((modRow as Record<string, unknown>).moderation_enabled);
        const rat = (modRow as Record<string, unknown>).organizer_gallery_reviewed_at;
        organizerGalleryReviewedAt = typeof rat === "string" ? rat : null;
      }
    } catch {
      // column not yet added — use defaults
    }
  }
```

- [ ] **Step 2: Pass props to GalleryTab and SettingsTab**

In `page.tsx`, update the `GalleryTab` render:

```typescript
{selectedTab === "gallery" && (
  <GalleryTab
    eventId={id}
    isPrimaryOrganizer={isPrimaryOrganizer}
    moderationEnabled={moderationEnabled}
    organizerGalleryReviewedAt={organizerGalleryReviewedAt}
  />
)}
```

Update the `SettingsTab` render to pass `moderationEnabled`:

```typescript
{selectedTab === "settings" && isPrimaryOrganizer && (
  <SettingsTab
    eventId={id}
    storedEmoji={storedEmoji}
    storedName={eventName}
    fullStoredTitle={String(event.title ?? "")}
    eventDate={event.event_date}
    plan={event.plan}
    accessCode={event.access_code}
    bannerTheme={bannerTheme}
    moderationEnabled={moderationEnabled}
  />
)}
```

- [ ] **Step 3: Update `GalleryTab` to accept and forward new props**

Replace `app/(app)/events/[id]/_tabs/GalleryTab.tsx` with:

```typescript
import { GalleryManager } from "./GalleryManager";

type GalleryTabProps = Readonly<{
  eventId: string;
  isPrimaryOrganizer: boolean;
  moderationEnabled: boolean;
  organizerGalleryReviewedAt: string | null;
}>;

export async function GalleryTab({
  eventId,
  isPrimaryOrganizer,
  moderationEnabled,
  organizerGalleryReviewedAt,
}: GalleryTabProps) {
  return (
    <GalleryManager
      eventId={eventId}
      isPrimaryOrganizer={isPrimaryOrganizer}
      moderationEnabled={moderationEnabled}
      organizerGalleryReviewedAt={organizerGalleryReviewedAt}
    />
  );
}
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors (GalleryManager doesn't accept these props yet — errors are expected here until Task 6)

- [ ] **Step 5: Commit**

```bash
git add app/\(app\)/events/\[id\]/page.tsx app/\(app\)/events/\[id\]/_tabs/GalleryTab.tsx
git commit -m "feat: thread moderationEnabled and reviewedAt through event page"
```

---

### Task 6: Update GalleryManager (review panel + new-items badge)

**Files:**
- Modify: `app/(app)/events/[id]/_tabs/GalleryManager.tsx`

- [ ] **Step 1: Add new props and state to `GalleryManager`**

Change the component signature:

```typescript
export function GalleryManager({
  eventId,
  isPrimaryOrganizer,
  moderationEnabled,
  organizerGalleryReviewedAt,
}: Readonly<{
  eventId: string;
  isPrimaryOrganizer: boolean;
  moderationEnabled: boolean;
  organizerGalleryReviewedAt: string | null;
}>) {
```

Add new state variables (after the existing `useState` declarations):

```typescript
  const [pendingItems, setPendingItems] = useState<MediaItem[]>([]);
  const [moderationBusy, setModerationBusy] = useState<string | null>(null);
  const [moderationError, setModerationError] = useState<string | null>(null);
  const [newCount, setNewCount] = useState(0);
```

- [ ] **Step 2: Add `moderation_status` to `MediaRow`**

Update the `MediaRow` type at the top of the file:

```typescript
type MediaRow = {
  id: string;
  storage_path: string;
  thumbnail_path: string | null;
  mime_type: string | null;
  created_at: string;
  uploaded_by: string;
  moderation_status: string;
};
```

Update the `select` query in `fetchPage` to include `moderation_status`:

```typescript
supabase
  .from("media_items")
  .select("id, storage_path, thumbnail_path, mime_type, created_at, uploaded_by, moderation_status")
  .eq("event_id", eventId)
  .order("created_at", { ascending: false })
  .range(from, to),
```

After building `mapped` in `fetchPage`, add:

```typescript
      if (isPrimaryOrganizer) {
        // Compute new-since-last-visit count
        const reviewedAt = organizerGalleryReviewedAt ? new Date(organizerGalleryReviewedAt).getTime() : 0;
        const newItems = mapped.filter((m) => new Date(m.created_at).getTime() > reviewedAt);
        if (replace) setNewCount(newItems.length);
      }

      if (isPrimaryOrganizer && moderationEnabled) {
        // Separate pending items for the review panel
        const pending = mapped.filter((m) => m.moderation_status === "pending");
        if (replace) setPendingItems(pending);
        else setPendingItems((prev) => [...prev, ...pending]);
      }
```

- [ ] **Step 3: Add `mark_reviewed` call on mount**

Add a new `useEffect` after the existing zip-export polling effect:

```typescript
  useEffect(() => {
    if (!isPrimaryOrganizer) return;
    // Fire-and-forget: update the organizer's last-reviewed timestamp.
    void fetch(`/api/events/${eventId}/moderation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_reviewed" }),
    }).catch(() => {
      // Non-critical — ignore failures silently.
    });
  }, [eventId, isPrimaryOrganizer]);
```

- [ ] **Step 4: Add moderation action handlers**

Add these functions before the `return` statement:

```typescript
  async function handleApproveItem(item: MediaItem) {
    setModerationBusy(item.id);
    setModerationError(null);
    try {
      const res = await fetch(`/api/events/${eventId}/moderation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve", mediaItemId: item.id }),
      });
      if (!res.ok) throw new Error();
      setPendingItems((prev) => prev.filter((p) => p.id !== item.id));
      // Refresh gallery so approved item appears in main grid.
      setPage(0);
      void fetchPage(0, true);
    } catch {
      setModerationError(ui.gallery.moderationActionFail);
    } finally {
      setModerationBusy(null);
    }
  }

  async function handleDiscardItem(item: MediaItem) {
    setModerationBusy(item.id);
    setModerationError(null);
    try {
      const res = await fetch(`/api/events/${eventId}/moderation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "discard", mediaItemId: item.id }),
      });
      if (!res.ok) throw new Error();
      setPendingItems((prev) => prev.filter((p) => p.id !== item.id));
    } catch {
      setModerationError(ui.gallery.moderationActionFail);
    } finally {
      setModerationBusy(null);
    }
  }

  async function handleApproveAll() {
    setModerationBusy("__all__");
    setModerationError(null);
    try {
      const res = await fetch(`/api/events/${eventId}/moderation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve_all" }),
      });
      if (!res.ok) throw new Error();
      setPendingItems([]);
      setPage(0);
      void fetchPage(0, true);
    } catch {
      setModerationError(ui.gallery.moderationActionFail);
    } finally {
      setModerationBusy(null);
    }
  }
```

- [ ] **Step 5: Add the review panel to the JSX**

Insert the following block inside the `<section>` return, just before the upload section (`{/* ── UPLOAD SECTION — Polaroid style ── */}`):

```tsx
      {/* ── MODERATION PANEL ── (organizer only, when moderation_enabled) */}
      {isPrimaryOrganizer && moderationEnabled ? (
        <div
          style={{
            marginBottom: 24,
            borderRadius: 14,
            border: "1.5px solid color-mix(in srgb, var(--app-gold) 35%, var(--app-border))",
            background: "color-mix(in srgb, var(--app-gold) 6%, var(--app-surface))",
            padding: "16px 16px 14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--app-gold)",
              }}
            >
              {ui.gallery.moderationPanelTitle}
              {pendingItems.length > 0 ? ` (${pendingItems.length})` : ""}
            </span>
            {pendingItems.length > 0 ? (
              <AppBtn
                type="button"
                variant="gold"
                size="sm"
                disabled={moderationBusy !== null}
                loading={moderationBusy === "__all__"}
                onClick={() => void handleApproveAll()}
              >
                {ui.gallery.moderationApproveAll}
              </AppBtn>
            ) : null}
          </div>

          {moderationError ? (
            <p style={{ margin: "0 0 10px", fontSize: 12, color: "var(--app-danger)" }}>{moderationError}</p>
          ) : null}

          {pendingItems.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: "var(--app-muted)" }}>{ui.gallery.moderationPanelEmpty}</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {pendingItems.map((item) => {
                const busy = moderationBusy === item.id;
                return (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 10px",
                      borderRadius: 10,
                      background: "var(--app-surface)",
                      border: "1px solid var(--app-border)",
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 6,
                        overflow: "hidden",
                        flexShrink: 0,
                        background: "var(--app-surface-2)",
                      }}
                    >
                      {item.thumbnailUrl ?? item.signedUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.thumbnailUrl ?? item.signedUrl}
                          alt=""
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : null}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 12, color: "var(--app-muted)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.uploaderLabel}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <AppBtn
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={moderationBusy !== null}
                        loading={busy}
                        onClick={() => void handleDiscardItem(item)}
                      >
                        {ui.gallery.moderationDiscard}
                      </AppBtn>
                      <AppBtn
                        type="button"
                        variant="gold"
                        size="sm"
                        disabled={moderationBusy !== null}
                        loading={busy}
                        onClick={() => void handleApproveItem(item)}
                      >
                        {busy ? ui.gallery.moderationApproveBusy : ui.gallery.moderationApprove}
                      </AppBtn>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : null}

      {/* ── NEW SINCE LAST VISIT badge (open mode) ── */}
      {isPrimaryOrganizer && !moderationEnabled && newCount > 0 ? (
        <div
          style={{
            marginBottom: 16,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 12px",
            borderRadius: 999,
            background: "color-mix(in srgb, var(--app-gold) 18%, var(--app-surface))",
            border: "1px solid color-mix(in srgb, var(--app-gold) 40%, var(--app-border))",
            fontSize: 11,
            fontWeight: 700,
            color: "var(--app-gold)",
            letterSpacing: "0.08em",
          }}
        >
          {interpolate(ui.gallery.moderationNewBadge, { count: newCount })}
        </div>
      ) : null}
```

- [ ] **Step 6: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 7: Commit**

```bash
git add app/\(app\)/events/\[id\]/_tabs/GalleryManager.tsx
git commit -m "feat: add moderation review panel and new-since-last-visit badge to GalleryManager"
```

---

### Task 7: Update MediaGrid (guest pending badge)

**Files:**
- Modify: `app/join/[accessCode]/_components/MediaGrid.tsx`

- [ ] **Step 1: Add `moderation_status` to `MediaRow` and `MediaItem` types**

In `MediaGrid.tsx`, update both types:

```typescript
type MediaItem = {
  id: string;
  storage_path: string;
  mime_type: string | null;
  uploaded_by: string;
  signedUrl: string | undefined;
  thumbnailUrl: string | undefined;
  uploaderLabel: string;
  moderation_status: string;
};

type MediaRow = {
  id: string;
  storage_path: string;
  thumbnail_path: string | null;
  mime_type: string | null;
  uploaded_by: string;
  moderation_status: string;
};
```

- [ ] **Step 2: Update the `select` query in `fetchPage`**

```typescript
const { data: rows, error: fetchErr } = await supabase
  .from("media_items")
  .select("id, storage_path, thumbnail_path, mime_type, uploaded_by, moderation_status")
  .eq("event_id", eventId)
  .order("created_at", { ascending: false })
  .range(from, to);
```

- [ ] **Step 3: Carry `moderation_status` through the mapping**

In the `mapped` array construction:

```typescript
const mapped: MediaItem[] = typedRows.map((r) => ({
  id: r.id,
  storage_path: r.storage_path,
  mime_type: r.mime_type,
  uploaded_by: r.uploaded_by,
  moderation_status: r.moderation_status,
  signedUrl: urlMap[r.storage_path],
  thumbnailUrl: r.thumbnail_path ? urlMap[r.thumbnail_path] : undefined,
  uploaderLabel:
    labelMap.get(r.uploaded_by) ??
    (r.uploaded_by === organizerUserId
      ? ui.guests.organizerLabelFallback
      : ui.guests.guestLabelFallback),
}));
```

- [ ] **Step 4: Add pending badge overlay to `renderOverlay`**

In `renderOverlay`, add the badge after the existing `<>` opener:

```tsx
const renderOverlay = (item: MediaItem) => {
  const isVideo = isVideoMime(item.mime_type);
  const isPending = item.moderation_status === "pending";
  return (
    <>
      {isPending ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "inherit",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              padding: "3px 9px",
              borderRadius: 999,
              background: "rgba(197,146,42,0.22)",
              border: "1px solid rgba(197,146,42,0.5)",
              fontSize: 9,
              fontWeight: 700,
              color: "var(--app-gold)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            {ui.gallery.moderationPendingBadge}
          </span>
        </div>
      ) : null}
      <div style={{ position: "absolute", inset: "auto 0 0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4, padding: "30px 8px 8px", background: "linear-gradient(transparent, rgba(0,0,0,0.7))", pointerEvents: "none" }}>
        <MediaUploaderChip label={item.uploaderLabel} isMine={Boolean(userId && item.uploaded_by === userId)} mineAria={ui.gallery.uploadedByYouAria} />
      </div>
      {!isVideo ? (
        <div style={{ position: "absolute", top: 6, right: 6, zIndex: 1 }}>
          <MediaLikeBadge
            liked={likedByMe.has(item.id)}
            count={likeCounts.get(item.id) ?? 0}
            pending={pendingLikeId === item.id}
            likeAria={ui.likes.heartLikeAria}
            unlikeAria={ui.likes.heartUnlikeAria}
            onToggle={(e) => { e.stopPropagation(); void handleToggleLikeForItem(item.id, item.uploaded_by); }}
          />
        </div>
      ) : null}
    </>
  );
};
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add app/join/\[accessCode\]/_components/MediaGrid.tsx
git commit -m "feat: show pending approval badge on guest's own unreviewed uploads"
```

---

### Task 8: Add moderation toggle to SettingsTab

**Files:**
- Modify: `app/(app)/events/[id]/_tabs/SettingsTab.tsx`

- [ ] **Step 1: Add `moderationEnabled` prop and state**

Update `SettingsTabProps`:

```typescript
type SettingsTabProps = Readonly<{
  eventId: string;
  storedEmoji: string;
  storedName: string;
  fullStoredTitle: string;
  eventDate: string;
  plan: string;
  accessCode: string;
  bannerTheme?: string;
  moderationEnabled: boolean;
}>;
```

Add to the function signature destructuring:

```typescript
export function SettingsTab({
  eventId,
  storedEmoji,
  storedName,
  fullStoredTitle,
  eventDate,
  plan,
  accessCode,
  bannerTheme,
  moderationEnabled: initialModerationEnabled,
}: SettingsTabProps) {
```

Add state:

```typescript
  const [modEnabled, setModEnabled] = useState(initialModerationEnabled);
  const [modSaving, setModSaving] = useState(false);
  const [modError, setModError] = useState<string | null>(null);
```

- [ ] **Step 2: Add `saveModeration` handler**

```typescript
  async function saveModeration(next: boolean) {
    setModSaving(true);
    setModError(null);
    try {
      const res = await fetch(`/api/events/${eventId}/moderation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_mode", enabled: next }),
      });
      if (!res.ok) throw new Error();
      setModEnabled(next);
      router.refresh();
    } catch {
      setModError(ui.settingsTab.moderationSaveFail);
    } finally {
      setModSaving(false);
    }
  }
```

- [ ] **Step 3: Add moderation section to the JSX**

Add a new section between `/* ── 02 Banner style ── */` and `/* ── 03 Schedule ── */`. Renumber the section marks: Banner stays 02, new Moderation becomes 03, Schedule becomes 04, Danger zone becomes 05.

Insert this block:

```tsx
        {/* ── 03 Moderation ─────────────────────────── */}
        <div>
          <SectionMark n="03" label={ui.settingsTab.moderationHeading} />
          <div style={{ ...glass, borderRadius: 18, padding: '20px 18px 22px' }}>
            <p style={{ margin: '0 0 16px', fontFamily: FS, fontStyle: 'italic', fontSize: 13, color: MUTED, lineHeight: 1.55 }}>
              {ui.settingsTab.moderationHint}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <AppBtn
                type="button"
                variant={modEnabled ? 'gold' : 'outline'}
                size="sm"
                disabled={modSaving || modEnabled}
                loading={modSaving && !modEnabled}
                onClick={() => void saveModeration(true)}
              >
                {ui.settingsTab.moderationOn}
              </AppBtn>
              <AppBtn
                type="button"
                variant={!modEnabled ? 'gold' : 'outline'}
                size="sm"
                disabled={modSaving || !modEnabled}
                loading={modSaving && modEnabled}
                onClick={() => void saveModeration(false)}
              >
                {ui.settingsTab.moderationOff}
              </AppBtn>
            </div>
            {modError ? (
              <p style={{ margin: '10px 0 0', fontSize: 12, color: 'var(--app-danger)' }}>{modError}</p>
            ) : null}
          </div>
        </div>
```

Also update the existing section marks: change `n="03"` on Schedule to `n="04"`, and `n="04"` on Danger zone to `n="05"`.

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add app/\(app\)/events/\[id\]/_tabs/SettingsTab.tsx
git commit -m "feat: add moderation toggle to event settings tab"
```

---

### Task 9: Add moderation toggle to event creation wizard

**Files:**
- Modify: `lib/create-event-draft.ts`
- Modify: `app/events/new/page.tsx`
- Modify: `app/events/new/_steps/Step1Details.tsx`
- Modify: `app/events/new/_steps/Step3Payment.tsx`

- [ ] **Step 1: Add `moderationEnabled` to `CreateEventDraft`**

In `lib/create-event-draft.ts`, update the type and validation:

```typescript
export type CreateEventDraft = Readonly<{
  v: 1;
  savedAt: string;
  step: "1" | "2" | "3";
  name: string;
  emoji?: string;
  date: string;
  planId: PlanId;
  moderationEnabled?: boolean;
}>;
```

In `decodeCreateEventDraft`, add:

```typescript
    if (parsed.moderationEnabled != null && typeof parsed.moderationEnabled !== "boolean") return null;
```

- [ ] **Step 2: Update `parseCreateEventQuery` in `page.tsx`**

In `app/events/new/page.tsx`, update `parseCreateEventQuery` return type and body:

```typescript
export function parseCreateEventQuery(params: CreateEventQueryParams): {
  step: string;
  name: string;
  emoji: string;
  date: string;
  planId: PlanId;
  moderationEnabled: boolean;
} {
  const step = pickQueryValue(params.step) ?? "1";
  const name = pickQueryValue(params.name) ?? "";
  const emoji = pickQueryValue(params.emoji) ?? "";
  const date = pickQueryValue(params.date) ?? DEFAULT_DATE;
  const planIdCandidate = pickQueryValue(params.planId);
  const planId = isPlanId(planIdCandidate) ? planIdCandidate : DEFAULT_PLAN;
  const moderationEnabled = pickQueryValue(params.moderationEnabled) === "true";
  return { step, name, emoji, date, planId, moderationEnabled };
}
```

Pass `moderationEnabled` to `Step1Details` and `Step3Payment`:

```typescript
const { step, name, emoji, date, planId, moderationEnabled } = parseCreateEventQuery(resolvedParams);
// ...
{step === "1" && (
  <Step1Details
    defaultName={name}
    defaultEmoji={emoji}
    defaultDate={date}
    defaultModerationEnabled={moderationEnabled}
  />
)}
// ...
{step === "3" && (
  <Step3Payment
    name={name}
    emoji={emoji}
    date={date}
    planId={planId}
    moderationEnabled={moderationEnabled}
    validationError={validation.ok ? null : validation.error}
  />
)}
```

- [ ] **Step 3: Update `Step1Details` to add the moderation toggle**

Add `defaultModerationEnabled` to `Step1DetailsProps`:

```typescript
type Step1DetailsProps = {
  defaultName: string;
  defaultEmoji: string;
  defaultDate: string;
  defaultModerationEnabled: boolean;
};
```

Add state:

```typescript
  const [moderationEnabled, setModerationEnabled] = useState(defaultModerationEnabled);
```

Add hidden input and update the `writeStep1Draft` and `writeStep2Draft` helpers to persist it:

```typescript
  const writeStep1Draft = (name: string, date: string) => {
    writeCreateEventDraftToStorage({ step: "1", name, emoji, date, planId: getPlanIdForDraft(), moderationEnabled });
  };

  const writeStep2Draft = (name: string, date: string) => {
    writeCreateEventDraftToStorage({ step: "2", name, emoji, date, planId: getPlanIdForDraft(), moderationEnabled });
  };
```

Inside the `<form>`, add the hidden input and the toggle UI. Place the toggle at the bottom of the card, before the submit button:

```tsx
        <input type="hidden" name="moderationEnabled" value={String(moderationEnabled)} />

        {/* ── Moderation toggle ── */}
        <div style={{ borderTop: `1px dashed ${BORDER}`, padding: '12px 18px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: INK_S, fontFamily: FB }}>
              {ui.createStep1.moderationToggleLabel}
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 10, color: MUTED, fontFamily: FB }}>
              {ui.createStep1.moderationToggleHint}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={moderationEnabled}
            onClick={() => {
              const next = !moderationEnabled;
              setModerationEnabled(next);
              const nameEl = document.getElementById("name");
              const dateEl = document.getElementById("date");
              const currentName = nameEl instanceof HTMLInputElement ? nameEl.value : defaultName;
              const currentDate = dateEl instanceof HTMLInputElement ? dateEl.value : defaultDate;
              writeCreateEventDraftToStorage({ step: "1", name: currentName, emoji, date: currentDate, planId: getPlanIdForDraft(), moderationEnabled: next });
            }}
            style={{
              flexShrink: 0,
              width: 40,
              height: 22,
              borderRadius: 999,
              border: 'none',
              background: moderationEnabled ? GOLD : BORDER,
              position: 'relative',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 2,
                left: moderationEnabled ? 20 : 2,
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: '#fff',
                boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
                transition: 'left 0.2s',
              }}
            />
          </button>
        </div>
```

- [ ] **Step 4: Update `Step3Payment` to include `moderationEnabled` in the free-plan insert**

Add `moderationEnabled` to `Step3PaymentProps`:

```typescript
type Step3PaymentProps = {
  name: string;
  emoji: string;
  date: string;
  planId: PlanId;
  moderationEnabled: boolean;
  validationError: "NAME_REQUIRED" | null;
};
```

In `onConfirm`, update the free-plan Supabase insert:

```typescript
      const { data, error: insertError } = await supabase
        .from("events")
        .insert({
          title,
          event_date: new Date(date).toISOString(),
          organizer_id: user.id,
          plan: planId,
          access_code: accessCode,
          moderation_enabled: moderationEnabled,
        })
        .select("id")
        .single();
```

Also update `writeStep3Draft`:

```typescript
  const writeStep3Draft = () => {
    writeCreateEventDraftToStorage({ step: "3", name, emoji, date, planId, moderationEnabled });
  };
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 6: Run all tests**

Run: `npx vitest run`
Expected: all PASS

- [ ] **Step 7: Commit**

```bash
git add lib/create-event-draft.ts app/events/new/page.tsx app/events/new/_steps/Step1Details.tsx app/events/new/_steps/Step3Payment.tsx
git commit -m "feat: add moderation toggle to event creation wizard"
```

---

## Self-Review Checklist

| Spec section | Covered by |
|---|---|
| `moderation_status` column on `media_items` | Task 1 |
| `moderation_enabled` + `organizer_gallery_reviewed_at` on `events` | Task 1 |
| RLS: guests see visible/approved + own pending | Task 1 |
| Upload sets status based on mode | Task 3 |
| Organizer uploads always `visible` | Task 3 |
| Approve / discard / approve_all / toggle_mode / mark_reviewed API | Task 4 |
| Toggle in Settings tab | Task 8 |
| Toggle in event creation wizard (Step 1 + Step 3) | Task 9 |
| Review panel in GalleryManager | Task 6 |
| New-since-last-visit badge | Task 6 |
| mark_reviewed fired on gallery open | Task 6 |
| Guest pending badge (own uploads only) | Task 7 |
| i18n strings (en/hr/de) | Task 2 |
| turning off mode bulk-approves pending items | Task 4 (`toggleMode`) |
