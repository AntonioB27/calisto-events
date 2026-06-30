# /start Route — Ad Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a focused `/start` route for social media ad traffic that drops visitors directly into event creation, and update the main landing page hero CTA to point there.

**Architecture:** The PlanCards component is split into two reusable sub-components (`PlanQuickStartForm`, `PlanCardList`) so the new `/start` page can compose them without pulling in the full section header. A new `StartPageClient` client component manages form state for the `/start` page. A locale-redirect page at `app/start/page.tsx` mirrors the root `app/page.tsx` pattern so the ad link `calisto.events/start` routes to the correct locale automatically.

**Tech Stack:** Next.js App Router (server + client components), TypeScript, Vitest, emoji-picker-react, Supabase auth (existing patterns)

## Global Constraints

- Never use em dashes (`—`) in any copy, UI strings, or written content
- All copy must be provided for all three locales: `en`, `hr`, `de`
- Glass UI style: warm-tinted amber glass, specular highlights — no pure-white glass
- Do not commit changes (user handles all git)
- Component test files end in `.test.ts` (not `.test.tsx`); vitest runs in `node` environment so React rendering is not available in tests — test only exported pure functions and server component redirect logic
- Run `npm test` to verify tests pass; run `npm run build` to verify TypeScript compiles

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `lib/i18n.ts` | Add `startHeadline`, `startSubheadline`, `startTrustBar` to type + all 3 locale objects; update `heroPrimaryCta` values |
| Create | `lib/i18n.start-copy.test.ts` | Verify new keys present in all locales |
| Create | `components/plan-cards/PlanQuickStartForm.tsx` | Polaroid card form (name, date, emoji) — owns picker open state internally |
| Create | `components/plan-cards/PlanCardList.tsx` | Plan cards grid + footnote + all plan-related CSS |
| Modify | `components/PlanCards.tsx` | Thin wrapper composing PlanQuickStartForm + PlanCardList; public API unchanged |
| Modify | `components/Hero.tsx` | Add `locale` prop; change primary CTA to `/{locale}/start` with new text |
| Modify | `app/[locale]/page.tsx` | Pass `locale` to `<Hero>` |
| Create | `app/start/page.tsx` | Detect locale, redirect to `/{locale}/start` |
| Create | `app/start/page.test.ts` | Verify redirect behavior |
| Create | `components/StartPageClient.tsx` | Client component: manages form state, renders headline + form + cards + trust bar |
| Create | `app/[locale]/start/page.tsx` | Server component: loads copy, renders minimal header + StartPageClient |
| Create | `app/[locale]/start/page.test.ts` | Verify locale validation + notFound behavior |

---

### Task 1: Add i18n copy keys

**Files:**
- Modify: `lib/i18n.ts`
- Create: `lib/i18n.start-copy.test.ts`

**Interfaces:**
- Produces: `LandingCopy.startHeadline: string`, `LandingCopy.startSubheadline: string`, `LandingCopy.startTrustBar: readonly [string, string, string]`
- Produces: updated `heroPrimaryCta` values for all locales

- [ ] **Step 1: Add new fields to `LandingCopy` type**

In `lib/i18n.ts`, after line `brandIconAlt: string;` (currently line 152), add three new fields:

```typescript
  brandIconAlt: string;
  startHeadline: string;
  startSubheadline: string;
  startTrustBar: readonly [string, string, string];
  pageTitle: string;
```

- [ ] **Step 2: Add English values**

In the `en` locale object, find `brandIconAlt: "Calisto logo",` and add after it:

```typescript
    brandIconAlt: "Calisto logo",
    startHeadline: "Your event, ready in 30 seconds",
    startSubheadline: "Guests scan a QR code and share photos in real time. You keep everything.",
    startTrustBar: ["No credit card until checkout", "Setup takes 30 seconds", "500+ events hosted"],
```

Also update the English `heroPrimaryCta`:

```typescript
    heroPrimaryCta: "Create your event",
```

- [ ] **Step 3: Add Croatian values**

Find `brandIconAlt: "Calisto logotip",` in the `hr` block and add after it:

```typescript
    brandIconAlt: "Calisto logotip",
    startHeadline: "Vaš događaj, spreman za 30 sekundi",
    startSubheadline: "Gosti skeniraju QR kod i dijele fotografije u stvarnom vremenu. Sve ostaje vaše zauvijek.",
    startTrustBar: ["Nema kartice do naplate", "Postavljanje traje 30 sekundi", "500+ događaja"],
```

Also update Croatian `heroPrimaryCta`:

```typescript
    heroPrimaryCta: "Kreiraj događaj",
```

- [ ] **Step 4: Add German values**

Find `brandIconAlt: "Calisto-Logo",` in the `de` block and add after it:

```typescript
    brandIconAlt: "Calisto-Logo",
    startHeadline: "Dein Event, bereit in 30 Sekunden",
    startSubheadline: "Gäste scannen einen QR-Code und teilen Fotos in Echtzeit. Du behältst alles für immer.",
    startTrustBar: ["Keine Karte bis zur Zahlung", "Einrichtung dauert 30 Sekunden", "500+ Events"],
```

Also update German `heroPrimaryCta`:

```typescript
    heroPrimaryCta: "Event erstellen",
```

- [ ] **Step 5: Write failing test**

Create `lib/i18n.start-copy.test.ts`:

