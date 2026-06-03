# Print Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `/events/[id]/print` with a sticky top bar, full-screen card preview on mobile, and a bottom-sheet template picker with visual thumbnails.

**Architecture:** `EventPrintToolbar` is converted to a client shell that owns `pickerOpen` state, renders a sticky top bar (back + template name + "Change theme" + print/download) and a `TemplatePicker` bottom sheet. `QrThemedPrintSheet` renders a single unrotated portrait card on mobile (< 640 px) and the existing A4 rotation sheet on desktop. Secondary controls (language, paper) move below the preview as server-rendered link rows in `page.tsx`. `print-sheet.css` gets all new layout rules.

**Tech Stack:** React 18, Next.js App Router, CSS custom properties, `react-qr-code` (already installed)

---

## File map

| File | Change |
|---|---|
| `app/(app)/events/[id]/print/print-sheet.css` | Add top-bar, mobile-preview, change-theme-button, secondary-controls, and bottom-sheet styles |
| `app/(app)/events/[id]/print/QrThemedPrintSheet.tsx` | Split into mobile (single card) + desktop (A4 sheet) views |
| `app/(app)/events/[id]/print/TemplatePicker.tsx` | **Create** — bottom sheet with 2-col thumbnail grid, navigation |
| `app/(app)/events/[id]/print/EventPrintToolbar.tsx` | Full redesign: sticky bar + pickerOpen state + TemplatePicker |
| `app/(app)/events/[id]/print/page.tsx` | Remove outer padding; add secondary controls below preview |

---

### Task 1: CSS — top bar, mobile preview, bottom sheet

**Files:**
- Modify: `app/(app)/events/[id]/print/print-sheet.css`

- [ ] **Append the following CSS block to the end of `print-sheet.css`:**

```css
/* ─── Print page top bar ─────────────────────────────────────────── */
.print-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 0 12px 0 4px;
  height: 56px;
  background: var(--app-surface);
  border-bottom: 1px solid color-mix(in srgb, var(--app-gold) 28%, transparent);
  position: sticky;
  top: 0;
  z-index: 20;
  box-sizing: border-box;
}

.print-topbar__title {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--app-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  text-align: center;
  padding: 0 8px;
}

.print-topbar__actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

/* ─── Change-theme button ────────────────────────────────────────── */
.print-change-theme-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 14px;
  height: 36px;
  border-radius: 10px;
  border: 1.5px solid var(--app-gold);
  background: color-mix(in srgb, var(--app-gold) 8%, transparent);
  color: var(--app-text);
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
}
.print-change-theme-btn:active {
  background: color-mix(in srgb, var(--app-gold) 18%, transparent);
}

/* ─── Secondary controls (language / paper) ─────────────────────── */
.print-secondary-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  padding: 12px 20px 24px;
  max-width: 640px;
  margin: 0 auto;
  box-sizing: border-box;
}

.print-secondary-controls__group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.print-secondary-controls__label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--app-muted);
  white-space: nowrap;
}

.print-secondary-controls__pill {
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  color: var(--app-muted);
  border: 1.5px solid var(--app-border);
  background: transparent;
}

.print-secondary-controls__pill--active {
  color: var(--app-text);
  border-color: var(--app-gold);
  background: color-mix(in srgb, var(--app-gold) 10%, transparent);
}

/* ─── QR themed card: mobile single-card view ───────────────────── */
.qr-themed-mobile-only  { display: block; }
.qr-themed-desktop-only { display: none;  }

@media (min-width: 640px) {
  .qr-themed-mobile-only  { display: none;  }
  .qr-themed-desktop-only { display: block; }
}

.qr-themed-desk--mobile {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px 20px 32px;
  min-height: min(90vw * 1.414, 560px);
}

.qr-themed-mobile-card {
  width: min(90vw, 340px);
  aspect-ratio: 148 / 210;
  border-radius: 4px;
  overflow: hidden;
  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.65),
    0 6px 16px  rgba(0, 0, 0, 0.45);
  flex-shrink: 0;
}

/* ─── Template picker bottom sheet ──────────────────────────────── */
.tpicker-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.52);
  z-index: 40;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
}
.tpicker-overlay--open {
  opacity: 1;
  pointer-events: auto;
}

.tpicker-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--app-surface);
  border-radius: 20px 20px 0 0;
  max-height: 85svh;
  overflow-y: auto;
  overscroll-behavior: contain;
  z-index: 41;
  transform: translateY(100%);
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
.tpicker-sheet--open {
  transform: translateY(0);
}

.tpicker-handle {
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: var(--app-border);
  margin: 10px auto 0;
}

.tpicker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px 10px;
  border-bottom: 1px solid var(--app-border);
}

.tpicker-header__title {
  font-size: 14px;
  font-weight: 700;
  color: var(--app-text);
  letter-spacing: -0.01em;
}

.tpicker-close {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: var(--app-surface-2);
  color: var(--app-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  line-height: 1;
  flex-shrink: 0;
}

.tpicker-section-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--app-muted);
  padding: 16px 20px 8px;
}

.tpicker-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 0 16px 16px;
}

.tpicker-thumb {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  text-align: center;
  -webkit-tap-highlight-color: transparent;
}

.tpicker-thumb__frame {
  width: 100%;
  aspect-ratio: 148 / 210;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid transparent;
  box-sizing: border-box;
  position: relative;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.14);
  transition: border-color 0.15s ease;
}

.tpicker-thumb__frame--active {
  border-color: var(--app-gold);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.14),
    0 0 0 1px color-mix(in srgb, var(--app-gold) 40%, transparent);
}

.tpicker-thumb__inner {
  position: absolute;
  inset: 0;
  pointer-events: none;
  user-select: none;
}

.tpicker-thumb__swatch {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tpicker-thumb__label {
  font-size: 11px;
  font-weight: 600;
  color: var(--app-text-sub);
  letter-spacing: 0.02em;
  line-height: 1.3;
}

.tpicker-thumb__label--active {
  color: var(--app-gold);
}
```

