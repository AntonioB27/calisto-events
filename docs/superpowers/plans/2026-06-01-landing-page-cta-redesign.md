# Landing Page CTA Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the landing page CTAs auth-aware and embed an inline event quick-start form inside the Plans section so visitors can fill in event details and select a plan without leaving the page.

**Architecture:** `[locale]/page.tsx` (server component) checks auth and passes `isLoggedIn` to `SiteHeader` and `Hero`. `PlanCards` (already a client component) gains local form state (name, date, emoji) and a Choose button per card that builds a `/events/new?step=3&...` URL via an extracted, testable utility. `PlanCards` does not receive `isLoggedIn` — the plan Choose button always goes to step 3 regardless of auth state.

**Tech Stack:** Next.js App Router, React `useState`/`useRef`, `useRouter` from `next/navigation`, Vitest

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `lib/landing-event-form.ts` | **Create** | URL builder utility |
| `lib/landing-event-form.test.ts` | **Create** | Tests for URL builder |
| `lib/i18n.ts` | Modify | Add 4 new copy keys to type + 3 locales |
| `app/[locale]/page.tsx` | Modify | Auth check → pass `isLoggedIn` to `SiteHeader` and `Hero` |
| `components/SiteHeader.tsx` | Modify | Accept `isLoggedIn`, route nav CTA to `/welcome` or `/dashboard` |
| `components/Hero.tsx` | Modify | Accept `isLoggedIn`, route primary CTA to `#plans` or `/dashboard` |
| `components/PlanCards.tsx` | Modify | Form state + form UI above plan grid + Choose button per card |

---

## Task 1: Create the URL builder utility (TDD)

**Files:**
- Create: `lib/landing-event-form.ts`
- Create: `lib/landing-event-form.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/landing-event-form.test.ts`:

```typescript
import { describe, expect, test } from "vitest";
import { buildPlanStartUrl } from "./landing-event-form";

describe("buildPlanStartUrl", () => {
  test("includes step=3, name, date, planId", () => {
    const url = buildPlanStartUrl("Birthday Party", "2026-12-25", "🎉", "premium");
    const parsed = new URL(url, "http://x");
    expect(parsed.pathname).toBe("/events/new");
    expect(parsed.searchParams.get("step")).toBe("3");
    expect(parsed.searchParams.get("name")).toBe("Birthday Party");
    expect(parsed.searchParams.get("date")).toBe("2026-12-25");
    expect(parsed.searchParams.get("planId")).toBe("premium");
    expect(parsed.searchParams.get("emoji")).toBe("🎉");
  });

  test("omits emoji param when empty string", () => {
    const url = buildPlanStartUrl("Test", "2026-01-01", "", "free");
    expect(url).not.toContain("emoji");
  });

  test("URL-encodes spaces in event name", () => {
    const url = buildPlanStartUrl("My Big Wedding", "2026-06-15", "", "standard");
    const parsed = new URL(url, "http://x");
    expect(parsed.searchParams.get("name")).toBe("My Big Wedding");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /Users/antoniobecic/repo/calisto-events && npx vitest run lib/landing-event-form.test.ts
```

Expected: error — `Cannot find module './landing-event-form'`

- [ ] **Step 3: Create the implementation**

Create `lib/landing-event-form.ts`:

```typescript
export function buildPlanStartUrl(
  name: string,
  date: string,
  emoji: string,
  planId: string,
): string {
  const params = new URLSearchParams({ step: "3", name, date, planId });
  if (emoji) params.set("emoji", emoji);
  return `/events/new?${params.toString()}`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /Users/antoniobecic/repo/calisto-events && npx vitest run lib/landing-event-form.test.ts
```

Expected: 3 tests pass

---

## Task 2: Add i18n copy keys

**Files:**
- Modify: `lib/i18n.ts`

- [ ] **Step 1: Add keys to the `LandingCopy` type (after `planFootnote: string;` on line 119)**

```typescript
  planFootnote: string;
  plansFormNamePlaceholder: string;
  plansFormDateLabel: string;
  plansFormEmojiPlaceholder: string;
  plansFormChooseBtn: string;
```