```typescript
import { describe, expect, test } from "vitest";
import { getLandingCopy, LOCALES } from "./i18n";

describe("start page copy", () => {
  test.each(LOCALES)("%s locale has startHeadline", (locale) => {
    const copy = getLandingCopy(locale);
    expect(copy.startHeadline).toBeTruthy();
    expect(copy.startHeadline.length).toBeGreaterThan(5);
  });

  test.each(LOCALES)("%s locale has startSubheadline", (locale) => {
    const copy = getLandingCopy(locale);
    expect(copy.startSubheadline).toBeTruthy();
  });

  test.each(LOCALES)("%s locale has startTrustBar with 3 items", (locale) => {
    const copy = getLandingCopy(locale);
    expect(copy.startTrustBar).toHaveLength(3);
    copy.startTrustBar.forEach((item) => expect(item.length).toBeGreaterThan(0));
  });

  test.each(LOCALES)("%s locale heroPrimaryCta is not the old value", (locale) => {
    const copy = getLandingCopy(locale);
    expect(copy.heroPrimaryCta).not.toBe("Try for free");
    expect(copy.heroPrimaryCta).not.toBe("Isprobaj besplatno");
    expect(copy.heroPrimaryCta).not.toBe("Kostenlos ausprobieren");
  });
});
```

- [ ] **Step 6: Run test — expect failure**

```bash
cd /Users/antoniobecic/repo/calisto-events && npm test -- lib/i18n.start-copy.test.ts
```

Expected: TypeScript error or test failures because the new keys don't exist yet.

- [ ] **Step 7: Run test after completing Steps 1-4 — expect pass**

```bash
cd /Users/antoniobecic/repo/calisto-events && npm test -- lib/i18n.start-copy.test.ts
```

Expected: 12 tests pass (3 locales x 4 assertions).

- [ ] **Step 8: Verify TypeScript compiles**

```bash
cd /Users/antoniobecic/repo/calisto-events && npm run build 2>&1 | head -30
```

Expected: No TypeScript errors about missing `startHeadline`, `startSubheadline`, or `startTrustBar`.

---

### Task 2: Extract PlanQuickStartForm

