# Event QR table posters (two-up + templates) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship localized, template-selectable **two-up table QR cards** on `/events/[id]/print` with A4/Letter print sizing and a cut guide between identical halves.

**Architecture:** Server `page.tsx` reads `searchParams` for `template` and `paper`, parses via `lib/event-print/print-options.ts`, loads strings with `getUiLocale` + `getAppStrings`, and renders `EventPrintSheet` (two `PosterHalfCard` + cut row). Client `EventPrintToolbar` syncs selections to the URL. Print layout uses dedicated CSS with `@page` rules.

**Tech stack:** Next.js App Router (16.x), React 19, `react-qr-code`, Vitest, existing `lib/app-ui` i18n.

**Spec:** `docs/superpowers/specs/2026-05-11-event-qr-table-posters-design.md`

---

### Task 1: Print query parsers (library + tests)

**Files:**

- Create: `lib/event-print/print-options.ts`
- Create: `lib/event-print/print-options.test.ts`

- [ ] **Step 1: Add `print-options.ts`**

```typescript
export const POSTER_TEMPLATES = ["table-minimal", "table-bold"] as const;
export type PosterTemplateId = (typeof POSTER_TEMPLATES)[number];
export const DEFAULT_POSTER_TEMPLATE: PosterTemplateId = "table-minimal";

export const PRINT_PAPERS = ["a4", "letter"] as const;
export type PrintPaperId = (typeof PRINT_PAPERS)[number];
export const DEFAULT_PRINT_PAPER: PrintPaperId = "a4";

export function parsePosterTemplate(raw: string | undefined): PosterTemplateId {
  if (raw && (POSTER_TEMPLATES as readonly string[]).includes(raw)) {
    return raw as PosterTemplateId;
  }
  return DEFAULT_POSTER_TEMPLATE;
}

export function parsePrintPaper(raw: string | undefined): PrintPaperId {
  if (raw && (PRINT_PAPERS as readonly string[]).includes(raw)) {
    return raw as PrintPaperId;
  }
  return DEFAULT_PRINT_PAPER;
}
```

- [ ] **Step 2: Add Vitest file `print-options.test.ts`**

```typescript
import { describe, expect, it } from "vitest";

import {
  DEFAULT_POSTER_TEMPLATE,
  DEFAULT_PRINT_PAPER,
  parsePosterTemplate,
  parsePrintPaper,
} from "./print-options";

describe("parsePosterTemplate", () => {
  it("defaults for undefined", () => {
    expect(parsePosterTemplate(undefined)).toBe(DEFAULT_POSTER_TEMPLATE);
  });
  it("accepts table-minimal", () => {
    expect(parsePosterTemplate("table-minimal")).toBe("table-minimal");
  });
  it("accepts table-bold", () => {
    expect(parsePosterTemplate("table-bold")).toBe("table-bold");
  });
  it("rejects unknown", () => {
    expect(parsePosterTemplate("hacker")).toBe(DEFAULT_POSTER_TEMPLATE);
  });
});

describe("parsePrintPaper", () => {
  it("defaults for undefined", () => {
    expect(parsePrintPaper(undefined)).toBe(DEFAULT_PRINT_PAPER);
  });
  it("accepts a4 and letter", () => {
    expect(parsePrintPaper("a4")).toBe("a4");
    expect(parsePrintPaper("letter")).toBe("letter");
  });
  it("rejects unknown", () => {
    expect(parsePrintPaper("tabloid")).toBe(DEFAULT_PRINT_PAPER);
  });
});
```

- [ ] **Step 3: Run tests**

Run: `npm test`

Expected: PASS (all tests in the new file).

- [ ] **Step 4: Commit**

```bash
git add lib/event-print/print-options.ts lib/event-print/print-options.test.ts
git commit -m "feat(print): add poster template and paper query parsers"
```

---

### Task 2: i18n strings (`print.*`)

**Files:**

- Modify: `lib/app-ui/en.ts` (extend `print` object)
- Modify: `lib/app-ui/de.ts`
- Modify: `lib/app-ui/hr.ts`

Add keys (exact names can be adjusted but must exist in **all three** files):