- [ ] **Step 2: Add EN values (after the `planFootnote` value block around line 359)**

```typescript
    planFootnote:
      "Fair-use policy applies: a reasonable maximum file size per video is enforced to prevent abuse. Uploads that exceed the per-file size limit will be rejected with a clear error message.",
    plansFormNamePlaceholder: "Event name",
    plansFormDateLabel: "Date",
    plansFormEmojiPlaceholder: "Emoji",
    plansFormChooseBtn: "Choose",
```

- [ ] **Step 3: Add HR values (after the HR `planFootnote` value block around line 650)**

```typescript
    planFootnote:
      "Primjenjuje se fair-use politika: postoji razuman maksimalan limit veličine videodatoteke radi sprječavanja zloupotrebe. Datoteke koje prelaze limit bit će odbijene uz jasnu poruku.",
    plansFormNamePlaceholder: "Naziv događaja",
    plansFormDateLabel: "Datum",
    plansFormEmojiPlaceholder: "Emoji",
    plansFormChooseBtn: "Odaberi",
```

- [ ] **Step 4: Add DE values (after the DE `planFootnote` value block around line 943)**

```typescript
    planFootnote:
      "Fair-Use gilt: zur Missbrauchsprävention wird eine angemessene maximale Dateigröße pro Video durchgesetzt. Uploads über dem Limit werden mit einer klaren Fehlermeldung abgewiesen.",
    plansFormNamePlaceholder: "Veranstaltungsname",
    plansFormDateLabel: "Datum",
    plansFormEmojiPlaceholder: "Emoji",
    plansFormChooseBtn: "Auswählen",
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
cd /Users/antoniobecic/repo/calisto-events && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors related to `LandingCopy`

---

## Task 3: Auth check in locale page

**Files:**
- Modify: `app/[locale]/page.tsx`

- [ ] **Step 1: Add the auth check and pass `isLoggedIn` to `SiteHeader` and `Hero`**

Replace the `LocalePage` function body with:

```typescript
export default async function LocalePage({ params }: LocalePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const copy = getLandingCopy(locale);

  const supabase = await createSupabaseAuthServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  return (
    <div className="vibrant-page-bg flex min-h-0 flex-1 flex-col overflow-x-clip">
      <WebMcpTools />
      <div className="page-vignette" aria-hidden />
      <LanguageSelectorPopup copy={copy} locale={locale as Locale} />
      <SiteHeader copy={copy} locale={locale as Locale} isLoggedIn={isLoggedIn} />
      <main className="flex-1">
        <Hero copy={copy} isLoggedIn={isLoggedIn} />
        <AppPreviewWindow copy={copy} />
        <FeatureGrid copy={copy} />
        <HowItWorks copy={copy} />
        <PlanCards copy={copy} />
        <AuroraQuote copy={copy} />
        <FAQ copy={copy} />
        <WaitlistForm copy={copy.waitlist} mascotAlt={copy.auroraMascotAlt} locale={locale as Locale} />
      </main>
      <SiteFooter copy={copy} locale={locale as Locale} />
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/antoniobecic/repo/calisto-events && npx tsc --noEmit 2>&1 | head -30
```

Expected: type errors in `SiteHeader` and `Hero` (they don't accept `isLoggedIn` yet) — these will be fixed in the next two tasks.

---

## Task 4: SiteHeader auth-aware CTA

**Files:**
- Modify: `components/SiteHeader.tsx`

- [ ] **Step 1: Add `isLoggedIn` to the props type and update both anchor hrefs**

Replace the entire file content:

```typescript
import { LanguageSelectorBar } from "@/components/LanguageSelectorBar";
import { ScrollSpyNav } from "@/components/ScrollSpyNav";
import type { LandingCopy, Locale } from "@/lib/i18n";

type SiteHeaderProps = {
  copy: LandingCopy;
  locale: Locale;
  isLoggedIn: boolean;
};

export function SiteHeader({ copy, locale, isLoggedIn }: SiteHeaderProps) {
  const ctaHref = isLoggedIn ? "/dashboard" : "/welcome";

  return (
    <header className="site-header sticky top-0 z-50">
      <div
        className="mx-auto grid w-full max-w-[1280px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1.5 px-4 sm:px-6
          md:flex md:items-center md:justify-between md:gap-6 md:px-8"
      >
        {/* Brand */}
        <a
          href="#top"
          className="min-w-0 shrink-0 focus:outline-none"
          style={{ textDecoration: "none" }}
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

        {/* Right: lang + CTA (row 1 on mobile; end cap on md+) */}
        <div className="flex items-center justify-self-end gap-3 shrink-0 md:order-3">
          <LanguageSelectorBar copy={copy} locale={locale} variant="header" />
          <a
            href={ctaHref}
            className="hidden sm:inline-flex items-center gap-2"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              fontWeight: 500,
              padding: "9px 16px",
              borderRadius: 999,
              background: "linear-gradient(135deg, var(--gold) 0%, var(--amber) 45%, var(--gold-deep) 100%)",
              color: "#1b1208",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.28) inset, 0 10px 32px -8px rgba(240,179,75,0.45)",
              transition: "all 250ms ease",
              textDecoration: "none",
              letterSpacing: "0.01em",
            }}
          >
            {copy.joinWaitlistShort}
            <span aria-hidden style={{ transition: "transform 300ms" }}>→</span>
          </a>
          <a
            href={ctaHref}
            className="sm:hidden"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              fontWeight: 500,
              padding: "8px 14px",
              borderRadius: 999,
              background: "linear-gradient(135deg, var(--gold) 0%, var(--amber) 45%, var(--gold-deep) 100%)",
              color: "#1b1208",
              textDecoration: "none",
            }}
          >
            {copy.joinWaitlistShort}
          </a>
        </div>

        {/* Nav: full-width row on mobile; between brand and tools on md+ */}
        <ScrollSpyNav copy={copy} />
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles (SiteHeader error should be gone)**