**Files:**
- Create: `components/plan-cards/PlanQuickStartForm.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks
- Produces: `PlanQuickStartForm` — exported React component; `PlanQuickStartFormProps` — exported type

- [ ] **Step 1: Create the directory and file**

Create `components/plan-cards/PlanQuickStartForm.tsx` with the full contents below. This extracts the polaroid card section from `PlanCards.tsx`. The component owns `pickerOpen` and `emojiBoxRef` internally so callers only manage `name`, `date`, and `emoji`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import EmojiPicker, { type EmojiClickData, Theme } from "emoji-picker-react";

export type PlanQuickStartFormProps = {
  name: string;
  onNameChange: (v: string) => void;
  date: string;
  onDateChange: (v: string) => void;
  emoji: string;
  onEmojiChange: (v: string) => void;
  shaking: boolean;
  nameInputRef: React.RefObject<HTMLInputElement>;
  copy: {
    plansFormNamePlaceholder: string;
    plansFormDateLabel: string;
    plansFormEmojiPlaceholder: string;
  };
};

export function PlanQuickStartForm({
  name,
  onNameChange,
  date,
  onDateChange,
  emoji,
  onEmojiChange,
  shaking,
  nameInputRef,
  copy,
}: PlanQuickStartFormProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const emojiBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pickerOpen) return;
    const onDocDown = (e: MouseEvent) => {
      if (!emojiBoxRef.current?.contains(e.target as Node)) setPickerOpen(false);
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [pickerOpen]);

  return (
    <div style={{ marginBottom: 32, position: "relative", paddingTop: 18, zIndex: 1 }}>
      {/* Washi tape */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 4,
          left: "50%",
          transform: "translateX(-50%) rotate(-2deg)",
          width: 64,
          height: 14,
          background: "rgba(212,168,67,0.48)",
          border: "0.5px solid rgba(212,168,67,0.6)",
          boxShadow: "0 2px 6px rgba(0,0,0,0.22)",
          zIndex: 2,
          borderRadius: 2,
          pointerEvents: "none",
        }}
      />

      {/* Polaroid card */}
      <div
        style={{
          background: "#f9f6f1",
          padding: "14px 18px 30px",
          borderRadius: 2,
          boxShadow: "0 8px 28px rgba(0,0,0,0.28), 0 2px 6px rgba(0,0,0,0.16)",
          transform: "rotate(-0.6deg)",
          position: "relative",
        }}
      >
        {/* Emoji header */}
        <div
          role="button"
          tabIndex={0}
          aria-label={copy.plansFormEmojiPlaceholder}
          onClick={() => setPickerOpen((v) => !v)}
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              setPickerOpen((v) => !v);
            }
          }}
          style={{
            cursor: "pointer",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            padding: "20px 16px 16px",
            background: "linear-gradient(160deg, rgba(197,146,42,0.13) 0%, rgba(197,146,42,0.04) 100%)",
            borderBottom: "1px solid rgba(197,146,42,0.18)",
            userSelect: "none",
          }}
        >
          <span aria-hidden style={{ position: "absolute", top: 12, left: 14, width: 16, height: 16, borderTop: "2px solid rgba(197,146,42,0.55)", borderLeft: "2px solid rgba(197,146,42,0.55)", borderRadius: "2px 0 0 0", pointerEvents: "none" }} />
          <span aria-hidden style={{ position: "absolute", top: 12, right: 14, width: 16, height: 16, borderTop: "2px solid rgba(197,146,42,0.55)", borderRight: "2px solid rgba(197,146,42,0.55)", borderRadius: "0 2px 0 0", pointerEvents: "none" }} />
          <span style={{ fontSize: 56, lineHeight: 1, filter: "drop-shadow(0 4px 12px rgba(40,25,15,0.18))" }}>
            {emoji || "📅"}
          </span>
          <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(163,113,24,0.6)", fontFamily: "'DM Sans', sans-serif" }}>
            {copy.plansFormEmojiPlaceholder}
          </span>
        </div>

        {/* Name + date inputs */}
        <div style={{ padding: "14px 16px 0" }}>
          <div className="plan-form-inputs">
            <input
              ref={nameInputRef}
              type="text"
              autoComplete="off"
              aria-label={copy.plansFormNamePlaceholder}
              placeholder={copy.plansFormNamePlaceholder}
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              style={{
                background: "rgba(255,255,255,0.8)",
                border: `1.5px solid ${shaking ? "rgba(210,80,110,0.65)" : "#DDD4C5"}`,
                borderRadius: 8,
                padding: "10px 13px",
                fontFamily: "'DM Serif Display', serif",
                fontStyle: "italic",
                fontSize: 16,
                color: "#221509",
                outline: "none",
                transition: "border-color 200ms",
                width: "100%",
                boxSizing: "border-box",
                letterSpacing: "-0.01em",
              }}
            />
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split("T")[0]}
              aria-label={copy.plansFormDateLabel}
              onChange={(e) => onDateChange(e.target.value)}
              style={{
                background: "rgba(255,255,255,0.8)",
                border: "1.5px solid #DDD4C5",
                borderRadius: 8,
                padding: "10px 13px",
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                color: "#221509",
                outline: "none",
                colorScheme: "light",
                width: "100%",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* Emoji picker row */}
        <div
          ref={emojiBoxRef}
          style={{
            position: "relative",
            borderTop: "1px dashed #DDD4C5",
            margin: "14px 0 0",
            padding: "10px 16px 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <p style={{ margin: 0, fontSize: 11, color: "#9A8570", fontFamily: "'DM Sans', sans-serif" }}>
            {emoji ? emoji : "📅"}&ensp;{copy.plansFormEmojiPlaceholder}
          </p>
          <button
            type="button"
            onClick={() => setPickerOpen((v) => !v)}
            style={{
              flexShrink: 0,
              background: "rgba(255,255,255,0.7)",
              border: `1.5px solid ${pickerOpen ? "#C5922A" : "#DDD4C5"}`,
              color: pickerOpen ? "#A37118" : "#5A4A36",
              padding: "5px 12px",
              borderRadius: 8,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              transition: "border-color 0.15s, color 0.15s",
            }}
          >
            {pickerOpen ? "✕" : copy.plansFormEmojiPlaceholder}
          </button>
          {pickerOpen && (
            <div
              role="dialog"
              aria-label={copy.plansFormEmojiPlaceholder}
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                zIndex: 20,
                borderRadius: 14,
                overflow: "hidden",
                border: "1.5px solid #DDD4C5",
                boxShadow: "0 20px 40px rgba(40,25,15,0.22)",
              }}
            >
              <EmojiPicker
                width={320}
                height={400}
                lazyLoadEmojis
                searchDisabled={false}
                skinTonesDisabled
                theme={Theme.LIGHT}
                onEmojiClick={(data: EmojiClickData) => {
                  onEmojiChange(data.emoji);
                  setPickerOpen(false);
                }}
              />
            </div>
          )}
        </div>
      </div>

      <style>{`
        .plan-form-inputs {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 10px;
          align-items: center;
        }
        @media (max-width: 600px) {
          .plan-form-inputs {
            grid-template-columns: 1fr !important;
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-6px); }
          40%       { transform: translateX(6px); }
          60%       { transform: translateX(-4px); }
          80%       { transform: translateX(4px); }
        }
        .input-shake { animation: shake 420ms ease; }
      `}</style>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/antoniobecic/repo/calisto-events && npm run build 2>&1 | grep -E "error|Error" | head -20
```

Expected: No errors from `components/plan-cards/PlanQuickStartForm.tsx`.

---

### Task 3: Extract PlanCardList

**Files:**
- Create: `components/plan-cards/PlanCardList.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks
- Produces: `PlanCardList` — exported React component; `PlanCardListProps` — exported type

- [ ] **Step 1: Create `components/plan-cards/PlanCardList.tsx`**

This extracts the plan cards grid, icon components, `PLAN_CONFIG`, and all card-related CSS from `PlanCards.tsx`:

```tsx
"use client";

import type React from "react";
import type { LandingCopy } from "@/lib/i18n";

export type PlanCardListProps = {
  plans: LandingCopy["plans"];
  expandedPlan: string | null;
  onToggle: (id: string) => void;
  onChoose: (e: React.MouseEvent, planId: string) => void;
  copy: Pick<LandingCopy, "plansFormChooseBtn" | "plansPerEventSuffix" | "planFootnote">;
};

type PlanConfig = {
  icon: () => React.ReactElement;
  accentColor: string;
  borderColor: string;
  panelBackground: string;
  detailStripe: string;
  glow: string;
  originalPrice?: string;
};

function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function DiamondIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
      <path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41L13.7 2.71a2.41 2.41 0 0 0-3.41 0Z" />
    </svg>
  );
}
function LayersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
      <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" />
      <path d="M22 17.65l-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m2 11.91 9.17 4.17a2 2 0 0 0 1.66 0L22 11.92" />
    </svg>
  );
}
function RocketIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

