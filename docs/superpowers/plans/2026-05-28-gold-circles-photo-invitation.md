# Gold Circles Photo Invitation Template Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `wedding-invite-gold-circles-photo` invitation template where users upload and crop their couple photo, which renders inside a gold double-ring circle frame on the printed invitation.

**Architecture:** The background asset (gold circles, confetti, textured white) is stored as a static PNG in `/public/print-backgrounds/`. The user's couple photo is uploaded to the existing `event-media` Supabase bucket via a new API route; the storage path and crop settings (x, y, scale as strings) are stored in the existing `field_values` JSONB column on `event_print_template_instances`. The print sheet renders the background, overlays the user's photo in a circle at the correct position, and shows text below.

**Tech Stack:** Next.js (App Router), React, TypeScript, Supabase (storage + DB), Vitest, CSS modules (single `print-sheet.css` file)

---

## File Map

| Action | Path |
|--------|------|
| Create | `public/print-backgrounds/wedding-gold-circles-photo.png` |
| Modify | `lib/event-print/template-catalog.ts` |
| Modify | `lib/event-print/template-catalog.test.ts` |
| Modify | `lib/app-ui/en.ts` |
| Modify | `lib/app-ui/hr.ts` |
| Modify | `lib/app-ui/de.ts` |
| Create | `app/api/events/[id]/invite-photo-upload/route.ts` |
| Modify | `app/(app)/events/[id]/print/print-sheet.css` |
| Create | `app/(app)/events/[id]/print/WeddingInviteGoldCirclesPhotoPrintSheet.tsx` |
| Create | `app/(app)/events/[id]/_tabs/InvitePhotoUpload.tsx` |
| Modify | `app/(app)/events/[id]/_tabs/InvitationEventDetailsModal.tsx` |
| Modify | `app/(app)/events/[id]/_tabs/PrintsTab.tsx` |
| Modify | `app/(app)/events/[id]/print/page.tsx` |

---

## Task 1: Save background asset

**Files:**
- Create: `public/print-backgrounds/wedding-gold-circles-photo.png`

- [ ] **Step 1: Save the image**

Save the provided background image (the second image — gold double-ring circle with confetti on textured white, with the sample couple inside the circle) to:
```
public/print-backgrounds/wedding-gold-circles-photo.png
```

- [ ] **Step 2: Verify**

```bash
ls -lh public/print-backgrounds/wedding-gold-circles-photo.png
```
Expected: file exists, size > 0.

- [ ] **Step 3: Commit**

```bash
git add public/print-backgrounds/wedding-gold-circles-photo.png
git commit -m "feat: add gold circles photo invitation background asset"
```

---

## Task 2: Register template in catalog

**Files:**
- Modify: `lib/event-print/template-catalog.ts`
- Modify: `lib/event-print/template-catalog.test.ts`

- [ ] **Step 1: Write failing tests**

Open `lib/event-print/template-catalog.test.ts` and add inside the `describe("template-catalog", ...)` block:

```ts
it("lists gold-circles-photo template for wedding events", () => {
  const ids = listPrintTemplatesForEventKind("wedding").map((t) => t.id);
  expect(ids).toContain("wedding-invite-gold-circles-photo");
});

it("classifies gold-circles-photo as invitation", () => {
  expect(isInvitationPrintTemplateId("wedding-invite-gold-circles-photo")).toBe(true);
});
```

And add inside `describe("validatePrintTemplateFieldValues", ...)`:

```ts
it("validates gold-circles-photo with partner names and photo path", () => {
  const result = validatePrintTemplateFieldValues("wedding-invite-gold-circles-photo", {
    partner_a: "Sofia",
    partner_b: "Tarun",
    couple_photo_path: "abc123/invite-photo/img.jpg",
    couple_photo_crop_x: "0",
    couple_photo_crop_y: "0",
    couple_photo_crop_scale: "1",
  });
  expect(result.ok).toBe(true);
});

it("rejects gold-circles-photo missing required partner_b", () => {
  const result = validatePrintTemplateFieldValues("wedding-invite-gold-circles-photo", {
    partner_a: "Sofia",
  });
  expect(result.ok).toBe(false);
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- --reporter=verbose 2>&1 | grep -A3 "gold-circles"
```
Expected: tests fail with "unknown template" or similar.

- [ ] **Step 3: Register the template**

In `lib/event-print/template-catalog.ts`, add `"wedding-invite-gold-circles-photo"` to the `INVITATION_PRINT_TEMPLATE_IDS` array (after `"wedding-invite-olive-gold-frame"`):

