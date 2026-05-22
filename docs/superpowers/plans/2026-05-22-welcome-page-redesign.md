# Welcome Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `/welcome` so Register and Login dominate the hierarchy, remove Create/Join buttons from that page, and add a `/welcome/onboarding` screen that guides new registrants to their next step.

**Architecture:** Four self-contained changes: (1) update copy keys in `lib/welcome-page-copy.ts`, (2) rewrite the JSX in `app/welcome/page.tsx` to use the new hierarchy, (3) trim CSS in `app/globals.css` to match, (4) create the new `app/welcome/onboarding/page.tsx` server component.

**Tech Stack:** Next.js App Router server components, lucide-react (Plus, Key icons), existing `app-shell` / `welcome-reveal` / `welcome-btn` CSS classes, Editorial Almanac inline-style palette.

---

### Task 1: Update copy keys in `lib/welcome-page-copy.ts`

**Files:**
- Modify: `lib/welcome-page-copy.ts`

- [ ] **Step 1: Replace the `WelcomePageCopy` type and all three locale objects**

Replace the entire file content with:

```ts
import type { Locale } from "@/lib/i18n";

export type WelcomePageCopy = {
  eyebrow: string;
  tagline: string;
  register: string;
  logIn: string;
  joinWithCode: string;
  backHome: string;
  onboardingHeading: string;
  onboardingCreateTitle: string;
  onboardingCreateSub: string;
  onboardingJoinTitle: string;
  onboardingJoinSub: string;
};

const WELCOME_PAGE_COPY: Record<Locale, WelcomePageCopy> = {
  en: {
    eyebrow: "Welcome to",
    tagline: "Collect photos and videos from everyone at your event.",
    register: "Create an account",
    logIn: "Log in",
    joinWithCode: "Join with a code",
    backHome: "← Back to home",
    onboardingHeading: "What would you like to do?",
    onboardingCreateTitle: "Create an event",
    onboardingCreateSub: "Set up a new event and invite your guests.",
    onboardingJoinTitle: "Join an event",
    onboardingJoinSub: "Enter an access code from your organizer.",
  },
  hr: {
    eyebrow: "Dobrodošli u",
    tagline: "Prikupljajte fotografije i videozapise od svih na vašem događaju.",
    register: "Stvori račun",
    logIn: "Prijavi se",
    joinWithCode: "Pridruži se s kodom",
    backHome: "← Natrag na početnu",
    onboardingHeading: "Što biste željeli napraviti?",
    onboardingCreateTitle: "Stvori događaj",
    onboardingCreateSub: "Postavi novi događaj i pozovi goste.",
    onboardingJoinTitle: "Pridruži se događaju",
    onboardingJoinSub: "Unesite pristupni kod od svog organizatora.",
  },
  de: {
    eyebrow: "Willkommen bei",
    tagline: "Sammeln Sie Fotos und Videos von allen auf Ihrer Veranstaltung.",
    register: "Konto erstellen",
    logIn: "Anmelden",
    joinWithCode: "Mit Code beitreten",
    backHome: "← Zurück zur Startseite",
    onboardingHeading: "Was möchtest du tun?",
    onboardingCreateTitle: "Veranstaltung erstellen",
    onboardingCreateSub: "Richte eine neue Veranstaltung ein und lade deine Gäste ein.",
    onboardingJoinTitle: "Veranstaltung beitreten",
    onboardingJoinSub: "Gib den Zugangscode von deinem Organisator ein.",
  },
};

export function getWelcomePageCopy(locale: Locale): WelcomePageCopy {
  return WELCOME_PAGE_COPY[locale];
}
```

- [ ] **Step 2: Verify TypeScript — expect one error about `copy.createEvent` / `copy.joinEvent` / `copy.haveAccount` in `app/welcome/page.tsx` (fixed in Task 2)**

```bash
npx tsc --noEmit 2>&1 | grep "welcome-page-copy\|welcome/page"
```

Expected: errors in `app/welcome/page.tsx` referencing old keys (`createEvent`, `joinEvent`, `haveAccount`). No errors in `lib/welcome-page-copy.ts` itself.

- [ ] **Step 3: Commit**

```bash
git add lib/welcome-page-copy.ts
git commit -m "feat: update welcome page copy keys for auth-first redesign"
```

---

### Task 2: Rewrite `app/welcome/page.tsx`

**Files:**
- Modify: `app/welcome/page.tsx`

- [ ] **Step 1: Replace the button section (lines 119–168) with the new three-action hierarchy**

Replace the entire file with:

```tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  MascotSpot,
  WELCOME_HERO_COLUMN_MAX_WIDTH_PX,
  WELCOME_HERO_MASCOT_PX,
} from "@/components/MascotSpot";
import { getLandingCopy } from "@/lib/i18n";
import { getUiLocale } from "@/lib/ui-locale";
import { getWelcomePageCopy } from "@/lib/welcome-page-copy";
import { createSupabaseAuthServerClient } from "@/lib/supabase-auth-server";

import { WelcomeLanguageBar } from "./WelcomeLanguageBar";

export default async function WelcomePage() {
  const supabase = await createSupabaseAuthServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    redirect("/dashboard");
  }

  const locale = await getUiLocale();
  const landing = getLandingCopy(locale);
  const copy = getWelcomePageCopy(locale);

  return (
    <main
      className="app-shell"
      aria-label="Welcome to Calisto"
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        paddingTop: 24,
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: "max(24px, env(safe-area-inset-bottom, 24px))",
        overflowY: "auto",
      }}
    >
      {/* Language bar */}
      <div className="welcome-lang-bar welcome-reveal">
        <WelcomeLanguageBar locale={locale} languageLabel={landing.languageLabel} />
      </div>

      <div
        className="welcome-card"
        style={{ width: "100%", maxWidth: WELCOME_HERO_COLUMN_MAX_WIDTH_PX, textAlign: "center" }}
      >
        <div
          className="welcome-reveal welcome-mascot-float"
          style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}
        >
          <MascotSpot
            src="/brand/mascot/aurora_present.png"
            size={WELCOME_HERO_MASCOT_PX}
            variant="stack"
            className="welcome-mascot"
          />
        </div>

        <div
          className="welcome-reveal welcome-reveal--d1"
          style={{ width: 32, height: 3, background: "#C5922A", borderRadius: 2, margin: "0 auto 16px" }}
        />

        <p
          className="welcome-reveal welcome-reveal--d2"
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#9A8570",
            marginBottom: 8,
          }}
        >
          {copy.eyebrow}
        </p>

        <h1
          className="welcome-reveal welcome-reveal--d3"
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: "clamp(36px, 13vw, 56px)",
            color: "#221509",
            lineHeight: 1,
            marginBottom: 12,
          }}
        >
          Calisto.
        </h1>

        <p
          className="welcome-reveal welcome-reveal--d4"
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: 16,
            color: "#9A8570",
            marginBottom: 32,
            lineHeight: 1.6,
          }}
        >
          {copy.tagline}
        </p>

        <div
          className="welcome-reveal welcome-reveal--d5"
          style={{ display: "flex", flexDirection: "column", gap: 10 }}
        >
          {/* Primary: Register — gold gradient */}
          <Link
            href="/auth/login?mode=register&returnTo=%2Fwelcome%2Fonboarding"
            className="welcome-btn welcome-btn--create"
          >
            <span className="welcome-btn__inner">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 1.5 L9.18 6.82 L14.5 8 L9.18 9.18 L8 14.5 L6.82 9.18 L1.5 8 L6.82 6.82 Z" />
              </svg>
              <span>{copy.register}</span>
            </span>
          </Link>

          {/* Secondary: Log in — glass with gradient border */}
          <Link
            href="/auth/login?returnTo=%2Fdashboard"
            className="welcome-btn welcome-btn--join"
          >
            <span className="welcome-btn__inner">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <circle cx="7" cy="4.5" r="2.4" stroke="currentColor" strokeWidth="1.3" />
                <path d="M1 13.5 C1.5 10 4 8.5 7 8.5 S12.5 10 13 13.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <span>{copy.logIn}</span>
            </span>
          </Link>
        </div>

        {/* Tertiary: Join with a code — muted text link */}
        <div
          className="welcome-reveal welcome-reveal--d6"
          style={{ display: "flex", justifyContent: "center", marginTop: 4 }}
        >
          <Link
            href="/join"
            style={{
              fontSize: 13,
              color: "#9A8570",
              textDecoration: "none",
              padding: "10px 14px",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="6" cy="7" r="3.2" stroke="currentColor" strokeWidth="1.4" />
              <path d="M8.5 9.5 L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M11.5 11.5 L13 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            {copy.joinWithCode}
          </Link>
        </div>

        <p
          className="welcome-reveal welcome-reveal--d6"
          style={{ marginTop: 20, fontSize: 13, color: "#9A8570" }}
        >
          <Link href="/" style={{ color: "#C5922A", textDecoration: "underline" }}>
            {copy.backHome}
          </Link>
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify TypeScript — no errors on the welcome page**

```bash
npx tsc --noEmit 2>&1 | grep "welcome/page"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add app/welcome/page.tsx
git commit -m "feat: redesign welcome page — Register primary, Login secondary, Join as text link"
```

---

### Task 3: Update CSS in `app/globals.css`

**Files:**
- Modify: `app/globals.css` (lines ~1843–1921)

- [ ] **Step 1: Fix `.welcome-btn--join .welcome-btn__inner` — change `justify-content` from `space-between` to `center`**

Find this block (around line 1843):
```css
.welcome-btn--join .welcome-btn__inner {
  justify-content: space-between;
}
```

Replace with:
```css
.welcome-btn--join .welcome-btn__inner {
  justify-content: center;
}
```

- [ ] **Step 2: Remove the chevron transition rules inside `.welcome-btn--join`**

Delete these two blocks entirely:
```css
.welcome-btn--join .welcome-btn-chevron {
  opacity: 0.5;
  transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.18s ease;
  flex-shrink: 0;
}