```bash
cd /Users/antoniobecic/repo/calisto-events && npx tsc --noEmit 2>&1 | head -30
```

Expected: only the `Hero` error remains

---

## Task 5: Hero auth-aware primary CTA

**Files:**
- Modify: `components/Hero.tsx`

- [ ] **Step 1: Add `isLoggedIn` to props type and update the primary CTA href**

In `components/Hero.tsx`, replace:

```typescript
type HeroProps = { copy: LandingCopy };

export function Hero({ copy }: HeroProps) {
```

with:

```typescript
type HeroProps = { copy: LandingCopy; isLoggedIn: boolean };

export function Hero({ copy, isLoggedIn }: HeroProps) {
```

Then replace the primary CTA anchor:

```typescript
              <a
                href="/events/new"
                className="inline-flex items-center gap-2.5"
```

with:

```typescript
              <a
                href={isLoggedIn ? "/dashboard" : "#plans"}
                className="inline-flex items-center gap-2.5"
```

- [ ] **Step 2: Verify TypeScript compiles cleanly**

```bash
cd /Users/antoniobecic/repo/calisto-events && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors

---

## Task 6: PlanCards — inline form + Choose button

**Files:**
- Modify: `components/PlanCards.tsx`

- [ ] **Step 1: Add imports at the top of `components/PlanCards.tsx`**

Replace:

```typescript
 "use client";

import { useState } from "react";
import type React from "react";
import type { LandingCopy } from "@/lib/i18n";
import Image from "next/image";
```

with:

```typescript
"use client";

import { useRef, useState } from "react";
import type React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { LandingCopy } from "@/lib/i18n";
import { buildPlanStartUrl } from "@/lib/landing-event-form";
```

- [ ] **Step 2: Add form state, ref, router, and `handleChoose` inside the `PlanCards` component**

Replace:

```typescript
export function PlanCards({ copy }: PlanCardsProps) {
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  const toggle = (id: string) =>
    setExpandedPlan((prev) => (prev === id ? null : id));
```

with:

```typescript
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
      setShaking(true);
      nameInputRef.current?.focus();
      nameInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => setShaking(false), 420);
      return;
    }
    router.push(buildPlanStartUrl(name.trim(), date, emoji, planId));
  }