- `print.sheetHelper` — e.g. EN: "Two identical table cards per sheet. Cut along the dashed line."
- `print.cutHere` — e.g. EN: "Cut here"
- `print.paperA4` — label for A4 toggle
- `print.paperLetter` — label for Letter toggle
- `print.templateTableMinimal` — short label for first template
- `print.templateTableBold` — short label for second template
- `print.templateSectionLabel` — e.g. "Layout" (toolbar section)

Reuse existing keys where they already match copy: `heroEyebrow`, `footerGoToLead`, `footerGoToTrail`, `backShare`, `print` (button).

- [ ] **Step 1: Edit all three locale files** with consistent keys and natural translations for DE/HR.

- [ ] **Step 2: Run TypeScript check via build**

Run: `npm run build`

Expected: PASS (AppUiDict shape identical across locales).

- [ ] **Step 3: Commit**

```bash
git add lib/app-ui/en.ts lib/app-ui/de.ts lib/app-ui/hr.ts
git commit -m "feat(print): add i18n strings for table poster sheet"
```

---

### Task 3: Print-only CSS sheet

**Files:**

- Create: `app/(app)/events/[id]/print/print-sheet.css`

- [ ] **Step 1: Create CSS** with:

  - `.print-root--a4` → `@media print { @page { size: A4 portrait; margin: 10mm; } }`
  - `.print-root--letter` → `@media print { @page { size: letter portrait; margin: 10mm; } }`
  - `.print-sheet` — `min-height` for screen preview (e.g. `100vh` on screen) and print: fill printable area; white background when printing.
  - `.print-card` — `break-inside: avoid`; flex column centered content; `flex: 1 1 0` inside `.print-sheet-body` (column flex).
  - `.print-cut` — dashed top border, small centered caption color muted; `flex: 0 0 auto`.
  - Screen: light border around fake “sheet” for preview; `print:hidden` on non-paper UI already handled in toolbar.

Import this CSS from `page.tsx` (side-effect import) or from a tiny `PrintStyles` component used only on the print route.

- [ ] **Step 2: Commit**

```bash
git add app/(app)/events/[id]/print/print-sheet.css app/(app)/events/[id]/print/page.tsx
git commit -m "feat(print): add two-up sheet print stylesheet"
```

(If `page.tsx` is not touched until Task 6, import can be deferred—then commit CSS alone with message `chore(print): add print sheet stylesheet`.)

---

### Task 4: `PosterHalfCard` presentational component

**Files:**

- Create: `app/(app)/events/[id]/print/PosterHalfCard.tsx`

- [ ] **Step 1: Implement** a server component accepting props:

```typescript
type PosterHalfCardProps = Readonly<{
  template: import("@/lib/event-print/print-options").PosterTemplateId;
  paper: import("@/lib/event-print/print-options").PrintPaperId;
  eventTitle: string;
  accessCode: string;
  joinUrl: string;
  publicHostDisplay: string; // origin without scheme, for footer
  strings: Pick<
    import("@/lib/app-ui").AppUiDict["print"],
    | "heroEyebrow"
    | "footerGoToLead"
    | "footerGoToTrail"
  >;
}>;
```

- Render: localized eyebrow, `h1` with `line-clamp` (Tailwind `line-clamp-2` or inline style), `<QRCode value={joinUrl} size={...} />` (size tuned per template), code pill, small URL line.
- Switch styles by `template`: `table-minimal` vs `table-bold` (different border weight, font-weight, spacing) using `data-template` attribute + CSS in `print-sheet.css` or conditional `className`.

- [ ] **Step 2: `npm run build`**

- [ ] **Step 3: Commit**

```bash
git add app/(app)/events/[id]/print/PosterHalfCard.tsx app/(app)/events/[id]/print/print-sheet.css
git commit -m "feat(print): add PosterHalfCard layouts for table templates"
```

---

### Task 5: `EventPrintSheet` wrapper

**Files:**

- Create: `app/(app)/events/[id]/print/EventPrintSheet.tsx`

- [ ] **Step 1: Implement** server component:

  - Root `div` with classes `print-root--a4` or `print-root--letter` from `paper` prop.
  - Inner column: `PosterHalfCard` (top) → cut row (localized `strings.cutHere` + `sheetHelper` only once on screen—helper is toolbar area; **cut row** uses `cutHere`) → `PosterHalfCard` (bottom).
  - Pass the same props to both halves (identical content).