```ts
export const INVITATION_PRINT_TEMPLATE_IDS = [
  "wedding-invite-blue-floral",
  "wedding-invite-geometric",
  "wedding-invite-watercolor-coast",
  "wedding-invite-navy-botanical",
  "wedding-invite-grayscale-glitter",
  "wedding-invite-terra-pill",
  "wedding-invite-gold-arch-floral",
  "wedding-invite-cherry-blossom",
  "wedding-invite-olive-gold-frame",
  "wedding-invite-gold-circles-photo",
] as const;
```

Then add the definition to `PRINT_TEMPLATE_DEFINITIONS` (after the `wedding-invite-olive-gold-frame` entry):

```ts
{
  id: "wedding-invite-gold-circles-photo",
  category: "invitation",
  eventKinds: ["wedding"],
  fields: [
    { key: "partner_a", maxLength: 80, required: true },
    { key: "partner_b", maxLength: 80, required: true },
    { key: "venue", maxLength: 200, required: false },
    { key: "extra_line", maxLength: 120, required: false },
    { key: "couple_photo_path", maxLength: 500, required: false },
    { key: "couple_photo_crop_x", maxLength: 30, required: false },
    { key: "couple_photo_crop_y", maxLength: 30, required: false },
    { key: "couple_photo_crop_scale", maxLength: 30, required: false },
  ],
  stripePriceEnvKey: null,
},
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test -- --reporter=verbose 2>&1 | grep -A3 "gold-circles"
```
Expected: all 4 new tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/event-print/template-catalog.ts lib/event-print/template-catalog.test.ts
git commit -m "feat: register wedding-invite-gold-circles-photo template"
```

---

## Task 3: Add string keys to all locale files

**Files:**
- Modify: `lib/app-ui/en.ts`
- Modify: `lib/app-ui/hr.ts`
- Modify: `lib/app-ui/de.ts`

- [ ] **Step 1: Add to `en.ts` — printsTab section**

After line `templateWeddingInviteOliveGoldFrame: "Wedding invitation · olive & gold frame",` (around line 321), add:
```ts
templateWeddingInviteGoldCirclesPhoto: "Wedding invitation · gold circles & photo",
```

After line `templateWeddingInviteOliveGoldFrame: "Wedding · olive & gold frame",` (around line 792 in the `print:` section), add:
```ts
templateWeddingInviteGoldCirclesPhoto: "Wedding · gold circles",
```

- [ ] **Step 2: Add to `en.ts` — print section strings**

After `inviteReceptionFollow: "Reception to follow",` (around line 817), add:
```ts
inviteGoldCirclesYoureInvited: "You're invited to the wedding of",
inviteGoldCirclesUploadPhoto: "Upload photo",
inviteGoldCirclesChangePhoto: "Change photo",
inviteGoldCirclesUploading: "Uploading…",
inviteGoldCirclesUploadError: "Upload failed. Try again.",
```

- [ ] **Step 3: Add to `hr.ts`**

After `templateWeddingInviteOliveGoldFrame: "Pozivnica za vjenčanje · maslina i zlatni okvir",` (around line 324), add:
```ts
templateWeddingInviteGoldCirclesPhoto: "Pozivnica za vjenčanje · zlatni krugovi i foto",
```

After `templateWeddingInviteOliveGoldFrame: "Vjenčanje · maslina i zlato",` (around line 805), add:
```ts
templateWeddingInviteGoldCirclesPhoto: "Vjenčanje · zlatni krugovi",
inviteGoldCirclesYoureInvited: "Pozivamo vas na vjenčanje",
inviteGoldCirclesUploadPhoto: "Dodaj fotografiju",
inviteGoldCirclesChangePhoto: "Promijeni fotografiju",
inviteGoldCirclesUploading: "Učitavam…",
inviteGoldCirclesUploadError: "Učitavanje nije uspjelo. Pokušaj ponovno.",
```

- [ ] **Step 4: Add to `de.ts`**

After `templateWeddingInviteOliveGoldFrame: "Hochzeitseinladung · Olive & Goldrahmen",` (around line 330), add:
```ts
templateWeddingInviteGoldCirclesPhoto: "Hochzeitseinladung · Goldkreise & Foto",
```

After `templateWeddingInviteOliveGoldFrame: "Hochzeit · Olive & Gold",` (around line 819), add:
```ts
templateWeddingInviteGoldCirclesPhoto: "Hochzeit · Goldkreise",
inviteGoldCirclesYoureInvited: "Ihr seid eingeladen zur Hochzeit von",
inviteGoldCirclesUploadPhoto: "Foto hochladen",
inviteGoldCirclesChangePhoto: "Foto ändern",
inviteGoldCirclesUploading: "Wird hochgeladen…",
inviteGoldCirclesUploadError: "Upload fehlgeschlagen. Erneut versuchen.",
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep "app-ui\|en.ts\|hr.ts\|de.ts" | head -10
```
Expected: no errors about missing keys.

- [ ] **Step 6: Commit**

```bash
git add lib/app-ui/en.ts lib/app-ui/hr.ts lib/app-ui/de.ts
git commit -m "feat: add string keys for gold circles photo invitation"
```

---

## Task 4: Create invite photo upload API route

**Files:**
- Create: `app/api/events/[id]/invite-photo-upload/route.ts`

- [ ] **Step 1: Create the file**

```ts
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSupabaseAuthServerClient } from "@/lib/supabase-auth-server";

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: eventId } = await ctx.params;

  const authClient = getSupabaseAuthServerClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { data: eventRow } = await authClient
    .from("events")
    .select("id, organizer_id")
    .eq("id", eventId)
    .maybeSingle();

  if (!eventRow) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  const organizerId =
    typeof (eventRow as { organizer_id?: unknown }).organizer_id === "string"
      ? (eventRow as { organizer_id: string }).organizer_id
      : "";

  if (!organizerId || organizerId !== user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large. Max 10 MB." }, { status: 400 });
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const storagePath = `${eventId}/invite-photo/${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadErr } = await authClient.storage
    .from("event-media")
    .upload(storagePath, buffer, { contentType: file.type, upsert: false });

  if (uploadErr) {
    console.error("[invite-photo-upload] storage upload failed", uploadErr);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }

  return NextResponse.json({ path: storagePath });
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep "invite-photo-upload" | head -5
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/events/\[id\]/invite-photo-upload/route.ts
git commit -m "feat: add invite-photo-upload API route"
```

---

## Task 5: Add CSS for the print sheet

**Files:**
- Modify: `app/(app)/events/[id]/print/print-sheet.css`

- [ ] **Step 1: Append CSS section at end of file**

Add the following block at the very end of `print-sheet.css`:

```css
/* --- Wedding invitation: gold circles photo --- */

.print-invite-outer.print-invite-gold-circles {
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
  overflow: hidden;
  border-radius: 4px;
  border: 1px solid rgba(180, 150, 60, 0.22);
  box-shadow: 0 16px 48px rgba(80, 60, 20, 0.14);
  container-type: inline-size;
  container-name: invite-gold-circles;
}

.print-invite-outer.print-invite-gold-circles--a4 {
  width: min(100%, 210mm);
  max-width: 210mm;
  aspect-ratio: 210 / 297;
  height: auto;
}

.print-invite-outer.print-invite-gold-circles--letter {
  width: min(100%, 8.5in);
  max-width: 8.5in;
  aspect-ratio: 8.5 / 11;
  height: auto;
}

@media print {
  .print-invite-outer.print-invite-gold-circles--a4 {
    width: 210mm;
    height: 297mm;
    max-width: 210mm;
    aspect-ratio: auto;
    border-radius: 0;
    border: none;
    box-shadow: none;
  }

  .print-invite-outer.print-invite-gold-circles--letter {
    width: 8.5in;
    height: 11in;
    max-width: none;
    aspect-ratio: auto;
    border-radius: 0;
    border: none;
    box-shadow: none;
  }

  .print-invite-gold-circles__card {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
}

.print-invite-gold-circles__card {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-height: 100%;
  position: relative;
  background-color: #f5f2ee;
  background-image: url("/print-backgrounds/wedding-gold-circles-photo.png");
  background-size: cover;
  background-position: center top;
  background-repeat: no-repeat;
  color: #2a2a2a;
  text-align: center;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/*
  Photo frame: positioned over the gold circle in the background.
  Adjust left/top/width if the background image is cropped differently.
  Center is ~50% x, ~30% from top; diameter ~72% of card width.
*/
.print-invite-gold-circles__photoFrame {
  position: absolute;
  left: 50%;
  top: 30%;
  width: 72%;
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  overflow: hidden;
  pointer-events: none;
}

.print-invite-gold-circles__photo {
  position: absolute;
  width: calc(var(--gc-scale, 1) * 100%);
  height: calc(var(--gc-scale, 1) * 100%);
  object-fit: cover;
  top: 50%;
  left: 50%;
  transform: translate(
    calc(-50% + var(--gc-crop-x, 0px)),
    calc(-50% + var(--gc-crop-y, 0px))
  );
  user-select: none;
  pointer-events: none;
}

/* Text zone: bottom portion of the card */
.print-invite-gold-circles__textZone {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  top: 57%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 8% 6%;
  gap: 0;
}

.print-invite-gold-circles__preamble {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-style: italic;
  font-size: clamp(0.6rem, 2.2cqw, 0.9rem);
  color: #3a3a3a;
  margin: 0 0 0.4em;
  letter-spacing: 0.01em;
}

.print-invite-gold-circles__names {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-weight: 700;
  font-size: clamp(1.1rem, 4.5cqw, 2rem);
  color: #1a1a1a;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin: 0 0 0.35em;
  line-height: 1.1;
}

.print-invite-gold-circles__dateLine {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(0.58rem, 2cqw, 0.85rem);
  color: #3a3a3a;
  margin: 0 0 0.2em;
  letter-spacing: 0.02em;
}

.print-invite-gold-circles__venueLine {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(0.58rem, 2cqw, 0.85rem);
  color: #3a3a3a;
  margin: 0 0 0.2em;
  letter-spacing: 0.02em;
}

.print-invite-gold-circles__extraLine {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-style: italic;
  font-size: clamp(0.58rem, 2cqw, 0.85rem);
  color: #3a3a3a;
  margin: 0.15em 0 0;
  letter-spacing: 0.02em;
}
```

- [ ] **Step 2: Verify no CSS syntax errors**

```bash
npx next build 2>&1 | grep -i "css\|error" | head -10
```
Or just check the file opens in the browser without parse errors in the next dev step.

- [ ] **Step 3: Commit**

```bash
git add "app/(app)/events/[id]/print/print-sheet.css"
git commit -m "feat: add CSS for gold circles photo print sheet"
```

---

## Task 6: Create the print sheet component

**Files:**
- Create: `app/(app)/events/[id]/print/WeddingInviteGoldCirclesPhotoPrintSheet.tsx`

- [ ] **Step 1: Create the component**

```tsx
import type { CSSProperties } from "react";

import type { Locale } from "@/lib/i18n";
import type { PrintPaperId } from "@/lib/event-print/print-options";
import {
  type InvitationFieldVisibility,
  showInvitationField,
} from "@/lib/event-print/invitation-field-visibility";
import { formatEventDateForPrintField } from "@/lib/event-print/print-field-defaults";

export type WeddingInviteGoldCirclesPhotoStrings = Readonly<{
  youreInvited: string;
  and: string;
  receptionToFollow: string;
}>;

type Props = Readonly<{
  paper: PrintPaperId;
  partnerA: string;
  partnerB: string;
  venue: string;
  extraLine: string;
  eventDateIso: string;
  locale: Locale;
  photoUrl: string | null;
  cropX: number;
  cropY: number;
  cropScale: number;
  strings: WeddingInviteGoldCirclesPhotoStrings;
  visibility: InvitationFieldVisibility;
}>;

function PrintPageRules({ paper }: Readonly<{ paper: PrintPaperId }>) {
  const pageDecl =
    paper === "letter"
      ? "@page { size: letter portrait; margin: 0; }"
      : "@page { size: 210mm 297mm portrait; margin: 0; }";
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `@media print { ${pageDecl} }`,
      }}
    />
  );
}

export function WeddingInviteGoldCirclesPhotoPrintSheet({
  paper,
  partnerA,
  partnerB,
  venue,
  extraLine,
  eventDateIso,
  locale,
  photoUrl,
  cropX,
  cropY,
  cropScale,
  strings,
  visibility,
}: Props) {
  const show = (key: Parameters<typeof showInvitationField>[1]) =>
    showInvitationField(visibility, key);

  const a = partnerA.trim();
  const b = partnerB.trim();
  const dateLine = show("event_date") ? formatEventDateForPrintField(eventDateIso, locale) : null;

  const paperMod =
    paper === "letter"
      ? "print-invite-gold-circles--letter"
      : "print-invite-gold-circles--a4";

  const photoFrameStyle: CSSProperties = {
    "--gc-scale": cropScale,
    "--gc-crop-x": `${cropX}px`,
    "--gc-crop-y": `${cropY}px`,
  } as CSSProperties;

  return (
    <>
      <PrintPageRules paper={paper} />
      <div className={`print-invite-outer print-invite-gold-circles ${paperMod}`}>
        <article
          className="print-invite-gold-circles__card"
          data-template="wedding-invite-gold-circles-photo"
        >
          {/* User photo overlay inside the circular frame */}
          {photoUrl ? (
            <div className="print-invite-gold-circles__photoFrame" style={photoFrameStyle}>
              <img
                src={photoUrl}
                alt=""
                className="print-invite-gold-circles__photo"
                draggable={false}
              />
            </div>
          ) : null}

          {/* Text zone */}
          <div className="print-invite-gold-circles__textZone">
            {show("invite_preamble") ? (
              <p className="print-invite-gold-circles__preamble">{strings.youreInvited}</p>
            ) : null}

            {show("partner_names") ? (
              <p className="print-invite-gold-circles__names">
                {a.toUpperCase() || " "}&nbsp;{strings.and.toUpperCase()}&nbsp;{b.toUpperCase() || " "}
              </p>
            ) : null}

            {dateLine ? (
              <p className="print-invite-gold-circles__dateLine">{dateLine}</p>
            ) : null}

            {show("venue") && venue.trim() ? (
              <p className="print-invite-gold-circles__venueLine">{venue.trim()}</p>
            ) : null}

            {show("extra_line") && extraLine.trim() ? (
              <p className="print-invite-gold-circles__extraLine">{extraLine.trim()}</p>
            ) : null}

            {show("reception") ? (
              <p className="print-invite-gold-circles__extraLine">{strings.receptionToFollow}</p>
            ) : null}
          </div>
        </article>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Check TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep "GoldCircles" | head -10
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "app/(app)/events/[id]/print/WeddingInviteGoldCirclesPhotoPrintSheet.tsx"
git commit -m "feat: add WeddingInviteGoldCirclesPhotoPrintSheet component"
```

---

## Task 7: Create InvitePhotoUpload component

**Files:**
- Create: `app/(app)/events/[id]/_tabs/InvitePhotoUpload.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type Props = Readonly<{
  eventId: string;
  savedPhotoPath: string;
  savedCropX: string;
  savedCropY: string;
  savedCropScale: string;
  uploadLabel: string;
  changeLabel: string;
  uploadingLabel: string;
  uploadErrorLabel: string;
  onPathChange: (path: string) => void;
  onCropChange: (x: string, y: string, scale: string) => void;
  onPreviewUrlChange: (url: string | null) => void;
}>;

const CIRCLE_PX = 200;

export function InvitePhotoUpload({
  eventId,
  savedPhotoPath,
  savedCropX,
  savedCropY,
  savedCropScale,
  uploadLabel,
  changeLabel,
  uploadingLabel,
  uploadErrorLabel,
  onPathChange,
  onCropChange,
  onPreviewUrlChange,
}: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropX, setCropX] = useState(parseFloat(savedCropX) || 0);
  const [cropY, setCropY] = useState(parseFloat(savedCropY) || 0);
  const [cropScale, setCropScale] = useState(parseFloat(savedCropScale) || 1);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; baseCropX: number; baseCropY: number } | null>(null);
  const isDragging = dragRef.current !== null;

  // Restore saved photo on mount
  useEffect(() => {
    if (!savedPhotoPath) return;
    const supabase = getSupabaseBrowserClient();
    void supabase.storage
      .from("event-media")
      .createSignedUrl(savedPhotoPath, 3600)
      .then(({ data }) => {
        if (data?.signedUrl) {
          setPreviewUrl(data.signedUrl);
          onPreviewUrlChange(data.signedUrl);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedPhotoPath]);

  // Restore saved crop values when they change externally
  useEffect(() => {
    setCropX(parseFloat(savedCropX) || 0);
    setCropY(parseFloat(savedCropY) || 0);
    setCropScale(parseFloat(savedCropScale) || 1);
  }, [savedCropX, savedCropY, savedCropScale]);

  async function handleFile(file: File) {
    setUploadError(null);
    const blob = URL.createObjectURL(file);
    setPreviewUrl(blob);
    onPreviewUrlChange(blob);
    setCropX(0);
    setCropY(0);
    setCropScale(1);
    onCropChange("0", "0", "1");

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/events/${eventId}/invite-photo-upload`, {
        method: "POST",
        body: fd,
      });
      const json = (await res.json()) as { path?: string; error?: string };
      if (!res.ok || !json.path) throw new Error(json.error ?? "Upload failed");
      onPathChange(json.path);
    } catch {
      setUploadError(uploadErrorLabel);
    } finally {
      setUploading(false);
    }
  }

  function onMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startY: e.clientY, baseCropX: cropX, baseCropY: cropY };
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!dragRef.current) return;
    const newX = dragRef.current.baseCropX + (e.clientX - dragRef.current.startX);
    const newY = dragRef.current.baseCropY + (e.clientY - dragRef.current.startY);
    setCropX(newX);
    setCropY(newY);
    onCropChange(String(newX), String(newY), String(cropScale));
  }

  function onMouseUp() {
    dragRef.current = null;
  }

  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    const next = Math.max(0.5, Math.min(5, cropScale - e.deltaY * 0.002));
    setCropScale(next);
    onCropChange(String(cropX), String(cropY), String(next));
  }

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      style={{ display: "none" }}
      onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) void handleFile(f);
        e.target.value = "";
      }}
    />
  );

  if (!previewUrl) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          style={{
            width: CIRCLE_PX,
            height: CIRCLE_PX,
            borderRadius: "50%",
            border: "2px dashed var(--app-gold)",
            background: "transparent",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            color: "var(--app-gold)",
          }}
          aria-label={uploadLabel}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <span style={{ fontSize: 12, fontWeight: 600 }}>{uploadLabel}</span>
        </button>
        {fileInput}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: CIRCLE_PX,
          height: CIRCLE_PX,
          borderRadius: "50%",
          overflow: "hidden",
          position: "relative",
          cursor: isDragging ? "grabbing" : "grab",
          border: "2px solid var(--app-gold)",
          flexShrink: 0,
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
      >
        <img
          src={previewUrl}
          alt=""
          draggable={false}
          style={{
            position: "absolute",
            width: `${cropScale * 100}%`,
            height: `${cropScale * 100}%`,
            objectFit: "cover",
            top: "50%",
            left: "50%",
            transform: `translate(calc(-50% + ${cropX}px), calc(-50% + ${cropY}px))`,
            userSelect: "none",
            pointerEvents: "none",
          }}
        />
        {uploading ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
            }}
          >
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>{uploadingLabel}</span>
          </div>
        ) : null}
      </div>

      {uploadError ? (
        <p style={{ fontSize: 11, color: "var(--app-danger)", margin: 0 }}>{uploadError}</p>
      ) : null}

      <p style={{ fontSize: 10, color: "var(--app-muted)", margin: 0, textAlign: "center" }}>
        Drag to reposition · Scroll to zoom
      </p>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        style={{
          fontSize: 12,
          color: "var(--app-gold)",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontWeight: 600,
          padding: 0,
        }}
      >
        {changeLabel}
      </button>
      {fileInput}
    </div>
  );
}
```

- [ ] **Step 2: Check TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep "InvitePhotoUpload" | head -10
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "app/(app)/events/[id]/_tabs/InvitePhotoUpload.tsx"
git commit -m "feat: add InvitePhotoUpload component"
```