```

- [ ] **Step 3: Add the quick-start form above the plan grid**

Find the comment `{/* Plan stack (single column) */}` and insert the form JSX immediately before it:

```tsx
        {/* Quick-start form */}
        <div
          style={{
            marginBottom: 32,
            borderRadius: 14,
            border: "1px solid var(--hair)",
            background: "var(--glass-bg)",
            padding: "18px 20px",
          }}
        >
          <div className="plan-form-inputs">
            <input
              ref={nameInputRef}
              type="text"
              placeholder={copy.plansFormNamePlaceholder}
              value={name}
              onChange={(e) => { setName(e.target.value); setShaking(false); }}
              className={shaking ? "input-shake" : ""}
              style={{
                background: "transparent",
                border: `1px solid ${shaking ? "rgba(233,122,164,0.6)" : "var(--hair)"}`,
                borderRadius: 9,
                padding: "10px 14px",
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                color: "var(--cream)",
                outline: "none",
                transition: "border-color 200ms",
                width: "100%",
                boxSizing: "border-box",
              }}
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                background: "transparent",
                border: "1px solid var(--hair)",
                borderRadius: 9,
                padding: "10px 14px",
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                color: "var(--cream)",
                outline: "none",
                colorScheme: "dark",
                width: "100%",
                boxSizing: "border-box",
              }}
            />
            <input
              type="text"
              placeholder={copy.plansFormEmojiPlaceholder}
              value={emoji}
              onChange={(e) => {
                const chars = [...e.target.value];
                setEmoji(chars[0] ?? "");
              }}
              style={{
                background: "transparent",
                border: "1px solid var(--hair)",
                borderRadius: 9,
                padding: "10px 14px",
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                color: "var(--cream)",
                outline: "none",
                width: 72,
                textAlign: "center",
                boxSizing: "border-box",
                flexShrink: 0,
              }}
            />
          </div>
        </div>

        {/* Plan stack (single column) */}
```

- [ ] **Step 4: Add the Choose button inside each plan card summary, after the `tailoredFor` paragraph**

Find:

```tsx
                    <p style={{ marginTop: 14, fontFamily: "var(--font-sans)", fontSize: 13.5, color: "var(--cream-3, #B5AB99)", lineHeight: 1.45 }}>
                      {plan.tailoredFor}
                    </p>
                  </div>
```

Replace with:

```tsx
                    <p style={{ marginTop: 14, fontFamily: "var(--font-sans)", fontSize: 13.5, color: "var(--cream-3, #B5AB99)", lineHeight: 1.45 }}>
                      {plan.tailoredFor}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => handleChoose(e, plan.id)}
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
```

- [ ] **Step 5: Add CSS for shake animation and form responsive layout**

Inside the existing `<style>` tag at the bottom of `PlanCards`, add before the closing backtick:

```css
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-6px); }
          40%       { transform: translateX(6px); }
          60%       { transform: translateX(-4px); }
          80%       { transform: translateX(4px); }
        }
        .input-shake { animation: shake 420ms ease; }
        .plan-form-inputs {
          display: grid;
          grid-template-columns: 1fr auto 72px;
          gap: 10px;
          align-items: center;
        }
        @media (max-width: 600px) {
          .plan-form-inputs {
            grid-template-columns: 1fr !important;
          }
          .plan-form-inputs input:last-child {
            width: 100% !important;
          }
        }
```

- [ ] **Step 6: Verify TypeScript compiles cleanly**

```bash
cd /Users/antoniobecic/repo/calisto-events && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors

- [ ] **Step 7: Run all tests**

```bash
cd /Users/antoniobecic/repo/calisto-events && npx vitest run
```

Expected: all tests pass including the 3 new `buildPlanStartUrl` tests