- [ ] **Step 2: Commit**

```bash
git add app/(app)/events/[id]/print/EventPrintSheet.tsx
git commit -m "feat(print): compose two-up EventPrintSheet"
```

---

### Task 6: Wire `page.tsx` (searchParams + strings + sheet)

**Files:**

- Modify: `app/(app)/events/[id]/print/page.tsx`

- [ ] **Step 1: Extend props** with `searchParams?: Promise<Record<string, string | string[] | undefined>>` (match `events/[id]/page.tsx` pattern).

- [ ] **Step 2: `pickQueryValue`** helper (copy from event page or import shared if you extract to `lib/url-search.ts`—YAGNI: inline copy is fine).

- [ ] **Step 3:** After access OK, `const sp = await searchParams`, `parsePosterTemplate(pickQueryValue(sp?.template))`, `parsePrintPaper(pickQueryValue(sp?.paper))`, `const locale = await getUiLocale()`, `const dict = getAppStrings(locale)`.

- [ ] **Step 4:** Replace inner `<article>` with `<EventPrintSheet ... />` and pass `dict.print` subset + event fields.

- [ ] **Step 5:** Import `./print-sheet.css`.

- [ ] **Step 6: Run**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add app/(app)/events/[id]/print/page.tsx
git commit -m "feat(print): render two-up sheet from search params"
```

---

### Task 7: Toolbar — template + paper URL controls

**Files:**

- Modify: `app/(app)/events/[id]/print/EventPrintToolbar.tsx`

- [ ] **Step 1: Expand props** to `Readonly<{ eventId: string; template: PosterTemplateId; paper: PrintPaperId; labels: { ... all toolbar strings ... } }>` (types from `AppUiDict["print"]` picks).

- [ ] **Step 2:** `"use client"`; use `usePathname`, `useSearchParams`, `useRouter` from `next/navigation`. On template/paper change, `router.replace` same path with updated query (preserve other params if any).

- [ ] **Step 3:** Render segmented controls (buttons or radio group) for template and paper; show `sheetHelper` text above or below controls; keep Back + Print.

- [ ] **Step 4: Commit**

```bash
git add app/(app)/events/[id]/print/EventPrintToolbar.tsx
git commit -m "feat(print): toolbar template and paper selectors"
```

---

### Task 8: Pass toolbar props from `page.tsx`

**Files:**

- Modify: `app/(app)/events/[id]/print/page.tsx`

- [ ] **Step 1:** Pass `template`, `paper`, and required label props into `EventPrintToolbar`.

- [ ] **Step 2: `npm run build`**

- [ ] **Step 3: Commit**

```bash
git add app/(app)/events/[id]/print/page.tsx
git commit -m "feat(print): connect toolbar to parsed print options"
```

---

### Task 9: Manual verification checklist (no automated browser test in repo)

- [ ] Chrome print preview — `table-minimal` + A4: two identical cards, cut line, margins OK.
- [ ] Same + Letter.
- [ ] `table-bold` + scan QR from monitor at ~40 cm.
- [ ] Switch UI locale to HR and DE; confirm new strings render on poster and toolbar.

---

## Plan self-review

| Spec requirement | Task coverage |
| --- | --- |
| Two identical halves + cut | Task 5, 3 |
| Table-optimized hierarchy | Task 4 |
| Templates (2) | Tasks 1, 4, 7 |
| A4 / Letter | Tasks 1, 3, 6, 7 |
| URL `template` + `paper` | Tasks 1, 6, 7 |
| i18n | Task 2 + server wiring 6 |
| Vitest for parsers | Task 1 |
| Non-goals respected | No PDF/tasks |

No TBD placeholders in task steps.

---

**Plan complete** and saved to `docs/superpowers/plans/2026-05-11-event-qr-table-posters.md`.

**Execution options:**

1. **Subagent-driven (recommended)** — fresh subagent per task, review between tasks.  
2. **Inline execution** — run tasks in this session with checkpoints.

Which approach do you prefer?