const PLAN_CONFIG: Record<string, PlanConfig> = {
  free: {
    icon: LeafIcon,
    accentColor: "#9FC58D",
    borderColor: "rgba(159,197,141,0.35)",
    panelBackground: "linear-gradient(165deg, rgba(159,197,141,0.24) 0%, rgba(159,197,141,0.08) 55%, rgba(0,0,0,0) 100%)",
    detailStripe: "linear-gradient(90deg, rgba(159,197,141,1) 0%, rgba(159,197,141,0.55) 100%)",
    glow: "rgba(159,197,141,0.28)",
  },
  standard: {
    icon: StarIcon,
    accentColor: "#86A9F9",
    borderColor: "rgba(134,169,249,0.35)",
    panelBackground: "linear-gradient(165deg, rgba(134,169,249,0.24) 0%, rgba(134,169,249,0.08) 55%, rgba(0,0,0,0) 100%)",
    detailStripe: "linear-gradient(90deg, rgba(134,169,249,1) 0%, rgba(134,169,249,0.55) 100%)",
    glow: "rgba(134,169,249,0.28)",
  },
  plus: {
    icon: LayersIcon,
    accentColor: "#B89BC4",
    borderColor: "rgba(184,155,196,0.35)",
    panelBackground: "linear-gradient(165deg, rgba(184,155,196,0.24) 0%, rgba(184,155,196,0.08) 55%, rgba(0,0,0,0) 100%)",
    detailStripe: "linear-gradient(90deg, rgba(184,155,196,1) 0%, rgba(184,155,196,0.55) 100%)",
    glow: "rgba(184,155,196,0.3)",
  },
  premium: {
    icon: DiamondIcon,
    accentColor: "#E6A760",
    borderColor: "rgba(230,167,96,0.42)",
    panelBackground: "linear-gradient(165deg, rgba(230,167,96,0.26) 0%, rgba(230,167,96,0.1) 55%, rgba(0,0,0,0) 100%)",
    detailStripe: "linear-gradient(90deg, rgba(230,167,96,1) 0%, rgba(230,167,96,0.6) 100%)",
    glow: "rgba(230,167,96,0.34)",
    originalPrice: "70€",
  },
  max: {
    icon: RocketIcon,
    accentColor: "#E97AA4",
    borderColor: "rgba(233,122,164,0.35)",
    panelBackground: "linear-gradient(165deg, rgba(233,122,164,0.24) 0%, rgba(233,122,164,0.08) 55%, rgba(0,0,0,0) 100%)",
    detailStripe: "linear-gradient(90deg, rgba(233,122,164,1) 0%, rgba(233,122,164,0.55) 100%)",
    glow: "rgba(233,122,164,0.3)",
    originalPrice: "100€",
  },
};

