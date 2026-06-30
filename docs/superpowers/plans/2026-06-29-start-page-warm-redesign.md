# Start Page Warm-Theme Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder `/start` ad landing page with the high-fidelity warm-theme design from `docs/design_handoff_landing_warm/README.md`.

**Architecture:** A self-contained `StartPageClient` client component owns the full page: its own background, nav, form state, and all sections (hero, form card, how it works, phone mockup, feature list, pricing, sticky CTA bar). The server page at `app/[locale]/start/page.tsx` detects locale, fetches copy from a new `lib/i18n-start.ts` module, and renders only `<StartPageClient copy={...} locale={...} />`. The dark-theme wrapper (`vibrant-page-bg`) is removed entirely from the start route.

**Tech Stack:** Next.js App Router, React 19, TypeScript, inline CSS (no Tailwind on this page — design uses precise pixel values), Google Fonts (Playfair Display added to root layout).

## Global Constraints

- Design spec: `docs/design_handoff_landing_warm/README.md` — all pixel values, colors, and radii are final.
- Warm palette — exact hex values:
  - pageBg `#EFE8DD`, text `#221509`, muted `#9A8570`, faint `#C5B7A3`, line `#E0D6C6`
  - surface `#FFFFFF`, surfaceSoft `#FBF7F1`
  - gold `#C5922A`, goldSoft `#E8C878`, goldTint `#FBF1DC`
  - purple `#5B2D8E`, purpleHi `#7B3FBE`
- Fonts: `"'Playfair Display', serif"` for display/headings/prices/wordmark; `"'DM Sans', sans-serif"` for body/UI.
- No em dashes (`—`) in any copy string. Use commas or middle dots (`·`) instead.
- Language switcher links use lowercase locale codes (`/en/start`, `/hr/start`, `/de/start`) and display uppercase labels.
- Login link href: `/auth/login`.
- Submit flow: `buildPlanStartUrl(name, date, emoji, planId)` from `@/lib/landing-event-form` — existing function, unchanged.
- Default selected plan: `"plus"`. Default emoji: `"🎉"`.
- Form emojis (fixed set): `["🎉", "💍", "🎂", "🎓", "🏖️", "🎊"]`.
- Plan config (fixed, not from i18n):

  | id       | name     | price | was   | chip      | ink       | icon    |
  |----------|----------|-------|-------|-----------|-----------|---------|
  | free     | Free     | 0€    | null  | #E2EDDB   | #4E7A4A   | leaf    |
  | standard | Standard | 15€   | null  | #E0E8F6   | #3E5FA6   | star    |
  | plus     | Plus     | 35€   | null  | #E9E0F1   | #7A4FA6   | layers  |
  | premium  | Premium  | 65€   | 70€   | #F5E6C4   | #B07E25   | diamond |
  | max      | Max      | 90€   | 100€  | #F3DBE5   | #B0517A   | spark   |

- `robots: { index: false }` on the `/[locale]/start` route (unchanged).
- No Tailwind classes inside `StartPageClient.tsx` — use inline `style` props only.
- Test runner: `npx vitest run <path>` (Vitest, Node environment — no React rendering in tests).
- YAGNI: no features beyond the design spec.

---

### Task 1: Start-page i18n data

**Files:**
- Create: `lib/i18n-start.ts`
- Create: `lib/i18n-start.test.ts`

**Interfaces:**
- Consumes: `Locale` type from `@/lib/i18n` (already `"en" | "hr" | "de"`).
- Produces: `StartPageCopy` type + `getStartPageCopy(locale: Locale): StartPageCopy` function, used by Tasks 2 and 3.

- [ ] **Step 1: Write the failing tests**

```typescript
// lib/i18n-start.test.ts
import { describe, expect, it } from "vitest";
import { getStartPageCopy } from "./i18n-start";

const LOCALES = ["en", "hr", "de"] as const;
const PLAN_KEYS = ["free", "standard", "plus", "premium", "max"] as const;

describe("getStartPageCopy", () => {
  for (const locale of LOCALES) {
    describe(locale, () => {
      const copy = getStartPageCopy(locale);

      it("has hero copy", () => {
        expect(copy.heroLine1).toBeTruthy();
        expect(copy.heroLine2).toBeTruthy();
        expect(copy.heroSub).toBeTruthy();
      });

      it("has 4 features", () => {
        expect(copy.features).toHaveLength(4);
      });

      it("has 3 howSteps each with title and desc", () => {
        expect(copy.howSteps).toHaveLength(3);
        for (const step of copy.howSteps) {
          expect(step.title).toBeTruthy();
          expect(step.desc).toBeTruthy();
        }
      });

      it("has guestLimits for all plans", () => {
        for (const k of PLAN_KEYS) {
          expect(copy.guestLimits[k]).toBeTruthy();
        }
      });

      it("has planDescriptions for all plans", () => {
        for (const k of PLAN_KEYS) {
          expect(copy.planDescriptions[k]).toBeTruthy();
        }
      });

      it("has formCta without em dash", () => {
        expect(copy.formCta).toBeTruthy();
        expect(copy.formCta).not.toContain("—");
      });
    });
  }
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run lib/i18n-start.test.ts
```