---

## Task 8: Wire InvitePhotoUpload into InvitationEventDetailsModal

**Files:**
- Modify: `app/(app)/events/[id]/_tabs/InvitationEventDetailsModal.tsx`

- [ ] **Step 1: Add import and new props**

At the top of the file, add the import:
```ts
import { InvitePhotoUpload } from "./InvitePhotoUpload";
```

Add these props to `InvitationEventDetailsModalProps`:
```ts
showPhotoUpload: boolean;
eventId: string;
couplePhotoPath: string;
couplePhotoCropX: string;
couplePhotoCropY: string;
couplePhotoCropScale: string;
onPathChange: (path: string) => void;
onCropChange: (x: string, y: string, scale: string) => void;
onPreviewUrlChange: (url: string | null) => void;
```

Add them to the destructured parameters in `InvitationEventDetailsModal(...)`.

- [ ] **Step 2: Add photo upload section to modal body**

Inside `<div className="pf-card pf-card--in-modal">`, add a new section **before** the existing `{/* 01 — Show on invitation */}` block:

```tsx
{showPhotoUpload ? (
  <div className="pf-section">
    <div className="pf-section-header">
      <span className="pf-section-num">00</span>
      <span className="pf-section-title">{ui.print.inviteGoldCirclesUploadPhoto}</span>
      <span className="pf-section-rule" />
    </div>
    <div style={{ display: "flex", justifyContent: "center", padding: "16px 0" }}>
      <InvitePhotoUpload
        eventId={eventId}
        savedPhotoPath={couplePhotoPath}
        savedCropX={couplePhotoCropX}
        savedCropY={couplePhotoCropY}
        savedCropScale={couplePhotoCropScale}
        uploadLabel={ui.print.inviteGoldCirclesUploadPhoto}
        changeLabel={ui.print.inviteGoldCirclesChangePhoto}
        uploadingLabel={ui.print.inviteGoldCirclesUploading}
        uploadErrorLabel={ui.print.inviteGoldCirclesUploadError}
        onPathChange={onPathChange}
        onCropChange={onCropChange}
        onPreviewUrlChange={onPreviewUrlChange}
      />
    </div>
  </div>
) : null}
```

