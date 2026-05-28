# Gold Circles Photo Invitation Template

**Date:** 2026-05-28
**Status:** Approved

## Overview

A new wedding invitation template (`wedding-invite-gold-circles-photo`) featuring a gold foil double-ring circle frame with gold confetti dots on a textured off-white background. The distinguishing feature is a circular photo area where the user uploads and crops their own couple photo, which is overlaid on the background at print time.

---

## 1. Template & Data

**Template ID:** `wedding-invite-gold-circles-photo`

Registered in `INVITATION_PRINT_TEMPLATE_IDS` and `PRINT_TEMPLATE_DEFINITIONS` in `lib/event-print/template-catalog.ts`.

**Fields** stored in existing `field_values` JSONB on `event_print_template_instances`:

| Field | Type | Description |
|---|---|---|
| `partner_a` | string | First partner's name |
| `partner_b` | string | Second partner's name |
| `venue` | string | Venue name / address |
| `extra_line` | string | Extra line (e.g. "Reception to follow") |
| `couple_photo_path` | string | Supabase storage path: `{eventId}/invite-photo/{uuid}.jpg` in `event-media` bucket |
| `couple_photo_crop_x` | string | Pan X offset as a percentage string (e.g. `"12.5"`) |
| `couple_photo_crop_y` | string | Pan Y offset as a percentage string (e.g. `"-8.0"`) |
| `couple_photo_crop_scale` | string | Zoom scale as a string (e.g. `"1.3"`) |

No new DB migration required — all data fits in the existing JSONB column.

---

## 2. Background Asset

File: `/public/print-backgrounds/wedding-gold-circles-photo.png`

This is the second image provided by the user — the gold double-ring circle frame with confetti dots on a textured off-white background, with a sample couple photo already embedded inside the circle. It serves as:
- The full decorative background at all times
- A natural placeholder when no user photo has been uploaded (the sample couple shows through)

---

## 3. Print Sheet Component

**File:** `app/(app)/events/[id]/print/WeddingInviteGoldCirclesPhotoPrintSheet.tsx`

The card is divided into two visual zones:

### Top ~55% — Photo zone
- Background image fills the card (`background-size: cover`, `background-position: center top`)
- A circular `<div>` is positioned absolutely to exactly overlay the gold ring circle in the background image
  - Center: approximately 50% horizontal, 37% vertical of the card height
  - Diameter: approximately 60% of card width
  - `border-radius: 50%`, `overflow: hidden`
- If `photoUrl` is provided, an `<img>` renders inside the circle with:
  - `transform: translate(cropX%, cropY%) scale(cropScale)`
  - `width: 100%`, `height: 100%`, `object-fit: cover`
- If no photo, the circle div is invisible and the background sample couple shows through

### Bottom ~45% — Text zone
Centered text on off-white background, top to bottom:
1. *"You're invited to the wedding of"* — italic serif, small (~0.85rem)
2. **PARTNER A & PARTNER B** — large bold caps (~2rem), with `&` connector
3. Date line — formatted from event date (e.g. "Saturday, October 18 at 7:00 PM")
4. Venue line
5. Extra line

**Props interface:**
```ts
type Props = {
  paper: PrintPaperId;
  partnerA: string;
  partnerB: string;
  venue: string;
  extraLine: string;
  eventDateIso: string;
  locale: Locale;
  photoUrl: string | null;       // signed URL or null
  cropX: number;                 // parsed from couple_photo_crop_x
  cropY: number;                 // parsed from couple_photo_crop_y
  cropScale: number;             // parsed from couple_photo_crop_scale
  strings: WeddingInviteGoldCirclesPhotoStrings;
  visibility: InvitationFieldVisibility;
}
```

CSS added to `print-sheet.css` under a `/* --- Wedding invitation: gold circles photo --- */` section following existing conventions.

---

## 4. Upload & Crop UI

**File:** `app/(app)/events/[id]/_tabs/InvitePhotoUpload.tsx`

A client component rendered inside the invitation form, **only when the active template is `wedding-invite-gold-circles-photo`**.

### States

**No photo uploaded:**
- Circular area (matches card circle proportions) with a camera icon and "Upload photo" label
- Clicking opens native file picker (`accept="image/*"`)

**Photo selected / uploaded:**
- Circular preview showing the user's photo
- **Drag** inside circle → pan (updates `cropX`, `cropY`)
- **Scroll / pinch** → zoom (updates `cropScale`)
- "Change photo" button to replace

### Save behavior
On the form's existing save action:
1. Upload file to `event-media/{eventId}/invite-photo/{uuid}.jpg` via Supabase client
2. Write `couple_photo_path`, `couple_photo_crop_x`, `couple_photo_crop_y`, `couple_photo_crop_scale` into `field_values`

### Reload behavior
1. Read `couple_photo_path` from saved `field_values`
2. Fetch a signed URL from Supabase storage
3. Restore crop state (`cropX`, `cropY`, `cropScale`) from saved values
4. User sees exactly what they saved

---

## 5. Print Page Integration

In `app/(app)/events/[id]/print/page.tsx`:
- Add new branch for `routeTemplate === "wedding-invite-gold-circles-photo"`
- If `couple_photo_path` is present in `mergedInvitation`, generate a signed URL via `supabase.storage.from("event-media").createSignedUrl(path, 3600)`
- Parse crop values from strings to numbers (default `0`, `0`, `1.0` if missing)
- Pass `photoUrl`, `cropX`, `cropY`, `cropScale` to `WeddingInviteGoldCirclesPhotoPrintSheet`

---

## 6. Strings

New string keys needed in `lib/app-ui/en.ts` (and other locale files):

- `inviteGoldCirclesUploadPhoto` — "Upload photo"
- `inviteGoldCirclesChangePhoto` — "Change photo"
- `inviteGoldCirclesYoureInvited` — "You're invited to the wedding of"
- `inviteGoldCirclesReception` — "Reception to follow"
- `inviteAnd` — already exists, reuse

---

## 7. What Is Not In Scope

- Cropping to a non-circle shape
- Multiple photos per invitation
- Photo deletion UI (replaced by uploading a new one)
- Supporting this template for non-wedding event kinds
