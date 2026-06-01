# QR Print Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the QR code print page so each A4 half-card is polished and well-designed, with the QR code as the visual hero, a proper paper-like screen preview, and three selectable visual styles (`qr-clean`, `qr-gold`, `qr-dark`).

**Architecture:** Add three new `TableQrPrintTemplateId` values to the template catalog. `qr-clean` gets a full visual redesign (QR-hero layout); `qr-gold` and `qr-dark` share that layout and are wired to the picker but use identical CSS for now. The default template changes from `table-minimal` to `qr-clean`. The screen preview gets a dark-background desk wrapper.

**Tech Stack:** Next.js (App Router), React, TypeScript, CSS modules/global, `react-qr-code`, Vitest

---

## File map

| File | Change |
|---|---|
| `lib/event-print/template-catalog.ts` | Add `qr-clean`, `qr-gold`, `qr-dark` to `TABLE_QR_PRINT_TEMPLATE_IDS` and `PRINT_TEMPLATE_DEFINITIONS` |
| `lib/event-print/template-catalog.test.ts` | Tests for new IDs |
| `lib/event-print/print-options.ts` | Change `DEFAULT_POSTER_TEMPLATE` to `"qr-clean"` |
| `lib/event-print/print-options.test.ts` | Tests for new IDs and updated default |
| `lib/app-ui/en.ts` | Add `templateQrClean`, `templateQrGold`, `templateQrDark` labels |
| `lib/app-ui/hr.ts` | Same (Croatian) |
| `lib/app-ui/de.ts` | Same (German) |
| `app/(app)/events/[id]/print/PosterHalfCard.tsx` | QR-hero layout for `qr-*` templates; legacy layout for `table-*` |
| `app/(app)/events/[id]/print/print-sheet.css` | New CSS for `qr-clean/gold/dark`; `.print-sheet-desk` dark wrapper; improved screen preview |
| `app/(app)/events/[id]/print/EventPrintSheet.tsx` | Wrap sheet in `.print-sheet-desk` |
| `app/(app)/events/[id]/print/EventPrintToolbar.tsx` | Add new template buttons with labels |

---

## Task 1: Extend template catalog with `qr-clean`, `qr-gold`, `qr-dark`

**Files:**
- Modify: `lib/event-print/template-catalog.ts`
- Modify: `lib/event-print/template-catalog.test.ts`

- [ ] **Step 1: Write failing tests**

Add to `lib/event-print/template-catalog.test.ts`, inside `describe("template-catalog")`:

```typescript
it("classifies qr-clean/gold/dark as table_qr templates", () => {
  expect(isTableQrTemplateId("qr-clean")).toBe(true);
  expect(isTableQrTemplateId("qr-gold")).toBe(true);
  expect(isTableQrTemplateId("qr-dark")).toBe(true);
  expect(isInvitationPrintTemplateId("qr-clean")).toBe(false);
});

it("lists qr-clean for both generic and wedding events", () => {
  const genericIds = listPrintTemplatesForEventKind("generic").map((t) => t.id);
  const weddingIds = listPrintTemplatesForEventKind("wedding").map((t) => t.id);
  expect(genericIds).toContain("qr-clean");
  expect(genericIds).toContain("qr-gold");
  expect(genericIds).toContain("qr-dark");
  expect(weddingIds).toContain("qr-clean");
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd /Users/antoniobecic/repo/calisto-events && npx vitest run lib/event-print/template-catalog.test.ts
```

Expected: FAIL — `qr-clean` not found in `TABLE_QR_PRINT_TEMPLATE_IDS`.

- [ ] **Step 3: Extend `TABLE_QR_PRINT_TEMPLATE_IDS` and add definitions**

In `lib/event-print/template-catalog.ts`, replace lines 24–25:

```typescript
export const TABLE_QR_PRINT_TEMPLATE_IDS = [
  "table-minimal",
  "table-bold",
  "qr-clean",
  "qr-gold",
  "qr-dark",
] as const;
export type TableQrPrintTemplateId = (typeof TABLE_QR_PRINT_TEMPLATE_IDS)[number];
```

Inside `PRINT_TEMPLATE_DEFINITIONS`, after the `table-bold` entry (after line 56), add:

```typescript
  {
    id: "qr-clean",
    category: "table_qr",
    eventKinds: ["generic", "wedding"],
    fields: [],
    stripePriceEnvKey: null,
  },
  {
    id: "qr-gold",
    category: "table_qr",
    eventKinds: ["generic", "wedding"],
    fields: [],
    stripePriceEnvKey: null,
  },
  {
    id: "qr-dark",
    category: "table_qr",
    eventKinds: ["generic", "wedding"],
    fields: [],
    stripePriceEnvKey: null,
  },
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd /Users/antoniobecic/repo/calisto-events && npx vitest run lib/event-print/template-catalog.test.ts
```