- [ ] **Step 3: Check TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep "InvitationEventDetailsModal\|InvitePhotoUpload" | head -10
```
Expected: errors pointing at `PrintsTab` (not yet updated). That is fine for now — the modal itself should have no errors.

- [ ] **Step 4: Commit**

```bash
git add "app/(app)/events/[id]/_tabs/InvitationEventDetailsModal.tsx"
git commit -m "feat: add photo upload section to InvitationEventDetailsModal"
```

---

## Task 9: Wire PrintsTab

**Files:**
- Modify: `app/(app)/events/[id]/_tabs/PrintsTab.tsx`

- [ ] **Step 1: Add imports**

At the top of `PrintsTab.tsx`, add:
```ts
import { WeddingInviteGoldCirclesPhotoPrintSheet } from "../print/WeddingInviteGoldCirclesPhotoPrintSheet";
import { maybeCreateSupabaseBrowserClient } from "@/lib/supabase-browser";
```

- [ ] **Step 2: Add `templateCardTitle` case**

In the `templateCardTitle` function, add before the `default` case:
```ts
case "wedding-invite-gold-circles-photo": return tab.templateWeddingInviteGoldCirclesPhoto;
```

- [ ] **Step 3: Add `initSharedFields` draft source**

In `initSharedFields`, extend the draft lookup chain to also check the gold-circles-photo draft:
```ts
const draft =
  drafts["wedding-invite-olive-gold-frame"] ??
  drafts["wedding-invite-cherry-blossom"] ??
  drafts["wedding-invite-gold-arch-floral"] ??
  drafts["wedding-invite-terra-pill"] ??
  drafts["wedding-invite-grayscale-glitter"] ??
  drafts["wedding-invite-navy-botanical"] ??
  drafts["wedding-invite-blue-floral"] ??
  drafts["wedding-invite-geometric"] ??
  drafts["wedding-invite-gold-circles-photo"] ??
  {};
