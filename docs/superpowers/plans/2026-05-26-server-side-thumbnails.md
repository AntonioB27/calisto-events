# Server-Side Thumbnails Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate a ~600px JPEG thumbnail server-side at upload time, store it alongside the original, and use it for gallery grids — eliminating Supabase image transformation quota usage while keeping originals intact for lightbox and ZIP export.

**Architecture:** Sharp resizes images synchronously in the existing `POST /api/events/[id]/guest-upload` route after the original is stored; both paths are written to a new `thumbnail_path` column on `media_items`. Gallery components sign and cache both paths independently — thumbnails for the grid, originals for lightbox/download. All three deletion paths (manual delete, organizer event delete, scheduled system delete) are updated to also remove the thumbnail file.

**Tech Stack:** Sharp (already installed), Vitest, Supabase Storage, Next.js App Router (Node.js runtime)

---

## File Map

| File | Action | Reason |
|---|---|---|
| `supabase/migrations/20260526100000_media_items_thumbnail_path.sql` | **Create** | Adds `thumbnail_path` column; updates both deletion SQL functions to also return thumbnail paths |
| `lib/image-thumbnail.ts` | **Create** | Pure Sharp resize function, isolated for unit testing |
| `lib/image-thumbnail.test.ts` | **Create** | Unit tests for the thumbnail function |
| `app/api/events/[id]/guest-upload/route.ts` | **Modify** | Call thumbnail generator after original upload; store `thumbnail_path`; expose via `__test` |
| `app/api/events/[id]/guest-upload/route.test.ts` | **Modify** | Update `insertMediaItemMock` signature; add test asserting `thumbnail_path` is passed for images |
| `app/(app)/events/[id]/_tabs/GalleryManager.tsx` | **Modify** | Add `thumbnail_path` to `MediaRow` type and DB select; sign thumbnail paths in same batch as originals; use `thumbnail_path` signed URL for grid; delete thumbnail alongside original |
| `app/join/[accessCode]/_components/MediaGrid.tsx` | **Modify** | Same changes as GalleryManager (types, select, signing, display) — no delete needed here |
| `lib/supabase-storage-transform.ts` | **Delete** | Replaced by stored thumbnails; no longer needed |
| `lib/supabase-storage-transform.test.ts` | **Delete** | Test file for deleted module |

---

## Task 1: DB Migration — add `thumbnail_path` column and fix deletion functions

**Files:**
- Create: `supabase/migrations/20260526100000_media_items_thumbnail_path.sql`

Both SQL deletion functions (`delete_event_as_primary_return_paths` and `delete_event_system_return_paths`) currently collect only `storage_path`. After this migration they also collect `thumbnail_path`, so the app-layer storage cleanup removes both files.

- [ ] **Step 1: Create the migration file**

```sql
-- supabase/migrations/20260526100000_media_items_thumbnail_path.sql

ALTER TABLE public.media_items
  ADD COLUMN IF NOT EXISTS thumbnail_path text;

-- Fix organizer-triggered delete: return both storage_path and thumbnail_path.
CREATE OR REPLACE FUNCTION public.delete_event_as_primary_return_paths(p_event_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid   uuid := auth.uid();
  path_list jsonb;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'NOT_AUTHENTICATED';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = p_event_id AND e.organizer_id = v_uid
  ) THEN
    RAISE EXCEPTION 'NOT_ORGANIZER';
  END IF;

  SELECT coalesce(jsonb_agg(p) FILTER (WHERE p IS NOT NULL AND p <> ''), '[]'::jsonb)
  INTO path_list
  FROM (
    SELECT m.storage_path   AS p FROM public.media_items m WHERE m.event_id = p_event_id
    UNION ALL
    SELECT m.thumbnail_path AS p FROM public.media_items m
      WHERE m.event_id = p_event_id AND m.thumbnail_path IS NOT NULL
  ) paths;

  DELETE FROM public.media_items     WHERE event_id = p_event_id;
  DELETE FROM public.event_memberships WHERE event_id = p_event_id;
  DELETE FROM public.events           WHERE id        = p_event_id;

  RETURN path_list;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_event_as_primary_return_paths(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_event_as_primary_return_paths(uuid) TO authenticated;

-- Fix system-triggered scheduled delete: return both paths.
CREATE OR REPLACE FUNCTION public.delete_event_system_return_paths(p_event_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  path_list jsonb;
BEGIN
  SELECT coalesce(jsonb_agg(p) FILTER (WHERE p IS NOT NULL AND p <> ''), '[]'::jsonb)
  INTO path_list
  FROM (
    SELECT m.storage_path   AS p FROM public.media_items m WHERE m.event_id = p_event_id
    UNION ALL
    SELECT m.thumbnail_path AS p FROM public.media_items m
      WHERE m.event_id = p_event_id AND m.thumbnail_path IS NOT NULL
  ) paths;

  DELETE FROM public.media_items     WHERE event_id = p_event_id;
  DELETE FROM public.event_memberships WHERE event_id = p_event_id;
  DELETE FROM public.events           WHERE id        = p_event_id;

  RETURN path_list;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_event_system_return_paths(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_event_system_return_paths(uuid) TO service_role;
```