Expected: FAIL — `getStartPageCopy` is not defined.

- [ ] **Step 3: Create `lib/i18n-start.ts`**

```typescript
import type { Locale } from "@/lib/i18n";

type PlanKey = "free" | "standard" | "plus" | "premium" | "max";

export type StartPageCopy = {
  loginLink: string;
  reviewBadge: string;
  heroLine1: string;
  heroLine2: string;
  heroSub: string;
  formNameLabel: string;
  formNamePlaceholder: string;
  formDateLabel: string;
  formEmojiLabel: string;
  formCta: string;
  formReassurance: string;
  howLabel: string;
  howSteps: readonly [
    { title: string; desc: string },
    { title: string; desc: string },
    { title: string; desc: string },
  ];
  albumLabel: string;
  albumCaption: string;
  albumEventName: string;
  features: readonly [string, string, string, string];
  pricingLabel: string;
  pricingTitle: string;
  popularBadge: string;
  perEvent: string;
  guestLimits: Record<PlanKey, string>;
  choosePlusCta: string;
  planDescriptions: Record<PlanKey, string>;
  fairUse: string;
  stickyTitle: string;
  stickySub: string;
  stickyCta: string;
};

const copy: Record<Locale, StartPageCopy> = {
  en: {
    loginLink: "Sign in",
    reviewBadge: "4.9 · 12,000+ events",
    heroLine1: "Guests scan.",
    heroLine2: "You collect memories.",
    heroSub:
      "One QR code captures all photos and videos from your celebration, live, without an app, in full quality.",
    formNameLabel: "Event name",
    formNamePlaceholder: "e.g. Tony and Mae's Wedding",
    formDateLabel: "Event date",
    formEmojiLabel: "Emoji",
    formCta: "Create event for free",
    formReassurance: "No credit card · ready instantly",
    howLabel: "How it works",
    howSteps: [
      { title: "Create your event", desc: "Name, date, and you are done." },
      { title: "Guests scan the QR", desc: "No app, no registration." },
      { title: "Memories arrive live", desc: "All in one place, in full quality." },
    ],
    albumLabel: "Live album",
    albumCaption: "Every scanned photo appears in the shared album instantly.",
    albumEventName: "Tony and Mae",
    features: [
      "No app, guests just scan",
      "Photos and videos in full quality",
      "Download the whole album in one click",
      "Private and only for your guests",
    ],
    pricingLabel: "Plans · per event",
    pricingTitle: "Choose your celebration size",
    popularBadge: "Most popular",
    perEvent: "/ EVENT",
    guestLimits: {
      free: "up to 30 guests",
      standard: "up to 80 guests",
      plus: "up to 200 guests",
      premium: "up to 500 guests",
      max: "unlimited",
    },
    choosePlusCta: "Choose Plus",
    planDescriptions: {
      free: "For small birthdays and family gatherings",
      standard: "For birthdays and small weddings",
      plus: "For medium celebrations and longer guest lists",
      premium: "For large weddings and formal events",
      max: "For festivals, multi-day events and unlimited reach",
    },
    fairUse:
      "Fair-use policy applies: there is a reasonable maximum file size limit for video files to prevent abuse.",
    stickyTitle: "Ready in 30 seconds",
    stickySub: "Free plan · no card",
    stickyCta: "Create",
  },

  hr: {
    loginLink: "Prijava",
    reviewBadge: "4,9 · 12.000+ događaja",
    heroLine1: "Gosti skeniraju.",
    heroLine2: "Vi skupljate uspomene.",
    heroSub:
      "Jedan QR kod prikuplja sve fotografije i videe s vaše proslave, uživo, bez aplikacije, u punoj kvaliteti.",
    formNameLabel: "Naziv događaja",
    formNamePlaceholder: "npr. Antonio i Matea",
    formDateLabel: "Datum događaja",
    formEmojiLabel: "Emoji",
    formCta: "Stvori događaj besplatno",
    formReassurance: "Bez kreditne kartice · spremno odmah",
    howLabel: "Kako radi",
    howSteps: [
      { title: "Stvorite događaj", desc: "Naziv, datum, i gotovi ste." },
      { title: "Gosti skeniraju QR", desc: "Bez aplikacije, bez registracije." },
      { title: "Uspomene stižu uživo", desc: "Sve na jednom mjestu, u punoj kvaliteti." },
    ],
    albumLabel: "Album uživo",
    albumCaption: "Svaka skenirana fotografija pojavljuje se u zajedničkom albumu u trenutku.",
    albumEventName: "Antonio i Matea",
    features: [
      "Bez aplikacije, gosti samo skeniraju",
      "Fotografije i videi u punoj kvaliteti",
      "Preuzmite cijeli album jednim klikom",
      "Privatno i samo za vaše goste",
    ],
    pricingLabel: "Planovi · po događaju",
    pricingTitle: "Odaberite veličinu proslave",
    popularBadge: "Najpopularnije",
    perEvent: "/ DOGAĐAJ",
    guestLimits: {
      free: "do 30 gostiju",
      standard: "do 80 gostiju",
      plus: "do 200 gostiju",
      premium: "do 500 gostiju",
      max: "neograničeno",
    },
    choosePlusCta: "Odaberi Plus",
    planDescriptions: {
      free: "Za male rođendane i obiteljska okupljanja",
      standard: "Za rođendane i manja vjenčanja",
      plus: "Za srednje proslave i duže liste gostiju",
      premium: "Za velika vjenčanja i svečane događaje",
      max: "Za festivale, višednevne evente i neograničen obuhvat",
    },
    fairUse:
      "Primjenjuje se fair-use politika: postoji razuman maksimalan limit veličine videodatoteke radi sprječavanja zloupotrebe.",
    stickyTitle: "Spremno za 30 sekundi",
    stickySub: "Free plan · bez kartice",
    stickyCta: "Stvori",
  },

  de: {
    loginLink: "Anmelden",
    reviewBadge: "4,9 · 12.000+ Events",
    heroLine1: "Gäste scannen.",
    heroLine2: "Du sammelst Erinnerungen.",
    heroSub:
      "Ein QR-Code erfasst alle Fotos und Videos deiner Feier, live, ohne App, in voller Qualität.",
    formNameLabel: "Event-Name",
    formNamePlaceholder: "z.B. Hochzeit Anna und Max",
    formDateLabel: "Event-Datum",
    formEmojiLabel: "Emoji",
    formCta: "Event kostenlos erstellen",
    formReassurance: "Keine Kreditkarte · sofort bereit",
    howLabel: "So funktioniert's",
    howSteps: [
      { title: "Event erstellen", desc: "Name, Datum, und fertig." },
      { title: "Gäste scannen den QR", desc: "Keine App, keine Registrierung." },
      { title: "Erinnerungen kommen live", desc: "Alles an einem Ort, in voller Qualität." },
    ],
    albumLabel: "Live-Album",
    albumCaption: "Jedes gescannte Foto erscheint sofort im gemeinsamen Album.",
    albumEventName: "Anna und Max",
    features: [
      "Keine App, Gäste scannen einfach",
      "Fotos und Videos in voller Qualität",
      "Gesamtes Album mit einem Klick herunterladen",
      "Privat und nur für deine Gäste",
    ],
    pricingLabel: "Tarife · pro Event",
    pricingTitle: "Wähle deine Eventgröße",
    popularBadge: "Beliebteste",
    perEvent: "/ EVENT",
    guestLimits: {
      free: "bis 30 Gäste",
      standard: "bis 80 Gäste",
      plus: "bis 200 Gäste",
      premium: "bis 500 Gäste",
      max: "unbegrenzt",
    },
    choosePlusCta: "Plus wählen",
    planDescriptions: {
      free: "Für kleine Geburtstage und Familientreffen",
      standard: "Für Geburtstage und kleine Hochzeiten",
      plus: "Für mittlere Feiern und längere Gästelisten",
      premium: "Für große Hochzeiten und festliche Events",
      max: "Für Festivals, mehrtägige Events und unbegrenzte Reichweite",
    },
    fairUse:
      "Es gilt eine Fair-Use-Richtlinie: Es gibt eine angemessene maximale Dateigröße für Videos, um Missbrauch zu verhindern.",
    stickyTitle: "In 30 Sekunden bereit",
    stickySub: "Free-Plan · ohne Karte",
    stickyCta: "Erstellen",
  },
};

export function getStartPageCopy(locale: Locale): StartPageCopy {
  return copy[locale];
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run lib/i18n-start.test.ts
```

