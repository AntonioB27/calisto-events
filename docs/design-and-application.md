# Calisto — design & application overview

This document condenses how the **Calisto Events** web app is structured and how **design tokens and UI primitives** hang together. It is intended for collaborators and coding agents who need grounding without chasing every file.

For **environment variables, Supabase tables, and CI/production build notes**, see the root [**README.md**](../README.md).

---

## 1. What the product is

- **Organizers**: Sign in with Supabase Auth, manage **events** (create, dashboard, detail screens, tiers, printing), optionally complete **first-run onboarding** tied to `profiles.onboarding_completed_at`.
- **Guests**: Reach events via **`/join/{accessCode}`** (paste flow from **`/join`**), upload and view media depending on event rules—not the authenticated `(app)` shell.
- **Marketing / locale landing**: **`/[locale]`** (e.g. `/en`, `/hr`, `/de`) drives the multilingual **marketing** shell (different visual language than the authenticated app chrome).
- **Waitlist**: Public landing areas can POST to **`/api/waitlist`** (server + service role)—orthogonally documented in README.

---

## 2. Technology stack & runtime rules

| Area | Choice |
|------|--------|
| Framework | **Next.js App Router** (this repo tracks **Next 16.x** — treat framework docs as version-specific; see **`AGENTS.md`**) |
| UI | **React** + **`components/app-ui/*`** primitives; **Tailwind CSS v4** alongside significant **`app/globals.css`** |
| Backend / data | **Supabase** (Auth, Postgres, Storage as used across features); server/auth via **`@supabase/ssr`** |
| Middleware | **`middleware.ts`** at repo root refreshes the auth session cookie on navigations (`getUser`). Next may warn toward the newer **`proxy.ts`** naming—only one convention file must exist |

Client Supabase singleton pattern: **`lib/supabase-browser.ts`** (`getSupabaseBrowserClient`). Server/route handlers: **`lib/supabase-auth-server.ts`**, **`app/auth/callback/route.ts`** (OAuth code exchange).

**Build/runtime env**: **`next.config.ts`** maps `SUPABASE_*` / `EXPO_PUBLIC_*` into **`NEXT_PUBLIC_*`** so anonymous keys embed correctly in client bundles—see README before changing secrets.

---

## 3. Information architecture (routes)

### Public / unauthenticated highlights

| Route | Role |
|-------|------|
| `/` | Default entry; aligns with landing behavior |
| `/[locale]` | Locale-specific marketing stack |
| `/welcome` | Choose **organizer vs guest** entry framing |
| `/join` | Paste access code → guest flow entry |
| `/join/[accessCode]` | Guest-facing event hub (media upload, grids, welcome modal, etc.) |
| `/auth/login` | Combined **login + register** UI (`AuthCombinedForm`), query `mode`, `returnTo` |
| `/auth/register` | Redirects into login with `mode=register` (legacy links preserved) |
| `/auth/forgot-password`, `/auth/reset-password`, `/auth/reset-password/success` | Email password recovery |
| `/auth/callback` | OAuth return (Google, etc.) + session exchange |

### Organizer app **`(app)` group** (`app/(app)/layout.tsx`)

All routes below require **`requireOrganizerSession()`**—otherwise redirect **`/auth/login`**. Wrapped in **`AppShell`** (+ **`OnboardingRedirect`**).

| Route | Role |
|-------|------|
| `/dashboard` | Event list (“My events”) |
| `/events/new` | Create flow (steps, draft/resume semantics as implemented) |
| `/events/[id]` | Organizer event hub (tabs: gallery management, guests, etc.) |
| `/events/[id]/print` | Print-oriented view |
| `/settings` | Profile block (`#profile`), appearance (theme), sign out (`SettingsClient` + **`lib/calisto-theme.ts`**) |
| `/onboarding/organizer` | Organizer onboarding form until DB says complete |
| `/plan-tiers` | Plan comparison / tiers surface |

Guest routes **reuse app visual tokens** in places (e.g. join shell styling) via **`globals.css`** `.join-shell` hooks where noted.

---

## 4. How the app behaves (flows)

### Auth

- **Email/password**: **`signInWithPassword`** / **`signUp`** from combined auth UI; safe redirects via **`lib/safe-return-path.ts`** (**same-origin paths only**).
- **OAuth (Google):** `signInWithOAuth` → **`/auth/callback`** → `exchangeCodeForSession`→ redirect to **`next`** query default **`/dashboard`**.
- **Session refresh**: Middleware (or equivalent) runs **`supabase.auth.getUser()`** so server components receive fresh cookies—do not rip out silently.

### Organizer onboarding gate

**`components/OnboardingRedirect.tsx`**: if **`needsOrganizerOnboarding`** then client **`replace`** to **`/onboarding/organizer`** unless path already starts with **`/onboarding`**.

### Guests

**`/join/[accessCode]`** loads event context (preview/API as implemented), shows guest UI (**`GuestEventPage`**, **`WelcomeModal`**, **`MediaGrid`**, **`UploadZone`**, …). Organizer RLS/session rules apply on server; guests use patterns appropriate to public join (see route handlers under **`app/api/`**).

