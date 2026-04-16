# Celebration Album — Full Landing Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Calisto landing page with a "Celebration Album" aesthetic — ink-dark hero/footer bookends, amber/coral accents, Aurora mascot prominent throughout, three new design-only sections (PhotoMarquee, StatBar, AuroraQuote).

**Architecture:** Each component is a self-contained TSX file receiving `copy: LandingCopy` props (or no props for purely decorative new sections). New CSS tokens are registered in `globals.css` and used via Tailwind utility classes. Three new components are added to the existing page assembly in `app/[locale]/page.tsx`.

**Tech Stack:** Next.js 15 (App Router), Tailwind CSS v4, TypeScript, `next/image`

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `app/globals.css` | Modify | New CSS tokens (`--ink`, `--primary-dark`, `--cream`), marquee keyframes |
| `lib/i18n.ts` | Modify | Add `auroraQuote: string` to `LandingCopy` type + 3 locale values |
| `components/SiteHeader.tsx` | Modify | Dark glass header, amber CTA, coral underline nav hover |
| `components/Hero.tsx` | Modify | Ink bg, confetti dots, display type, amber CTAs, Aurora on dark |
| `components/PhotoMarquee.tsx` | **Create** | Dual-row auto-scrolling screenshot strip |
| `components/StatBar.tsx` | **Create** | 3-stat amber-on-purple strip |
| `components/FeatureGrid.tsx` | Modify | Cream bg, colored left-border cards, hover lift |
| `components/HowItWorks.tsx` | Modify | Deep-purple inverted bg, white text, amber step circles |
| `components/PlanCards.tsx` | Modify | Cream bg, amber gradient on popular card |
| `components/Lifecycle.tsx` | Modify | White bg, amber timeline dots |
| `components/AuroraQuote.tsx` | **Create** | Full-width warm quote panel with Aurora portrait |
| `components/FutureRoadmap.tsx` | Modify | Colored left-border on card hover per status |
| `components/WaitlistForm.tsx` | Modify | Ink bg, glassmorphism card, amber CTAs |
| `components/SiteFooter.tsx` | Modify | Ink bg, amber/white wordmark |
| `app/[locale]/page.tsx` | Modify | Import + place PhotoMarquee, StatBar, AuroraQuote |

---

## Task 1: Design Tokens & Marquee CSS

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Add new CSS custom properties to `:root`**

Open `app/globals.css`. Inside the `:root { }` block, after `--warm-surface: #fdf8f0;`, add:

```css
  --ink: #1a0a2e;
  --primary-dark: #7c2d9e;
  --cream: #fdf6ec;
```

- [ ] **Step 2: Register new tokens in `@theme inline`**

Inside the `@theme inline { }` block, after `--color-warm-surface: var(--warm-surface);`, add:

```css
  --color-ink: var(--ink);
  --color-primary-dark: var(--primary-dark);
  --color-cream: var(--cream);
```

- [ ] **Step 3: Add marquee keyframes and utility classes**

At the end of `app/globals.css`, append:

```css
/* Photo marquee */
@keyframes marqueeLeft {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

@keyframes marqueeRight {
  from { transform: translateX(-50%); }
  to   { transform: translateX(0); }
}

.marquee-track {
  display: flex;
  width: max-content;
  will-change: transform;
}

.marquee-left {
  animation: marqueeLeft 26s linear infinite;
}

.marquee-right {
  animation: marqueeRight 32s linear infinite;
}

@media (prefers-reduced-motion: reduce) {
  .marquee-left,
  .marquee-right {
    animation: none;
  }
}
```

- [ ] **Step 4: Run TypeScript check**

```bash
cd /home/antonio/repo/calisto-landing && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 5: Commit**

```bash
cd /home/antonio/repo/calisto-landing && git add app/globals.css && git commit -m "feat: add ink/cream/primary-dark tokens and marquee CSS"
```

---

## Task 2: i18n — Add `auroraQuote`

**Files:**
- Modify: `lib/i18n.ts`

- [ ] **Step 1: Add field to `LandingCopy` type**

In `lib/i18n.ts`, inside the `LandingCopy` type (after `langContinue: string;`), add:

```ts
  auroraQuote: string;
```

- [ ] **Step 2: Add English value**

In the `en` locale object, after `langContinue: "Continue",`, add:

```ts
    auroraQuote: "Every memory deserves a home. I'll make sure yours is beautiful, organized, and yours forever.",