export function PlanCardList({ plans, expandedPlan, onToggle, onChoose, copy }: PlanCardListProps) {
  return (
    <>
      <div
        className="plan-cards-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 22,
          maxWidth: 720,
          margin: "0 auto",
        }}
      >
        {plans.map((plan, idx) => {
          const [priceRow, ...restRows] = plan.rows;
          const config = PLAN_CONFIG[plan.id] ?? PLAN_CONFIG.free!;
          const Icon = config.icon;
          const isExpanded = expandedPlan === plan.id;
          return (
            <article
              key={plan.id}
              className={`plan-card plan-card-${plan.id}`}
              tabIndex={0}
              aria-labelledby={`plan-${plan.id}`}
              aria-expanded={isExpanded}
              data-expanded={isExpanded ? "true" : "false"}
              onClick={() => onToggle(plan.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onToggle(plan.id);
                }
              }}
              style={{
                background: "var(--ink)",
                border: `1px solid ${config.borderColor}`,
                borderRadius: 18,
                overflow: "hidden",
                position: "relative",
                outline: "none",
                cursor: "pointer",
                boxShadow: `0 20px 56px -40px ${config.glow}`,
                animation: "planCardReveal 520ms cubic-bezier(0.16, 1, 0.3, 1) both",
                animationDelay: `${idx * 80}ms`,
              }}
            >
              <div className="plan-card-shell">
                <div className="plan-card-summary" style={{ background: config.panelBackground }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <span
                      style={{
                        display: "inline-flex",
                        width: 30,
                        height: 30,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 9,
                        border: `1px solid ${config.borderColor}`,
                        background: `${config.accentColor}1C`,
                        color: config.accentColor,
                        flexShrink: 0,
                      }}
                    >
                      <Icon />
                    </span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ width: 16, height: 16, color: "var(--cream-4,#6E6758)", flexShrink: 0, transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 280ms ease" }}>
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                  <h3
                    id={`plan-${plan.id}`}
                    style={{
                      fontFamily: "var(--font-display)",
                      fontStyle: "italic",
                      fontSize: 30,
                      fontWeight: 400,
                      color: "var(--cream)",
                      margin: "14px 0 12px",
                      lineHeight: 1.05,
                    }}
                  >
                    {plan.name}
                  </h3>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 56, color: "var(--cream)", lineHeight: 0.94 }}>
                    {config.originalPrice ? (
                      <span
                        style={{
                          display: "block",
                          fontFamily: "var(--font-sans)",
                          fontSize: 20,
                          fontWeight: 500,
                          color: "var(--cream-4, #6E6758)",
                          textDecoration: "line-through",
                          textDecorationThickness: "1.5px",
                          marginBottom: 8,
                        }}
                      >
                        {config.originalPrice}
                      </span>
                    ) : null}
                    {priceRow?.value}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "var(--cream-3, #B5AB99)",
                      marginTop: 7,
                    }}
                  >
                    {copy.plansPerEventSuffix}
                  </div>
                  <p style={{ marginTop: 14, fontFamily: "var(--font-sans)", fontSize: 13.5, color: "var(--cream-3, #B5AB99)", lineHeight: 1.45 }}>
                    {plan.tailoredFor}
                  </p>
                  <button
                    type="button"
                    onClick={(e) => onChoose(e, plan.id)}
                    style={{
                      marginTop: 16,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "9px 16px",
                      borderRadius: 999,
                      background: `${config.accentColor}18`,
                      border: `1px solid ${config.borderColor}`,
                      color: config.accentColor,
                      fontFamily: "var(--font-sans)",
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                      letterSpacing: "0.01em",
                      transition: "background 200ms",
                    }}
                  >
                    {copy.plansFormChooseBtn}
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.75}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ width: 13, height: 13 }}
                      aria-hidden
                    >
                      <path d="M3 8h10M9 4l4 4-4 4" />
                    </svg>
                  </button>
                </div>

                <div className="plan-card-details">
                  <div className="plan-card-details-inner">
                    <div
                      aria-hidden
                      style={{
                        height: 4,
                        borderRadius: 999,
                        background: config.detailStripe,
                        marginBottom: 10,
                      }}
                    />
                    <dl style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                      {restRows.map((row) => (
                        <div
                          key={row.label}
                          className="plan-detail-row"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "minmax(130px, auto) 1fr",
                            alignItems: "center",
                            gap: 14,
                            padding: "13px 0",
                            borderBottom: "1px dashed rgba(181,171,153,0.2)",
                            background: `linear-gradient(90deg, ${config.accentColor}10 0%, rgba(0,0,0,0) 30%)`,
                          }}
                        >
                          <dt
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: 10,
                              color: "var(--cream-4, #6E6758)",
                              letterSpacing: "0.09em",
                              textTransform: "uppercase",
                            }}
                          >
                            {row.label}
                          </dt>
                          <dd
                            style={{
                              fontFamily: "var(--font-sans)",
                              color: "var(--cream)",
                              fontWeight: 600,
                              margin: 0,
                              textAlign: "right",
                              lineHeight: 1.35,
                            }}
                          >
                            {row.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <p
        style={{
          marginTop: 16,
          borderRadius: 12,
          border: "1px solid var(--hair)",
          background: "var(--glass-bg)",
          padding: "12px 16px",
          fontFamily: "var(--font-sans)",
          fontSize: 12.5,
          fontStyle: "italic",
          color: "var(--cream-4, #6E6758)",
          lineHeight: 1.6,
        }}
      >
        {copy.planFootnote}
      </p>

      <style>{`
        @keyframes planCardReveal {
          0%   { opacity: 0; transform: translateY(14px) scale(0.985); }
          100% { opacity: 1; transform: translateY(0)    scale(1); }
        }
        .plan-card-shell { display: grid; grid-template-columns: 1fr; }
        .plan-card-summary { padding: 22px 20px 20px; }
        .plan-card-details {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 280ms ease;
        }
        .plan-card[data-expanded="true"] .plan-card-details { grid-template-rows: 1fr; }
        .plan-card-details-inner {
          overflow: hidden;
          padding: 0 20px;
          border-top: 0px solid transparent;
          transition: padding 280ms ease, border-color 280ms ease;
        }
        .plan-card[data-expanded="true"] .plan-card-details-inner {
          padding: 16px 20px;
          border-top-width: 1px;
          border-top-color: rgba(181,171,153,0.2);
        }
        .plan-card {
          transition: transform 220ms ease, box-shadow 220ms ease, filter 220ms ease;
        }
        .plan-card:hover { transform: translateY(-3px); filter: saturate(1.1); }
        .plan-card-free:hover     { box-shadow: 0 20px 56px -32px rgba(159,197,141,0.35); }
        .plan-card-standard:hover { box-shadow: 0 20px 56px -32px rgba(134,169,249,0.35); }
        .plan-card-plus:hover     { box-shadow: 0 20px 56px -32px rgba(184,155,196,0.38); }
        .plan-card-premium:hover  { box-shadow: 0 20px 56px -32px rgba(230,167,96,0.4); }
        .plan-card-max:hover      { box-shadow: 0 20px 56px -32px rgba(233,122,164,0.38); }
        .plan-detail-row { transition: transform 200ms ease; }
        .plan-card[data-expanded="true"] .plan-detail-row:hover { transform: translateX(2px); }
        .plan-card .plan-detail-row:last-child { border-bottom: none !important; }
        @media (max-width: 780px) {
          .plan-detail-row {
            grid-template-columns: 1fr !important;
            gap: 6px !important;
            padding: 11px 0 !important;
          }
          .plan-detail-row dd { text-align: left !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .plan-card, .plan-card-details, .plan-card-details-inner, .plan-detail-row {
            animation: none !important;
            transition: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/antoniobecic/repo/calisto-events && npm run build 2>&1 | grep -E "error|Error" | head -20
```

Expected: No errors from `components/plan-cards/PlanCardList.tsx`.

---

### Task 3: Refactor PlanCards to use extracted components

**Files:**
- Modify: `components/PlanCards.tsx`

**Interfaces:**
- Consumes: `PlanQuickStartForm` from `components/plan-cards/PlanQuickStartForm.tsx`
- Consumes: `PlanCardList` from `components/plan-cards/PlanCardList.tsx`
- Produces: `PlanCards` — same public API as before, no external change

- [ ] **Step 1: Replace `components/PlanCards.tsx` with the refactored version**

The public API (`PlanCards({ copy })`) is unchanged. All state and logic stays here; the JSX for the polaroid form and plan cards is delegated to the extracted components:

```tsx
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { LandingCopy } from "@/lib/i18n";
import { buildPlanStartUrl } from "@/lib/landing-event-form";
import { PlanQuickStartForm } from "@/components/plan-cards/PlanQuickStartForm";
import { PlanCardList } from "@/components/plan-cards/PlanCardList";

type PlanCardsProps = { copy: LandingCopy };

export function PlanCards({ copy }: PlanCardsProps) {
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [emoji, setEmoji] = useState("");
  const [shaking, setShaking] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const toggle = (id: string) =>
    setExpandedPlan((prev) => (prev === id ? null : id));

  function handleChoose(e: React.MouseEvent, planId: string) {
    e.stopPropagation();
    if (!name.trim()) {
      const el = nameInputRef.current;
      if (el) {
        el.classList.remove("input-shake");
        void el.offsetWidth;
        el.classList.add("input-shake");
      }
      setShaking(true);
      nameInputRef.current?.focus();
      nameInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => setShaking(false), 420);
      return;
    }
    router.push(buildPlanStartUrl(name.trim(), date, emoji, planId));
  }

  return (
    <section
      id="plans"
      className="relative scroll-mt-20"
      style={{ borderTop: "1px solid var(--hair)", padding: "40px 0", zIndex: 2 }}
    >
      <div className="mx-auto" style={{ maxWidth: 1280, padding: "0 32px" }}>
        {/* Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start" style={{ marginBottom: 56 }}>
          <div style={{ width: "100%" }}>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10.5px",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "var(--gold)",
                marginBottom: 14,
              }}
            >
              {copy.plansSectionLabel}
            </div>
            <div className="flex w-full items-center gap-4">
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 400,
                  fontSize: "clamp(36px, 5vw, 64px)",
                  lineHeight: 1.02,
                  letterSpacing: "-0.02em",
                  color: "var(--cream)",
                  margin: 0,
                  flex: 1,
                  minWidth: 0,
                }}
              >
                {copy.plansTitle}
              </h2>
              <div className="ml-auto shrink-0">
                <Image
                  src="/brand/mascot/aurora_present.png"
                  alt={copy.plansMascotAlt}
                  width={200}
                  height={200}
                  style={{ width: 100, height: "auto", objectFit: "contain" }}
                />
              </div>
            </div>
          </div>
        </div>

        <PlanQuickStartForm
          name={name}
          onNameChange={(v) => { setName(v); setShaking(false); }}
          date={date}
          onDateChange={setDate}
          emoji={emoji}
          onEmojiChange={setEmoji}
          shaking={shaking}
          nameInputRef={nameInputRef}
          copy={{
            plansFormNamePlaceholder: copy.plansFormNamePlaceholder,
            plansFormDateLabel: copy.plansFormDateLabel,
            plansFormEmojiPlaceholder: copy.plansFormEmojiPlaceholder,
          }}
        />

        <PlanCardList
          plans={copy.plans}
          expandedPlan={expandedPlan}
          onToggle={toggle}
          onChoose={handleChoose}
          copy={{
            plansFormChooseBtn: copy.plansFormChooseBtn,
            plansPerEventSuffix: copy.plansPerEventSuffix,
            planFootnote: copy.planFootnote,
          }}
        />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Run full test suite**

```bash
cd /Users/antoniobecic/repo/calisto-events && npm test
```

Expected: All existing tests pass. No regressions.

- [ ] **Step 3: Verify TypeScript compiles cleanly**

```bash
cd /Users/antoniobecic/repo/calisto-events && npm run build 2>&1 | grep -E "error|Error" | head -20
```

Expected: No errors.

---

### Task 4: Update Hero CTA

**Files:**
- Modify: `components/Hero.tsx`
- Modify: `app/[locale]/page.tsx`

**Interfaces:**
- Consumes: `LandingCopy.heroPrimaryCta` (updated in Task 1)
- Produces: `Hero` — updated props type with `locale: Locale`

- [ ] **Step 1: Update `components/Hero.tsx`**

Add `locale` to `HeroProps` and change the primary CTA link for non-logged-in visitors:

```tsx
import Image from "next/image";
import type { LandingCopy, Locale } from "@/lib/i18n";

type HeroProps = { copy: LandingCopy; isLoggedIn: boolean; locale: Locale };

export function Hero({ copy, isLoggedIn, locale }: HeroProps) {
```

Then change the primary CTA `href` (around line 46 in the original):

```tsx
              <a
                href={isLoggedIn ? "/dashboard" : `/${locale}/start`}
```

The rest of the Hero component is unchanged.

- [ ] **Step 2: Pass `locale` to `<Hero>` in `app/[locale]/page.tsx`**

Find the line:

```tsx
        <Hero copy={copy} isLoggedIn={isLoggedIn} />
```

Replace with:

```tsx
        <Hero copy={copy} isLoggedIn={isLoggedIn} locale={locale as Locale} />
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/antoniobecic/repo/calisto-events && npm run build 2>&1 | grep -E "error|Error" | head -20
```

Expected: No errors. TypeScript should catch if `locale` is missing from the Hero call.

---

### Task 5: Create /start locale-redirect

**Files:**
- Create: `app/start/page.tsx`
- Create: `app/start/page.test.ts`

**Interfaces:**
- Produces: `app/start/page.tsx` — server component that redirects to `/{locale}/start`

- [ ] **Step 1: Write the failing test**

Create `app/start/page.test.ts`:

```typescript
import { beforeEach, describe, expect, it, vi } from "vitest";

const redirectMock = vi.fn();

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue(null),
  }),
}));