```

- [ ] **Step 4: Add state for photo preview URL and Supabase client**

Inside the `PrintsTab` component, after the existing state declarations, add:
```ts
const supabase = useMemo(() => maybeCreateSupabaseBrowserClient(), []);
const [couplePhotoPreviewUrl, setCouplePhotoPreviewUrl] = useState<string | null>(null);
```

Add a `useEffect` to fetch the signed URL when the saved path changes:
```ts
useEffect(() => {
  const path = sharedFields.couple_photo_path;
  if (!path || !supabase) {
    setCouplePhotoPreviewUrl(null);
    return;
  }
  void supabase.storage
    .from("event-media")
    .createSignedUrl(path, 3600)
    .then(({ data }) => {
      if (data?.signedUrl) setCouplePhotoPreviewUrl(data.signedUrl);
    });
}, [sharedFields.couple_photo_path, supabase]);
```

- [ ] **Step 5: Add crop-change handler**

Below the existing `setField` function, add:
```ts
function setCropFields(x: string, y: string, scale: string) {
  setSaveHint(null);
  setSharedFields((prev) => ({
    ...prev,
    couple_photo_crop_x: x,
    couple_photo_crop_y: y,
    couple_photo_crop_scale: scale,
  }));
}
```

- [ ] **Step 6: Add preview case in `renderInvitePreview`**

In `renderInvitePreview`, add before `return null`:
```ts
if (t.id === "wedding-invite-gold-circles-photo") {
  return (
    <WeddingInviteGoldCirclesPhotoPrintSheet
      paper="a4"
      partnerA={sharedFields.partner_a ?? ""}
      partnerB={sharedFields.partner_b ?? ""}
      venue={sharedFields.venue ?? ""}
      extraLine={sharedFields.extra_line ?? ""}
      eventDateIso={eventDateIso}
      locale={uiLocale}
      photoUrl={couplePhotoPreviewUrl}
      cropX={parseFloat(sharedFields.couple_photo_crop_x ?? "") || 0}
      cropY={parseFloat(sharedFields.couple_photo_crop_y ?? "") || 0}
      cropScale={parseFloat(sharedFields.couple_photo_crop_scale ?? "") || 1}
      strings={{
        youreInvited: ui.print.inviteGoldCirclesYoureInvited,
        and: ui.print.inviteAnd,
        receptionToFollow: ui.print.inviteReceptionFollow,
      }}
      visibility={fieldVisibility}
    />
  );
}
```

- [ ] **Step 7: Pass new props to InvitationEventDetailsModal**

Find the `<InvitationEventDetailsModal` usage and add the new props:
```tsx
<InvitationEventDetailsModal
  open={detailsOpen}
  onClose={() => setDetailsOpen(false)}
  sharedFields={sharedFields}
  setField={setField}
  setVisibility={setVisibility}
  collapsedSections={collapsedSections}
  toggleSection={toggleSection}
  saving={saving}
  saveError={saveError}
  saveHint={saveHint}
  onSave={() => void saveAllDrafts()}
  showPhotoUpload={invitationTemplates.some((t) => t.id === "wedding-invite-gold-circles-photo")}
  eventId={eventId}
  couplePhotoPath={sharedFields.couple_photo_path ?? ""}
  couplePhotoCropX={sharedFields.couple_photo_crop_x ?? ""}
  couplePhotoCropY={sharedFields.couple_photo_crop_y ?? ""}
  couplePhotoCropScale={sharedFields.couple_photo_crop_scale ?? ""}
  onPathChange={(path) => setField("couple_photo_path", path)}
  onCropChange={setCropFields}
  onPreviewUrlChange={setCouplePhotoPreviewUrl}
