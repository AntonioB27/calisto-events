# Creating a New Invitation Template

**Skip all brainstorming and planning.** No design docs, no implementation plans, no spec files. Go straight to code.

The user sends two images: one with text (reference) and one without text (the background asset). Build the template immediately.

---

## Template ID convention

```
wedding-invite-{descriptor}
```

Examples: `wedding-invite-blue-floral`, `wedding-invite-gold-circles-photo`

---

## Files to touch (in order)

### 1. Save background image

```
public/print-backgrounds/wedding-{descriptor}.png
```

User must copy the second image (no-text version) here manually — you cannot extract binary images from chat. Tell them exactly where to put it and commit when done.

### 2. Register in template catalog

**`lib/event-print/template-catalog.ts`**

Add to `INVITATION_PRINT_TEMPLATE_IDS` array and add a definition to `PRINT_TEMPLATE_DEFINITIONS`:

```ts
{
  id: "wedding-invite-{descriptor}",
  category: "invitation",
  eventKinds: ["wedding"],
  fields: [
    { key: "partner_a", maxLength: 80, required: true },
    { key: "partner_b", maxLength: 80, required: true },
    { key: "venue", maxLength: 200, required: false },
    { key: "extra_line", maxLength: 120, required: false },
    // add extra fields as needed
  ],
  stripePriceEnvKey: null,
}
```

**`lib/event-print/template-catalog.test.ts`** — add tests for:
- `listPrintTemplatesForEventKind("wedding")` contains the new id
- `isInvitationPrintTemplateId(newId)` is true
- `validatePrintTemplateFieldValues` accepts valid input
- `validatePrintTemplateFieldValues` rejects missing required fields

### 3. Add locale strings

**`lib/app-ui/en.ts`** — add to BOTH sections:

In `printsTab:`:
```ts
templateWeddingInvite{CamelDescriptor}: "Wedding invitation · {label}",
```

In `print:`:
```ts
templateWeddingInvite{CamelDescriptor}: "Wedding · {short label}",
// plus any template-specific strings (preamble text, etc.)
```

**`lib/app-ui/hr.ts`** and **`lib/app-ui/de.ts`** — add identical keys with translations. The `AppUiDict` type is derived from `typeof en` — ALL three files must have the same keys or TypeScript breaks.

### 4. Add CSS

**`app/(app)/events/[id]/print/print-sheet.css`** — append at end of file.

CSS class naming: `.print-invite-{descriptor}__*`

Required structure:
```css
/* outer container */
.print-invite-outer.print-invite-{descriptor} { container-type: inline-size; ... }
.print-invite-outer.print-invite-{descriptor}--a4 { width: min(100%, 210mm); aspect-ratio: 210/297; }
.print-invite-outer.print-invite-{descriptor}--letter { width: min(100%, 8.5in); aspect-ratio: 8.5/11; }

@media print {
  .print-invite-outer.print-invite-{descriptor}--a4 { width: 210mm; height: 297mm; aspect-ratio: auto; border: none; box-shadow: none; }
  .print-invite-outer.print-invite-{descriptor}--letter { width: 8.5in; height: 11in; aspect-ratio: auto; border: none; box-shadow: none; }
  .print-invite-{descriptor}__card { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
}

/* card: uses background image from /print-backgrounds/ */
.print-invite-{descriptor}__card {
  width: 100%; height: 100%;
  background-image: url("/print-backgrounds/wedding-{descriptor}.png");
  background-size: cover;
  background-position: center top;
  ...
}
```

Use `cqw` units for font sizes. Use `clamp()` for responsive text.

### 5. Create print sheet component

**`app/(app)/events/[id]/print/WeddingInvite{CamelDescriptor}PrintSheet.tsx`**

