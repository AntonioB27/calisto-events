# Photo Moderation Feature — Design Spec

**Date:** 2026-06-06
**Status:** Approved

---

## Overview

Organizers can optionally enable moderation mode on an event. When enabled, guest-uploaded photos land in a pending queue and are hidden from other guests until the organizer approves them. When disabled (open mode), photos are immediately visible to all guests — but the organizer still sees a "new since last visit" indicator so they can spot and delete anything they don't want.

---

## Data Model

### `events` table — two new columns

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| `moderation_enabled` | `boolean NOT NULL` | `false` | Whether uploaded photos require approval before becoming visible |
| `organizer_gallery_reviewed_at` | `timestamptz` | `null` | Null = organizer has never reviewed; updated each time organizer opens the Gallery tab |

### `media_items` table — one new column

| Column | Type | Default | Allowed values |
|--------|------|---------|----------------|
| `moderation_status` | `text NOT NULL` | `'visible'` | `'visible'`, `'pending'`, `'approved'` |

**Status semantics:**
- `visible` — uploaded while moderation was OFF; visible to everyone
- `pending` — uploaded while moderation was ON; visible only to the uploader and the organizer
- `approved` — approved by the organizer from the pending queue; visible to everyone

### RLS / query rules

- Guests see items where `moderation_status IN ('visible', 'approved')` OR (`moderation_status = 'pending'` AND `uploaded_by = auth.uid()`)
- Organizers see all items regardless of status
- No new table required — everything lives on existing rows

---

## Upload Flow

File: `app/api/events/[id]/guest-upload/route.ts`

1. The route already fetches the event row for plan/limit checks. Add `moderation_enabled` to that select.
2. Insert `media_items` with `moderation_status = moderation_enabled ? 'pending' : 'visible'`.
3. Organizer's own uploads always land as `'visible'` regardless of mode.

No other upload-path changes needed.

---

## Organizer Review UX

### "New since last visit" badge

- On Gallery tab open, read `organizer_gallery_reviewed_at` from the event row.
- Items with `created_at > organizer_gallery_reviewed_at` (or all items if null) are highlighted as new.
- A badge on the Gallery tab in the admin nav shows the count.
- Opening the tab fires a PATCH that sets `organizer_gallery_reviewed_at = now()`.
- Works in both open mode and moderated mode.

### Moderation review panel

- Rendered at the top of `GalleryManager`, visible only to the organizer, only when `moderation_enabled = true`.
- Shows all items where `moderation_status = 'pending'` as a strip/list above the main grid.
- Per-item actions:
  - **Approve** — sets `moderation_status = 'approved'`; item becomes visible to all guests
  - **Discard** — permanently deletes row and storage paths (same path as the existing single-delete flow)
- Bulk action: **Approve all** — sets all pending items to `'approved'` in one call.
- No "Reject all" bulk action — too destructive without per-item review.

---

## Guest UX

When `moderation_enabled = true`:
- The uploader sees their own pending photo in the gallery with a "pending approval" badge (muted overlay, clock icon).
- Other guests do not see the pending photo at all (enforced at the DB/RLS level).
- On approval: photo appears in the full gallery on next refresh.
- On discard: photo silently disappears from the uploader's view (row deleted). No rejection notification.

Files affected: `app/join/[accessCode]/_components/MediaGrid.tsx` and `UploadZone.tsx` — small update to render the pending badge when `moderation_status === 'pending'`.

---

## Configuration Entry Points

### Event creation wizard

- New toggle in `app/events/new/_steps/Step1Details.tsx`: "Moderate uploaded photos before they appear in the gallery" (default OFF).
- Value is passed through the creation flow and written to `events.moderation_enabled` on event creation.

### Settings tab

- New toggle in `app/(app)/events/[id]/_tabs/SettingsTab.tsx`.
- **Turning OFF (ON→OFF):** bulk-approves all currently pending items (set `moderation_status = 'visible'`), then sets `moderation_enabled = false`. Handled in a small API route.
- **Turning ON (OFF→ON):** no backfill — only future uploads are affected.

---

## Files to Create / Modify

| File | Change |
|------|--------|
| `supabase/migrations/20260606_photo_moderation.sql` | Add columns to `events` and `media_items`; update RLS policies |
| `app/api/events/[id]/guest-upload/route.ts` | Read `moderation_enabled`; set `moderation_status` on insert |
| `app/api/events/[id]/moderation/route.ts` | New route: approve item, discard item, approve-all, toggle moderation mode, update `organizer_gallery_reviewed_at` |
| `app/(app)/events/[id]/_tabs/GalleryManager.tsx` | Add pending review panel; add "new since last visit" badge logic; fire reviewed_at PATCH on mount |
| `app/(app)/events/[id]/_tabs/SettingsTab.tsx` | Add moderation toggle |
| `app/events/new/_steps/Step1Details.tsx` | Add moderation toggle |
| `app/join/[accessCode]/_components/MediaGrid.tsx` | Render pending badge |
| `lib/app-ui.ts` (or equivalent i18n file) | Add copy strings for moderation UI |