Expected: All PASS.

---

## Task 2: Update default template and print-options tests

**Files:**
- Modify: `lib/event-print/print-options.ts`
- Modify: `lib/event-print/print-options.test.ts`

- [ ] **Step 1: Write failing tests**

Add to `lib/event-print/print-options.test.ts`, inside `describe("parsePrintRouteTemplate")`:

```typescript
it("accepts qr-clean, qr-gold, qr-dark", () => {
  expect(parsePrintRouteTemplate("qr-clean")).toBe("qr-clean");
  expect(parsePrintRouteTemplate("qr-gold")).toBe("qr-gold");
  expect(parsePrintRouteTemplate("qr-dark")).toBe("qr-dark");
});
```

Add inside `describe("parsePosterTemplate")`:

```typescript
it("accepts qr-clean", () => {
  expect(parsePosterTemplate("qr-clean")).toBe("qr-clean");
});
```

- [ ] **Step 2: Run to confirm they fail**

```bash
cd /Users/antoniobecic/repo/calisto-events && npx vitest run lib/event-print/print-options.test.ts
```

Expected: FAIL — `parsePrintRouteTemplate("qr-clean")` returns `"table-minimal"` (old default).

- [ ] **Step 3: Change `DEFAULT_POSTER_TEMPLATE` to `"qr-clean"`**

In `lib/event-print/print-options.ts`, line 16, change:

```typescript
export const DEFAULT_POSTER_TEMPLATE: PosterTemplateId = "qr-clean";
```

- [ ] **Step 4: Run all print-options tests to confirm they pass**

```bash
cd /Users/antoniobecic/repo/calisto-events && npx vitest run lib/event-print/print-options.test.ts
```

Expected: All PASS. (Existing tests that use `DEFAULT_POSTER_TEMPLATE` as the expected value still pass because they compare against the constant, not the string literal.)

- [ ] **Step 5: Commit**

```bash
git add lib/event-print/template-catalog.ts lib/event-print/template-catalog.test.ts lib/event-print/print-options.ts lib/event-print/print-options.test.ts
git commit -m "feat: add qr-clean/gold/dark template IDs and set qr-clean as default"
```

---

## Task 3: Add i18n labels for new templates

**Files:**
- Modify: `lib/app-ui/en.ts` (after line 799)
- Modify: `lib/app-ui/hr.ts` (after line 812)
- Modify: `lib/app-ui/de.ts` (after line 826)

- [ ] **Step 1: Add labels to `en.ts`**

After `templateTableBold: "Bold",` (line 799), insert:

```typescript
    templateQrClean: "Clean",
    templateQrGold: "Gold",
    templateQrDark: "Dark",
```

- [ ] **Step 2: Add labels to `hr.ts`**

After `templateTableBold: "Naglašeno",` (line 812), insert:

```typescript
    templateQrClean: "Čisto",
    templateQrGold: "Zlatno",
    templateQrDark: "Tamno",
```

- [ ] **Step 3: Add labels to `de.ts`**

After `templateTableBold: "Kräftig",` (line 826), insert:

```typescript
    templateQrClean: "Schlicht",
    templateQrGold: "Gold",
    templateQrDark: "Dunkel",
```

- [ ] **Step 4: Confirm TypeScript compiles**

```bash
cd /Users/antoniobecic/repo/calisto-events && npx tsc --noEmit 2>&1 | head -20
```

Expected: No errors related to the new keys (the `AppUiDict` type is inferred from `APP_UI_EN`, so adding keys there is enough — `hr.ts` and `de.ts` must also satisfy the same shape, which they do after this step).

- [ ] **Step 5: Commit**

```bash
git add lib/app-ui/en.ts lib/app-ui/hr.ts lib/app-ui/de.ts
git commit -m "feat: add i18n labels for qr-clean/gold/dark print templates"
```

---

## Task 4: Redesign `PosterHalfCard` with QR-hero layout

**Files:**
- Modify: `app/(app)/events/[id]/print/PosterHalfCard.tsx`

- [ ] **Step 1: Replace the component with the new layout**

Full new content of `app/(app)/events/[id]/print/PosterHalfCard.tsx`:

```typescript
import type { CSSProperties } from "react";
import QRCode from "react-qr-code";

import type { PosterTemplateId } from "@/lib/event-print/print-options";

const titleClamp: CSSProperties = {
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 2,
  overflow: "hidden",
};

export type PosterHalfStrings = Readonly<{
  heroEyebrow: string;
  footerGoToLead: string;
  footerGoToTrail: string;
}>;

type PosterHalfCardProps = Readonly<{
  template: PosterTemplateId;
  eventTitle: string;
  accessCode: string;
  joinUrl: string;
  publicHostDisplay: string;
  strings: PosterHalfStrings;
}>;

const QR_SIZE: Record<PosterTemplateId, number> = {
  "table-minimal": 200,
  "table-bold": 192,
  "qr-clean": 248,
  "qr-gold": 248,
  "qr-dark": 248,
};

function isQrHeroTemplate(t: PosterTemplateId): boolean {
  return t === "qr-clean" || t === "qr-gold" || t === "qr-dark";
}

export function PosterHalfCard({
  template,
  eventTitle,
  accessCode,
  joinUrl,
  publicHostDisplay,
  strings,
}: PosterHalfCardProps) {
  if (isQrHeroTemplate(template)) {
    return (
      <section className="print-half-card" data-template={template} aria-label={strings.heroEyebrow}>
        <h1 className="print-poster-title" style={titleClamp}>
          {eventTitle}
        </h1>
        <div className="print-qr-frame">
          <QRCode value={joinUrl} size={QR_SIZE[template]} />
        </div>
        <p className="print-code-pill">{accessCode}</p>
        <p className="print-scan-hint">{strings.heroEyebrow}</p>
        <p className="print-join-url">{joinUrl}</p>
      </section>
    );
  }

  return (
    <section className="print-half-card" data-template={template} aria-label={strings.heroEyebrow}>
      <p className="print-poster-eyebrow">{strings.heroEyebrow}</p>
      <h1 className="print-poster-title" style={titleClamp}>
        {eventTitle}
      </h1>
      <div className="print-qr-frame">
        <QRCode value={joinUrl} size={QR_SIZE[template]} />
      </div>
      <p className="print-footer-lead">
        {strings.footerGoToLead}
        <span style={{ fontFamily: "ui-monospace, monospace" }}>{publicHostDisplay}</span>
        {strings.footerGoToTrail}
      </p>
      <p className="print-code-pill">{accessCode}</p>
      <p className="print-join-url">{joinUrl}</p>
    </section>
  );
}
```

- [ ] **Step 2: Confirm TypeScript compiles**

```bash
cd /Users/antoniobecic/repo/calisto-events && npx tsc --noEmit 2>&1 | head -20
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add app/\(app\)/events/\[id\]/print/PosterHalfCard.tsx
git commit -m "feat: add qr-hero layout to PosterHalfCard for qr-clean/gold/dark templates"
```

---

## Task 5: Add CSS for new templates and screen preview desk wrapper

**Files:**
- Modify: `app/(app)/events/[id]/print/print-sheet.css`
- Modify: `app/(app)/events/[id]/print/EventPrintSheet.tsx`

- [ ] **Step 1: Add `.print-sheet-desk` and new template CSS to `print-sheet.css`**

Append to the end of `app/(app)/events/[id]/print/print-sheet.css`:

```css
/* --- Screen preview: dark desk surface behind the A4 sheet --- */

.print-sheet-desk {
  background: #1a1a1a;
  border-radius: 16px;
  padding: 32px 24px 40px;
  box-sizing: border-box;
}

@media print {
  .print-sheet-desk {
    background: transparent;
    border-radius: 0;
    padding: 0;
  }
}

/* Improve sheet shadow in screen view */
@media screen {
  .print-sheet-outer {
    box-shadow: 0 8px 48px rgba(0, 0, 0, 0.65), 0 2px 12px rgba(0, 0, 0, 0.35);
  }
}

/* --- Templates: qr-clean, qr-gold, qr-dark (shared hero layout) --- */

.print-half-card[data-template="qr-clean"] .print-poster-title,
.print-half-card[data-template="qr-gold"] .print-poster-title,
.print-half-card[data-template="qr-dark"] .print-poster-title {
  margin-top: 0;
  margin-bottom: 14px;
  font-size: clamp(1rem, 2.6vw, 1.45rem);
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.25;
  max-width: 100%;
  color: var(--app-text, #111);
}

.print-half-card[data-template="qr-clean"] .print-qr-frame,
.print-half-card[data-template="qr-gold"] .print-qr-frame,
.print-half-card[data-template="qr-dark"] .print-qr-frame {
  display: inline-flex;
  padding: 16px;
  border-radius: 14px;
  border: 1.5px solid #e8e8e8;
  background: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.print-half-card[data-template="qr-clean"] .print-code-pill,
.print-half-card[data-template="qr-gold"] .print-code-pill,
.print-half-card[data-template="qr-dark"] .print-code-pill {
  margin-top: 16px;
  display: inline-flex;
  border-radius: 9999px;
  border: 1.5px solid #222;
  padding: 7px 22px;
  font-family: ui-monospace, monospace;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: #111;
}

.print-half-card[data-template="qr-clean"] .print-scan-hint,
.print-half-card[data-template="qr-gold"] .print-scan-hint,
.print-half-card[data-template="qr-dark"] .print-scan-hint {
  margin-top: 10px;
  font-size: 11px;
  font-style: italic;
  color: #777;
  letter-spacing: 0.01em;
}

.print-half-card[data-template="qr-clean"] .print-join-url,
.print-half-card[data-template="qr-gold"] .print-join-url,
.print-half-card[data-template="qr-dark"] .print-join-url {
  margin-top: 6px;
  font-family: ui-monospace, monospace;
  font-size: 8px;
  color: #bbb;
  word-break: break-all;
  max-width: 100%;
}

@media print {
  .print-half-card[data-template="qr-clean"] .print-poster-title,
  .print-half-card[data-template="qr-gold"] .print-poster-title,
  .print-half-card[data-template="qr-dark"] .print-poster-title {
    color: #111;
  }

  .print-half-card[data-template="qr-clean"] .print-code-pill,
  .print-half-card[data-template="qr-gold"] .print-code-pill,
  .print-half-card[data-template="qr-dark"] .print-code-pill {
    color: #111;
    border-color: #222;
  }
}
```

- [ ] **Step 2: Wrap sheet in `.print-sheet-desk` in `EventPrintSheet.tsx`**

In `app/(app)/events/[id]/print/EventPrintSheet.tsx`, replace the `return` block (lines 49–63):

```typescript
  return (
    <>
      <PrintPageRules paper={paper} />
      <div className="print-sheet-desk">
        <div className={outerClass}>
          <div className="print-two-up print-two-up-vfill">
            <PosterHalfCard {...halfProps} />
            <div className="print-cut-row" aria-hidden>
              <span className="print-cut-label">{cutHere}</span>
            </div>
            <PosterHalfCard {...halfProps} />
          </div>
        </div>
      </div>
    </>
  );
```

- [ ] **Step 3: Confirm TypeScript compiles**

```bash
cd /Users/antoniobecic/repo/calisto-events && npx tsc --noEmit 2>&1 | head -20
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add app/\(app\)/events/\[id\]/print/print-sheet.css app/\(app\)/events/\[id\]/print/EventPrintSheet.tsx
git commit -m "feat: add qr-clean/gold/dark CSS and dark desk screen preview wrapper"
```

---

## Task 6: Update `EventPrintToolbar` with new template buttons

**Files:**
- Modify: `app/(app)/events/[id]/print/EventPrintToolbar.tsx`

- [ ] **Step 1: Replace the template picker section**

In `EventPrintToolbar.tsx`, the toolbar receives `chromePrint: AppUiDict["print"]`. The labels `templateQrClean`, `templateQrGold`, `templateQrDark` are now part of that type.

Replace the entire `<div style={{ marginBottom: 14 }}>` block that renders `POSTER_TEMPLATES` (lines 224–249) with:

```typescript
      <div style={{ marginBottom: 14 }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "var(--app-muted)",
          }}
        >
          {tableSectionHeading}
        </p>
        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {POSTER_TEMPLATES.map((tid) => {
            const labelMap: Record<string, string> = {
              "table-minimal": p.templateTableMinimal,
              "table-bold": p.templateTableBold,
              "qr-clean": p.templateQrClean,
              "qr-gold": p.templateQrGold,
              "qr-dark": p.templateQrDark,
            };
            return (
              <Link
                key={tid}
                href={buildPrintHref(eventId, { template: tid, paper, posterLang })}
                scroll={false}
                style={pickStyle(activeTemplate === tid)}
                prefetch={false}
              >
                {labelMap[tid] ?? tid}
              </Link>
            );
          })}
        </div>
      </div>
```

- [ ] **Step 2: Confirm TypeScript compiles**

```bash
cd /Users/antoniobecic/repo/calisto-events && npx tsc --noEmit 2>&1 | head -20
```

Expected: No errors.

- [ ] **Step 3: Run full test suite**

```bash
cd /Users/antoniobecic/repo/calisto-events && npm test
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add app/\(app\)/events/\[id\]/print/EventPrintToolbar.tsx
git commit -m "feat: add qr-clean/gold/dark template buttons to print toolbar"
```
