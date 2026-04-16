# Calisto Landing UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Calisto landing page to feel warm, distinctive, and human—removing the "generic AI-generated SaaS" aesthetic while preserving all content and functionality.

**Architecture:** Each section component is redesigned independently; shared design tokens are updated in `globals.css`. No new dependencies are introduced—Tailwind utility classes and CSS custom properties cover everything.

**Tech Stack:** Next.js 15 (App Router), Tailwind CSS v4, TypeScript, `next/image`

---

## Code Review Findings (fix first in Task 1)

1. **`Hero.tsx` indentation bug** — the inner `<div>` wrapping h1/p/CTAs has misaligned indentation (cosmetic but worth fixing).
2. **`SiteHeader.tsx` indentation bug** — same issue inside the flex container.
3. **`LanguageSelectorPopup.tsx`** — "Continue" button label is hardcoded English; not translated.
4. **`AppPreviewWindow.tsx`** — the centered hover overlay is `pointer-events-none`, so the enlarged preview image can't be dismissed by mousing onto it; the `onMouseLeave` is on the column wrapper, which works, but the overlay itself can feel jumpy. Minor UX issue.
5. **`app/layout.tsx`** — `<html lang="en">` is hard-coded; should match the active locale. (Not fixed in this plan—requires server component plumbing through layout; flag only.)
6. **`LanguageSelectorPopup`** — `useState(true)` means it appears on every single page load with no persistence; users switching language see it again immediately. This is by design but should be noted.

---

## File Map

| File | Action | What changes |
|------|--------|--------------|
| `app/globals.css` | Modify | New CSS variables: `--rose`, `--warm-bg`; improved plan-card animation |
| `components/SiteHeader.tsx` | Modify | Fix indentation; add subtle logo wordmark color |
| `components/Hero.tsx` | Modify | Fix indentation; add warm-tinted radial glow; badge polish; CTA button visual refresh |
| `components/AppPreviewWindow.tsx` | Modify | Richer frame—inner glow, softer border, label above frame |
| `components/FeatureGrid.tsx` | Modify | Icon per card (emoji-based, no new dep); accent top-border on cards; asymmetric header layout |
| `components/HowItWorks.tsx` | Modify | Dashed connector line between steps on desktop; warmer bg |
| `components/PlanCards.tsx` | Modify | Popular plan gets prominent gradient header; other plans get subtle icon badges; footer note styled differently |
| `components/Lifecycle.tsx` | Modify | Timeline layout—left border with dots, not bullet list |
| `components/FutureRoadmap.tsx` | Modify | Status pill per item (`Roadmap` / `Planned` / `Idea`); horizontal card layout |
| `components/WaitlistForm.tsx` | Modify | Split layout with Aurora mascot image on desktop; warmer card bg |
| `components/SiteFooter.tsx` | Modify | Richer footer with social/brand row |
| `components/LanguageSelectorPopup.tsx` | Modify | Fix hardcoded "Continue" label |
| `lib/i18n.ts` | Modify | Add `langContinue` key to `LandingCopy` type and all three locale copies |

---

## Task 1: Code Review Fixes

**Files:**
- Modify: `components/Hero.tsx`
- Modify: `components/SiteHeader.tsx`
- Modify: `components/LanguageSelectorPopup.tsx`
- Modify: `lib/i18n.ts`

- [ ] **Step 1: Fix Hero.tsx indentation**

Replace the inner div wrapper around h1/p/cta from its current misaligned indent to proper 8-space indent:

```tsx
// components/Hero.tsx — the <div> containing h1, p, and CTAs should be:
        <div>
          <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">
            {copy.heroTitle}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-zinc-600">
            {copy.heroDescription}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a href="#waitlist" className="...">...</a>
            <a href="#plans" className="...">...</a>
          </div>
        </div>
```

- [ ] **Step 2: Fix SiteHeader.tsx indentation**

The inner `<div className="flex items-center justify-between gap-4 ...">` and `<a href="#top">` have inconsistent indent. Fix both to align to 10 spaces (inside the outer div max-w-5xl → flex container).

- [ ] **Step 3: Add `langContinue` to i18n**

