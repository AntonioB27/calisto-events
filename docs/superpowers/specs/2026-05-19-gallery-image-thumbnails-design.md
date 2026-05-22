# Gallery Image Thumbnails — Design Spec

**Date:** 2026-05-19
**Branch target:** `feat/signed-url-cache` (or new branch off main)
**Status:** Approved

---

## Problem

The gallery grid loads full-size images (up to 50 MB each). On events with many photos this makes the grid slow to paint, especially on mobile. A thumbnail-sized image (~40–100 KB) is sufficient for the masonry grid; full resolution is only needed when the user opens the lightbox.

## Scope

Images only. Videos are excluded — frame extraction requires FFmpeg which cannot run in a Vercel serverless function or Supabase Edge Function without significant infrastructure. Video thumbnails are a separate future effort.

---

## Approach: Supabase Storage Image Transformations

Supabase Pro includes an image transformation endpoint. The render endpoint accepts the same signed JWT as the regular object endpoint — only the URL path prefix differs:

```
Original:  /storage/v1/object/sign/<bucket>/<path>?token=JWT
Thumbnail: /storage/v1/render/image/sign/<bucket>/<path>?token=JWT&width=400&quality=80
```

Because the JWT is identical, thumbnail URLs are **derived locally** from already-signed original URLs. No extra `createSignedUrl` calls, no DB schema changes, no additional storage paths.

Transform parameters:
- `width=400` — sufficient for 2–4 column masonry at all screen sizes
- `quality=80` — good balance of sharpness vs file size
- Height is unconstrained — natural aspect ratio is preserved (correct for masonry)
- Format: Supabase serves WebP automatically when supported

**Bonus:** HEIC files currently render as broken images in browsers. The render endpoint converts HEIC → WebP, silently fixing broken HEIC thumbnails in the grid.

---

## Components

### New: `lib/supabase-storage-transform.ts`

Single exported function:

```ts
export function toThumbnailUrl(signedUrl: string): string {
  return signedUrl
    .replace("/storage/v1/object/sign/", "/storage/v1/render/image/sign/")
    + "&width=400&quality=80";
}
```

Both gallery components import this. The replace is safe — if the URL doesn't contain the expected prefix (e.g. already a render URL, or an unexpected format) the string is returned unchanged and the fallback to `signedUrl` in the render handles it gracefully.

### Modified: `MediaItem` type (GalleryManager + MediaGrid)

Add one optional field:

```ts
type MediaItem = ... & { signedUrl?: string; thumbnailUrl?: string; ... };
```

### Modified: `fetchPage` in `GalleryManager` and `MediaGrid`

After building `urlMap`, derive `thumbnailUrl` during the `.map()`:

```ts
signedUrl: urlMap[r.storage_path],
thumbnailUrl: urlMap[r.storage_path]
  ? toThumbnailUrl(urlMap[r.storage_path])
  : undefined,
```

### Modified: Gallery grid `<img>` (GalleryManager + MediaGrid)

```tsx
<img src={item.thumbnailUrl ?? item.signedUrl} ... />
```

Falls back to the original URL if `thumbnailUrl` is undefined (e.g. for video rows, which have no thumbnail).

### Unchanged

- Lightbox `<img>` — continues to use `signedUrl` (full resolution)
- Download button — continues to use `signedUrl` (full file downloaded)
- `lib/signed-url-cache.ts` — caches `signedUrl` (original); `thumbnailUrl` is derived at render time, no caching needed
- Upload route — no changes
- DB schema — no migration needed

---

## Error Handling

- If the render endpoint returns a non-image response (e.g. unsupported format), the browser shows a broken image icon — same as today for HEIC. No regression.
- The `thumbnailUrl ?? signedUrl` fallback ensures video rows are unaffected.
- No retry logic needed — failures are silent per-image and non-critical.

---

## What This Is Not

- Not pre-generated thumbnails stored at upload time (no async processing, no `thumbnail_path` column)
- Not video thumbnail extraction
- Not a CDN integration (Supabase's CDN caches the transformed result automatically on Pro)