```

- [ ] **Step 3: Add Croatian value**

In the `hr` locale object, after `langContinue: "Nastavi",`, add:

```ts
    auroraQuote: "Svaka uspomena zaslužuje dom. Pobrinut ću se da bude lijepa, organizirana i zauvijek vaša.",
```

- [ ] **Step 4: Add German value**

In the `de` locale object, after `langContinue: "Weiter",`, add:

```ts
    auroraQuote: "Jede Erinnerung verdient ein Zuhause. Ich sorge dafür, dass deines schön, geordnet und für immer deins ist.",
```

- [ ] **Step 5: Run TypeScript check**

```bash
cd /home/antonio/repo/calisto-landing && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 6: Commit**

```bash
cd /home/antonio/repo/calisto-landing && git add lib/i18n.ts && git commit -m "feat: add auroraQuote i18n key to all 3 locales"
```

---

## Task 3: SiteHeader — Dark Glass

**Files:**
- Modify: `components/SiteHeader.tsx`

- [ ] **Step 1: Replace `components/SiteHeader.tsx` entirely**

```tsx
import type { LandingCopy } from "@/lib/i18n";
import Image from "next/image";

type SiteHeaderProps = {
  copy: LandingCopy;
};

export function SiteHeader({ copy }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#1a0a2e]/90 backdrop-blur-md">
      <div className="mx-auto max-w-5xl px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex items-center justify-between gap-4 sm:min-w-[170px]">
            <a
              href="#top"
              className="inline-flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a0a2e]"
            >
              <Image
                src="/brand/calisto-icon.png"
                alt="Calisto icon"
                width={28}
                height={28}
                className="rounded-md"
              />
              <span className="text-lg font-extrabold tracking-tight">
                <span className="text-amber-400">Cal</span>
                <span className="text-white">isto</span>
              </span>
            </a>
            <a
              href="#waitlist"
              className="rounded-full bg-amber-400 px-4 py-2 text-sm font-bold text-zinc-900 transition hover:bg-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a0a2e] sm:hidden"
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
                className="group relative rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-300 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a0a2e] sm:px-3 sm:py-2 sm:text-sm"
              >
                {item.label}
                <span
                  aria-hidden
                  className="absolute bottom-0.5 left-2.5 h-0.5 w-0 rounded-full bg-orange-400 transition-all duration-200 group-hover:w-[calc(100%-1.25rem)] sm:left-3 sm:group-hover:w-[calc(100%-1.5rem)]"
                />
              </a>
            ))}
          </nav>
          <a
            href="#waitlist"
            className="hidden rounded-full bg-amber-400 px-4 py-2 text-sm font-bold text-zinc-900 transition hover:bg-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a0a2e] sm:inline-flex sm:shrink-0"
          >
            {copy.joinWaitlistShort}
          </a>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd /home/antonio/repo/calisto-landing && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
cd /home/antonio/repo/calisto-landing && git add components/SiteHeader.tsx && git commit -m "feat: SiteHeader — dark glass, amber CTA, coral underline nav"
```

---

## Task 4: Hero — Ink Background, Confetti, Display Type

**Files:**
- Modify: `components/Hero.tsx`

- [ ] **Step 1: Replace `components/Hero.tsx` entirely**