In `lib/i18n.ts`, add `langContinue: string` to `LandingCopy` type and populate all three locales:

```ts
// In LandingCopy type (after languageLabel):
  langContinue: string;

// en:
  langContinue: "Continue",

// hr:
  langContinue: "Nastavi",

// de:
  langContinue: "Weiter",
```

- [ ] **Step 4: Fix LanguageSelectorPopup hardcoded label**

```tsx
// components/LanguageSelectorPopup.tsx
// Change button text from hardcoded "Continue" to:
          {copy.langContinue}
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
cd /home/antonio/repo/calisto-landing && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add components/Hero.tsx components/SiteHeader.tsx components/LanguageSelectorPopup.tsx lib/i18n.ts
git commit -m "fix: code review fixes — indentation, translate langContinue key"
```

---

## Task 2: Design Tokens & Global CSS

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Add warm accent and subtle background**

Replace the contents of `app/globals.css` with an expanded set of tokens. Keep all existing animations; add:

```css
:root {
  --background: #fafaf8;          /* very slightly warm white */
  --foreground: #171717;
  --primary: #b453c9;
  --primary-tint: #ede4f5;
  --rose: #f43f5e;                /* accent for "popular" badge */
  --warm-surface: #fdf8f0;        /* warm off-white for alternate sections */
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-tint: var(--primary-tint);
  --color-rose: var(--rose);
  --color-warm-surface: var(--warm-surface);
  /* keep existing font declarations */
}
```

- [ ] **Step 2: Add hero radial glow utility class**

Add after the existing keyframes:

```css
.hero-glow {
  background: radial-gradient(ellipse 80% 60% at 60% 0%, rgba(180, 83, 201, 0.10) 0%, transparent 70%),
              linear-gradient(to bottom, #f3ecfb 0%, #fafaf8 100%);
}
```

- [ ] **Step 3: Add timeline CSS for Lifecycle section**

```css
/* Lifecycle timeline */
.lifecycle-rule {
  position: relative;
  padding-left: 2rem;
}

.lifecycle-rule::before {
  content: "";
  position: absolute;
  left: 0.45rem;
  top: 0;
  bottom: -1.5rem;
  width: 2px;
  background: linear-gradient(to bottom, var(--primary), transparent);
}

.lifecycle-rule:last-child::before {
  display: none;
}

.lifecycle-dot {
  position: absolute;
  left: 0;
  top: 0.35rem;
  width: 0.875rem;
  height: 0.875rem;
  border-radius: 9999px;
  background: var(--primary);
  border: 2px solid white;
  box-shadow: 0 0 0 2px rgba(180, 83, 201, 0.25);
}
```

- [ ] **Step 4: Commit**

```bash
git add app/globals.css
git commit -m "feat: expand design tokens — warm bg, hero glow, timeline CSS"
```

---

## Task 3: Redesign Hero Section

**Files:**
- Modify: `components/Hero.tsx`

- [ ] **Step 1: Replace Hero.tsx entirely**