- [ ] **Verify no syntax errors** by checking the end of the file looks clean:

```bash
tail -20 app/\(app\)/events/\[id\]/print/print-sheet.css
```

Expected: closing `}` for last rule, no truncation.

- [ ] **Commit:**

```bash
git add "app/(app)/events/[id]/print/print-sheet.css"
git commit -m "style: add print page top-bar, mobile preview, and bottom sheet CSS"
```

---

### Task 2: QrThemedPrintSheet — mobile/desktop split

**Files:**
- Modify: `app/(app)/events/[id]/print/QrThemedPrintSheet.tsx`

- [ ] **Replace the file contents with the mobile+desktop split version:**

```tsx
import type { QrThemedTemplateId } from "@/lib/event-print/template-catalog";

import { QrCardSimple }    from "./QrCardSimple";
import { QrCardRomantic }  from "./QrCardRomantic";
import { QrCardLuxurious } from "./QrCardLuxurious";
import { QrCardBotanical } from "./QrCardBotanical";
import { QrCardArtDeco }   from "./QrCardArtDeco";
import { QrCardPlayful }   from "./QrCardPlayful";

type CardProps = { eventTitle: string; accessCode: string; joinUrl: string };

export function pickQrCard(template: QrThemedTemplateId, props: CardProps) {
  switch (template) {
    case "qr-simple":    return <QrCardSimple    {...props} />;
    case "qr-romantic":  return <QrCardRomantic  {...props} />;
    case "qr-luxurious": return <QrCardLuxurious {...props} />;
    case "qr-botanical": return <QrCardBotanical {...props} />;
    case "qr-art-deco":  return <QrCardArtDeco   {...props} />;
    case "qr-playful":   return <QrCardPlayful   {...props} />;
  }
}

type Props = CardProps & { template: QrThemedTemplateId };

function Slot({ template, cardProps }: { template: QrThemedTemplateId; cardProps: CardProps }) {
  return (
    <div className="qr-themed-slot">
      <div className="qr-themed-card-rotate">
        {pickQrCard(template, cardProps)}
      </div>
    </div>
  );
}

export function QrThemedPrintSheet({ template, eventTitle, accessCode, joinUrl }: Props) {
  const cardProps = { eventTitle, accessCode, joinUrl };
  return (
    <>
      {/* Mobile: single portrait card, no rotation */}
      <div className="qr-themed-desk qr-themed-desk--mobile qr-themed-mobile-only">
        <div className="qr-themed-mobile-card">
          {pickQrCard(template, cardProps)}
        </div>
      </div>

      {/* Desktop: full A4 sheet with two rotated cards */}
      <div className="qr-themed-desktop-only">
        <div className="qr-themed-desk">
          <div className="qr-themed-page">
            <Slot template={template} cardProps={cardProps} />
            <div className="qr-themed-cut" aria-hidden />
            <Slot template={template} cardProps={cardProps} />
          </div>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Check TypeScript compiles cleanly:**

```bash
npx tsc --noEmit 2>&1 | grep "QrThemed\|pickQr"
```

Expected: no output (no errors).

- [ ] **Commit:**

```bash
git add "app/(app)/events/[id]/print/QrThemedPrintSheet.tsx"
git commit -m "feat: mobile single-card preview in QrThemedPrintSheet"
```

---

### Task 3: TemplatePicker bottom sheet

**Files:**
- Create: `app/(app)/events/[id]/print/TemplatePicker.tsx`

- [ ] **Create the file with the following contents:**

```tsx
"use client";