```tsx
import type { LandingCopy } from "@/lib/i18n";
import Image from "next/image";

type HeroProps = {
  copy: LandingCopy;
};

const CONFETTI = [
  { w: 10, h: 10, color: "#b453c9", top: "15%", left: "7%",  delay: "0s",   dur: "2.8s" },
  { w: 7,  h: 7,  color: "#f59e0b", top: "28%", left: "91%", delay: "0.6s", dur: "3.1s" },
  { w: 14, h: 5,  color: "#f97316", top: "60%", left: "4%",  delay: "1.1s", dur: "2.5s" },
  { w: 8,  h: 8,  color: "#f59e0b", top: "72%", left: "86%", delay: "0.3s", dur: "3.4s" },
  { w: 12, h: 12, color: "#b453c9", top: "42%", left: "95%", delay: "1.5s", dur: "2.9s" },
  { w: 6,  h: 6,  color: "#f97316", top: "85%", left: "12%", delay: "0.9s", dur: "3.2s" },
  { w: 9,  h: 9,  color: "#f59e0b", top: "10%", left: "55%", delay: "0.4s", dur: "2.6s" },
  { w: 5,  h: 14, color: "#b453c9", top: "50%", left: "2%",  delay: "1.8s", dur: "3.0s" },
  { w: 11, h: 4,  color: "#f59e0b", top: "80%", left: "75%", delay: "0.7s", dur: "2.7s" },
  { w: 7,  h: 7,  color: "#f97316", top: "35%", left: "78%", delay: "1.3s", dur: "3.3s" },
];

export function Hero({ copy }: HeroProps) {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-[#1a0a2e] px-4 py-20 sm:px-6 sm:py-28"
    >
      {/* Confetti dots */}
      {CONFETTI.map((dot, i) => (
        <span
          key={i}
          aria-hidden
          className="pointer-events-none absolute animate-pulse opacity-70"
          style={{
            width: dot.w,
            height: dot.h,
            background: dot.color,
            top: dot.top,
            left: dot.left,
            animationDelay: dot.delay,
            animationDuration: dot.dur,
            borderRadius: dot.w === dot.h ? "50%" : "3px",
          }}
        />
      ))}

      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 30% 50%, rgba(180,83,201,0.12) 0%, transparent 65%)",
        }}
      />

      <div className="relative mx-auto grid max-w-5xl gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        {/* Left: text */}
        <div>
          <span className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-300">
            ✨ {copy.heroBadge}
          </span>
          <h1
            className="font-black text-white"
            style={{
              fontSize: "clamp(2.5rem, 5.5vw, 4.6rem)",
              letterSpacing: "-0.04em",
              lineHeight: "1.06",
            }}
          >
            {copy.heroTitle}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-zinc-300">
            {copy.heroDescription}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#waitlist"
              className="inline-flex items-center justify-center rounded-full bg-amber-400 px-8 py-4 text-base font-bold text-zinc-900 shadow-[0_6px_24px_rgba(245,158,11,0.4)] transition hover:bg-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a0a2e]"
            >
              {copy.heroPrimaryCta}
            </a>
            <a
              href="#plans"
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a0a2e]"
            >
              {copy.heroSecondaryCta}
            </a>
          </div>
        </div>

        {/* Right: Aurora */}
        <div className="relative mx-auto w-full max-w-sm">
          {/* Decorative rings */}
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/20"
          />
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10"
          />

          {/* Speech bubble */}
          <div className="pointer-events-none absolute left-1/2 top-[10%] z-10 flex w-full max-w-xs -translate-x-1/2 -translate-y-full justify-center px-2">
            <p className="pointer-events-auto relative rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-center text-sm font-semibold leading-snug text-white shadow-md backdrop-blur-md">
              {copy.heroIntro}
              <span
                aria-hidden
                className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r border-white/20 bg-[#1a0a2e]"
              />
            </p>
          </div>

          <Image
            src="/brand/mascot.png"
            alt="Aurora, your Calisto guide"
            width={500}
            height={500}
            priority
            className="relative z-10 h-auto w-full drop-shadow-[0_20px_40px_rgba(180,83,201,0.3)]"
          />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd /home/antonio/repo/calisto-landing && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
cd /home/antonio/repo/calisto-landing && git add components/Hero.tsx && git commit -m "feat: Hero — ink bg, confetti dots, display type, amber CTAs, Aurora on dark"
```

---

## Task 5: PhotoMarquee — New Component

**Files:**
- Create: `components/PhotoMarquee.tsx`

- [ ] **Step 1: Create `components/PhotoMarquee.tsx`**

```tsx
import Image from "next/image";

const SCREENSHOTS = [
  "/brand/screenshots/p1.jpeg",
  "/brand/screenshots/p2.jpeg",
  "/brand/screenshots/p3.jpeg",
];

// Duplicate for seamless loop
const ROW1 = [...SCREENSHOTS, ...SCREENSHOTS];
const ROW2 = [...SCREENSHOTS, ...SCREENSHOTS].reverse();

export function PhotoMarquee() {
  return (
    <section
      aria-hidden
      className="overflow-hidden bg-[#1a0a2e] py-6 sm:py-8"
    >
      {/* Row 1: scrolls left */}
      <div className="relative flex overflow-hidden">
        <div className="marquee-track marquee-left flex gap-3 pr-3">
          {ROW1.map((src, i) => (
            <div
              key={`r1-${i}`}
              className="h-32 w-auto shrink-0 overflow-hidden rounded-2xl shadow-lg sm:h-40"
            >
              <Image
                src={src}
                alt=""
                width={180}
                height={360}
                className="h-full w-auto object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Row 2: scrolls right */}
      <div className="relative mt-3 flex overflow-hidden">
        <div className="marquee-track marquee-right flex gap-3 pr-3">
          {ROW2.map((src, i) => (
            <div
              key={`r2-${i}`}
              className="h-24 w-auto shrink-0 overflow-hidden rounded-2xl opacity-70 shadow-md sm:h-32"
            >
              <Image
                src={src}
                alt=""
                width={180}
                height={360}
                className="h-full w-auto object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd /home/antonio/repo/calisto-landing && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
cd /home/antonio/repo/calisto-landing && git add components/PhotoMarquee.tsx && git commit -m "feat: PhotoMarquee — dual-row scrolling screenshot strip"
```