Expected: all 18 tests pass (3 locales × 6 assertions).

- [ ] **Step 5: Commit**

```bash
git add lib/i18n-start.ts lib/i18n-start.test.ts
git commit -m "feat: add StartPageCopy i18n data for warm-theme start page"
```

---

### Task 2: Font addition and page.tsx update

**Files:**
- Modify: `app/layout.tsx` (add Playfair Display to Google Fonts URL)
- Modify: `app/[locale]/start/page.tsx` (use `getStartPageCopy`, pass `locale`, strip dark wrapper)

**Interfaces:**
- Consumes: `getStartPageCopy(locale: Locale): StartPageCopy` from `@/lib/i18n-start` (Task 1).
- Produces: `StartPageClient` now receives `{ copy: StartPageCopy; locale: Locale }` — Task 3 must match this signature.

- [ ] **Step 1: Add Playfair Display to Google Fonts in `app/layout.tsx`**

Find the existing `<link>` tag in `app/layout.tsx` that loads Google Fonts. It currently loads:
```
https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=JetBrains+Mono:wght@400;500&display=swap
```

Replace it with (added `&family=Playfair+Display:ital,wght@0,700;1,700` before `&display=swap`):
```
https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=JetBrains+Mono:wght@400;500&family=Playfair+Display:ital,wght@0,700;1,700&display=swap
```