- [ ] **Step 2: Apply the migration**

```bash
npx supabase db push
```

Expected: migration applies cleanly. If using the local dev stack, use `npx supabase db reset` instead and verify the column appears in `\d media_items`.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260526100000_media_items_thumbnail_path.sql
git commit -m "feat: add thumbnail_path column to media_items, fix deletion functions to remove thumbnails"
```

---

## Task 2: Pure thumbnail generation function

**Files:**
- Create: `lib/image-thumbnail.ts`
- Create: `lib/image-thumbnail.test.ts`

Extracting the Sharp logic into its own file lets the upload route stay focused and makes the resize behaviour testable without any Supabase mocking.

- [ ] **Step 1: Write the failing test**

Create `lib/image-thumbnail.test.ts`:

```typescript
import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { generateImageThumbnail } from "./image-thumbnail";

async function pngBuffer(width: number, height: number): Promise<ArrayBuffer> {
  const buf = await sharp({
    create: { width, height, channels: 3, background: { r: 255, g: 0, b: 0 } },
  })
    .png()
    .toBuffer();
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

describe("generateImageThumbnail", () => {
  it("returns a Buffer for a valid image mime type", async () => {
    const input = await pngBuffer(800, 600);
    const result = await generateImageThumbnail(input, "image/png");
    expect(result).toBeInstanceOf(Buffer);
    expect(result!.length).toBeGreaterThan(0);
  });

  it("resizes so neither dimension exceeds 600px", async () => {
    const input = await pngBuffer(1200, 900);
    const result = await generateImageThumbnail(input, "image/jpeg");
    const meta = await sharp(result!).metadata();
    expect(meta.width).toBeLessThanOrEqual(600);
    expect(meta.height).toBeLessThanOrEqual(600);
  });

  it("does not enlarge images already smaller than 600px", async () => {
    const input = await pngBuffer(300, 200);
    const result = await generateImageThumbnail(input, "image/jpeg");
    const meta = await sharp(result!).metadata();
    expect(meta.width).toBeLessThanOrEqual(300);
    expect(meta.height).toBeLessThanOrEqual(200);
  });

  it("returns null for video mime types", async () => {
    const input = new ArrayBuffer(8);
    const result = await generateImageThumbnail(input, "video/mp4");
    expect(result).toBeNull();
  });

  it("returns null for corrupt image data", async () => {
    const corrupt = new ArrayBuffer(10);
    const result = await generateImageThumbnail(corrupt, "image/jpeg");
    expect(result).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run lib/image-thumbnail.test.ts
```

Expected: FAIL — `generateImageThumbnail` not found.

- [ ] **Step 3: Write the implementation**

Create `lib/image-thumbnail.ts`:

```typescript
import sharp from "sharp";

/**
 * Resize an image to fit within 600×600px and re-encode as JPEG at 80% quality.
 * Returns null for non-image MIME types or if Sharp cannot decode the input.
 */
export async function generateImageThumbnail(
  buffer: ArrayBuffer,
  mimeType: string,
): Promise<Buffer | null> {
  if (!mimeType.startsWith("image/")) return null;
  try {
    return await sharp(Buffer.from(buffer))
      .resize(600, 600, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run lib/image-thumbnail.test.ts
```

Expected: 5 passed.

- [ ] **Step 5: Commit**

```bash
git add lib/image-thumbnail.ts lib/image-thumbnail.test.ts
git commit -m "feat: add generateImageThumbnail helper using Sharp"
```

---

## Task 3: Upload route — generate and store thumbnail

**Files:**
- Modify: `app/api/events/[id]/guest-upload/route.ts`
- Modify: `app/api/events/[id]/guest-upload/route.test.ts`

After storing the original, the route generates a thumbnail (best-effort — a Sharp failure does not fail the upload), uploads it, and stores `thumbnail_path` in the DB row.

- [ ] **Step 1: Update the failing test first**

In `app/api/events/[id]/guest-upload/route.test.ts`, update `insertMediaItemMock`'s type signature and add a new test case:

Find the existing `insertMediaItemMock` declaration:
```typescript
const insertMediaItemMock = vi.fn<
  (params: {
    eventId: string;
    uploaderId: string;
    filePath: string;
    mimeType: string;
    sizeBytes: number;
  }) => Promise<{ id: string; storage_path: string }>
>();
```

Replace it with:
```typescript
const insertMediaItemMock = vi.fn<
  (params: {
    eventId: string;
    uploaderId: string;
    filePath: string;
    mimeType: string;
    sizeBytes: number;
    thumbnailPath: string | null;
  }) => Promise<{ id: string; storage_path: string }>
>();
```

Then add this test at the end of the `describe` block (before the closing `}`):

```typescript
  it("passes thumbnail_path to insertMediaItem for image uploads", async () => {
    vi.useFakeTimers({ now: new Date("2026-05-07T12:00:00.000Z") });
    try {
      getEventUploadContextMock.mockResolvedValue({
        planId: "free",
        eventDate: "2026-05-06T00:00:00.000Z",
      });
      countMediaForQuotaMock.mockResolvedValue(0);
      insertMediaItemMock.mockResolvedValue({ id: "m1", storage_path: "events/evt_1/x.jpg" });
      __test.generateThumbnail = async (_buf: ArrayBuffer, _mime: string) =>
        Buffer.from("fake-thumbnail");

      const form = new FormData();
      form.append("file", new File(["hello"], "photo.jpg", { type: "image/jpeg" }));
      const request = new Request("http://localhost/api/events/evt_1/guest-upload", {
        method: "POST",
        body: form,
      });

      const response = await POST(request, { params: Promise.resolve({ id: "evt_1" }) });

      expect(response.status).toBe(201);
      const call = insertMediaItemMock.mock.calls[0]?.[0];
      expect(call?.thumbnailPath).toMatch(/^events\/evt_1\/thumbnails\//);
    } finally {
      vi.useRealTimers();
    }
  });

  it("still succeeds when thumbnail generation returns null", async () => {
    vi.useFakeTimers({ now: new Date("2026-05-07T12:00:00.000Z") });
    try {
      getEventUploadContextMock.mockResolvedValue({
        planId: "free",
        eventDate: "2026-05-06T00:00:00.000Z",
      });
      countMediaForQuotaMock.mockResolvedValue(0);
      insertMediaItemMock.mockResolvedValue({ id: "m2", storage_path: "events/evt_1/x.mp4" });
      __test.generateThumbnail = async (_buf: ArrayBuffer, _mime: string) => null;

      const form = new FormData();
      form.append("file", new File(["hello"], "video.mp4", { type: "video/mp4" }));
      const request = new Request("http://localhost/api/events/evt_1/guest-upload", {
        method: "POST",
        body: form,
      });

      const response = await POST(request, { params: Promise.resolve({ id: "evt_1" }) });

      expect(response.status).toBe(201);
      const call = insertMediaItemMock.mock.calls[0]?.[0];
      expect(call?.thumbnailPath).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run "app/api/events/\[id\]/guest-upload/route.test.ts"
```

Expected: the two new tests FAIL, existing tests still pass.

- [ ] **Step 3: Update the upload route**

In `app/api/events/[id]/guest-upload/route.ts`:

Add the import at the top (after the existing imports):
```typescript
import { generateImageThumbnail } from "@/lib/image-thumbnail";
```

Update `insertMediaItem` to accept and store `thumbnailPath`:
```typescript
async function insertMediaItem(params: {
  eventId: string;
  uploaderId: string;
  filePath: string;
  mimeType: string;
  sizeBytes: number;
  thumbnailPath: string | null;
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
    })
    .select("id, storage_path")
    .single();

  if (error) {
    throw error;
  }
  return data as { id: string; storage_path: string };
}
```

Update the `__test` export to expose the thumbnail generator as a seam:
```typescript
export const __test = {
  getEventUploadContext,
  countMediaForQuota,
  insertMediaItem,
  maxGuestUploadBytesForMime,
  generateThumbnail: generateImageThumbnail as (buf: ArrayBuffer, mime: string) => Promise<Buffer | null>,
};
```

Replace steps 5 and 6 in the `POST` handler (the existing "Upload to Storage" and "Insert media row" sections) with:

```typescript
  // 5) Upload original to Storage
  const ext = MIME_TO_EXT[file.type] ?? "bin";
  const fileUuid = crypto.randomUUID();
  const filePath = `events/${eventId}/${fileUuid}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();

  const db = getSupabaseServerClient();
  const { error: storageError } = await db.storage.from("event-media").upload(filePath, arrayBuffer, {
    contentType: file.type,
    upsert: false,
  });
  if (storageError) {
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }

  // 6) Generate thumbnail (best-effort — failure does not block the upload)
  let thumbnailPath: string | null = null;
  const thumbBuffer = await __test.generateThumbnail(arrayBuffer, file.type);
  if (thumbBuffer) {
    const thumbPath = `events/${eventId}/thumbnails/${fileUuid}.jpg`;
    const { error: thumbErr } = await db.storage.from("event-media").upload(thumbPath, thumbBuffer, {
      contentType: "image/jpeg",
      upsert: false,
    });
    if (!thumbErr) {
      thumbnailPath = thumbPath;
    }
  }

  // 7) Insert media row
  try {
    const inserted = await __test.insertMediaItem({
      eventId,
      uploaderId: user.id,
      filePath,
      mimeType: file.type,
      sizeBytes: file.size,
      thumbnailPath,
    });
    return NextResponse.json({ id: inserted.id, file_path: inserted.storage_path }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save upload." }, { status: 500 });
  }
```

- [ ] **Step 4: Run all upload route tests**

```bash
npx vitest run "app/api/events/\[id\]/guest-upload/route.test.ts"
```

Expected: all tests pass including the two new ones.

- [ ] **Step 5: Commit**

```bash
git add app/api/events/\[id\]/guest-upload/route.ts app/api/events/\[id\]/guest-upload/route.test.ts
git commit -m "feat: generate and store thumbnail on upload via Sharp"
```

---

## Task 4: GalleryManager — use thumbnail_path for grid display and delete

**Files:**
- Modify: `app/(app)/events/[id]/_tabs/GalleryManager.tsx`

Three changes: (a) add `thumbnail_path` to `MediaRow` type and the DB `.select()`, (b) sign thumbnail paths in the same batch as originals, (c) delete the thumbnail when deleting a media item.

- [ ] **Step 1: Update `MediaRow` type and DB select**

Find the `MediaRow` type definition:
```typescript
type MediaRow = {
  id: string;
  storage_path: string;
  mime_type: string | null;
  created_at: string;
  uploaded_by: string;
};
```

Replace with:
```typescript
type MediaRow = {
  id: string;
  storage_path: string;
  thumbnail_path: string | null;
  mime_type: string | null;
  created_at: string;
  uploaded_by: string;
};
```

Find the DB select call (around line 335):
```typescript
          .select("id, storage_path, mime_type, created_at, uploaded_by")
```

Replace with:
```typescript
          .select("id, storage_path, thumbnail_path, mime_type, created_at, uploaded_by")
```

- [ ] **Step 2: Update signed URL generation to include thumbnail paths**

Find the section that builds `allPaths` and calls `getCachedUrls` (around line 361):
```typescript
      const allPaths = typed.map((r) => r.storage_path);
      const { cached: cachedUrls, missing: missingPaths } = getCachedUrls(allPaths);
```

Replace with:
```typescript
      const thumbnailPaths = typed
        .map((r) => r.thumbnail_path)
        .filter((p): p is string => Boolean(p));
      const allPaths = Array.from(new Set([
        ...typed.map((r) => r.storage_path),
        ...thumbnailPaths,
      ]));
      const { cached: cachedUrls, missing: missingPaths } = getCachedUrls(allPaths);
```

- [ ] **Step 3: Update the `mapped` array to use thumbnail signed URL**

Find the `mapped` array construction (around line 400):
```typescript
      const mapped: MediaItem[] = typed.map((r) => ({
        ...r,
        signedUrl: urlMap[r.storage_path],
        thumbnailUrl: urlMap[r.storage_path] ? toThumbnailUrl(urlMap[r.storage_path]) : undefined,
        uploaderLabel: ...
      }));
```

Replace the `thumbnailUrl` line only:
```typescript
        thumbnailUrl: r.thumbnail_path
          ? urlMap[r.thumbnail_path]
          : undefined,
```

(Leave `signedUrl` and `uploaderLabel` lines unchanged.)

- [ ] **Step 4: Update individual photo delete to also remove thumbnail**

Find `confirmDeletePending` (around line 458):
```typescript
      const { error: storageError } = await supabase.storage.from("event-media").remove([item.storage_path]);
      if (storageError) throw storageError;

      invalidateCachedUrl(item.storage_path);
```

Replace with:
```typescript
      const pathsToDelete = [item.storage_path, item.thumbnail_path].filter(
        (p): p is string => Boolean(p),
      );
      const { error: storageError } = await supabase.storage.from("event-media").remove(pathsToDelete);
      if (storageError) throw storageError;

      pathsToDelete.forEach(invalidateCachedUrl);
```

- [ ] **Step 5: Remove the now-unused `toThumbnailUrl` import**

Find at the top of the file:
```typescript
import { toThumbnailUrl } from "@/lib/supabase-storage-transform";
```

Delete that line.

- [ ] **Step 6: Run the full test suite to catch type errors**

```bash
npx vitest run
```

Expected: all tests pass. TypeScript errors would surface as test failures if type checking is wired into the suite; otherwise run `npx tsc --noEmit` to check.

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add "app/(app)/events/[id]/_tabs/GalleryManager.tsx"
git commit -m "feat: use thumbnail_path for gallery grid; delete thumbnail alongside original"
```

---

## Task 5: MediaGrid — use thumbnail_path for guest gallery display

**Files:**
- Modify: `app/join/[accessCode]/_components/MediaGrid.tsx`

Same changes as Task 4 except there is no individual delete flow in this component.

- [ ] **Step 1: Update `MediaRow` type and DB select**

Find the `MediaRow` type:
```typescript
type MediaRow = {
  id: string;
  storage_path: string;
  mime_type: string | null;
  uploaded_by: string;
};
```

Replace with:
```typescript
type MediaRow = {
  id: string;
  storage_path: string;
  thumbnail_path: string | null;
  mime_type: string | null;
  uploaded_by: string;
};
```

Find the DB select (around line 107):
```typescript
          .select("id, storage_path, mime_type, uploaded_by")
```

Replace with:
```typescript
          .select("id, storage_path, thumbnail_path, mime_type, uploaded_by")
```

- [ ] **Step 2: Update signed URL generation to include thumbnail paths**

Find the section that builds `allPaths` and calls `getCachedUrls` (around line 128):
```typescript
        const allPaths = typedRows.map((r) => r.storage_path);
        const { cached: cachedUrls, missing: missingPaths } = getCachedUrls(allPaths);
```

Replace with:
```typescript
        const thumbnailPaths = typedRows
          .map((r) => r.thumbnail_path)
          .filter((p): p is string => Boolean(p));
        const allPaths = Array.from(new Set([
          ...typedRows.map((r) => r.storage_path),
          ...thumbnailPaths,
        ]));
        const { cached: cachedUrls, missing: missingPaths } = getCachedUrls(allPaths);
```

- [ ] **Step 3: Update the mapped array to use thumbnail signed URL**

Find the `mapped` array construction (around line 167):
```typescript
          thumbnailUrl: urlMap[r.storage_path] ? toThumbnailUrl(urlMap[r.storage_path]) : undefined,
```

Replace with:
```typescript
          thumbnailUrl: r.thumbnail_path ? urlMap[r.thumbnail_path] : undefined,
```

- [ ] **Step 4: Remove the `toThumbnailUrl` import**

Find at the top:
```typescript
import { toThumbnailUrl } from "@/lib/supabase-storage-transform";
```

Delete that line.

- [ ] **Step 5: Run type check and tests**

```bash
npx tsc --noEmit && npx vitest run
```

Expected: no TypeScript errors, all tests pass.

- [ ] **Step 6: Commit**

```bash
git add "app/join/[accessCode]/_components/MediaGrid.tsx"
git commit -m "feat: use thumbnail_path for guest gallery grid"
```

---

## Task 6: Delete the `supabase-storage-transform` module

**Files:**
- Delete: `lib/supabase-storage-transform.ts`
- Delete: `lib/supabase-storage-transform.test.ts`

Both files were already reduced to a no-op in the previous hotfix. Now that nothing imports `toThumbnailUrl`, they are dead code.

- [ ] **Step 1: Verify nothing imports the module**

```bash
grep -r "supabase-storage-transform" /Users/antoniobecic/repo/calisto-events --include="*.ts" --include="*.tsx" | grep -v node_modules | grep -v .next
```

Expected: no output.

- [ ] **Step 2: Delete both files**

```bash
rm lib/supabase-storage-transform.ts lib/supabase-storage-transform.test.ts
```

- [ ] **Step 3: Run type check and tests**

```bash
npx tsc --noEmit && npx vitest run
```

Expected: no errors, all tests pass.

- [ ] **Step 4: Commit**

```bash
git add -u lib/supabase-storage-transform.ts lib/supabase-storage-transform.test.ts
git commit -m "chore: remove supabase-storage-transform module, replaced by stored thumbnails"
```

---

## Self-Review

**Spec coverage:**
- ✅ Thumbnail generated server-side (Task 2 + 3)
- ✅ Original preserved; lightbox/download use `signedUrl` (original path) unchanged
- ✅ ZIP export untouched — still uses `storage_path`
- ✅ `thumbnail_path` column added (Task 1)
- ✅ Both SQL deletion functions updated (Task 1)
- ✅ GalleryManager individual delete removes thumbnail (Task 4)
- ✅ Thumbnail failure is best-effort, upload still succeeds (Task 3, step 3 — `thumbErr` guarded)
- ✅ Existing `media_items` rows with `null` thumbnail_path fall back to `signedUrl` in both gallery components (the `thumbnailUrl` field is `undefined`, and both components already do `thumbnailUrl ?? signedUrl` in the `<img>` src)
- ✅ `supabase-storage-transform` module deleted (Task 6)
- ✅ No Supabase image transformation quota consumed

**Type consistency check:**
- `thumbnailPath: string | null` — used in `insertMediaItem` params (Task 3) and returned from `__test.generateThumbnail` (Task 3)
- `thumbnail_path: string | null` — added to `MediaRow` in both GalleryManager (Task 4) and MediaGrid (Task 5)
- `__test.generateThumbnail` exposed in Task 3 and stubbed in test as `async (_buf, _mime) => Buffer | null` — matches `generateImageThumbnail` signature

**Placeholder scan:** No TBDs, TODOs, or "similar to Task N" patterns found.