---

## Task 6: StatBar — New Component

**Files:**
- Create: `components/StatBar.tsx`

- [ ] **Step 1: Create `components/StatBar.tsx`**

```tsx
const STATS = [
  { value: "50+",    label: "guests on Free plan" },
  { value: "100 GB", label: "max storage available" },
  { value: "3",      label: "steps to your gallery" },
] as const;

export function StatBar() {
  return (
    <section className="bg-[#7c2d9e] px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <dl className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={`flex flex-col items-center text-center ${
                i < STATS.length - 1
                  ? "sm:border-r sm:border-white/10"
                  : ""
              }`}
            >
              <dt
                className="font-black text-amber-400"
                style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", letterSpacing: "-0.03em" }}
              >
                {stat.value}
              </dt>
              <dd className="mt-1 text-xs font-bold uppercase tracking-widest text-purple-200">
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd /home/antonio/repo/calisto-landing && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
cd /home/antonio/repo/calisto-landing && git add components/StatBar.tsx && git commit -m "feat: StatBar — 3-stat amber-on-purple strip"
```

---

## Task 7: FeatureGrid — Cream Background, Colored Borders

**Files:**
- Modify: `components/FeatureGrid.tsx`

- [ ] **Step 1: Replace `components/FeatureGrid.tsx` entirely**

```tsx
import type { LandingCopy } from "@/lib/i18n";
import Image from "next/image";

type FeatureGridProps = {
  copy: LandingCopy;
};

const FEATURE_ICONS = ["🔑", "📱", "🖼️", "👥", "🎞️", "📦"];

// Cycling left-border accent colors per card
const BORDER_COLORS = [
  "border-l-primary",
  "border-l-amber-400",
  "border-l-orange-400",
  "border-l-primary",
  "border-l-amber-400",
  "border-l-orange-400",
];

const ICON_BG = [
  "bg-primary/10 text-primary",
  "bg-amber-400/15 text-amber-600",
  "bg-orange-400/15 text-orange-500",
  "bg-primary/10 text-primary",
  "bg-amber-400/15 text-amber-600",
  "bg-orange-400/15 text-orange-500",
];

export function FeatureGrid({ copy }: FeatureGridProps) {
  return (
    <section id="features" className="scroll-mt-20 bg-[#fdf6ec] px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-5xl">
        {/* Header row */}
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_minmax(0,300px)] lg:gap-12">
          <div>
            <h2
              className="font-extrabold tracking-tight text-zinc-900"
              style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)" }}
            >
              {copy.featuresTitle}
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-zinc-600">
              {copy.featuresDescription}
            </p>
          </div>
          <div className="relative mx-auto w-full max-w-[260px] shrink-0 lg:mx-0">
            <div className="pointer-events-none absolute left-1/2 top-0 z-10 flex w-full max-w-xs -translate-x-1/2 -translate-y-full justify-center px-2">
              <p className="pointer-events-auto relative rounded-2xl border border-primary/25 bg-white px-4 py-2.5 text-center text-sm font-semibold leading-snug text-primary shadow-sm">
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
              className={`rounded-[24px] border border-zinc-200 border-l-4 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl ${BORDER_COLORS[i] ?? "border-l-primary"}`}
            >
              <span className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl text-xl ${ICON_BG[i] ?? "bg-primary/10 text-primary"}`}>
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

- [ ] **Step 2: TypeScript check**

```bash
cd /home/antonio/repo/calisto-landing && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
cd /home/antonio/repo/calisto-landing && git add components/FeatureGrid.tsx && git commit -m "feat: FeatureGrid — cream bg, cycling colored borders, hover lift"
```

---

## Task 8: HowItWorks — Inverted Deep Purple