/>
```

- [ ] **Step 8: Check TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep "PrintsTab\|InvitationEventDetailsModal" | head -10
```
Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add "app/(app)/events/[id]/_tabs/PrintsTab.tsx"
git commit -m "feat: wire gold-circles-photo template into PrintsTab"
```

---

## Task 10: Wire the print page

**Files:**
- Modify: `app/(app)/events/[id]/print/page.tsx`

- [ ] **Step 1: Add import**

At the top of `page.tsx`, add:
```ts
import { WeddingInviteGoldCirclesPhotoPrintSheet } from "./WeddingInviteGoldCirclesPhotoPrintSheet";
```

- [ ] **Step 2: Add photo resolution and JSX branch**

Since `page.tsx` is an async server component, resolve the photo URL before the `return` statement. Add this block right after `const eventDateIso = ...` (near the bottom of the function, before `return`):

```tsx
let goldCirclesPhotoUrl: string | null = null;
if (isInvitationPrint && mergedInvitation && routeTemplate === "wedding-invite-gold-circles-photo") {
  const photoPath = mergedInvitation.couple_photo_path ?? "";
  if (photoPath) {
    const { data: urlData } = await supabase.storage
      .from("event-media")
      .createSignedUrl(photoPath, 3600);
    goldCirclesPhotoUrl = urlData?.signedUrl ?? null;
  }
}
```

Then in the long conditional chain inside the JSX, add a new branch **before** the final `<EventPrintSheet ...` fallback — after the `wedding-invite-blue-floral` block closing `)`:

```tsx
) : isInvitationPrint && mergedInvitation && routeTemplate === "wedding-invite-gold-circles-photo" ? (
  <WeddingInviteGoldCirclesPhotoPrintSheet
    paper={paper}
    partnerA={mergedInvitation.partner_a ?? ""}
    partnerB={mergedInvitation.partner_b ?? ""}
    venue={mergedInvitation.venue ?? ""}
    extraLine={mergedInvitation.extra_line ?? ""}
    eventDateIso={eventDateIso}
    locale={posterLocale}
    photoUrl={goldCirclesPhotoUrl}
    cropX={parseFloat(mergedInvitation.couple_photo_crop_x ?? "") || 0}
    cropY={parseFloat(mergedInvitation.couple_photo_crop_y ?? "") || 0}
    cropScale={parseFloat(mergedInvitation.couple_photo_crop_scale ?? "") || 1}
    strings={{
      youreInvited: posterPrint.inviteGoldCirclesYoureInvited,
      and: posterPrint.inviteAnd,
      receptionToFollow: posterPrint.inviteReceptionFollow,
    }}
    visibility={inviteVisibility}
  />
```

- [ ] **Step 4: Check TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep "print/page\|GoldCircles" | head -10
```
Expected: no errors.

- [ ] **Step 5: Run all tests**

```bash
npm test
```
Expected: all tests pass (no regressions).

- [ ] **Step 6: Final commit**

```bash
git add "app/(app)/events/[id]/print/page.tsx"
git commit -m "feat: wire gold-circles-photo template into print page"
```

---

## Visual Tuning Checklist (after code is wired up)

After running the dev server, open the Prints tab and navigate to the gold circles template:

- [ ] **Photo circle alignment:** Open the modal, upload a photo. In the carousel preview, confirm the circle overlays the gold ring frame in the background image. If the circle is offset, adjust `.print-invite-gold-circles__photoFrame` `left`, `top`, and `width` values in `print-sheet.css`.
- [ ] **Text position:** Confirm text renders in the white/off-white area below the circle. Adjust `.print-invite-gold-circles__textZone` `top` if the text overlaps the image.
- [ ] **Print preview:** Open `/events/{id}/print?template=wedding-invite-gold-circles-photo`, confirm photo and text render correctly.
- [ ] **No photo state:** With no photo uploaded, confirm the background's sample couple shows through naturally (the `.print-invite-gold-circles__photoFrame` div is not rendered).