Standard structure:
```tsx
import type { CSSProperties } from "react";
import type { Locale } from "@/lib/i18n";
import type { PrintPaperId } from "@/lib/event-print/print-options";
import { type InvitationFieldVisibility, showInvitationField } from "@/lib/event-print/invitation-field-visibility";
import { formatEventDateForPrintField } from "@/lib/event-print/print-field-defaults";

export type WeddingInvite{CamelDescriptor}Strings = Readonly<{ ... }>;

type Props = Readonly<{
  paper: PrintPaperId;
  partnerA: string; partnerB: string; venue: string; extraLine: string;
  eventDateIso: string; locale: Locale;
  strings: WeddingInvite{CamelDescriptor}Strings;
  visibility: InvitationFieldVisibility;
}>;

function PrintPageRules({ paper }: Readonly<{ paper: PrintPaperId }>) {
  const pageDecl = paper === "letter"
    ? "@page { size: letter portrait; margin: 0; }"
    : "@page { size: 210mm 297mm portrait; margin: 0; }";
  return <style dangerouslySetInnerHTML={{ __html: `@media print { ${pageDecl} }` }} />;
}

export function WeddingInvite{CamelDescriptor}PrintSheet({ paper, ... }: Props) {
  const show = (key: Parameters<typeof showInvitationField>[1]) => showInvitationField(visibility, key);
  const paperMod = paper === "letter" ? "print-invite-{descriptor}--letter" : "print-invite-{descriptor}--a4";
  return (
    <>
      <PrintPageRules paper={paper} />
      <div className={`print-invite-outer print-invite-{descriptor} ${paperMod}`}>
        <article className="print-invite-{descriptor}__card" data-template="wedding-invite-{descriptor}">
          {/* content */}
        </article>
      </div>
    </>
  );
}
```

### 6. Wire into PrintsTab

**`app/(app)/events/[id]/_tabs/PrintsTab.tsx`**

Four places to touch:

1. **Import** the new print sheet component
2. **`templateCardTitle`** switch: add `case "wedding-invite-{descriptor}": return tab.templateWeddingInvite{CamelDescriptor};`
3. **`initSharedFields`** draft lookup: add `drafts["wedding-invite-{descriptor}"] ??` to the chain
4. **`renderInvitePreview`**: add a new `if (t.id === "wedding-invite-{descriptor}")` branch returning the component (before `return null`)

### 7. Wire into print page

**`app/(app)/events/[id]/print/page.tsx`**

Two places:

1. **Import** the print sheet component
2. **JSX ternary chain**: insert a new `isInvitationPrint && mergedInvitation && routeTemplate === "wedding-invite-{descriptor}" ? (<WeddingInvite.../>)` branch just before the `<EventPrintSheet>` fallback. Use `visibility={inviteVisibility!}` (non-null assertion — same as sibling branches).

---

## Photo upload templates (special case)

When the template needs a user-uploaded couple photo (like `gold-circles-photo`):

**Extra field keys** in the template definition:
```ts
{ key: "couple_photo_path", maxLength: 500, required: false },
{ key: "couple_photo_crop_x", maxLength: 30, required: false },
{ key: "couple_photo_crop_y", maxLength: 30, required: false },
{ key: "couple_photo_crop_scale", maxLength: 30, required: false },
```

**Extra API route**: `app/api/events/[id]/invite-photo-upload/route.ts` already exists — reuse it. No new route needed.

**Photo in print sheet component** — CSS custom props `--gc-scale`, `--gc-crop-x`, `--gc-crop-y` on the photo frame div; the photo `<img>` uses them for positioning. See `WeddingInviteGoldCirclesPhotoPrintSheet.tsx` for the exact pattern.

**`InvitePhotoUpload` component** already exists at `app/(app)/events/[id]/_tabs/InvitePhotoUpload.tsx`. Reuse it.

**Extra wiring in PrintsTab**:
- `maybeCreateSupabaseBrowserClient()` to get signed URL from `sharedFields.couple_photo_path`
- `useEffect` to refetch signed URL when path changes
- `setCropFields` helper to update `couple_photo_crop_x/y/scale`
- Pass `showPhotoUpload`, `couplePhotoPath`, `couplePhotoCropX/Y/Scale`, `onPathChange`, `onCropChange`, `onPreviewUrlChange` to `InvitationEventDetailsModal`

**Extra wiring in InvitationEventDetailsModal** (`InvitationEventDetailsModal.tsx`):
- Add props above + render section "00" with `<InvitePhotoUpload>` when `showPhotoUpload` is true

**Extra wiring in print page**:
- Before `return`, resolve signed URL from `mergedInvitation.couple_photo_path` using the existing `supabase` client

---

## String key naming pattern

```ts
// printsTab (long label, shown in carousel and cards)
templateWeddingInvite{CamelDescriptor}: "Wedding invitation · {display name}",

// print (short label — must be different enough to distinguish)
templateWeddingInvite{CamelDescriptor}: "Wedding · {short name}",

// template-specific strings (preamble, connectors, etc.)
invite{CamelDescriptor}Preamble: "...",
```

---

## What to skip

- No `docs/superpowers/specs/` design doc
- No `docs/superpowers/plans/` implementation plan
- No brainstorming phase
- No subagent-driven development process for invitation templates — just write the code directly
- **No git commits** — the user handles all git operations

Go through the file list above top to bottom. Run `npx tsc --noEmit` after each file.