**Files:**
- Modify: `components/HowItWorks.tsx`

- [ ] **Step 1: Replace `components/HowItWorks.tsx` entirely**

```tsx
import type { LandingCopy } from "@/lib/i18n";

type HowItWorksProps = {
  copy: LandingCopy;
};

export function HowItWorks({ copy }: HowItWorksProps) {
  return (
    <section className="bg-[#7c2d9e] px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <h2
          className="font-extrabold tracking-tight text-white"
          style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)" }}
        >
          {copy.howTitle}
        </h2>
        <p className="mt-3 max-w-xl text-lg text-purple-200">{copy.howDescription}</p>

        <ol className="relative mt-12 grid gap-0 sm:grid-cols-3">
          {copy.howItems.map((item, idx) => (
            <li key={item.step} className="relative flex flex-col gap-4 pb-10 sm:pb-0 sm:pr-8">
              {/* Desktop connector */}
              {idx < copy.howItems.length - 1 && (
                <span
                  aria-hidden
                  className="absolute left-10 top-5 hidden h-0.5 w-[calc(100%-2.5rem)] border-t-2 border-dashed border-white/25 sm:block"
                />
              )}
              {/* Mobile connector */}
              {idx < copy.howItems.length - 1 && (
                <span
                  aria-hidden
                  className="absolute left-5 top-10 block h-[calc(100%-2.5rem)] w-0.5 border-l-2 border-dashed border-white/25 sm:hidden"
                />
              )}
              <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-400 text-sm font-extrabold text-zinc-900 shadow-[0_4px_16px_rgba(245,158,11,0.4)]">
                {item.step}
              </span>
              <div>
                <h3 className="text-base font-bold text-white">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-purple-200">{item.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd /home/antonio/repo/calisto-landing && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
cd /home/antonio/repo/calisto-landing && git add components/HowItWorks.tsx && git commit -m "feat: HowItWorks — inverted deep-purple bg, amber step circles, white text"
```

---

## Task 9: PlanCards — Cream Background, Amber Popular

**Files:**
- Modify: `components/PlanCards.tsx`

