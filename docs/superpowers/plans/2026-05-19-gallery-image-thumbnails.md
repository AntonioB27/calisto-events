# Gallery Image Thumbnails Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show CDN-cached 400px thumbnails in the gallery grid while keeping full-size images for lightbox display and downloads.

**Architecture:** Supabase Pro's image render endpoint accepts the same signed JWT as the regular object endpoint — only the URL path prefix differs. Thumbnail URLs are derived locally from already-signed original URLs, so no extra network calls, no DB migration, and no cache changes are needed. A new pure utility function handles the URL rewrite; both gallery components import it.

**Tech Stack:** TypeScript, Vitest, Supabase Storage image transformations (Pro), Next.js

---

## File Map

| Action | File |
|--------|------|
| Create | `lib/supabase-storage-transform.ts` |
| Create | `lib/supabase-storage-transform.test.ts` |
| Modify | `app/(app)/events/[id]/_tabs/GalleryManager.tsx` |
| Modify | `app/join/[accessCode]/_components/MediaGrid.tsx` |

---

### Task 1: `toThumbnailUrl` utility + tests

**Files:**
- Create: `lib/supabase-storage-transform.ts`
- Create: `lib/supabase-storage-transform.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/supabase-storage-transform.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { toThumbnailUrl } from "./supabase-storage-transform";

const BASE = "https://abc.supabase.co/storage/v1/object/sign/event-media/events/uuid/photo.jpg?token=JWT123";

describe("toThumbnailUrl", () => {
  it("replaces the object path prefix with the render prefix", () => {
    const result = toThumbnailUrl(BASE);
    expect(result).toContain("/storage/v1/render/image/sign/");
    expect(result).not.toContain("/storage/v1/object/sign/");
  });

  it("appends width and quality params", () => {
    const result = toThumbnailUrl(BASE);
    expect(result).toContain("&width=400");
    expect(result).toContain("&quality=80");
  });

  it("preserves the original token and path", () => {
    const result = toThumbnailUrl(BASE);
    expect(result).toContain("token=JWT123");
    expect(result).toContain("event-media/events/uuid/photo.jpg");
  });

  it("returns the url unchanged when the prefix is not present", () => {
    const other = "https://other.cdn.com/image.jpg?token=XYZ";
    expect(toThumbnailUrl(other)).toBe(other + "&width=400&quality=80");
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npx vitest run lib/supabase-storage-transform.test.ts
```

Expected: `FAIL` — module not found.

- [ ] **Step 3: Implement `lib/supabase-storage-transform.ts`**

```ts
export function toThumbnailUrl(signedUrl: string): string {
  return signedUrl
    .replace("/storage/v1/object/sign/", "/storage/v1/render/image/sign/")
    + "&width=400&quality=80";
}
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
npx vitest run lib/supabase-storage-transform.test.ts
```

Expected: all 4 tests `PASS`.

- [ ] **Step 5: Commit**

```bash
git add lib/supabase-storage-transform.ts lib/supabase-storage-transform.test.ts
git commit -m "feat(gallery): toThumbnailUrl utility for Supabase image transform URLs"
```

---

### Task 2: Wire thumbnails into `GalleryManager.tsx`

**Files:**
- Modify: `app/(app)/events/[id]/_tabs/GalleryManager.tsx`

Three changes in one file: the type, the mapping, and the grid render.

- [ ] **Step 1: Add `thumbnailUrl` import and update `MediaItem` type**

At the top of the file, after the existing imports, add:

```ts
import { toThumbnailUrl } from "@/lib/supabase-storage-transform";
```

Then update the `MediaItem` type (currently line 22):

```ts
// Before
type MediaItem = MediaRow & { signedUrl?: string; uploaderLabel: string };

// After
type MediaItem = MediaRow & { signedUrl?: string; thumbnailUrl?: string; uploaderLabel: string };
```

- [ ] **Step 2: Derive `thumbnailUrl` in `fetchPage`**

In `fetchPage`, find the `.map()` that builds `mapped` (around line 339). Update it:

```ts
// Before
const mapped: MediaItem[] = typed.map((r) => ({
  ...r,
  signedUrl: urlMap[r.storage_path],
  uploaderLabel:
    labelMap.get(r.uploaded_by) ??
    (organizerId !== null && r.uploaded_by === organizerId
      ? ui.guests.organizerLabelFallback
      : ui.guests.guestLabelFallback),
}));

// After
const mapped: MediaItem[] = typed.map((r) => ({
  ...r,
  signedUrl: urlMap[r.storage_path],
  thumbnailUrl: urlMap[r.storage_path] ? toThumbnailUrl(urlMap[r.storage_path]) : undefined,
  uploaderLabel:
    labelMap.get(r.uploaded_by) ??
    (organizerId !== null && r.uploaded_by === organizerId
      ? ui.guests.organizerLabelFallback
      : ui.guests.guestLabelFallback),
}));
```

- [ ] **Step 3: Use `thumbnailUrl` in the grid `<img>`**

In the masonry grid (around line 734), there is `const signedUrl = item.signedUrl;` followed by a conditional render. The `<img>` for non-video items currently uses `src={signedUrl}`. Change the `<img>` src only — leave the video `<src>` and the outer conditional using `signedUrl` unchanged:

```tsx
// Before
<img
  src={signedUrl}
  alt=""
  loading="lazy"
  decoding="async"
  className="block h-auto w-full max-w-full"
  style={{ transition: 'transform 0.3s' }}
  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
/>

// After
<img
  src={item.thumbnailUrl ?? signedUrl}
  alt=""
  loading="lazy"
  decoding="async"
  className="block h-auto w-full max-w-full"
  style={{ transition: 'transform 0.3s' }}
  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
/>
```

The lightbox `<img>` (around line 820, `src={lightbox.signedUrl}`) and the download button (uses `lightbox.signedUrl`) are **not changed** — they keep the full-size original URL.

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep "supabase-storage-transform\|GalleryManager\|thumbnailUrl"
```

Expected: no output (no new errors in these files).

- [ ] **Step 5: Commit**

```bash
git add "app/(app)/events/[id]/_tabs/GalleryManager.tsx"
git commit -m "feat(gallery): use thumbnail URLs in gallery grid, full-size in lightbox/download"
```

---

### Task 3: Wire thumbnails into `MediaGrid.tsx`

**Files:**
- Modify: `app/join/[accessCode]/_components/MediaGrid.tsx`

Same three changes as Task 2, applied to the guest join gallery.

- [ ] **Step 1: Add import and update `MediaItem` type**

Add the import after the existing imports:

```ts
import { toThumbnailUrl } from "@/lib/supabase-storage-transform";
```

Update the `MediaItem` type (currently lines 9–14):

```ts
// Before
type MediaItem = {
  id: string;
  storage_path: string;
  mime_type: string | null;
  signedUrl: string | undefined;
};

// After
type MediaItem = {
  id: string;
  storage_path: string;
  mime_type: string | null;
  signedUrl: string | undefined;
  thumbnailUrl: string | undefined;
};
```

- [ ] **Step 2: Derive `thumbnailUrl` in `fetchPage`**

Find the `.map()` building `mapped` (around line 91). Update it:

```ts
// Before
const mapped: MediaItem[] = typedRows.map((r) => ({
  id: r.id,
  storage_path: r.storage_path,
  mime_type: r.mime_type,
  signedUrl: urlMap[r.storage_path],
}));

// After
const mapped: MediaItem[] = typedRows.map((r) => ({
  id: r.id,
  storage_path: r.storage_path,
  mime_type: r.mime_type,
  signedUrl: urlMap[r.storage_path],
  thumbnailUrl: urlMap[r.storage_path] ? toThumbnailUrl(urlMap[r.storage_path]) : undefined,
}));
```

- [ ] **Step 3: Use `thumbnailUrl` in the grid `<img>`**

Find the `<img>` (currently line 148):

```tsx
// Before
<img src={item.signedUrl} alt="" loading="lazy" decoding="async" className="block h-auto w-full max-w-full" />

// After
<img src={item.thumbnailUrl ?? item.signedUrl} alt="" loading="lazy" decoding="async" className="block h-auto w-full max-w-full" />
```

The video `<video src={item.signedUrl}>` just above is **not changed**.

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep "supabase-storage-transform\|MediaGrid\|thumbnailUrl"
```

Expected: no output.

- [ ] **Step 5: Run full test suite**

```bash
npx vitest run
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add "app/join/[accessCode]/_components/MediaGrid.tsx"
git commit -m "feat(gallery): use thumbnail URLs in guest join gallery grid"
```

---

### Task 4: Push

- [ ] **Push branch**

```bash
git push
```