describe("StartRedirectPage", () => {
  beforeEach(() => {
    redirectMock.mockReset();
    redirectMock.mockImplementation(() => { throw new Error("NEXT_REDIRECT"); });
  });

  it("redirects to /en/start when no Accept-Language header", async () => {
    const { default: StartRedirectPage } = await import("./page");
    await expect(StartRedirectPage()).rejects.toThrow("NEXT_REDIRECT");
    expect(redirectMock).toHaveBeenCalledWith("/en/start");
  });

  it("redirects to /hr/start for Croatian Accept-Language", async () => {
    vi.mocked((await import("next/headers")).headers).mockResolvedValue({
      get: vi.fn().mockReturnValue("hr,en;q=0.9"),
    } as never);

    const { default: StartRedirectPage } = await import("./page");
    await expect(StartRedirectPage()).rejects.toThrow("NEXT_REDIRECT");
    expect(redirectMock).toHaveBeenCalledWith("/hr/start");
  });
});
```

- [ ] **Step 2: Run test — expect failure**

```bash
cd /Users/antoniobecic/repo/calisto-events && npm test -- app/start/page.test.ts
```

Expected: FAIL — `./page` module not found.

- [ ] **Step 3: Create `app/start/page.tsx`**

```tsx
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { DEFAULT_LOCALE, LOCALES, isLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

function detectLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const langs = acceptLanguage
    .split(",")
    .map((s) => s.split(";")[0].trim().toLowerCase().split("-")[0]);
  for (const lang of langs) {
    if (isLocale(lang)) return lang as Locale;
  }
  return DEFAULT_LOCALE;
}