- [ ] **Step 2: Rewrite `app/[locale]/start/page.tsx`**

Replace the entire file with:

```typescript
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { StartPageClient } from "@/components/StartPageClient";
import { getStartPageCopy } from "@/lib/i18n-start";
import { isLocale, LOCALES, type Locale } from "@/lib/i18n";

type LocaleStartPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: LocaleStartPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = getStartPageCopy(locale as Locale);
  return {
    title: `${copy.heroLine1} ${copy.heroLine2}`,
    description: copy.heroSub,
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

  const copy = getStartPageCopy(locale as Locale);

  return <StartPageClient copy={copy} locale={locale as Locale} />;
}
```

- [ ] **Step 3: Run existing start-page tests to verify they still pass**

```bash
npx vitest run app/\\[locale\\]/start/page.test.ts
```

Expected: both tests pass (invalid locale calls notFound; valid locales render without error). Note: the test imports the updated page which now imports `StartPageClient` — this is fine because the test mocks `next/navigation` and `next/headers`, and the component itself is not rendered in the node-env test.

If tests fail because `StartPageClient` now has a different signature, update the existing test mock accordingly (it should not need changing — the test only checks `notFound()` and return value presence, not the component shape).

- [ ] **Step 4: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors in `app/[locale]/start/page.tsx` or `lib/i18n-start.ts`.

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx app/\[locale\]/start/page.tsx
git commit -m "feat: add Playfair Display font and update start page server component"
```

---

### Task 3: Complete StartPageClient rewrite

**Files:**
- Modify: `components/StartPageClient.tsx` (complete replacement)

**Interfaces:**
- Consumes:
  - `StartPageCopy` from `@/lib/i18n-start`
  - `Locale` from `@/lib/i18n`
  - `buildPlanStartUrl(name, date, emoji, planId): string` from `@/lib/landing-event-form`
- Produces: `StartPageClient({ copy: StartPageCopy; locale: Locale })` — used by `app/[locale]/start/page.tsx`.

All sections use inline `style` props only (no Tailwind). Design tokens are defined as module-level constants. The component is self-contained: it renders the full page background, nav, and all content sections.

- [ ] **Step 1: Replace `components/StartPageClient.tsx` with the complete implementation**

Write the following file in its entirety:

```typescript
"use client";

import type React from "react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { buildPlanStartUrl } from "@/lib/landing-event-form";
import type { StartPageCopy } from "@/lib/i18n-start";

// ── Design tokens (warm theme — exact values from spec) ───────────
const SERIF = "'Playfair Display', serif";
const SANS = "'DM Sans', sans-serif";
const pageBg = "#EFE8DD";
const textColor = "#221509";
const muted = "#9A8570";
const faint = "#C5B7A3";
const line = "#E0D6C6";
const surface = "#FFFFFF";
const surfaceSoft = "#FBF7F1";
const gold = "#C5922A";
const goldSoft = "#E8C878";
const goldTint = "#FBF1DC";
const purple = "#5B2D8E";
const purpleHi = "#7B3FBE";