- [ ] **Step 1: Replace `components/PlanCards.tsx` entirely**

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
    <section id="plans" className="scroll-mt-20 bg-[#fdf6ec] px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
          <div className="min-w-0 max-w-2xl">
            <h2
              className="font-extrabold tracking-tight text-zinc-900"
              style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)" }}
            >
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
              alt="Aurora planning"
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
                className={`plan-card overflow-hidden rounded-[28px] outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-xl ${
                  isPopular
                    ? "border-2 border-amber-400 shadow-[0_4px_24px_rgba(245,158,11,0.2)]"
                    : "border border-zinc-200 shadow-sm"
                }`}
                aria-labelledby={`plan-${plan.id}`}
              >
                {/* Card header */}
                <div
                  className={`px-6 py-5 ${
                    isPopular
                      ? "bg-gradient-to-r from-amber-400 to-orange-400"
                      : "bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{PLAN_ICONS[plan.id] ?? "📋"}</span>
                      <h3
                        id={`plan-${plan.id}`}
                        className={`text-xl font-extrabold tracking-wide ${
                          isPopular ? "text-zinc-900" : "text-zinc-900"
                        }`}
                      >
                        {plan.name}
                      </h3>
                    </div>
                    {isPopular && (
                      <span className="rounded-full bg-zinc-900/15 px-3 py-0.5 text-xs font-bold text-zinc-900">
                        {copy.popularBadge}
                      </span>
                    )}
                  </div>
                  <p className={`mt-1 text-3xl font-extrabold ${isPopular ? "text-zinc-900" : "text-zinc-900"}`}>
                    {priceRow.value}
                  </p>
                  <p className={`text-sm ${isPopular ? "text-zinc-700" : "text-zinc-500"}`}>
                    {storageRow.label}: {storageRow.value}
                  </p>
                </div>

                {/* Card body */}
                <div className={`px-6 py-4 ${isPopular ? "bg-amber-50" : "bg-white"}`}>
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
        <p className="mt-6 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm italic leading-relaxed text-zinc-600">
          {copy.planFootnote}
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd /home/antonio/repo/calisto-landing && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
cd /home/antonio/repo/calisto-landing && git add components/PlanCards.tsx && git commit -m "feat: PlanCards — cream bg, amber gradient popular card"
```

---

## Task 10: Lifecycle — White Background, Amber Dots

**Files:**
- Modify: `components/Lifecycle.tsx`

- [ ] **Step 1: Replace `components/Lifecycle.tsx` entirely**

```tsx
import type { LandingCopy } from "@/lib/i18n";

type LifecycleProps = {
  copy: LandingCopy;
};

export function Lifecycle({ copy }: LifecycleProps) {
  return (
    <section
      id="lifecycle"
      className="scroll-mt-20 bg-white px-4 py-20 sm:px-6 sm:py-24"
    >
      <div className="mx-auto max-w-5xl">
        <h2
          className="font-extrabold tracking-tight text-zinc-900"
          style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)" }}
        >
          {copy.lifecycleTitle}
        </h2>
        <p className="mt-3 max-w-xl text-lg text-zinc-600">{copy.lifecycleDescription}</p>
        <ul className="mt-10 space-y-6">
          {copy.lifecycleRules.map((rule, i) => (
            <li key={i} className="lifecycle-rule">
              <span
                className="lifecycle-dot"
                aria-hidden
                style={{ background: "#f59e0b", boxShadow: "0 0 0 3px rgba(245,158,11,0.2)" }}
              />
              <p className="text-base leading-relaxed text-zinc-800">{rule}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd /home/antonio/repo/calisto-landing && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
cd /home/antonio/repo/calisto-landing && git add components/Lifecycle.tsx && git commit -m "feat: Lifecycle — white bg, amber timeline dots"
```

---

## Task 11: AuroraQuote — New Component

**Files:**
- Create: `components/AuroraQuote.tsx`

- [ ] **Step 1: Create `components/AuroraQuote.tsx`**

```tsx
import type { LandingCopy } from "@/lib/i18n";
import Image from "next/image";

type AuroraQuoteProps = {
  copy: LandingCopy;
};

export function AuroraQuote({ copy }: AuroraQuoteProps) {
  return (
    <section
      className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-24"
      style={{
        background:
          "linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(245,158,11,0.10) 35%, rgba(237,228,245,0.40) 70%, rgba(180,83,201,0.08) 100%)",
      }}
    >
      {/* Decorative large quote mark */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-4 left-6 select-none font-black text-amber-400/20 sm:left-12"
        style={{ fontSize: "clamp(8rem, 20vw, 14rem)", lineHeight: 1 }}
      >
        "
      </span>

      <div className="relative mx-auto max-w-3xl text-center">
        <blockquote>
          <p
            className="font-semibold italic leading-relaxed text-zinc-800"
            style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)" }}
          >
            "{copy.auroraQuote}"
          </p>
        </blockquote>

        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-amber-400 shadow-[0_0_0_4px_rgba(245,158,11,0.15)]">
            <Image
              src="/brand/aurora-photo.png"
              alt="Aurora"
              width={56}
              height={56}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-900">Aurora</p>
            <p className="text-xs text-zinc-500">Your Calisto guide</p>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd /home/antonio/repo/calisto-landing && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
cd /home/antonio/repo/calisto-landing && git add components/AuroraQuote.tsx && git commit -m "feat: AuroraQuote — full-width warm quote panel with Aurora portrait"
```

---

## Task 12: FutureRoadmap — Colored Hover Borders

**Files:**
- Modify: `components/FutureRoadmap.tsx`

- [ ] **Step 1: Replace `components/FutureRoadmap.tsx` entirely**

```tsx
import type { LandingCopy } from "@/lib/i18n";

type FutureRoadmapProps = {
  copy: LandingCopy;
};

const STATUS_CONFIG = [
  { label: "Roadmap", pillClass: "bg-violet-100 text-violet-700", borderClass: "hover:border-l-violet-400" },
  { label: "Roadmap", pillClass: "bg-violet-100 text-violet-700", borderClass: "hover:border-l-violet-400" },
  { label: "Planned",  pillClass: "bg-blue-100 text-blue-700",    borderClass: "hover:border-l-blue-400" },
  { label: "Planned",  pillClass: "bg-blue-100 text-blue-700",    borderClass: "hover:border-l-blue-400" },
  { label: "Idea",     pillClass: "bg-amber-100 text-amber-700",  borderClass: "hover:border-l-amber-400" },
];

export function FutureRoadmap({ copy }: FutureRoadmapProps) {
  return (
    <section
      id="future"
      className="scroll-mt-20 bg-[var(--warm-surface)] px-4 py-20 sm:px-6 sm:py-24"
    >
      <div className="mx-auto max-w-5xl">
        <h2
          className="font-extrabold tracking-tight text-zinc-900"
          style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)" }}
        >
          {copy.futureTitle}
        </h2>
        <p className="mt-3 max-w-xl text-lg text-zinc-600">{copy.futureDescription}</p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {copy.futureItems.map((item, i) => {
            const status = STATUS_CONFIG[i] ?? STATUS_CONFIG[STATUS_CONFIG.length - 1];
            return (
              <li
                key={item.title}
                className={`rounded-[24px] border border-l-4 border-zinc-200 border-l-transparent bg-white p-5 shadow-sm transition duration-200 ${status.borderClass}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-bold text-zinc-900">{item.title}</h3>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${status.pillClass}`}
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

- [ ] **Step 2: TypeScript check**

```bash
cd /home/antonio/repo/calisto-landing && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
cd /home/antonio/repo/calisto-landing && git add components/FutureRoadmap.tsx && git commit -m "feat: FutureRoadmap — colored left-border on hover per status"
```

---

## Task 13: WaitlistForm — Ink Background, Glassmorphism, Amber CTAs

**Files:**
- Modify: `components/WaitlistForm.tsx`

- [ ] **Step 1: Replace `components/WaitlistForm.tsx` entirely**

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
      className="scroll-mt-20 bg-[#1a0a2e] px-4 py-20 sm:px-6 sm:py-24"
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 100%, rgba(180,83,201,0.10) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-sm">
          <div className="grid lg:grid-cols-[1fr_1.6fr]">
            {/* Aurora panel */}
            <div className="hidden items-end justify-center bg-gradient-to-b from-primary/20 to-primary/5 px-6 pt-10 lg:flex">
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
              <h2
                className="font-extrabold tracking-tight text-white"
                style={{ fontSize: "clamp(1.7rem, 3.5vw, 2.6rem)" }}
              >
                {copy.title}
              </h2>
              <p className="mt-3 text-lg text-zinc-300">{copy.description}</p>
              <p className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-200">
                {copy.discount}
              </p>

              {submitted ? (
                <p
                  className="mt-8 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-4 text-emerald-300"
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
                      className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white shadow-sm placeholder:text-zinc-500 focus:border-amber-400/60 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                      aria-invalid={error !== null}
                      aria-describedby={error ? "waitlist-email-error" : undefined}
                    />
                    {error ? (
                      <p
                        id="waitlist-email-error"
                        className="mt-2 text-sm text-red-400"
                        role="alert"
                      >
                        {error}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="submit"
                    disabled={busy}
                    className="shrink-0 rounded-xl bg-amber-400 px-8 py-3 text-base font-bold text-zinc-900 shadow-[0_4px_20px_rgba(245,158,11,0.35)] transition hover:bg-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a0a2e] disabled:cursor-not-allowed disabled:opacity-70"
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

- [ ] **Step 2: TypeScript check**

```bash
cd /home/antonio/repo/calisto-landing && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
cd /home/antonio/repo/calisto-landing && git add components/WaitlistForm.tsx && git commit -m "feat: WaitlistForm — ink bg, glassmorphism card, amber CTAs"
```

---

## Task 14: SiteFooter — Ink Background

**Files:**
- Modify: `components/SiteFooter.tsx`

- [ ] **Step 1: Replace `components/SiteFooter.tsx` entirely**

```tsx
import type { LandingCopy } from "@/lib/i18n";
import Image from "next/image";

type SiteFooterProps = {
  copy: LandingCopy;
};

export function SiteFooter({ copy }: SiteFooterProps) {
  return (
    <footer className="bg-[#1a0a2e] px-4 py-10 sm:px-6">
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
              <span className="text-amber-400">Cal</span>
              <span className="text-white">isto</span>
            </span>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-zinc-400">{copy.footerText}</p>
        </div>
        <div className="mt-8 border-t border-white/10 pt-6">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} Calisto. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd /home/antonio/repo/calisto-landing && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
cd /home/antonio/repo/calisto-landing && git add components/SiteFooter.tsx && git commit -m "feat: SiteFooter — ink bg, amber/white wordmark, border separator"
```

---

## Task 15: Page Assembly — Add New Sections

**Files:**
- Modify: `app/[locale]/page.tsx`

- [ ] **Step 1: Replace `app/[locale]/page.tsx` entirely**

```tsx
import { notFound } from "next/navigation";
import { AppPreviewWindow } from "@/components/AppPreviewWindow";
import { AuroraQuote } from "@/components/AuroraQuote";
import { FeatureGrid } from "@/components/FeatureGrid";
import { FutureRoadmap } from "@/components/FutureRoadmap";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { LanguageSelectorBar } from "@/components/LanguageSelectorBar";
import { LanguageSelectorPopup } from "@/components/LanguageSelectorPopup";
import { Lifecycle } from "@/components/Lifecycle";
import { PhotoMarquee } from "@/components/PhotoMarquee";
import { PlanCards } from "@/components/PlanCards";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { StatBar } from "@/components/StatBar";
import { WaitlistForm } from "@/components/WaitlistForm";
import { getLandingCopy, isLocale, LOCALES, type Locale } from "@/lib/i18n";

type LocalePageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocalePage({ params }: LocalePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const copy = getLandingCopy(locale);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#1a0a2e]">
      <LanguageSelectorPopup copy={copy} locale={locale as Locale} />
      <SiteHeader copy={copy} />
      <main className="flex-1">
        <Hero copy={copy} />
        <PhotoMarquee />
        <StatBar />
        <FeatureGrid copy={copy} />
        <HowItWorks copy={copy} />
        <PlanCards copy={copy} />
        <Lifecycle copy={copy} />
        <AuroraQuote copy={copy} />
        <FutureRoadmap copy={copy} />
        <WaitlistForm copy={copy.waitlist} />
        <LanguageSelectorBar copy={copy} locale={locale as Locale} className="bg-[#1a0a2e] pb-6 pt-4" />
      </main>
      <SiteFooter copy={copy} />
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd /home/antonio/repo/calisto-landing && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
cd /home/antonio/repo/calisto-landing && git add app/[locale]/page.tsx && git commit -m "feat: page assembly — add PhotoMarquee, StatBar, AuroraQuote; ink bg on wrapper"
```

---

## Task 16: Final Verify

**Files:** Read-only verification pass

- [ ] **Step 1: Run TypeScript**

```bash
cd /home/antonio/repo/calisto-landing && npx tsc --noEmit
```

Expected: 0 errors

- [ ] **Step 2: Run ESLint**

```bash
cd /home/antonio/repo/calisto-landing && npx eslint . --ext .ts,.tsx 2>&1 | head -60
```

Expected: 0 errors

- [ ] **Step 3: Print git log of all redesign commits**

```bash
cd /home/antonio/repo/calisto-landing && git log --oneline -20
```

Expected: 15+ commits including all tasks above

- [ ] **Step 4: Check all new component files exist**

```bash
ls /home/antonio/repo/calisto-landing/components/PhotoMarquee.tsx /home/antonio/repo/calisto-landing/components/StatBar.tsx /home/antonio/repo/calisto-landing/components/AuroraQuote.tsx
```

Expected: all 3 files listed

- [ ] **Step 5: Verify `auroraQuote` key in all 3 locales**

```bash
grep -n "auroraQuote" /home/antonio/repo/calisto-landing/lib/i18n.ts
```

Expected: 4 lines (1 type definition + 3 locale values)

---

## Self-Review

**Spec coverage:**
- ✅ Ink bg on hero, footer, header — Tasks 3, 4, 14
- ✅ Amber CTA buttons everywhere — Tasks 3, 4, 13
- ✅ Coral nav underline — Task 3
- ✅ Confetti dots in hero — Task 4
- ✅ PhotoMarquee new section — Task 5
- ✅ StatBar new section — Task 6
- ✅ FeatureGrid cream bg + colored borders — Task 7
- ✅ HowItWorks inverted purple + amber circles — Task 8
- ✅ PlanCards amber popular gradient — Task 9
- ✅ Lifecycle amber dots — Task 10
- ✅ AuroraQuote new section — Task 11
- ✅ FutureRoadmap colored hover borders — Task 12
- ✅ WaitlistForm glassmorphism ink — Task 13
- ✅ AppPreviewWindow kept as-is — not touched (already redesigned)
- ✅ Page assembly with correct order — Task 15
- ✅ auroraQuote i18n key — Task 2

**Placeholder scan:** No TBD/TODO anywhere. All code blocks complete.

**Type consistency:** `LandingCopy["auroraQuote"]` used in `AuroraQuote` component (Task 11), defined in `LandingCopy` type (Task 2). `PhotoMarquee` and `StatBar` take no props. All other components use `copy: LandingCopy` consistent with existing pattern.