### App shell (**`components/AppShell.tsx`**)

- **Desktop (`md+`)**: top bar with logo, **`Home`** + **`Settings`** text nav, **`Join`** / **`New event`** actions, **account menu** (**`AppShellAccountMenu`**: Profile, Settings, Theme, Help → mailto **`info@calisto-events.com`**, Sign out).
- **Mobile**: **Join hidden in header** (duplicated bottom dock **`DOCK_ITEMS`**). **New event** short label **`+`** with **`aria-label`**. **`100dvh`** column flex shell; **`main`** carries **`min-h-0 flex-1 overflow-y-auto`** so only the body scrolls. Top bar CSS class **`app-shell-header`** uses **solid background & no backdrop-filter under 768px** to avoid mobile tap glitches.

---

## 5. Visual design language

### Surfaces — two families

1. **Marketing / locale pages** (“Calisto landing” aesthetic): richer gold/cream **`--cream`/`--ink`/`--gold`** stack, vignettes, **`body::after` film-grain overlay** (**`pointer-events: none`**), **`SiteHeader`** / **`SiteFooter`**, multilingual chrome.
2. **Authenticated app & join contexts**: **`--app-*` token family** scoped conceptually inside **`.app-shell`** and **`.join-shell`** (**`globals.css`** comment block spells this out). Warm light base; dark mode swaps to deep plum/graphite ambience with analogous gold/purple accents.

### Core **`--app-*` tokens** (light defaults; dark overridden under **`html[data-theme="dark"]`**)

Representative semantics (not exhaustive): **`--app-bg`**, **`--app-surface`**, **`--app-surface-2`**, **`--app-text`**, **`--app-muted`**, **`--app-border`** / **`--app-border-strong`**, **`--app-purple`** / **`--app-purple-2`**, **`--app-gold`** / **`--app-gold-2`**, **`--app-danger`**, **`--app-success`**, **`--app-warn`**, radii (**`--app-radius-*`**), **`--app-shadow-*`**, **`--app-inverse`** (text on gradients).

Typography: **`--font-display`** (italic headlines: “Calisto.”, page titles), body uses system-friendly sans via global font setup (**`app/layout.tsx`** — not duplicated here).

### Motion & UX polish

- **Auth combined form**: Sliding **mode rail** (`.auth-mode-rail*`); **dual-panel login/register** stacks in one grid row so **card height stays stable** (`.auth-form-stack`, `.auth-form-panel*`).
- **OAuth divider** on auth card: eyebrow **`Or`** + **continue with email** plus gradient rule lines (`.auth-oauth-*`).
- **Reduced motion**: `@media (prefers-reduced-motion: reduce)` scales back rail/panel animations in **`globals.css`**.

Theme persistence: **`data-theme`** on **`html`** + **`localStorage`** key centralized in **`lib/calisto-theme.ts`** (**`CALISTO_THEME_STORAGE_KEY`**).

---

## 6. UI primitives (reuse these)

Located under **`components/app-ui/`**:

| Component | Typical use |
|-----------|--------------|
| **`AppBtn`** | Primary/outline/ghost/gold/danger variants, sizes **`sm/md/lg`**, `loading`, optional **`as={Link}`** |
| **`AppCard`** | Padded surfaces, hover states, **`app-card`** + modifiers (e.g. **`.auth-card`**) |
| **`AppPageHeader`** | Gold bar + eyebrow/title/description + actions rail |
| **`AppFormRow`**, **`AppInput`**, **`FieldLabel`** | Form consistency |
| **`AppBadge`** | Tone chips (plans, statuses) |
| **`GoldBar`**, **`StatRing`** | Decorative / metrics |
| **`AuthModeRail`** | Tab-like login/register control on auth card |

Sticky nav / event subtabs use dedicated blocks in **`globals.css`** (`.app-nav-link*`, `.event-navbar*`). Account popover styling: `.app-account-menu__*`.

Prefer **matching existing spacing, italic display headlines, gradient CTAs**, and **`color-mix(in srgb, …)`** tints rather than importing a second design system.

---

## 7. Where to extend safely

| Concern | Start here |
|---------|-------------|
| New organizer page | **`app/(app)/…`**; wrap content with existing primitives; honor **`1040`** max inner width convention in **`AppShell`** (`max-w-[1040px]`) unless the screen is fullscreen by design |
| Guest join UI | **`app/join/[accessCode]/_components/`**, **`app/globals.css`** join shell hooks |
| Auth surface | **`app/auth/_components/AuthCombinedForm.tsx`**, auth CSS markers in **`globals.css`** |
| New API routes | **`app/api/**`** (+ Vitest colocated **`*.test.ts`** where patterns exist) |
| Supabase/session | **`lib/supabase-*`**, **`middleware.ts`** |

---

## 8. Drift disclaimer

Plans and retros live under **`docs/superpowers/`**; they may lag the **current repo**. Prefer **code + this file + README** for truth. Refresh this overview when architectural or brand-level behavior changes materially.