import { useRouter } from "next/navigation";
import type { AppUiDict } from "@/lib/app-ui/en";
import type { EventKind } from "@/lib/event-kind";
import type { Locale } from "@/lib/i18n";
import type { PrintPaperId, PrintRouteTemplateId } from "@/lib/event-print/print-options";
import { POSTER_LANG_QUERY } from "@/lib/event-print/print-options";
import { QR_THEMED_PRINT_TEMPLATE_IDS } from "@/lib/event-print/template-catalog";
import { pickQrCard } from "./QrThemedPrintSheet";
import type { QrThemedTemplateId } from "@/lib/event-print/template-catalog";

// ── Swatch colours for non-themed templates ───────────────────────────────────
const SWATCH: Record<string, { bg: string; fg: string; accent: string }> = {
  "table-minimal":                    { bg: "#ffffff", fg: "#1a1a1a", accent: "#1a1a1a" },
  "table-bold":                       { bg: "#0a0a0a", fg: "#ffffff", accent: "#ffffff" },
  "qr-clean":                         { bg: "#ffffff", fg: "#1a1a1a", accent: "#c5922a" },
  "qr-gold":                          { bg: "#fdf7ee", fg: "#1a1a1a", accent: "#c5922a" },
  "qr-dark":                          { bg: "#1a1a1a", fg: "#f3e9d2", accent: "#c5922a" },
  "wedding-invite-blue-floral":       { bg: "#dde8f4", fg: "#2a3a5a", accent: "#4a6fa5" },
  "wedding-invite-geometric":         { bg: "#f5ede0", fg: "#2a1a10", accent: "#b8963e" },
  "wedding-invite-watercolor-coast":  { bg: "#d9e8e5", fg: "#2f4f4f", accent: "#487876" },
  "wedding-invite-navy-botanical":    { bg: "#001830", fg: "#f4ecda", accent: "#f4ecda" },
  "wedding-invite-grayscale-glitter": { bg: "#0a0a0a", fg: "#ffffff", accent: "#d4af5a" },
  "wedding-invite-terra-pill":        { bg: "#f0e5dc", fg: "#3a261c", accent: "#8c4834" },
  "wedding-invite-gold-arch-floral":  { bg: "#ffffff", fg: "#b89446", accent: "#b89446" },
  "wedding-invite-cherry-blossom":    { bg: "#fff5f6", fg: "#2c2c2c", accent: "#d4849a" },
  "wedding-invite-olive-gold-frame":  { bg: "#f2efe8", fg: "#4d563b", accent: "#4d563b" },
  "wedding-invite-gold-circles-photo":{ bg: "#f5f2ee", fg: "#1a1a1a", accent: "#b8903e" },
};