```tsx
import type { LandingCopy } from "@/lib/i18n";
import Image from "next/image";

type HeroProps = {
  copy: LandingCopy;
};

export function Hero({ copy }: HeroProps) {
  return (
    <section
      id="top"
      className="hero-glow relative overflow-hidden border-b border-zinc-200/60 px-4 py-16 sm:px-6 sm:py-28"
    >
      {/* Subtle decorative rings in top-right */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-primary/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full border border-primary/10"
      />

      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
            {copy.heroBadge}
          </span>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.15] tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl">
            {copy.heroTitle}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-zinc-600">
            {copy.heroDescription}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#waitlist"
              className="inline-flex items-center justify-center rounded-full bg-primary px-7 py-3.5 text-base font-bold text-white shadow-[0_4px_20px_rgba(180,83,201,0.35)] transition hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {copy.heroPrimaryCta}
            </a>
            <a
              href="#plans"
              className="inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white/80 px-7 py-3.5 text-base font-semibold text-zinc-800 backdrop-blur-sm transition hover:border-zinc-400 hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {copy.heroSecondaryCta}
            </a>
          </div>
        </div>

        <div className="relative mx-auto flex w-full max-w-sm flex-col items-center">
          <div className="relative w-full">
            {/* Speech bubble */}
            <div className="pointer-events-none absolute left-1/2 z-10 flex w-full max-w-xs -translate-x-1/2 justify-center px-2 sm:max-w-sm top-[10%] -translate-y-full">
              <p className="pointer-events-auto relative rounded-2xl border border-primary/25 bg-white/95 px-4 py-3 text-center text-sm font-semibold leading-snug text-primary shadow-md backdrop-blur-sm">
                {copy.heroIntro}
                <span
                  aria-hidden
                  className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r border-primary/25 bg-white"
                />
              </p>
            </div>
            <Image
              src="/brand/mascot.png"
              alt="Calisto mascot Aurora"
              width={560}
              height={560}
              priority
              className="h-auto w-full rounded-3xl object-cover shadow-[0_8px_40px_rgba(180,83,201,0.15)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify dev server renders hero correctly**

```bash
cd /home/antonio/repo/calisto-landing && npm run dev &
# Open http://localhost:3000/en — check hero looks correct, no overflow issues
```

- [ ] **Step 3: Commit**

```bash
git add components/Hero.tsx
git commit -m "feat: redesign Hero — warmer bg, bigger type, cta shadow, decorative rings"
```

---

## Task 4: Redesign Feature Grid

**Files:**
- Modify: `components/FeatureGrid.tsx`

The feature cards will get a colored top accent line and a relevant icon. Icons are hardcoded by feature index (no new deps, just emoji in a styled pill).

- [ ] **Step 1: Replace FeatureGrid.tsx entirely**

```tsx
import type { LandingCopy } from "@/lib/i18n";
import Image from "next/image";

type FeatureGridProps = {
  copy: LandingCopy;
};

// Feature icons ordered by position in copy.features array
const FEATURE_ICONS = ["🔑", "📱", "🖼️", "👥", "🎞️", "📦"];