export default async function StartRedirectPage() {
  const headersList = await headers();
  const locale = detectLocale(headersList.get("accept-language"));
  redirect(`/${locale}/start`);
}
```

- [ ] **Step 4: Run test — expect pass**

```bash
cd /Users/antoniobecic/repo/calisto-events && npm test -- app/start/page.test.ts
```

Expected: 2 tests pass.

---

### Task 6: Create StartPageClient component

**Files:**
- Create: `components/StartPageClient.tsx`

**Interfaces:**
- Consumes: `PlanQuickStartForm` from `components/plan-cards/PlanQuickStartForm.tsx`
- Consumes: `PlanCardList` from `components/plan-cards/PlanCardList.tsx`
- Produces: `StartPageClient` — exported client component receiving `copy: LandingCopy`

- [ ] **Step 1: Create `components/StartPageClient.tsx`**

```tsx
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { LandingCopy } from "@/lib/i18n";
import { buildPlanStartUrl } from "@/lib/landing-event-form";
import { PlanQuickStartForm } from "@/components/plan-cards/PlanQuickStartForm";
import { PlanCardList } from "@/components/plan-cards/PlanCardList";

type StartPageClientProps = { copy: LandingCopy };

export function StartPageClient({ copy }: StartPageClientProps) {
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [emoji, setEmoji] = useState("");
  const [shaking, setShaking] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const toggle = (id: string) =>
    setExpandedPlan((prev) => (prev === id ? null : id));

  function handleChoose(e: React.MouseEvent, planId: string) {
    e.stopPropagation();
    if (!name.trim()) {
      const el = nameInputRef.current;
      if (el) {
        el.classList.remove("input-shake");
        void el.offsetWidth;
        el.classList.add("input-shake");
      }
      setShaking(true);
      nameInputRef.current?.focus();
      nameInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => setShaking(false), 420);
      return;
    }
    router.push(buildPlanStartUrl(name.trim(), date, emoji, planId));
  }

  return (
    <main style={{ flex: 1, padding: "48px 0 64px" }}>
      <div className="mx-auto" style={{ maxWidth: 720, padding: "0 24px" }}>
        {/* Headline block */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontSize: "clamp(36px, 6vw, 64px)",
              lineHeight: 1.02,
              letterSpacing: "-0.025em",
              color: "var(--cream)",
              margin: "0 0 16px",
            }}
          >
            {copy.startHeadline}
          </h1>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 16,
              lineHeight: 1.55,
              color: "var(--cream-3, #B5AB99)",
              margin: "0 auto",
              maxWidth: 480,
            }}
          >
            {copy.startSubheadline}
          </p>
        </div>

        {/* Form + plan cards */}
        <PlanQuickStartForm
          name={name}
          onNameChange={(v) => { setName(v); setShaking(false); }}
          date={date}
          onDateChange={setDate}
          emoji={emoji}
          onEmojiChange={setEmoji}
          shaking={shaking}
          nameInputRef={nameInputRef}
          copy={{
            plansFormNamePlaceholder: copy.plansFormNamePlaceholder,
            plansFormDateLabel: copy.plansFormDateLabel,
            plansFormEmojiPlaceholder: copy.plansFormEmojiPlaceholder,
          }}
        />

        <PlanCardList
          plans={copy.plans}
          expandedPlan={expandedPlan}
          onToggle={toggle}
          onChoose={handleChoose}
          copy={{
            plansFormChooseBtn: copy.plansFormChooseBtn,
            plansPerEventSuffix: copy.plansPerEventSuffix,
            planFootnote: copy.planFootnote,
          }}
        />

        {/* Trust bar */}
        <div
          style={{
            marginTop: 28,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "8px 24px",
          }}
        >
          {copy.startTrustBar.map((item) => (
            <span
              key={item}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--cream-4, #6E6758)",
              }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/antoniobecic/repo/calisto-events && npm run build 2>&1 | grep -E "error|Error" | head -20
```

Expected: No errors.

---

### Task 7: Create /[locale]/start page

**Files:**
- Create: `app/[locale]/start/page.tsx`
- Create: `app/[locale]/start/page.test.ts`

**Interfaces:**
- Consumes: `StartPageClient` from `components/StartPageClient.tsx`
- Consumes: `getLandingCopy`, `isLocale`, `LOCALES` from `lib/i18n.ts`
- Produces: `app/[locale]/start` route — focused ad landing page

- [ ] **Step 1: Write the failing test**

Create `app/[locale]/start/page.test.ts`:

```typescript
import { beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.fn();

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
}));