const CLASSIC_QR_IDS  = ["qr-clean", "qr-gold", "qr-dark", "table-minimal", "table-bold"] as const;
const INVITATION_IDS  = [
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

// ── Thumbnail rendering ───────────────────────────────────────────────────────

const CARD_NATIVE_W = 559; // 148 mm at 96 dpi

function QrThemedThumb({ templateId }: { templateId: QrThemedTemplateId }) {
  const scale = 1; // container CSS handles sizing via aspect-ratio + width 100%
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div style={{
        position: "absolute",
        width: CARD_NATIVE_W,
        height: 793,
        top: 0,
        left: 0,
        transformOrigin: "top left",
        transform: `scale(${scale})`,
        // actual scale is driven by the parent's width via CSS aspect-ratio
        // we use a JS-measured approach via inline style below
      }}>
        {pickQrCard(templateId, { eventTitle: "Your Event", accessCode: "ABCD1234", joinUrl: "#" })}
      </div>
    </div>
  );
}

function ScaledCardThumb({ templateId }: { templateId: QrThemedTemplateId }) {
  // The frame is sized by CSS (aspect-ratio 148/210, width ~165px in 2-col grid).
  // We need to scale a 559×793 card to fit inside it.
  // We use a CSS-only approach: the inner div is full size, clipped by overflow:hidden on the frame.
  // Scale is calculated as CSS calc or set via a wrapper width trick.
  // We set the inner container to a fixed width and use transform scale relative to that.
  return (
    <div style={{
      position: "absolute",
      inset: 0,
      overflow: "hidden",
    }}>
      {/* Force the card to render at full size then CSS-scale it down */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: CARD_NATIVE_W,
        height: 793,
        transformOrigin: "top left",
        // Scale so that 559px native width fills the thumb frame width.
        // The frame's actual px width is unknown here, so we use a CSS trick:
        // set the frame to container-type and use 100cqw, but that requires nesting.
        // Simplest: set a fixed scale that fits well in typical 165px thumb:
        // 165/559 ≈ 0.295 — hardcode this, it's presentation-only.
        transform: "scale(0.295)",
      }}>
        {pickQrCard(templateId, { eventTitle: "Your Event", accessCode: "ABCD1234", joinUrl: "#" })}
      </div>
    </div>
  );
}