.welcome-btn--join:hover .welcome-btn-chevron {
  transform: translateX(3px);
  opacity: 1;
}
```

- [ ] **Step 3: Remove the entire `.welcome-btn--account` block**

Delete these five blocks entirely:
```css
/* ── Have account: pure text-link action ── */
.welcome-btn--account { ... }
.welcome-btn--account .welcome-btn__inner { ... }
.welcome-btn--account:hover { ... }
.welcome-btn--account .welcome-btn-arrow { ... }
.welcome-btn--account:hover .welcome-btn-arrow { ... }
```

- [ ] **Step 4: Clean up the `@media (prefers-reduced-motion: reduce)` block**

Find (around line 1915):
```css
@media (prefers-reduced-motion: reduce) {
  .welcome-btn { transition: none; }
  .welcome-btn--create::after { animation: none !important; }
  .welcome-btn--create:hover { transform: none; }
  .welcome-btn--join:hover { transform: none; }
  .welcome-btn--join .welcome-btn-chevron,
  .welcome-btn--account .welcome-btn-arrow { transition: none; }
}
```

Replace with:
```css
@media (prefers-reduced-motion: reduce) {
  .welcome-btn { transition: none; }
  .welcome-btn--create::after { animation: none !important; }
  .welcome-btn--create:hover { transform: none; }
  .welcome-btn--join:hover { transform: none; }
}
```

- [ ] **Step 5: Verify the page still compiles**

```bash
npx tsc --noEmit 2>&1 | grep "globals\|welcome"
```

Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add app/globals.css
git commit -m "style: clean up welcome button CSS — center Login, remove account link rules"
```

---

### Task 4: Create `/welcome/onboarding/page.tsx`

**Files:**
- Create: `app/welcome/onboarding/page.tsx`

- [ ] **Step 1: Create the file**

```tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { Key, Plus } from "lucide-react";

import { createSupabaseAuthServerClient } from "@/lib/supabase-auth-server";
import { getUiLocale } from "@/lib/ui-locale";
import { getWelcomePageCopy } from "@/lib/welcome-page-copy";

export default async function OnboardingPage() {
  const supabase = await createSupabaseAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/welcome");

  const locale = await getUiLocale();
  const copy = getWelcomePageCopy(locale);

  const GOLD = "#C5922A";
  const PURPLE = "#5B2D8E";
  const INK = "#221509";
  const MUTED = "#9A8570";
  const FS = "'DM Serif Display', serif";
  const FB = "'DM Sans', sans-serif";

  const glass: React.CSSProperties = {
    background: "rgba(255,255,255,0.62)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    border: "1px solid rgba(255,255,255,0.78)",
    boxShadow: "0 10px 30px -8px rgba(40,25,15,0.18), inset 0 1px 0 rgba(255,255,255,0.7)",
    borderRadius: 14,
    padding: 20,
    display: "flex",
    alignItems: "center",
    gap: 16,
    textDecoration: "none",
    cursor: "pointer",
  };

  return (
    <main
      className="app-shell welcome-reveal"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: 24,
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{ width: 32, height: 3, background: GOLD, borderRadius: 2, margin: "0 auto 16px" }}
          />
          <h1
            style={{
              fontFamily: FS,
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: "clamp(28px, 8vw, 38px)",
              color: INK,
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            {copy.onboardingHeading}
          </h1>
        </div>

        {/* Two glass tiles */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Link href="/events/new" style={glass}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `${GOLD}18`,
                border: `1px solid ${GOLD}40`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Plus size={22} color={GOLD} />
            </div>
            <div>
              <div
                style={{
                  fontFamily: FS,
                  fontStyle: "italic",
                  fontWeight: 700,
                  fontSize: 18,
                  color: INK,
                  lineHeight: 1.2,
                }}
              >
                {copy.onboardingCreateTitle}
              </div>
              <div
                style={{ fontFamily: FB, fontSize: 13, color: MUTED, marginTop: 3, lineHeight: 1.4 }}
              >
                {copy.onboardingCreateSub}
              </div>
            </div>
          </Link>

          <Link href="/join" style={glass}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `${PURPLE}18`,
                border: `1px solid ${PURPLE}40`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Key size={20} color={PURPLE} />
            </div>
            <div>
              <div
                style={{
                  fontFamily: FS,
                  fontStyle: "italic",
                  fontWeight: 700,
                  fontSize: 18,
                  color: INK,
                  lineHeight: 1.2,
                }}
              >
                {copy.onboardingJoinTitle}
              </div>
              <div
                style={{ fontFamily: FB, fontSize: 13, color: MUTED, marginTop: 3, lineHeight: 1.4 }}
              >
                {copy.onboardingJoinSub}
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify TypeScript — no errors on the new file**

```bash
npx tsc --noEmit 2>&1 | grep "onboarding"
```

Expected: no output.

- [ ] **Step 3: Verify full project has no new errors**

```bash
npx tsc --noEmit 2>&1 | grep -v "node_modules\|\.next\|test\.tsx\|test\.ts" | grep "error TS"
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add app/welcome/onboarding/page.tsx
git commit -m "feat: add /welcome/onboarding post-registration screen with create/join tiles"
```

---

### Task 5: Push

- [ ] **Step 1: Push all commits**

```bash
git push origin main
```
