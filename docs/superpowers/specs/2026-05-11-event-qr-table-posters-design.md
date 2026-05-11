---
title: Event QR table posters (two-up, templates)
date: 2026-05-11
status: draft
---

## Summary

Replace the single generic `/events/[id]/print` layout with **print-optimized table cards**: each sheet contains **two identical halves** separated by a **cut guide**, aimed at organizers who place cards on tables. Organizers choose among a small set of **templates** (distinct layout and typography, not only color). Copy is **localized** via existing `getUiLocale` / `getAppStrings` patterns.

## Goals

- **Readable at table distance** (~30–60 cm): QR remains primary; event title and access code are clearly legible within each half-sheet.
- **Two cards per printed page**: one horizontal cut yields two **identical** cards (same QR, title, code, instructions).
- **Template choice**: at least two visually distinct templates optimized for this use case; selection persists in the URL for sharing and refresh.
- **Paper**: explicit **A4** vs **US Letter** control so `@page` size matches what users print (locale is not a reliable proxy).
- **i18n**: all user-visible poster strings (including cut hint and sheet description) live in `lib/app-ui/{en,de,hr}.ts` under `print.*`; the print route uses server-side `getUiLocale()` + `getAppStrings()` and passes strings into components (the print page stays compatible with the root `AppUiProvider` for any client subcomponents).

## Non-goals (v1)

- Different content on the two halves (e.g. front/back); halves are **always identical**.
- PDF download or server-side image generation (HTML + CSS print only).
- Custom colors, logos, or per-event imagery.
- Instagram / story aspect ratios.

## Current state

- Route: `app/(app)/events/[id]/print/page.tsx` — one centered article, inline English, `react-qr-code` at 260px, `window.print()` from `EventPrintToolbar`.
- Share tab links to `/events/[id]/print` (`ShareTab.tsx`).
- Partial `print` keys exist in `APP_UI_*` but the page does not consume them yet.

## UX

### Screen (non-print)

- Short helper: **two table cards per sheet; cut along the dashed line** (localized).
- **Template** selector: visual or labeled options (e.g. cards / radio + preview). Changing template updates URL query `template=`.
- **Paper** selector: A4 vs Letter; updates query `paper=`.
- Existing actions: back to Share, Print.

### Print

- Exactly **one physical sheet** per print job: top block = card 1, dashed **cut line** + “Cut here” (localized), bottom block = card 2 (duplicate).
- Toolbar and helper copy use `print:hidden` (or equivalent) so they do not appear on paper.
- Background: **white** on paper; templates may use borders and typography only so **grayscale** printing stays acceptable.

## Template set (v1)

| ID | Intent |
| --- | --- |
| `table-minimal` (default) | Maximum whitespace, restrained type, QR + title + code hierarchy. |
| `table-bold` | Higher contrast “signage” feel: stronger borders or weight, still fits half-sheet. |

Both share the same data fields: eyebrow / hero line, event title, QR (`joinUrl`), manual-join line (host + code), optional small URL line (keep if it aids support; may be smaller than today).

## Technical approach

### Query parameters

- `template`: `table-minimal` \| `table-bold` — invalid or missing → `table-minimal`.
- `paper`: `a4` \| `letter` — invalid or missing → `a4`.

Parsing and allowlists live in a small **framework-agnostic** module (e.g. `lib/event-print/print-options.ts`) for unit testing. Defaults applied in the server `page.tsx` when building links.

### Layout model

- Outer **sheet** wrapper sets print height from paper (CSS `@page` + inner `min-height` in `mm` so each half is ~half of the printable area).
- **Cut row**: non-interactive, dashed rule + muted label; does not consume a full “card” slot—sits between two flex children each `flex: 1` (or fixed fractional heights) so the two cards have equal vertical space.
- Each **card** is one column: title → QR → code / instructions; `break-inside: avoid` on each card block to reduce ugly splits across browsers.
- **QR size**: scale per half-sheet (target roughly 180–220px equivalent at 96dpi in layout terms, expressed with `max()`/`clamp()` or fixed `mm` width so both templates stay scannable).

### Components (suggested split)

- `lib/event-print/print-options.ts` — constants, `parsePosterTemplate`, `parsePrintPaper`.
- `app/(app)/events/[id]/print/print-sheet.css` — `@page`, paper-specific classes, print-only rules (imported only from print route or layout under print).
- `app/(app)/events/[id]/print/PosterHalfCard.tsx` — presentational; receives template id + content props + `strings`.
- `app/(app)/events/[id]/print/EventPrintSheet.tsx` — composes two `PosterHalfCard` instances + cut row.
- `app/(app)/events/[id]/print/EventPrintToolbar.tsx` — client: template + paper controls using `useRouter` / `usePathname` / `useSearchParams` to sync queries; Print button unchanged.

### Auth and data

- Unchanged: same Supabase access checks; same `getWebJoinUrl` / `getPublicOrigin` inputs.

## Edge cases

- **Very long event titles**: truncate with CSS (`line-clamp`) or ellipsis with a sensible `max-lines` per template so QR does not get pushed off the half-card.
- **Print preview**: user may still choose wrong paper in the OS dialog; our paper toggle sets CSS `@page` to reduce mismatch.
- **Access denied**: keep current behavior; optionally localize denied copy using `getAppStrings` in a small follow-up if not already.

## Verification

- `npm test` — unit tests for query parsers and defaults.
- `npm run build`
- Manual: Chrome print preview for **A4** and **Letter**, each template; confirm two identical halves, cut line visible, no toolbar; scan QR from screen at ~40 cm; spot-check **de** and **hr** locales for string coverage.

## Open items deferred

- Automatic locale-based default for `paper` (optional enhancement).
- Third template (“celebration” decorative) after v1 feedback.