describe("LocaleStartPage", () => {
  beforeEach(() => {
    notFoundMock.mockReset();
    notFoundMock.mockImplementation(() => { throw new Error("NEXT_NOT_FOUND"); });
  });

  it("calls notFound for an invalid locale", async () => {
    const { default: LocaleStartPage } = await import("./page");
    await expect(
      LocaleStartPage({ params: Promise.resolve({ locale: "xx" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });

  it("renders without error for valid locales", async () => {
    const { default: LocaleStartPage } = await import("./page");
    for (const locale of ["en", "hr", "de"]) {
      const result = await LocaleStartPage({ params: Promise.resolve({ locale }) });
      expect(result).toBeTruthy();
      expect(notFoundMock).not.toHaveBeenCalled();
    }
  });
});
```

- [ ] **Step 2: Run test — expect failure**

```bash
cd /Users/antoniobecic/repo/calisto-events && npm test -- "app/\[locale\]/start/page.test.ts"
```

Expected: FAIL — `./page` module not found.

- [ ] **Step 3: Create `app/[locale]/start/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { StartPageClient } from "@/components/StartPageClient";
import { getLandingCopy, isLocale, LOCALES, type Locale } from "@/lib/i18n";

type LocaleStartPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: LocaleStartPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = getLandingCopy(locale as Locale);
  return {
    title: copy.startHeadline,
    description: copy.startSubheadline,
    robots: { index: false },
  };
}

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleStartPage({ params }: LocaleStartPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const copy = getLandingCopy(locale as Locale);

  return (
    <div className="vibrant-page-bg flex min-h-0 flex-1 flex-col overflow-x-clip">
      <div className="page-vignette" aria-hidden />

      {/* Minimal header — logo only */}
      <header style={{ padding: "20px 24px", display: "flex", justifyContent: "center" }}>
        <a
          href={`/${locale}`}
          style={{ textDecoration: "none" }}
          aria-label="Calisto home"
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 22,
              fontWeight: 500,
              letterSpacing: "0.01em",
              color: "var(--cream)",
            }}
          >
            Calisto
            <em style={{ fontStyle: "italic", color: "var(--cream-2, #E8DCC6)", fontWeight: 400 }}>.</em>
          </span>
        </a>
      </header>

      <StartPageClient copy={copy} />
    </div>
  );
}
```

- [ ] **Step 4: Run test — expect pass**

```bash
cd /Users/antoniobecic/repo/calisto-events && npm test -- "app/\[locale\]/start/page.test.ts"
```

Expected: 2 tests pass.

- [ ] **Step 5: Run full test suite**

```bash
cd /Users/antoniobecic/repo/calisto-events && npm test
```

Expected: All tests pass, including `lib/i18n.start-copy.test.ts` and `app/start/page.test.ts`.

- [ ] **Step 6: Verify TypeScript compiles cleanly**

```bash
cd /Users/antoniobecic/repo/calisto-events && npm run build 2>&1 | grep -E "error|Error" | head -20
```

Expected: No errors. Build succeeds.

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|-----------------|------|
| `app/start/page.tsx` locale redirect | Task 5 |
| `app/[locale]/start/page.tsx` focused page | Task 7 |
| Minimal header (logo only) | Task 7, Step 3 |
| Headline + subheadline block | Task 6 (StartPageClient) |
| Quick-start form front and center | Task 6 (StartPageClient) |
| Plan cards | Task 6 (StartPageClient) |
| Trust bar (3 items) | Task 6 (StartPageClient) |
| No nav, no footer links | Task 7 — no SiteHeader, SiteFooter |
| Hero CTA changed to `/start` | Task 4 |
| `locale` prop added to Hero | Task 4 |
| i18n keys for all 3 locales | Task 1 |
| `heroPrimaryCta` updated in all locales | Task 1 |
| PlanCards public API unchanged | Task 3 |
| `robots: index: false` on /start (not indexed) | Task 7, Step 3 |

**Placeholder scan:** No TBDs or incomplete steps.

**Type consistency:** `PlanQuickStartFormProps` defined in Task 2 and consumed identically in Tasks 3 and 6. `PlanCardListProps` defined in Task 2 (Task 3 heading) and consumed identically in Tasks 3 and 6. `LandingCopy` new keys defined in Task 1 and consumed in Tasks 6 and 7.