// ── Plan icon SVGs (inline per design spec) ───────────────────────
function PlanIcon({ name, color }: { name: string; color: string }) {
  const s: React.CSSProperties = { width: 16, height: 16, display: "block" };
  if (name === "leaf")
    return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 4C9 4 4 9 4 18c0 1 .5 2 .5 2S14 19 18 13c2-3 2-9 2-9Z" />
        <path d="M7 17c3-4 7-7 11-9" />
      </svg>
    );
  if (name === "star")
    return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinejoin="round">
        <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.6 1-5.8-4.3-4.1 5.9-.9z" />
      </svg>
    );
  if (name === "layers")
    return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinejoin="round">
        <path d="M12 3l9 5-9 5-9-5 9-5z" />
        <path d="M3 13l9 5 9-5" />
      </svg>
    );
  if (name === "diamond")
    return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinejoin="round">
        <path d="M12 3l8 8-8 10L4 11z" />
      </svg>
    );
  if (name === "spark")
    return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v18M3 12h18M6 6l12 12M18 6L6 18" />
      </svg>
    );
  return null;
}

// ── Fixed plan config (display data, not i18n) ────────────────────
const PLAN_CONFIG = [
  { id: "free",     name: "Free",     price: "0€",  was: null,   chip: "#E2EDDB", ink: "#4E7A4A", icon: "leaf"    },
  { id: "standard", name: "Standard", price: "15€", was: null,   chip: "#E0E8F6", ink: "#3E5FA6", icon: "star"    },
  { id: "plus",     name: "Plus",     price: "35€", was: null,   chip: "#E9E0F1", ink: "#7A4FA6", icon: "layers"  },
  { id: "premium",  name: "Premium",  price: "65€", was: "70€",  chip: "#F5E6C4", ink: "#B07E25", icon: "diamond" },
  { id: "max",      name: "Max",      price: "90€", was: "100€", chip: "#F3DBE5", ink: "#B0517A", icon: "spark"   },
] as const;

type PlanId = (typeof PLAN_CONFIG)[number]["id"];

const EMOJIS = ["🎉", "💍", "🎂", "🎓", "🏖️", "🎊"] as const;

const ALL_LOCALES: Locale[] = ["en", "hr", "de"];

// ── Upper-case label (reused across sections) ─────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: SANS,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.16em",
        textTransform: "uppercase" as const,
        color: muted,
      }}
    >
      {children}
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────────
export type StartPageClientProps = {
  copy: StartPageCopy;
  locale: Locale;
};