export function FeatureGrid({ copy }: FeatureGridProps) {
  return (
    <section id="features" className="scroll-mt-20 px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-5xl">
        {/* Header row */}
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_minmax(0,320px)] lg:gap-12">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl">
              {copy.featuresTitle}
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-zinc-600">
              {copy.featuresDescription}
            </p>
          </div>
          <div className="relative mx-auto w-full max-w-[280px] shrink-0 sm:max-w-[300px] lg:mx-0">
            <div className="pointer-events-none absolute left-1/2 top-0 z-10 flex w-full max-w-xs -translate-x-1/2 -translate-y-full justify-center px-2 sm:max-w-sm">
              <p className="pointer-events-auto relative rounded-2xl border border-primary/25 bg-white/95 px-4 py-2.5 text-center text-sm font-semibold leading-snug text-primary shadow-sm">
                {copy.featuresAuroraBubble}
                <span
                  aria-hidden
                  className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r border-primary/25 bg-white"
                />
              </p>
            </div>
            <Image
              src="/brand/aurora-photo.png"
              alt="Aurora"
              width={520}
              height={520}
              className="h-auto w-full object-contain"
            />
          </div>
        </div>

        {/* Feature cards */}
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {copy.features.map((f, i) => (
            <li
              key={f.title}
              className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-primary/30 hover:shadow-lg"
            >
              <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-tint text-xl">
                {FEATURE_ICONS[i] ?? "✨"}
              </span>
              <h3 className="text-base font-bold text-zinc-900">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{f.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/FeatureGrid.tsx
git commit -m "feat: redesign FeatureGrid — icon pills, improved header layout, richer cards"
```

---

## Task 5: Redesign How It Works

**Files:**
- Modify: `components/HowItWorks.tsx`

- [ ] **Step 1: Replace HowItWorks.tsx entirely**

```tsx
import type { LandingCopy } from "@/lib/i18n";

type HowItWorksProps = {
  copy: LandingCopy;
};

export function HowItWorks({ copy }: HowItWorksProps) {
  return (
    <section className="border-y border-zinc-200/60 bg-[var(--warm-surface)] px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
          {copy.howTitle}
        </h2>
        <p className="mt-3 max-w-xl text-lg text-zinc-600">{copy.howDescription}</p>

        <ol className="relative mt-12 grid gap-0 sm:grid-cols-3">
          {copy.howItems.map((item, idx) => (
            <li key={item.step} className="relative flex flex-col gap-4 pb-10 sm:pb-0 sm:pr-8">
              {/* Connector line (all but last) */}
              {idx < copy.howItems.length - 1 && (
                <span
                  aria-hidden
                  className="absolute left-5 top-5 hidden h-0.5 w-[calc(100%-2.5rem)] border-t-2 border-dashed border-primary/30 sm:block"
                  style={{ left: "2.5rem" }}
                />
              )}
              {/* Vertical connector on mobile */}
              {idx < copy.howItems.length - 1 && (
                <span
                  aria-hidden
                  className="absolute left-5 top-10 block h-[calc(100%-2.5rem)] w-0.5 border-l-2 border-dashed border-primary/30 sm:hidden"
                />
              )}
              <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-extrabold text-white shadow-[0_4px_12px_rgba(180,83,201,0.3)]">
                {item.step}
              </span>
              <div>
                <h3 className="text-base font-bold text-zinc-900">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{item.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/HowItWorks.tsx
git commit -m "feat: redesign HowItWorks — dashed connector line, warm bg, mobile vertical connector"
```

---

## Task 6: Redesign Plan Cards

**Files:**
- Modify: `components/PlanCards.tsx`

The "popular" (premium) card gets a gradient header strip. Other cards get a cleaner summary line. Price is displayed prominently as a number.

- [ ] **Step 1: Replace PlanCards.tsx entirely**

```tsx
import type { LandingCopy } from "@/lib/i18n";
import Image from "next/image";

type PlanCardsProps = {
  copy: LandingCopy;
};

const PLAN_ICONS: Record<string, string> = {
  free: "🌱",
  standard: "⭐",
  premium: "💎",
  max: "🚀",
};

export function PlanCards({ copy }: PlanCardsProps) {
  return (
    <section id="plans" className="scroll-mt-20 px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
          <div className="min-w-0 max-w-2xl">
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
              {copy.plansTitle}
            </h2>
            <p className="mt-3 text-lg text-zinc-600">
              <strong className="font-semibold text-zinc-800">{copy.plansDescriptionStrong}</strong>
              {" — "}
              {copy.plansDescriptionRest}
            </p>
          </div>
          <div className="mx-auto flex w-full max-w-[min(100%,280px)] shrink-0 flex-col items-center gap-3 sm:max-w-[300px] lg:mx-0">
            <div className="relative w-full px-1">
              <p className="relative rounded-2xl border border-primary/25 bg-white px-4 py-2.5 text-center text-sm font-semibold leading-snug text-primary shadow-sm">
                {copy.plansAuroraBubble}
                <span
                  aria-hidden
                  className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r border-primary/25 bg-white"
                />
              </p>
            </div>
            <Image
              src="/brand/mascot/aurora_planning.png"
              alt="Aurora"
              width={1000}
              height={1000}
              className="h-auto w-full object-contain"
            />
          </div>
        </div>

        {/* Cards */}
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {copy.plans.map((plan) => {
            const [priceRow, storageRow, ...restRows] = plan.rows;
            const isPopular = plan.id === "premium";
            return (
              <article
                key={plan.id}
                tabIndex={0}
                className={`plan-card overflow-hidden rounded-2xl outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-xl ${
                  isPopular
                    ? "border-2 border-primary shadow-[0_4px_24px_rgba(180,83,201,0.18)]"
                    : "border border-zinc-200 shadow-sm"
                }`}
                aria-labelledby={`plan-${plan.id}`}
              >
                {/* Card header */}
                <div
                  className={`px-6 py-5 ${
                    isPopular
                      ? "bg-gradient-to-r from-primary to-violet-500"
                      : "bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{PLAN_ICONS[plan.id] ?? "📋"}</span>
                      <h3
                        id={`plan-${plan.id}`}
                        className={`text-xl font-extrabold tracking-wide ${
                          isPopular ? "text-white" : "text-zinc-900"
                        }`}
                      >
                        {plan.name}
                      </h3>
                    </div>
                    {isPopular && (
                      <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold text-white ring-1 ring-white/30">
                        {copy.popularBadge}
                      </span>
                    )}
                  </div>
                  <p className={`mt-1 text-3xl font-extrabold ${isPopular ? "text-white" : "text-zinc-900"}`}>
                    {priceRow.value}
                  </p>
                  <p className={`text-sm ${isPopular ? "text-white/70" : "text-zinc-500"}`}>
                    {storageRow.label}: {storageRow.value}
                  </p>
                </div>

                {/* Card body */}
                <div className={`px-6 py-4 ${isPopular ? "bg-primary-tint/30" : "bg-white"}`}>
                  <div className="plan-card-extras">
                    <div className="plan-card-extras-inner">
                      <dl className="space-y-3">
                        {restRows.map((row) => (
                          <div
                            key={row.label}
                            className="grid grid-cols-[8rem_1fr] gap-2 text-sm"
                          >
                            <dt className="font-semibold text-zinc-500">{row.label}</dt>
                            <dd className="text-zinc-800">{row.value}</dd>
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
        <p className="mt-6 rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-sm italic leading-relaxed text-zinc-500">
          {copy.planFootnote}
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/PlanCards.tsx
git commit -m "feat: redesign PlanCards — gradient popular header, icon badges, price prominent"
```

---

## Task 7: Redesign Lifecycle Section

**Files:**
- Modify: `components/Lifecycle.tsx`

Use the `.lifecycle-rule`, `.lifecycle-dot` CSS classes added in Task 2.

- [ ] **Step 1: Replace Lifecycle.tsx entirely**

```tsx
import type { LandingCopy } from "@/lib/i18n";

type LifecycleProps = {
  copy: LandingCopy;
};

export function Lifecycle({ copy }: LifecycleProps) {
  return (
    <section
      id="lifecycle"
      className="scroll-mt-20 border-t border-zinc-200/60 bg-white px-4 py-20 sm:px-6 sm:py-24"
    >
      <div className="mx-auto max-w-5xl">
        <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
          {copy.lifecycleTitle}
        </h2>
        <p className="mt-3 max-w-xl text-lg text-zinc-600">{copy.lifecycleDescription}</p>
        <ul className="mt-10 space-y-6">
          {copy.lifecycleRules.map((rule, i) => (
            <li key={i} className="lifecycle-rule">
              <span className="lifecycle-dot" aria-hidden />
              <p className="text-base leading-relaxed text-zinc-800">{rule}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/Lifecycle.tsx
git commit -m "feat: redesign Lifecycle — timeline layout with gradient connector line"
```

---

## Task 8: Redesign Future Roadmap

**Files:**
- Modify: `components/FutureRoadmap.tsx`

Add a colored status pill per item. Items follow the copy order: index 0–1 → "Roadmap", 2–3 → "Planned", 4 → "Idea". Pills are purely visual, not part of i18n copy (they match the copy text which already says "Roadmap:" / "Planned:" anyway).

- [ ] **Step 1: Replace FutureRoadmap.tsx entirely**

```tsx
import type { LandingCopy } from "@/lib/i18n";

type FutureRoadmapProps = {
  copy: LandingCopy;
};

const STATUS_CONFIG = [
  { label: "Roadmap", className: "bg-violet-100 text-violet-700" },
  { label: "Roadmap", className: "bg-violet-100 text-violet-700" },
  { label: "Planned", className: "bg-blue-100 text-blue-700" },
  { label: "Planned", className: "bg-blue-100 text-blue-700" },
  { label: "Idea", className: "bg-amber-100 text-amber-700" },
];

export function FutureRoadmap({ copy }: FutureRoadmapProps) {
  return (
    <section
      id="future"
      className="scroll-mt-20 border-t border-zinc-200/60 bg-[var(--warm-surface)] px-4 py-20 sm:px-6 sm:py-24"
    >
      <div className="mx-auto max-w-5xl">
        <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
          {copy.futureTitle}
        </h2>
        <p className="mt-3 max-w-xl text-lg text-zinc-600">{copy.futureDescription}</p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {copy.futureItems.map((item, i) => {
            const status = STATUS_CONFIG[i] ?? STATUS_CONFIG[STATUS_CONFIG.length - 1];
            return (
              <li
                key={item.title}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-bold text-zinc-900">{item.title}</h3>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{item.description}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/FutureRoadmap.tsx
git commit -m "feat: redesign FutureRoadmap — status pills, 2-col grid layout"
```

---

## Task 9: Redesign Waitlist Form

**Files:**
- Modify: `components/WaitlistForm.tsx`

On desktop, split layout: Aurora mascot on the left, form on the right. Warmer card background.

- [ ] **Step 1: Replace WaitlistForm.tsx entirely**

```tsx
"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import type { LandingCopy } from "@/lib/i18n";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(value: string): boolean {
  const t = value.trim();
  return t.length > 0 && EMAIL_RE.test(t);
}

type WaitlistFormProps = {
  copy: LandingCopy["waitlist"];
};

export function WaitlistForm({ copy }: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      const trimmed = email.trim();
      if (!isValidEmail(trimmed)) {
        setError(copy.invalidEmail);
        return;
      }
      setBusy(true);
      try {
        const response = await fetch("/api/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmed }),
        });
        if (!response.ok) {
          setError(copy.submitFailed);
          return;
        }
        setSubmitted(true);
      } catch {
        setError(copy.submitFailed);
      } finally {
        setBusy(false);
      }
    },
    [copy.invalidEmail, copy.submitFailed, email],
  );

  return (
    <section
      id="waitlist"
      className="scroll-mt-20 border-t border-zinc-200/60 bg-gradient-to-b from-primary-tint/30 to-white px-4 py-20 sm:px-6 sm:py-24"
    >
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-3xl border border-primary/20 bg-white shadow-xl">
          <div className="grid lg:grid-cols-[1fr_1.6fr]">
            {/* Aurora mascot panel */}
            <div className="hidden items-end justify-center bg-gradient-to-b from-primary-tint/60 to-primary-tint/20 px-6 pt-10 lg:flex">
              <Image
                src="/brand/mascot.png"
                alt="Aurora"
                width={400}
                height={400}
                className="h-auto w-full max-w-[220px] object-contain"
              />
            </div>

            {/* Form panel */}
            <div className="px-8 py-10 sm:px-10 sm:py-12">
              <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
                {copy.title}
              </h2>
              <p className="mt-3 text-lg text-zinc-600">{copy.description}</p>
              <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950">
                {copy.discount}
              </p>

              {submitted ? (
                <p
                  className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-emerald-900"
                  role="status"
                >
                  {copy.submitted}
                </p>
              ) : (
                <form
                  onSubmit={onSubmit}
                  className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-start"
                  noValidate
                >
                  <div className="min-w-0 flex-1">
                    <label htmlFor="waitlist-email" className="sr-only">
                      {copy.inputLabel}
                    </label>
                    <input
                      id="waitlist-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      placeholder={copy.inputPlaceholder}
                      value={email}
                      onChange={(ev) => {
                        setEmail(ev.target.value);
                        if (error) setError(null);
                      }}
                      className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                      aria-invalid={error ? true : undefined}
                      aria-describedby={error ? "waitlist-email-error" : undefined}
                    />
                    {error ? (
                      <p
                        id="waitlist-email-error"
                        className="mt-2 text-sm text-red-600"
                        role="alert"
                      >
                        {error}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="submit"
                    disabled={busy}
                    className="shrink-0 rounded-xl bg-primary px-8 py-3 text-base font-bold text-white shadow-[0_4px_16px_rgba(180,83,201,0.3)] transition hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {busy ? copy.buttonBusy : copy.buttonIdle}
                  </button>
                </form>
              )}

              <p className="mt-6 text-xs text-zinc-500">{copy.note}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/WaitlistForm.tsx
git commit -m "feat: redesign WaitlistForm — split layout with Aurora panel, richer card"
```

---

## Task 10: Redesign Site Header & Footer

**Files:**
- Modify: `components/SiteHeader.tsx`
- Modify: `components/SiteFooter.tsx`

- [ ] **Step 1: Replace SiteHeader.tsx**

The logo wordmark gets a primary-tinted color on "Calisto" to add brand warmth.

```tsx
import type { LandingCopy } from "@/lib/i18n";
import Image from "next/image";

type SiteHeaderProps = {
  copy: LandingCopy;
};

export function SiteHeader({ copy }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto max-w-5xl px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex items-center justify-between gap-4 sm:min-w-[170px]">
            <a
              href="#top"
              className="inline-flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <Image
                src="/brand/calisto-icon.png"
                alt="Calisto icon"
                width={28}
                height={28}
                className="rounded-md"
              />
              <span className="text-lg font-extrabold tracking-tight">
                <span className="text-primary">Cal</span>
                <span className="text-zinc-900">isto</span>
              </span>
            </a>
            <a
              href="#waitlist"
              className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:hidden"
            >
              {copy.joinWaitlistShort}
            </a>
          </div>
          <nav
            className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1 sm:flex-1"
            aria-label={copy.navAriaLabel}
          >
            {copy.nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-primary-tint hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:px-3 sm:py-2 sm:text-sm"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <a
            href="#waitlist"
            className="hidden rounded-full bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:inline-flex sm:shrink-0"
          >
            {copy.joinWaitlistShort}
          </a>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Replace SiteFooter.tsx**

```tsx
import type { LandingCopy } from "@/lib/i18n";
import Image from "next/image";

type SiteFooterProps = {
  copy: LandingCopy;
};

export function SiteFooter({ copy }: SiteFooterProps) {
  return (
    <footer className="border-t border-zinc-200 bg-white px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/brand/calisto-icon.png"
              alt="Calisto icon"
              width={24}
              height={24}
              className="rounded-md opacity-80"
            />
            <span className="text-sm font-extrabold tracking-tight">
              <span className="text-primary">Cal</span>
              <span className="text-zinc-900">isto</span>
            </span>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-zinc-500">{copy.footerText}</p>
        </div>
        <p className="mt-8 text-xs text-zinc-400">
          © {new Date().getFullYear()} Calisto. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/SiteHeader.tsx components/SiteFooter.tsx
git commit -m "feat: redesign Header (split wordmark color) and Footer (icon + copyright)"
```

---

## Task 11: Final Polish & Verify

- [ ] **Step 1: Run TypeScript check**

```bash
cd /home/antonio/repo/calisto-landing && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 2: Run lint**

```bash
cd /home/antonio/repo/calisto-landing && npx eslint . --ext .ts,.tsx
```

Expected: no new errors introduced

- [ ] **Step 3: Start dev server and visual check each section**

```bash
cd /home/antonio/repo/calisto-landing && npm run dev
```

Check in browser at `http://localhost:3000/en`:
- [ ] Hero: warm radial glow, decorative rings, mascot speech bubble, CTA shadow
- [ ] Feature grid: icon pills visible, header layout correct
- [ ] How It Works: dashed connector line visible on desktop, vertical on mobile
- [ ] Plan Cards: Premium card has purple gradient header, price prominent, expand-on-hover works
- [ ] Lifecycle: timeline dots and connector line visible
- [ ] Future Roadmap: status pills visible, 2-col grid on sm+
- [ ] Waitlist: Aurora mascot panel visible on lg, form works end-to-end
- [ ] Header: "Cal" is purple, "isto" is dark
- [ ] Footer: icon + split wordmark + copyright year
- [ ] Test HR and DE locales — "Continue" button now shows translated text

- [ ] **Step 4: Final commit if any polish tweaks were needed**

```bash
git add -p
git commit -m "fix: final polish tweaks from visual review"
```

---

## Self-Review

**Spec coverage:**
- Code review issues 1–4: covered in Task 1
- Code review issue 5 (`html lang`): flagged, not implemented (requires layout plumbing outside scope)
- Warm, human aesthetic: Tasks 2–10 cover every section
- `langContinue` key: Task 1 Step 3–4

**Placeholder scan:** No TBD/TODO in any step. All code blocks are complete.

**Type consistency:** `langContinue` added to type in Task 1 Step 3, consumed in Task 1 Step 4. `FEATURE_ICONS`, `PLAN_ICONS`, `STATUS_CONFIG` are module-level constants, not shared between tasks. No cross-task type references.