function SwatchThumb({ templateId }: { templateId: string }) {
  const s = SWATCH[templateId] ?? { bg: "#f0f0f0", fg: "#888", accent: "#888" };
  return (
    <div className="tpicker-thumb__swatch" style={{ background: s.bg }}>
      <div style={{
        width: "55%",
        height: "55%",
        border: `3px solid ${s.accent}`,
        borderRadius: 6,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{
          width: "60%",
          height: "60%",
          background: s.fg,
          opacity: 0.15,
          borderRadius: 2,
        }} />
      </div>
    </div>
  );
}

// ── Label map ─────────────────────────────────────────────────────────────────

function buildLabelMap(p: AppUiDict["print"]): Record<string, string> {
  return {
    "qr-simple":                        p.templateQrSimple,
    "qr-romantic":                      p.templateQrRomantic,
    "qr-luxurious":                     p.templateQrLuxurious,
    "qr-botanical":                     p.templateQrBotanical,
    "qr-art-deco":                      p.templateQrArtDeco,
    "qr-playful":                       p.templateQrPlayful,
    "qr-clean":                         p.templateQrClean,
    "qr-gold":                          p.templateQrGold,
    "qr-dark":                          p.templateQrDark,
    "table-minimal":                    p.templateTableMinimal,
    "table-bold":                       p.templateTableBold,
    "wedding-invite-blue-floral":       p.templateWeddingInviteBlueFloral,
    "wedding-invite-geometric":         p.templateWeddingInviteGeometric,
    "wedding-invite-watercolor-coast":  p.templateWeddingInviteWatercolorCoast,
    "wedding-invite-navy-botanical":    p.templateWeddingInviteNavyBotanical,
    "wedding-invite-grayscale-glitter": p.templateWeddingInviteGrayscaleGlitter,
    "wedding-invite-terra-pill":        p.templateWeddingInviteTerraPill,
    "wedding-invite-gold-arch-floral":  p.templateWeddingInviteGoldArchFloral,
    "wedding-invite-cherry-blossom":    p.templateWeddingInviteCherryBlossom,
    "wedding-invite-olive-gold-frame":  p.templateWeddingInviteOliveGoldFrame,
    "wedding-invite-gold-circles-photo":p.templateWeddingInviteGoldCirclesPhoto,
  };
}

// ── Main component ────────────────────────────────────────────────────────────

export type TemplatePickerProps = Readonly<{
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  activeTemplate: PrintRouteTemplateId;
  eventKind: EventKind;
  paper: PrintPaperId;
  posterLang: Locale;
  chromePrint: AppUiDict["print"];
}>;

export function TemplatePicker({
  isOpen,
  onClose,
  eventId,
  activeTemplate,
  eventKind,
  paper,
  posterLang,
  chromePrint,
}: TemplatePickerProps) {
  const router = useRouter();
  const labels = buildLabelMap(chromePrint);

  function navigate(tid: PrintRouteTemplateId) {
    const q = new URLSearchParams();
    q.set("template", tid);
    q.set("paper", paper);
    q.set(POSTER_LANG_QUERY, posterLang);
    router.push(`/events/${eventId}/print?${q.toString()}`);
    onClose();
  }

  function Thumb({ tid }: { tid: PrintRouteTemplateId }) {
    const isActive = tid === activeTemplate;
    const isThemed = (QR_THEMED_PRINT_TEMPLATE_IDS as readonly string[]).includes(tid);
    return (
      <button
        className="tpicker-thumb"
        onClick={() => navigate(tid)}
        aria-pressed={isActive}
        aria-label={labels[tid] ?? tid}
      >
        <div className={`tpicker-thumb__frame${isActive ? " tpicker-thumb__frame--active" : ""}`}>
          <div className="tpicker-thumb__inner">
            {isThemed
              ? <ScaledCardThumb templateId={tid as QrThemedTemplateId} />
              : <SwatchThumb templateId={tid} />
            }
          </div>
        </div>
        <span className={`tpicker-thumb__label${isActive ? " tpicker-thumb__label--active" : ""}`}>
          {labels[tid] ?? tid}
        </span>
      </button>
    );
  }

  return (
    <>
      <div
        className={`tpicker-overlay${isOpen ? " tpicker-overlay--open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`tpicker-sheet${isOpen ? " tpicker-sheet--open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Choose a theme"
      >
        <div className="tpicker-handle" aria-hidden />
        <div className="tpicker-header">
          <span className="tpicker-header__title">Choose a theme</span>
          <button className="tpicker-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* QR Card Themes */}
        <p className="tpicker-section-label">QR Card Themes</p>
        <div className="tpicker-grid">
          {QR_THEMED_PRINT_TEMPLATE_IDS.map((tid) => (
            <Thumb key={tid} tid={tid} />
          ))}
        </div>

        {/* Classic QR */}
        <p className="tpicker-section-label">Classic QR</p>
        <div className="tpicker-grid">
          {CLASSIC_QR_IDS.map((tid) => (
            <Thumb key={tid} tid={tid} />
          ))}
        </div>

        {/* Invitations — wedding only */}
        {eventKind === "wedding" && (
          <>
            <p className="tpicker-section-label">Invitations</p>
            <div className="tpicker-grid">
              {INVITATION_IDS.map((tid) => (
                <Thumb key={tid} tid={tid} />
              ))}
            </div>
          </>
        )}

        <div style={{ height: 24 }} />
      </div>
    </>
  );
}
```

- [ ] **Check TypeScript:**

```bash
npx tsc --noEmit 2>&1 | grep "TemplatePicker"
```

Expected: no output.

- [ ] **Commit:**

```bash
git add "app/(app)/events/[id]/print/TemplatePicker.tsx"
git commit -m "feat: TemplatePicker bottom sheet with thumbnail grid"
```

---

### Task 4: EventPrintToolbar redesign

**Files:**
- Modify: `app/(app)/events/[id]/print/EventPrintToolbar.tsx`

- [ ] **Replace the entire file with the redesigned version:**

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";

import { AppBtn } from "@/components/app-ui/AppBtn";
import type { AppUiDict } from "@/lib/app-ui/en";
import type { EventKind } from "@/lib/event-kind";
import type { Locale } from "@/lib/i18n";
import { LOCALES } from "@/lib/i18n";
import {
  POSTER_LANG_QUERY,
  type PrintPaperId,
  type PrintRouteTemplateId,
} from "@/lib/event-print/print-options";
import {
  isInvitationPrintTemplateId,
  isQrThemedPrintTemplateId,
} from "@/lib/event-print/template-catalog";
import { TemplatePicker } from "./TemplatePicker";

export type EventPrintToolbarProps = Readonly<{
  eventId: string;
  activeTemplate: PrintRouteTemplateId;
  eventKind: EventKind;
  paper: PrintPaperId;
  posterLang: Locale;
  chromePrint: AppUiDict["print"];
  localeOptionLabels: AppUiDict["languagePicker"]["locales"];
  backHref: string;
  backLabel: string;
  sheetHelperLine: string;
}>;

function buildPrintHref(
  eventId: string,
  opts: Readonly<{ template: PrintRouteTemplateId; paper: PrintPaperId; posterLang: Locale }>,
): string {
  const q = new URLSearchParams();
  q.set("template", opts.template);
  q.set("paper", opts.paper);
  q.set(POSTER_LANG_QUERY, opts.posterLang);
  return `/events/${eventId}/print?${q.toString()}`;
}

function localeLabel(loc: Locale, labels: AppUiDict["languagePicker"]["locales"]): string {
  if (loc === "en") return labels.en;
  if (loc === "hr") return labels.hr;
  return labels.de;
}

function buildActiveLabel(tid: PrintRouteTemplateId, p: AppUiDict["print"]): string {
  const map: Record<string, string> = {
    "qr-simple": p.templateQrSimple,
    "qr-romantic": p.templateQrRomantic,
    "qr-luxurious": p.templateQrLuxurious,
    "qr-botanical": p.templateQrBotanical,
    "qr-art-deco": p.templateQrArtDeco,
    "qr-playful": p.templateQrPlayful,
    "qr-clean": p.templateQrClean,
    "qr-gold": p.templateQrGold,
    "qr-dark": p.templateQrDark,
    "table-minimal": p.templateTableMinimal,
    "table-bold": p.templateTableBold,
    "wedding-invite-blue-floral": p.templateWeddingInviteBlueFloral,
    "wedding-invite-geometric": p.templateWeddingInviteGeometric,
    "wedding-invite-watercolor-coast": p.templateWeddingInviteWatercolorCoast,
    "wedding-invite-navy-botanical": p.templateWeddingInviteNavyBotanical,
    "wedding-invite-grayscale-glitter": p.templateWeddingInviteGrayscaleGlitter,
    "wedding-invite-terra-pill": p.templateWeddingInviteTerraPill,
    "wedding-invite-gold-arch-floral": p.templateWeddingInviteGoldArchFloral,
    "wedding-invite-cherry-blossom": p.templateWeddingInviteCherryBlossom,
    "wedding-invite-olive-gold-frame": p.templateWeddingInviteOliveGoldFrame,
    "wedding-invite-gold-circles-photo": p.templateWeddingInviteGoldCirclesPhoto,
  };
  return map[tid] ?? tid;
}

function GridIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function EventPrintToolbar({
  eventId,
  activeTemplate,
  eventKind,
  paper,
  posterLang,
  chromePrint,
  localeOptionLabels,
  backHref,
  backLabel,
}: EventPrintToolbarProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const p = chromePrint;
  const isInvitationView =
    isInvitationPrintTemplateId(activeTemplate) ||
    isQrThemedPrintTemplateId(activeTemplate);
  const activeLabel = buildActiveLabel(activeTemplate, p);

  return (
    <>
      {/* ── Sticky top bar ─────────────────────────────────────────── */}
      <div className="print-topbar print:hidden">
        <AppBtn variant="ghost" size="sm" href={backHref} as={Link} style={{ flexShrink: 0 }}>
          ← {backLabel}
        </AppBtn>

        <span className="print-topbar__title">{activeLabel}</span>

        <div className="print-topbar__actions">
          <button
            className="print-change-theme-btn"
            onClick={() => setPickerOpen(true)}
            type="button"
          >
            <GridIcon />
            {p.changeTheme ?? "Change theme"}
          </button>

          {!isInvitationView ? (
            <>
              <AppBtn
                variant="outline"
                size="sm"
                as="a"
                href={`/api/events/${eventId}/qr-pdf?preview=1`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "none" }}
                className="sm:flex"
              >
                {p.previewPdf}
              </AppBtn>
              <AppBtn
                variant="gold"
                size="sm"
                as="a"
                href={`/api/events/${eventId}/qr-pdf`}
                download
              >
                {p.downloadPdf}
              </AppBtn>
            </>
          ) : (
            <AppBtn
              variant="gold"
              size="sm"
              type="button"
              onClick={() => window.print()}
            >
              {p.print}
            </AppBtn>
          )}
        </div>
      </div>

      {/* ── Template picker bottom sheet ───────────────────────────── */}
      <TemplatePicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        eventId={eventId}
        activeTemplate={activeTemplate}
        eventKind={eventKind}
        paper={paper}
        posterLang={posterLang}
        chromePrint={chromePrint}
      />
    </>
  );
}
```

- [ ] **Check TypeScript:**

```bash
npx tsc --noEmit 2>&1 | grep "EventPrintToolbar\|TemplatePicker"
```

Expected: no output.

- [ ] **Commit:**

```bash
git add "app/(app)/events/[id]/print/EventPrintToolbar.tsx"
git commit -m "feat: redesign EventPrintToolbar with sticky bar and theme picker"
```

---

### Task 5: page.tsx — layout cleanup + secondary controls + i18n key

**Files:**
- Modify: `app/(app)/events/[id]/print/page.tsx`
- Modify: `lib/app-ui/en.ts`
- Modify: `lib/app-ui/de.ts`
- Modify: `lib/app-ui/hr.ts`

- [ ] **Add `changeTheme` i18n key to `lib/app-ui/en.ts`** (find the `print:` object, add after `downloadPdf`):

```ts
    downloadPdf: "Download PDF",
    changeTheme: "Change theme",   // ← add this line
    previewPdf: "Preview",
```

- [ ] **Add to `lib/app-ui/de.ts`** (same location relative to `downloadPdf`):

```ts
    downloadPdf: "PDF herunterladen",
    changeTheme: "Design ändern",
    previewPdf: "Vorschau",
```

- [ ] **Add to `lib/app-ui/hr.ts`:**

```ts
    downloadPdf: "Preuzmi PDF",
    changeTheme: "Promijeni temu",
    previewPdf: "Pregled",
```

- [ ] **In `page.tsx`, change the `<main>` opening tag** to remove outer horizontal and top padding (the sticky bar sits flush at the top):

Find:
```tsx
      className="join-shell min-h-screen px-4 py-10 print:bg-white print:px-0 print:py-0"
```

Replace with:
```tsx
      className="join-shell min-h-screen print:bg-white"
      style={{ paddingBottom: 48 }}
```

- [ ] **Replace the inner wrapper `<div>` that sets maxWidth** with a full-width wrapper:

Find:
```tsx
      <div
        style={{
          maxWidth: (isInvitationPrint || isQrThemed) ? "100%" : 960,
          margin: "0 auto",
          width: "100%",
        }}
        className="print:max-w-none"
      >
```

Replace with:
```tsx
      <div style={{ width: "100%" }} className="print:max-w-none">
```

- [ ] **Add secondary controls below the QrThemedPrintSheet render** — insert between the `QrThemedPrintSheet` block and the invitation `<div>`:

Find:
```tsx
        {isQrThemed && qrThemedJoinUrl ? (
          <QrThemedPrintSheet
            template={routeTemplate as QrThemedTemplateId}
            eventTitle={splitEventTitleStored(String(event.title ?? "")).name}
            accessCode={event.access_code}
            joinUrl={qrThemedJoinUrl}
          />
        ) : null}
```

Replace with:
```tsx
        {isQrThemed && qrThemedJoinUrl ? (
          <QrThemedPrintSheet
            template={routeTemplate as QrThemedTemplateId}
            eventTitle={splitEventTitleStored(String(event.title ?? "")).name}
            accessCode={event.access_code}
            joinUrl={qrThemedJoinUrl}
          />
        ) : null}

        {/* Secondary controls: paper size (all templates) + language (classic QR only) */}
        {!isInvitationPrint && (
          <div className="print-secondary-controls print:hidden">
            <div className="print-secondary-controls__group">
              <span className="print-secondary-controls__label">Paper</span>
              {(["a4", "letter"] as const).map((p) => (
                <Link
                  key={p}
                  href={`/events/${id}/print?template=${routeTemplate}&paper=${p}&${POSTER_LANG_QUERY}=${posterLocale}`}
                  scroll={false}
                  prefetch={false}
                  className={`print-secondary-controls__pill${paper === p ? " print-secondary-controls__pill--active" : ""}`}
                >
                  {p === "a4" ? "A4" : "Letter"}
                </Link>
              ))}
            </div>
            {!isQrThemed && (
              <div className="print-secondary-controls__group">
                <span className="print-secondary-controls__label">{uiDict.print.posterLanguageLabel}</span>
                {LOCALES.map((loc) => (
                  <Link
                    key={loc}
                    href={`/events/${id}/print?template=${routeTemplate}&paper=${paper}&${POSTER_LANG_QUERY}=${loc}`}
                    scroll={false}
                    prefetch={false}
                    className={`print-secondary-controls__pill${posterLocale === loc ? " print-secondary-controls__pill--active" : ""}`}
                  >
                    {loc === "en" ? uiDict.languagePicker.locales.en : loc === "hr" ? uiDict.languagePicker.locales.hr : uiDict.languagePicker.locales.de}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
```

- [ ] **Add `LOCALES` import** (already imported from `@/lib/i18n` in page.tsx — verify it's there):

```bash
grep "LOCALES" "app/(app)/events/[id]/print/page.tsx"
```

If missing, add to the `@/lib/i18n` import line:
```ts
import { getUiLocale } from "@/lib/ui-locale";
```
becomes:
```ts
import { getUiLocale } from "@/lib/ui-locale";
// and at the top with i18n imports:
import { LOCALES } from "@/lib/i18n";
```

- [ ] **Check TypeScript:**

```bash
npx tsc --noEmit 2>&1 | grep "print/page\|app-ui"
```

Expected: no output.

- [ ] **Commit:**

```bash
git add "app/(app)/events/[id]/print/page.tsx" \
        "lib/app-ui/en.ts" "lib/app-ui/de.ts" "lib/app-ui/hr.ts"
git commit -m "feat: print page layout cleanup and secondary controls"
```

---

### Task 6: Verify end-to-end in the browser

- [ ] **Start dev server** (if not already running):

```bash
npm run dev
```

- [ ] **Open the print page for any event with a QR themed template:**

```
http://localhost:3000/events/<YOUR_EVENT_ID>/print?template=qr-luxurious&paper=a4&posterLang=en
```

- [ ] **Verify on mobile viewport (DevTools → responsive, 390px wide):**
  - Sticky top bar visible at top: back button, "Luxurious" label, "Change theme" button, "Print" button
  - Single portrait card fills most of the screen on a dark desk background
  - Paper/language secondary controls visible below the card
  - Tapping "Change theme" slides up the bottom sheet
  - Sheet shows 3 sections: QR Card Themes (6 thumbnails with actual card renders), Classic QR (5 swatches), no Invitations section (unless event is wedding kind)
  - Tapping a thumbnail navigates to that template and closes the sheet

- [ ] **Verify on desktop viewport (1024px+):**
  - Full A4 sheet with two rotated cards visible
  - Top bar compact but readable
  - Bottom sheet picker still works

- [ ] **Verify print output** (browser print dialog):
  - Top bar hidden
  - Only card content prints
  - No secondary controls or sheet visible in print