export function StartPageClient({ copy, locale }: StartPageClientProps) {
  const [name, setName] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [emoji, setEmoji] = useState<string>("🎉");
  const nameInputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;
  const router = useRouter();

  function handleSubmit(planId: PlanId = "plus") {
    if (!name.trim()) {
      const el = nameInputRef.current;
      if (el) {
        el.classList.remove("sp-shake");
        void el.offsetWidth;
        el.classList.add("sp-shake");
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => el.classList.remove("sp-shake"), 420);
      }
      return;
    }
    router.push(buildPlanStartUrl(name.trim(), date, emoji, planId));
  }

  const plusPlan = PLAN_CONFIG.find((p) => p.id === "plus")!;
  const comparisonPlans = PLAN_CONFIG.filter((p) => p.id !== "plus");

  return (
    <>
      {/* ── PAGE BACKGROUND ── */}
      <div
        style={{
          background: pageBg,
          fontFamily: SANS,
          color: textColor,
          position: "relative",
          minHeight: "100vh",
        }}
      >
        {/* Purple glow */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: -100,
            right: -80,
            width: 360,
            height: 300,
            background:
              "radial-gradient(ellipse at center, rgba(123,63,190,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* ── NAV ── */}
        <nav
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px",
            borderBottom: `1px solid ${line}`,
          }}
        >
          <a href={`/${locale}`} style={{ textDecoration: "none" }}>
            <span
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: 20,
                color: textColor,
              }}
            >
              Calisto.
            </span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Language switcher */}
            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
              {ALL_LOCALES.map((l) => (
                <a
                  key={l}
                  href={`/${l}/start`}
                  style={{
                    padding: "4px 9px",
                    borderRadius: 7,
                    textDecoration: "none",
                    background: l === locale ? gold : "transparent",
                    color: l === locale ? "#1a0f00" : "rgba(34,21,9,0.42)",
                    fontSize: 10,
                    fontWeight: 700,
                    fontFamily: SANS,
                    letterSpacing: "0.06em",
                    transition: "all 0.18s",
                  }}
                >
                  {l.toUpperCase()}
                </a>
              ))}
            </div>
            <a
              href="/auth/login"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: textColor,
                textDecoration: "none",
              }}
            >
              {copy.loginLink}
            </a>
          </div>
        </nav>

        {/* ── CONTENT COLUMN (430–480px centered) ── */}
        <div
          style={{
            maxWidth: 480,
            margin: "0 auto",
            position: "relative",
            zIndex: 1,
          }}
        >

          {/* ── HERO ── */}
          <div style={{ padding: "32px 26px 0" }}>
            {/* Review badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                background: goldTint,
                border: `1px solid ${goldSoft}`,
                borderRadius: 30,
                padding: "6px 13px",
                marginBottom: 16,
              }}
            >
              <span style={{ color: gold, fontSize: 12 }}>★★★★★</span>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: "#3A2A18" }}>
                {copy.reviewBadge}
              </span>
            </div>
            {/* Headline */}
            <h1
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: 36,
                lineHeight: 1.07,
                margin: 0,
                color: textColor,
              }}
            >
              {copy.heroLine1}
              <br />
              {copy.heroLine2}
            </h1>
            {/* Subcopy */}
            <p
              style={{
                fontSize: 14.5,
                color: muted,
                lineHeight: 1.55,
                margin: "14px 0 0",
                maxWidth: 340,
              }}
            >
              {copy.heroSub}
            </p>
          </div>

          {/* ── FORM CARD ── */}
          <div style={{ padding: "24px 22px 0" }}>
            <div
              style={{
                background: surface,
                borderRadius: 20,
                padding: "22px 20px 24px",
                border: `1px solid ${line}`,
                boxShadow: "0 18px 40px -22px rgba(80,55,20,0.22)",
              }}
            >
              {/* Name */}
              <div style={{ marginBottom: 11 }}>
                <div
                  style={{
                    fontFamily: SANS,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: muted,
                    marginBottom: 7,
                  }}
                >
                  {copy.formNameLabel}
                </div>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={copy.formNamePlaceholder}
                  className="sp-input"
                  style={{
                    width: "100%",
                    padding: "13px 15px",
                    background: surfaceSoft,
                    border: `1.5px solid ${line}`,
                    borderRadius: 13,
                    fontSize: 15.5,
                    color: textColor,
                    fontFamily: SANS,
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Date */}
              <div style={{ marginBottom: 11 }}>
                <div
                  style={{
                    fontFamily: SANS,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: muted,
                    marginBottom: 7,
                  }}
                >
                  {copy.formDateLabel}
                </div>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="sp-input"
                  style={{
                    width: "100%",
                    padding: "13px 15px",
                    background: surfaceSoft,
                    border: `1.5px solid ${line}`,
                    borderRadius: 13,
                    fontSize: 15.5,
                    color: textColor,
                    fontFamily: SANS,
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Emoji picker */}
              <div>
                <div
                  style={{
                    fontFamily: SANS,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: muted,
                    marginBottom: 7,
                  }}
                >
                  {copy.formEmojiLabel}
                </div>
                <div style={{ display: "flex", gap: 7 }}>
                  {EMOJIS.map((e) => {
                    const sel = emoji === e;
                    return (
                      <button
                        key={e}
                        type="button"
                        onClick={() => setEmoji(e)}
                        style={{
                          flex: "1 1 0",
                          height: 42,
                          background: sel ? goldTint : surfaceSoft,
                          border: `1.5px solid ${sel ? gold : line}`,
                          borderRadius: 11,
                          fontSize: 19,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.15s",
                        }}
                      >
                        {e}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Primary CTA */}
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="sp-cta"
                style={{
                  width: "100%",
                  border: "none",
                  borderRadius: 14,
                  padding: "15px 24px",
                  marginTop: 17,
                  background: `linear-gradient(135deg, ${purpleHi} 0%, ${purple} 100%)`,
                  color: "#fff",
                  fontFamily: SANS,
                  fontSize: 14.5,
                  fontWeight: 700,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                {copy.formCta}
              </button>

              {/* Reassurance */}
              <p
                style={{
                  textAlign: "center",
                  fontSize: 12,
                  color: muted,
                  margin: "11px 0 0",
                }}
              >
                {copy.formReassurance}
              </p>
            </div>
          </div>

          {/* ── HOW IT WORKS ── */}
          <div style={{ padding: "38px 26px 0" }}>
            <div style={{ textAlign: "center", marginBottom: 18 }}>
              <SectionLabel>{copy.howLabel}</SectionLabel>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {copy.howSteps.map((step, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    background: surface,
                    border: `1px solid ${line}`,
                    borderRadius: 14,
                    padding: "13px 15px",
                  }}
                >
                  {/* Number medallion */}
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      flexShrink: 0,
                      borderRadius: "50%",
                      background: goldTint,
                      border: `1px solid ${goldSoft}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: SERIF,
                      fontStyle: "italic",
                      fontWeight: 700,
                      color: gold,
                      fontSize: 15,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: textColor }}>
                      {step.title}
                    </div>
                    <div style={{ fontSize: 12.5, color: muted, marginTop: 1 }}>
                      {step.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── PHONE MOCKUP ── */}
          <div style={{ padding: "40px 26px 0", textAlign: "center" }}>
            <div style={{ marginBottom: 14 }}>
              <SectionLabel>{copy.albumLabel}</SectionLabel>
            </div>
            {/* Phone frame */}
            <div
              style={{
                width: 188,
                margin: "0 auto",
                borderRadius: 30,
                background: "#1d140a",
                padding: 8,
                boxShadow: "0 28px 50px -22px rgba(20,12,4,0.5)",
              }}
            >
              <div
                style={{
                  borderRadius: 23,
                  overflow: "hidden",
                  background: surfaceSoft,
                  border: `1px solid ${line}`,
                }}
              >
                {/* Album header bar */}
                <div
                  style={{
                    height: 30,
                    background: surface,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderBottom: `1px solid ${line}`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: SERIF,
                      fontStyle: "italic",
                      fontWeight: 700,
                      fontSize: 12,
                      color: textColor,
                    }}
                  >
                    {copy.albumEventName}
                  </span>
                </div>
                {/* Photo grid (striped placeholders) */}
                <div
                  style={{
                    padding: 7,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 5,
                  }}
                >
                  {[64, 50, 50, 64, 50, 64].map((h, i) => (
                    <div
                      key={i}
                      style={{
                        height: h,
                        borderRadius: 8,
                        background:
                          "repeating-linear-gradient(135deg, #E7DCCB 0 11px, #EFE6D6 11px 22px)",
                        border: `1px solid ${line}`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            {/* Caption */}
            <p
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: 14,
                color: muted,
                lineHeight: 1.5,
                margin: "18px auto 0",
                maxWidth: 290,
              }}
            >
              {copy.albumCaption}
            </p>
          </div>

          {/* ── FEATURE CHECKLIST ── */}
          <div style={{ padding: "36px 26px 0" }}>
            <div
              style={{
                background: surfaceSoft,
                border: `1px solid ${line}`,
                borderRadius: 18,
                padding: "20px 22px",
                display: "flex",
                flexDirection: "column",
                gap: 13,
              }}
            >
              {copy.features.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: purple,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 14 14"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2.5 7.5l3 3 6-7" />
                    </svg>
                  </div>
                  <span style={{ fontSize: 13.5, color: textColor }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── PRICING ── */}
          <div style={{ padding: "42px 26px 0" }}>
            {/* Section header */}
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ marginBottom: 8 }}>
                <SectionLabel>{copy.pricingLabel}</SectionLabel>
              </div>
              <h2
                style={{
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontWeight: 700,
                  fontSize: 27,
                  color: textColor,
                  margin: 0,
                }}
              >
                {copy.pricingTitle}
              </h2>
            </div>

            {/* Plus highlight card */}
            <div
              style={{
                position: "relative",
                borderRadius: 20,
                padding: "22px 22px 24px",
                background: `linear-gradient(160deg, ${purple} 0%, #45226E 100%)`,
                boxShadow: "0 20px 44px -20px rgba(91,45,142,0.5)",
                marginBottom: 12,
              }}
            >
              {/* "Most popular" badge */}
              <div
                style={{
                  position: "absolute",
                  top: 16,
                  right: 18,
                  background: goldSoft,
                  color: "#3A2A0A",
                  fontSize: 9.5,
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  padding: "4px 9px",
                  borderRadius: 20,
                }}
              >
                {copy.popularBadge}
              </div>
              <div
                style={{
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontWeight: 700,
                  fontSize: 26,
                  color: "#fff",
                }}
              >
                {plusPlan.name}
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.72)", marginTop: 2 }}>
                {copy.guestLimits.plus}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 6,
                  margin: "14px 0 4px",
                }}
              >
                <span
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 700,
                    fontSize: 42,
                    lineHeight: 1,
                    color: "#fff",
                  }}
                >
                  {plusPlan.price}
                </span>
                <span
                  style={{
                    fontFamily: "ui-monospace, Menlo, monospace",
                    fontSize: 10,
                    color: "rgba(255,255,255,0.72)",
                    letterSpacing: "0.08em",
                  }}
                >
                  {copy.perEvent}
                </span>
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.72)",
                  margin: "6px 0 18px",
                  lineHeight: 1.5,
                }}
              >
                {copy.planDescriptions.plus}
              </p>
              <button
                type="button"
                onClick={() => handleSubmit("plus")}
                style={{
                  width: "100%",
                  border: "none",
                  borderRadius: 13,
                  padding: 14,
                  background: "#fff",
                  color: purple,
                  fontFamily: SANS,
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                {copy.choosePlusCta}
              </button>
            </div>

            {/* Comparison rows (other 4 plans) */}
            <div
              style={{
                background: surface,
                border: `1px solid ${line}`,
                borderRadius: 18,
                overflow: "hidden",
              }}
            >
              {comparisonPlans.map((p, i, arr) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSubmit(p.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 13,
                    padding: "15px 18px",
                    width: "100%",
                    background: "none",
                    border: "none",
                    borderBottom: i < arr.length - 1 ? `1px solid ${line}` : "none",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  {/* Tier chip */}
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 9,
                      background: p.chip,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <PlanIcon name={p.icon} color={p.ink} />
                  </div>
                  {/* Name + guest limit */}
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div
                      style={{
                        fontFamily: SERIF,
                        fontStyle: "italic",
                        fontWeight: 700,
                        fontSize: 16,
                        color: textColor,
                      }}
                    >
                      {p.name}
                    </div>
                    <div style={{ fontSize: 11.5, color: muted }}>
                      {copy.guestLimits[p.id]}
                    </div>
                  </div>
                  {/* Price */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    {p.was && (
                      <div
                        style={{
                          fontSize: 11,
                          color: faint,
                          textDecoration: "line-through",
                        }}
                      >
                        {p.was}
                      </div>
                    )}
                    <div
                      style={{
                        fontFamily: SERIF,
                        fontWeight: 700,
                        fontSize: 19,
                        color: textColor,
                      }}
                    >
                      {p.price}
                    </div>
                  </div>
                  {/* Chevron */}
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    stroke={faint}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flexShrink: 0 }}
                  >
                    <path d="M5 3l5 4.5L5 12" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* ── FAIR-USE NOTE ── */}
          <div style={{ padding: "34px 26px 0" }}>
            <p
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: 11.5,
                color: faint,
                lineHeight: 1.6,
                textAlign: "center",
                margin: 0,
              }}
            >
              {copy.fairUse}
            </p>
          </div>

          {/* Spacer so sticky bar never covers content */}
          <div style={{ height: 92 }} />
        </div>
      </div>

      {/* ── STICKY MOBILE CTA BAR (fixed to viewport bottom) ── */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "12px 18px",
          paddingBottom: "calc(12px + env(safe-area-inset-bottom))",
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderTop: `1px solid ${line}`,
          boxShadow: "0 -6px 20px -8px rgba(20,12,4,0.18)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          zIndex: 100,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: textColor }}>
            {copy.stickyTitle}
          </div>
          <div style={{ fontSize: 11, color: muted }}>{copy.stickySub}</div>
        </div>
        <button
          type="button"
          onClick={() => handleSubmit()}
          className="sp-cta"
          style={{
            flexShrink: 0,
            border: "none",
            borderRadius: 14,
            padding: "13px 20px",
            background: `linear-gradient(135deg, ${purpleHi} 0%, ${purple} 100%)`,
            color: "#fff",
            fontFamily: SANS,
            fontSize: 14.5,
            fontWeight: 700,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          {copy.stickyCta}
        </button>
      </div>

      {/* ── GLOBAL STYLES for this page ── */}
      <style>{`
        .sp-input:focus {
          border-color: ${gold} !important;
          outline: none;
        }
        .sp-cta {
          transition: all 0.2s;
          box-shadow: 0 5px 16px rgba(91,45,142,0.30);
        }
        .sp-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 30px rgba(91,45,142,0.30);
        }
        @keyframes sp-shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-5px); }
          40%       { transform: translateX(5px); }
          60%       { transform: translateX(-4px); }
          80%       { transform: translateX(4px); }
        }
        .sp-shake { animation: sp-shake 0.42s ease-out; }
      `}</style>
    </>
  );
}
```

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep -E "StartPageClient|i18n-start" | head -20
```

Expected: no errors in `components/StartPageClient.tsx`.

- [ ] **Step 3: Run the existing start-page test suite**

```bash
npx vitest run app/\\[locale\\]/start/page.test.ts lib/i18n-start.test.ts
```

Expected: all tests pass. The `app/[locale]/start/page.test.ts` tests verify that invalid locales call `notFound()` and that valid locales render without throwing — both still hold.

- [ ] **Step 4: Run the full test suite to check for regressions**

```bash
npx vitest run 2>&1 | tail -20
```

Expected: same pass/fail counts as baseline. The existing 5 failing tests are pre-existing (confirmed before this feature branch). Any new failure is a regression to fix before committing.

- [ ] **Step 5: Commit**

```bash
git add components/StartPageClient.tsx
git commit -m "feat: redesign /start page with warm-theme UI per design handoff"
```
