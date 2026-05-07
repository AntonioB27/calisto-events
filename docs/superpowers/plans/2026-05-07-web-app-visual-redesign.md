# Web App Visual Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle all authenticated app routes (dashboard, events, auth, join) to match the approved Calisto Web App design — warm cream/dark-adaptive theme, Playfair Display headings, gold + purple accents, top-bar nav — without touching the marketing landing page.

**Architecture:** New `--app-*` CSS tokens added to `globals.css` (additive, never modifying existing tokens). A client `AppShell` component provides the sticky top-bar nav and wraps `(app)/layout.tsx` children. Individual pages are simplified to return content only (no per-page full-screen wrappers). Shared atoms live in `components/app-ui/`.

**Tech Stack:** Next.js 16 (React 19), Tailwind v4, Supabase SSR, vitest

---

## File Map

| Path | Action | Purpose |
|---|---|---|
| `app/layout.tsx` | Modify | Add Playfair Display to Google Fonts link |
| `app/globals.css` | Modify (additive) | New `--app-*` token block + `.app-shell` class |
| `components/app-ui/GoldBar.tsx` | Create | 32×3 gold accent bar |
| `components/app-ui/FieldLabel.tsx` | Create | Uppercase 10px muted label |
| `components/app-ui/StatRing.tsx` | Create | SVG progress ring with centred icon |
| `components/app-ui/AppCard.tsx` | Create | Themed card with hover lift |
| `components/app-ui/AppBtn.tsx` | Create | primary / gold / ghost / white button variants |
| `components/app-ui/AppInput.tsx` | Create | Gold-focus themed input + textarea |
| `components/AppShell.tsx` | Create | Top-bar nav + sub-bar + mobile dock (client) |
| `app/(app)/layout.tsx` | Modify | Get user email, wrap in AppShell |
| `app/welcome/page.tsx` | Modify | Redesign pre-auth welcome |
| `app/auth/login/page.tsx` | Modify | Redesign, keep Supabase logic |
| `app/auth/register/page.tsx` | Modify | Redesign, keep Supabase logic |
| `app/auth/forgot-password/page.tsx` | Modify | Redesign |
| `app/(app)/dashboard/page.tsx` | Modify | Remove hardcoded bg wrapper |
| `app/(app)/dashboard/DashboardClient.tsx` | Modify | Full redesign with EventCard |
| `app/(app)/events/[id]/page.tsx` | Modify | Remove hardcoded bg, restyle layout |
| `app/(app)/events/[id]/_tabs/EventAdminTabs.tsx` | Modify | Restyle tab pills |
| `app/(app)/events/[id]/_tabs/OverviewTab.tsx` | Modify | Full redesign (info, stats, access code, featured) |
| `app/(app)/events/[id]/_tabs/ShareTab.tsx` | Modify | Restyle to app tokens |
| `app/(app)/events/[id]/_tabs/GalleryManager.tsx` | Modify | Masonry grid + lightbox |
| `app/(app)/events/new/page.tsx` | Modify | Remove hardcoded wrapper |
| `app/(app)/events/new/_steps/Step1Details.tsx` | Modify | Full redesign |
| `app/(app)/events/new/_steps/Step2Plan.tsx` | Modify | Gradient plan cards |
| `app/join/page.tsx` | Modify | Remove hardcoded wrapper, add mascot layout |
| `app/join/JoinCodeForm.tsx` | Modify | Redesign large code input |

---

## Task 1: Design tokens + Playfair Display font

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Add Playfair Display to the Google Fonts link**

In `app/layout.tsx`, change the font `<link>` href from:
```
https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&display=swap
```
to:
```
https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap
```

- [ ] **Step 2: Add app-shell CSS token block to `globals.css`**

Append the following block at the end of `app/globals.css` (after all existing rules):

```css
/* ════════ App shell design tokens ════════ */
:root {
  --app-bg:     #0C0A0F;
  --app-card:   rgba(255, 255, 255, 0.05);
  --app-text:   #F4EAD9;
  --app-muted:  #B5AB99;
  --app-gold:   #F0B34B;
  --app-purple: #8B6A8C;
  --app-border: rgba(244, 234, 217, 0.08);
  --app-card-solid: #1C1724;
}

[data-theme="light"] {
  --app-bg:          #ECE4D9;
  --app-card:        #FAF7F3;
  --app-card-solid:  #FAF7F3;
  --app-text:        #221509;
  --app-muted:       #9A8570;
  --app-gold:        #C5922A;
  --app-purple:      #5B2D8E;
  --app-border:      #DDD4C5;
}

.app-shell {
  --font-display: 'Playfair Display', Georgia, serif;
  background: var(--app-bg);
  color: var(--app-text);
  min-height: 100vh;
}
```

- [ ] **Step 3: Verify the page still builds**

```bash
cd /home/antonio/repo/calisto-landing && npm run build 2>&1 | tail -20
```
Expected: build completes, no type errors, no CSS parse errors.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx app/globals.css
git commit -m "feat(app-ui): add Playfair Display font + app-shell CSS tokens"
```

---

## Task 2: Shared atoms — GoldBar, FieldLabel, StatRing

**Files:**
- Create: `components/app-ui/GoldBar.tsx`
- Create: `components/app-ui/FieldLabel.tsx`
- Create: `components/app-ui/StatRing.tsx`

- [ ] **Step 1: Create `components/app-ui/GoldBar.tsx`**

```tsx
type GoldBarProps = { vertical?: boolean };

export function GoldBar({ vertical }: GoldBarProps) {
  if (vertical) {
    return (
      <div style={{ width: 3, height: 16, background: 'var(--app-gold)', borderRadius: 2, flexShrink: 0 }} />
    );
  }
  return (
    <div style={{ width: 32, height: 3, background: 'var(--app-gold)', borderRadius: 2 }} />
  );
}
```

- [ ] **Step 2: Create `components/app-ui/FieldLabel.tsx`**

```tsx
export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: 'var(--app-muted)',
      marginBottom: 8,
    }}>
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Write StatRing unit test (pure calculation)**

Create `components/app-ui/StatRing.test.ts`:

```ts
import { describe, it, expect } from 'vitest';

function ringOffset(value: number, max: number, r = 32): number {
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  return circ * (1 - pct);
}

describe('ringOffset', () => {
  it('returns full circumference when value is 0', () => {
    const circ = 2 * Math.PI * 32;
    expect(ringOffset(0, 100)).toBeCloseTo(circ);
  });

  it('returns 0 when value equals max', () => {
    expect(ringOffset(100, 100)).toBeCloseTo(0);
  });

  it('returns half circumference at 50%', () => {
    const circ = 2 * Math.PI * 32;
    expect(ringOffset(50, 100)).toBeCloseTo(circ * 0.5);
  });

  it('clamps value above max to full fill', () => {
    expect(ringOffset(200, 100)).toBeCloseTo(0);
  });
});
```

- [ ] **Step 4: Run the test**

```bash
cd /home/antonio/repo/calisto-landing && npm test -- --reporter=verbose components/app-ui/StatRing.test.ts 2>&1 | tail -20
```
Expected: 4 tests pass.

- [ ] **Step 5: Create `components/app-ui/StatRing.tsx`**

```tsx
type StatRingProps = {
  value: number;
  max: number;
  color: string;
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
};

export function StatRing({ value, max, color, label, sublabel, icon }: StatRingProps) {
  const r = 32;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const offset = circ * (1 - pct);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flex: 1, minWidth: 80 }}>
      <div style={{ position: 'relative', width: 76, height: 76 }}>
        <svg width="76" height="76" viewBox="0 0 76 76" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="38" cy="38" r={r} fill="none" stroke="var(--app-border)" strokeWidth="5.5" />
          <circle
            cx="38" cy="38" r={r} fill="none"
            stroke={color} strokeWidth="5.5"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--app-text)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11, color: 'var(--app-muted)', marginTop: 3 }}>{label}</div>
        {sublabel && <div style={{ fontSize: 10, fontWeight: 600, color, marginTop: 2 }}>{sublabel}</div>}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add components/app-ui/
git commit -m "feat(app-ui): add GoldBar, FieldLabel, StatRing atoms"
```

---

## Task 3: Shared atoms — AppCard, AppBtn, AppInput

**Files:**
- Create: `components/app-ui/AppCard.tsx`
- Create: `components/app-ui/AppBtn.tsx`
- Create: `components/app-ui/AppInput.tsx`

- [ ] **Step 1: Create `components/app-ui/AppCard.tsx`**

```tsx
"use client";

import { useState } from "react";

type AppCardProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
  hover?: boolean;
};

export function AppCard({ children, style = {}, onClick, hover }: AppCardProps) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'var(--app-card)',
        borderRadius: 18,
        border: '1.5px solid var(--app-border)',
        boxShadow: hov && hover ? '0 8px 32px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'all 0.18s',
        transform: hov && hover ? 'translateY(-2px)' : 'none',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Create `components/app-ui/AppBtn.tsx`**

```tsx
type AppBtnVariant = 'primary' | 'gold' | 'ghost' | 'white';

type AppBtnProps = {
  children: React.ReactNode;
  variant?: AppBtnVariant;
  onClick?: () => void;
  small?: boolean;
  style?: React.CSSProperties;
  icon?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
};

const VARIANTS: Record<AppBtnVariant, React.CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg, var(--app-purple) 0%, #7B3FBE 100%)',
    color: '#fff',
    boxShadow: '0 4px 16px color-mix(in srgb, var(--app-purple) 27%, transparent)',
    border: 'none',
  },
  gold: {
    background: 'transparent',
    color: 'var(--app-gold)',
    border: '1.5px solid var(--app-gold)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--app-muted)',
    border: '1.5px solid var(--app-border)',
  },
  white: {
    background: 'var(--app-card)',
    color: 'var(--app-text)',
    border: '1.5px solid var(--app-border)',
  },
};

export function AppBtn({ children, variant = 'primary', onClick, small, style = {}, icon, type = 'button', disabled }: AppBtnProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        borderRadius: small ? 10 : 14,
        padding: small ? '9px 18px' : '15px 28px',
        fontSize: small ? 13 : 15,
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.18s',
        letterSpacing: '0.01em',
        opacity: disabled ? 0.6 : 1,
        ...VARIANTS[variant],
        ...style,
      }}
    >
      {icon && icon}{children}
    </button>
  );
}
```

- [ ] **Step 3: Create `components/app-ui/AppInput.tsx`**

```tsx
"use client";

import { useState } from "react";

type AppInputProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
  name?: string;
  id?: string;
  required?: boolean;
  autoComplete?: string;
};

export function AppInput({
  value, defaultValue, onChange, placeholder,
  type = 'text', multiline, name, id, required, autoComplete,
}: AppInputProps) {
  const [focus, setFocus] = useState(false);

  const shared: React.CSSProperties = {
    width: '100%',
    padding: '13px 16px',
    background: 'var(--app-bg)',
    border: `1.5px solid ${focus ? 'var(--app-gold)' : 'var(--app-border)'}`,
    borderRadius: 12,
    fontSize: 15,
    color: 'var(--app-text)',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
  };

  const handlers = {
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
  };

  if (multiline) {
    return (
      <textarea
        name={name} id={id} required={required}
        value={value} defaultValue={defaultValue}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        style={{ ...shared, resize: 'vertical', minHeight: 80 }}
        {...handlers}
      />
    );
  }

  return (
    <input
      type={type} name={name} id={id} required={required}
      value={value} defaultValue={defaultValue}
      onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
      style={shared}
      {...handlers}
    />
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/app-ui/AppCard.tsx components/app-ui/AppBtn.tsx components/app-ui/AppInput.tsx
git commit -m "feat(app-ui): add AppCard, AppBtn, AppInput shared atoms"
```

---

## Task 4: AppShell — top-bar nav + sub-bar + mobile dock

**Files:**
- Create: `components/AppShell.tsx`

- [ ] **Step 1: Write the active-path unit test**

Create `components/AppShell.test.ts`:

```ts
import { describe, it, expect } from 'vitest';

function getActiveNav(pathname: string): string | null {
  if (pathname === '/dashboard' || pathname === '/') return 'home';
  if (pathname.startsWith('/events/new')) return 'create';
  if (pathname.startsWith('/events')) return 'events';
  if (pathname.startsWith('/join')) return 'join';
  if (pathname.startsWith('/settings')) return 'settings';
  return null;
}

describe('getActiveNav', () => {
  it('returns home for /dashboard', () => {
    expect(getActiveNav('/dashboard')).toBe('home');
  });
  it('returns events for /events/abc123', () => {
    expect(getActiveNav('/events/abc123')).toBe('events');
  });
  it('returns create for /events/new', () => {
    expect(getActiveNav('/events/new')).toBe('create');
  });
  it('returns join for /join', () => {
    expect(getActiveNav('/join')).toBe('join');
  });
  it('returns null for unknown paths', () => {
    expect(getActiveNav('/onboarding/organizer')).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test**

```bash
cd /home/antonio/repo/calisto-landing && npm test -- --reporter=verbose components/AppShell.test.ts 2>&1 | tail -20
```
Expected: 5 tests pass.

- [ ] **Step 3: Create `components/AppShell.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type AppShellProps = {
  userName: string;
  userInitial: string;
  children: React.ReactNode;
};

function getActiveNav(pathname: string): string | null {
  if (pathname === '/dashboard' || pathname === '/') return 'home';
  if (pathname.startsWith('/events/new')) return 'create';
  if (pathname.startsWith('/events')) return 'events';
  if (pathname.startsWith('/join')) return 'join';
  if (pathname.startsWith('/settings')) return 'settings';
  return null;
}

const NAV_LINKS = [
  { id: 'home',     href: '/dashboard', label: 'Home' },
  { id: 'events',   href: '/events',    label: 'Events' },
  { id: 'settings', href: '/settings',  label: 'Settings' },
];

const DOCK_ITEMS = [
  { id: 'home',   href: '/dashboard',  label: 'Home',   icon: '⌂' },
  { id: 'events', href: '/events',     label: 'Events', icon: '◈' },
  { id: 'create', href: '/events/new', label: 'New',    icon: '+' },
  { id: 'join',   href: '/join',       label: 'Join',   icon: '⬡' },
];

export function AppShell({ userName, userInitial, children }: AppShellProps) {
  const pathname = usePathname();
  const active = getActiveNav(pathname);

  // Detect event sub-screen (not /events/new)
  const eventMatch = pathname.match(/^\/events\/([^\/]+)/);
  const isEventScreen = Boolean(eventMatch && eventMatch[1] !== 'new');

  return (
    <div
      className="app-shell"
      style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      {/* ── Top bar ─────────────────────────────────── */}
      <header style={{
        height: 64, flexShrink: 0,
        background: 'var(--app-card)',
        borderBottom: '1px solid var(--app-border)',
        display: 'flex', alignItems: 'center',
        padding: '0 32px', gap: 0,
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        {/* Wordmark */}
        <Link href="/dashboard" style={{
          display: 'flex', alignItems: 'center', gap: 6,
          marginRight: 40, textDecoration: 'none',
        }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic', fontWeight: 700,
            fontSize: 26, color: 'var(--app-text)',
            letterSpacing: '-0.02em',
          }}>
            Calisto
          </span>
          <div style={{ width: 6, height: 6, background: 'var(--app-gold)', borderRadius: '50%', marginBottom: 8 }} />
        </Link>

        {/* Nav links — hidden on mobile */}
        <nav style={{ display: 'flex', gap: 4, flex: 1 }} className="hidden md:flex">
          {NAV_LINKS.map(link => {
            const on = active === link.id;
            return (
              <Link key={link.id} href={link.href} style={{
                padding: '8px 16px',
                borderRadius: 10,
                background: on ? `color-mix(in srgb, var(--app-purple) 12%, transparent)` : 'transparent',
                color: on ? 'var(--app-purple)' : 'var(--app-muted)',
                fontSize: 14, fontWeight: on ? 600 : 400,
                textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: 7,
                transition: 'all 0.15s',
              }}>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginLeft: 'auto' }}>
          <Link href="/join" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: 'transparent', color: 'var(--app-gold)',
            border: '1.5px solid var(--app-gold)', textDecoration: 'none',
            transition: 'all 0.18s',
          }}>
            Join
          </Link>
          <Link href="/events/new" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: 'linear-gradient(135deg, var(--app-purple) 0%, #7B3FBE 100%)',
            color: '#fff', textDecoration: 'none', border: 'none',
            transition: 'all 0.18s',
          }}>
            + New Event
          </Link>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--app-purple), #7B3FBE)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0,
            title: userName,
          }}>
            {userInitial}
          </div>
        </div>
      </header>

      {/* ── Event sub-bar ─────────────────────────────── */}
      {isEventScreen && (
        <div style={{
          height: 44, flexShrink: 0,
          background: 'var(--app-bg)',
          borderBottom: '1px solid var(--app-border)',
          display: 'flex', alignItems: 'center',
          padding: '0 32px', gap: 0,
        }}>
          <Link href="/dashboard" style={{
            fontSize: 13, color: 'var(--app-muted)', textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            ← Home
          </Link>
          <span style={{ color: 'var(--app-border)', margin: '0 10px' }}>/</span>
          <span style={{
            fontFamily: 'var(--font-display)', fontStyle: 'italic',
            fontSize: 14, color: 'var(--app-text)',
          }}>
            Event
          </span>
        </div>
      )}

      {/* ── Scrollable content ─────────────────────────── */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', padding: '0 32px 80px' }}>
          {children}
        </div>
      </main>

      {/* ── Mobile dock — hidden above md ─────────────── */}
      <div
        className="md:hidden"
        style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 200 }}
      >
        <div style={{
          background: 'rgba(34, 21, 9, 0.9)',
          backdropFilter: 'blur(20px)',
          borderRadius: 40, padding: '10px 14px',
          display: 'flex', gap: 4,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}>
          {DOCK_ITEMS.map(item => {
            const on = active === item.id;
            return (
              <Link key={item.id} href={item.href} style={{
                width: 46, height: 46,
                background: on ? 'linear-gradient(135deg, var(--app-gold), #D4A843)' : 'transparent',
                borderRadius: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                textDecoration: 'none',
                color: on ? '#fff' : 'rgba(255,255,255,0.45)',
                fontSize: 18, fontWeight: 700,
                transition: 'all 0.2s',
              }}>
                {item.icon}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/AppShell.tsx components/AppShell.test.ts
git commit -m "feat(app-ui): add AppShell top-bar nav with sub-bar and mobile dock"
```

---

## Task 5: Wire up `(app)/layout.tsx` + remove per-page bg wrappers

**Files:**
- Modify: `app/(app)/layout.tsx`
- Modify: `app/(app)/dashboard/page.tsx`
- Modify: `app/(app)/events/[id]/page.tsx`
- Modify: `app/(app)/events/new/page.tsx`

- [ ] **Step 1: Update `app/(app)/layout.tsx`**

Replace entire file content with:

```tsx
import { redirect } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { OnboardingRedirect } from "@/components/OnboardingRedirect";
import { needsOrganizerOnboarding } from "@/lib/onboarding-profile";
import {
  createSupabaseAuthServerClient,
  isAuthRequiredError,
  requireOrganizerSession,
} from "@/lib/supabase-auth-server";

export default async function ProtectedAppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let needsOnboarding = false;
  let userInitial = 'A';
  let userName = '';

  try {
    await requireOrganizerSession();
    const supabase = await createSupabaseAuthServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const fullName: string = user?.user_metadata?.full_name ?? '';
    const email: string = user?.email ?? '';
    userName = fullName || email;
    userInitial = (fullName?.[0] ?? email?.[0] ?? 'A').toUpperCase();

    needsOnboarding = await needsOrganizerOnboarding(supabase, user!.id);
  } catch (error) {
    if (isAuthRequiredError(error)) {
      redirect("/auth/login");
    }
    throw error;
  }

  return (
    <AppShell userName={userName} userInitial={userInitial}>
      <OnboardingRedirect needsOnboarding={needsOnboarding}>
        {children}
      </OnboardingRedirect>
    </AppShell>
  );
}
```

- [ ] **Step 2: Simplify `app/(app)/dashboard/page.tsx`**

Replace the return statement — remove the outer `<main>` with hardcoded bg, keep just the data-fetching server component content:

```tsx
import { createSupabaseAuthServerClient } from "@/lib/supabase-auth-server";
import { DashboardClient } from "./DashboardClient";

type EventRow = {
  id: string;
  title: string;
  event_date: string;
  plan: string;
  access_code: string;
};

export default async function DashboardPage() {
  const supabase = await createSupabaseAuthServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: events } = await supabase
    .from("events")
    .select("id, title, event_date, plan, access_code")
    .eq("organizer_id", user!.id)
    .order("event_date", { ascending: false });

  return (
    <DashboardClient
      organizerId={user!.id}
      userName={user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'there'}
      events={(events ?? []) as EventRow[]}
    />
  );
}
```

- [ ] **Step 3: Simplify `app/(app)/events/new/page.tsx`**

Replace the return wrapper — keep all logic, just remove the outer `<main className="mx-auto max-w-2xl px-6 py-12">` and replace with a padded content div:

```tsx
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 0 60px' }}>
      {/* existing step rendering unchanged */}
      {step === "1" && <Step1Details defaultName={name} defaultDate={date} />}
      {step === "2" && (
        <Step2Plan
          name={name}
          date={date}
          selectedPlanId={planId}
          planOptions={PLAN_OPTIONS}
          validationError={validation.ok ? null : validation.error}
        />
      )}
      {step === "3" && (
        <Step3Payment
          name={name}
          date={date}
          planId={planId}
          validationError={validation.ok ? null : validation.error}
        />
      )}
    </div>
  );
```

(Keep all existing imports, constants, and helper functions. Only the return statement changes.)

- [ ] **Step 4: Simplify `app/(app)/events/[id]/page.tsx`**

Remove `min-h-screen bg-[#1a0a2e] px-4 py-10` wrappers. Replace the return with:

```tsx
  if (!event || !isOrganizer) {
    return (
      <div style={{ padding: '40px 0' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 28, color: 'var(--app-text)' }}>
          Event not found
        </h1>
        <p style={{ marginTop: 8, fontSize: 14, color: 'var(--app-muted)' }}>
          You don&apos;t have access to this event.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 0 60px' }}>
      <EventAdminTabs eventId={id} selectedTab={selectedTab} eventTitle={event.title} eventEmoji="📅" />
      <div style={{ marginTop: 24 }}>
        {selectedTab === "overview" && (
          <OverviewTab
            eventId={id}
            eventTitle={event.title}
            eventDate={event.event_date}
            plan={event.plan}
            accessCode={event.access_code}
          />
        )}
        {selectedTab === "guests" && <GuestsTab eventId={id} />}
        {selectedTab === "gallery" && <GalleryTab eventId={id} />}
        {selectedTab === "share" && (
          <ShareTab
            eventId={id}
            eventTitle={event.title}
            accessCode={event.access_code}
            publicOrigin={publicOrigin}
          />
        )}
      </div>
    </div>
  );
```

- [ ] **Step 5: Build to verify types**

```bash
cd /home/antonio/repo/calisto-landing && npm run build 2>&1 | tail -30
```
Expected: build succeeds. If `DashboardClient` complains about the new `userName` prop, that's expected — we fix it in Task 7.

- [ ] **Step 6: Commit**

```bash
git add "app/(app)/layout.tsx" "app/(app)/dashboard/page.tsx" "app/(app)/events/new/page.tsx" "app/(app)/events/[id]/page.tsx"
git commit -m "feat(app-ui): wire AppShell into (app) layout, remove hardcoded bg wrappers"
```

---

## Task 6: Welcome + auth pages

**Files:**
- Modify: `app/welcome/page.tsx`
- Modify: `app/auth/login/page.tsx`
- Modify: `app/auth/register/page.tsx`
- Modify: `app/auth/forgot-password/page.tsx`

Note: auth pages are outside the `(app)` layout, so they don't get AppShell. They use the same `--app-*` tokens via a local `app-shell` class on their root element.

The mascot image URL is `https://www.calisto-events.com/_next/image?url=%2Fbrand%2Fmascot.png&w=640&q=75`. For Next.js `<img>` use `// eslint-disable-next-line @next/next/no-img-element` or use a local asset. The local asset path is `/brand/mascot.png` (served via the public dir) — use that to avoid the external URL warning.

Checking the local mascot path used in the project: assets are in `assets/mascot/`. Check which path is correct by checking the existing components (e.g. `app/(app)/onboarding`). Use `/brand/mascot.png` if it exists in `public/`, otherwise skip the mascot image for now.

- [ ] **Step 1: Redesign `app/welcome/page.tsx`**

```tsx
import Link from "next/link";

export default function WelcomePage() {
  return (
    <main className="app-shell" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <div style={{ width: 32, height: 3, background: 'var(--app-gold)', borderRadius: 2, margin: '0 auto 16px' }} />
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--app-muted)', marginBottom: 8 }}>
          Welcome to
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 56, color: 'var(--app-text)', lineHeight: 1, marginBottom: 12 }}>
          Calisto.
        </h1>
        <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16, color: 'var(--app-muted)', marginBottom: 40, lineHeight: 1.6 }}>
          Collect photos and videos from everyone at your event.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Link href="/auth/register" style={{
            display: 'block', padding: '15px 28px', borderRadius: 14, fontSize: 15, fontWeight: 600,
            background: 'linear-gradient(135deg, var(--app-purple) 0%, #7B3FBE 100%)',
            color: '#fff', textDecoration: 'none', textAlign: 'center',
            boxShadow: '0 4px 16px color-mix(in srgb, var(--app-purple) 27%, transparent)',
          }}>
            Create organizer account
          </Link>
          <Link href="/auth/login" style={{
            display: 'block', padding: '15px 28px', borderRadius: 14, fontSize: 15, fontWeight: 600,
            background: 'transparent', color: 'var(--app-muted)',
            border: '1.5px solid var(--app-border)', textDecoration: 'none', textAlign: 'center',
          }}>
            I already have an account
          </Link>
          <Link href="/join" style={{
            display: 'block', padding: '12px', fontSize: 14,
            color: 'var(--app-muted)', textDecoration: 'none', textAlign: 'center',
          }}>
            I have an event code →
          </Link>
        </div>

        <p style={{ marginTop: 40, fontSize: 12, color: 'var(--app-muted)' }}>
          <Link href="/" style={{ color: 'var(--app-gold)', textDecoration: 'underline' }}>
            ← Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Redesign `app/auth/login/page.tsx`**

Keep all Supabase logic identical. Only replace the JSX returned by `LoginForm`. Replace the entire file:

```tsx
"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { getSafeReturnPath } from "@/lib/safe-return-path";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = getSafeReturnPath(searchParams.get("returnTo"));
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    const supabase = getSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setPending(false);
      return;
    }

    router.push(returnTo ?? "/dashboard");
    router.refresh();
  }

  return (
    <main className="app-shell" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Wordmark */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 32, height: 3, background: 'var(--app-gold)', borderRadius: 2, margin: '0 auto 12px' }} />
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--app-muted)' }}>
            Welcome to
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 56, color: 'var(--app-text)', lineHeight: 1 }}>
            Calisto.
          </h1>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--app-card)', borderRadius: 18,
          border: '1.5px solid var(--app-border)',
          padding: 32,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          {/* Tab switcher */}
          <div style={{ display: 'flex', background: 'var(--app-bg)', borderRadius: 12, padding: 4, marginBottom: 28 }}>
            {(['login', 'register'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => t === 'register' ? router.push('/auth/register') : setTab('login')}
                style={{
                  flex: 1, padding: '10px 0', border: 'none', borderRadius: 10,
                  background: tab === t ? 'var(--app-card-solid)' : 'transparent',
                  color: tab === t ? 'var(--app-text)' : 'var(--app-muted)',
                  fontWeight: tab === t ? 600 : 400, fontSize: 14,
                  boxShadow: tab === t ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--app-muted)', marginBottom: 8 }}>
                Email
              </div>
              <input
                name="email" type="email" placeholder="you@example.com"
                autoComplete="email" required
                style={{
                  width: '100%', padding: '13px 16px',
                  background: 'var(--app-bg)',
                  border: '1.5px solid var(--app-border)',
                  borderRadius: 12, fontSize: 15, color: 'var(--app-text)',
                  outline: 'none', fontFamily: 'inherit',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--app-gold)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--app-border)')}
              />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--app-muted)', marginBottom: 8 }}>
                Password
              </div>
              <input
                name="password" type="password" placeholder="••••••••"
                autoComplete="current-password" required
                style={{
                  width: '100%', padding: '13px 16px',
                  background: 'var(--app-bg)',
                  border: '1.5px solid var(--app-border)',
                  borderRadius: 12, fontSize: 15, color: 'var(--app-text)',
                  outline: 'none', fontFamily: 'inherit',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--app-gold)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--app-border)')}
              />
            </div>

            {error && (
              <p style={{ fontSize: 13, color: '#e05252', background: 'rgba(224,82,82,0.08)', padding: '10px 14px', borderRadius: 10 }}>
                {error}
              </p>
            )}

            <button
              type="submit" disabled={pending}
              style={{
                width: '100%', padding: '15px 28px', border: 'none', borderRadius: 14,
                background: 'linear-gradient(135deg, var(--app-purple) 0%, #7B3FBE 100%)',
                color: '#fff', fontSize: 15, fontWeight: 600, cursor: pending ? 'not-allowed' : 'pointer',
                opacity: pending ? 0.7 : 1, transition: 'all 0.18s',
                boxShadow: '0 4px 16px color-mix(in srgb, var(--app-purple) 27%, transparent)',
              }}
            >
              {pending ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Link href="/auth/forgot-password" style={{ fontSize: 13, color: 'var(--app-muted)', textDecoration: 'underline' }}>
              Forgot password?
            </Link>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--app-muted)' }}>
          By continuing you agree to Calisto&apos;s{' '}
          <span style={{ textDecoration: 'underline' }}>Terms &amp; Privacy Policy</span>.
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p style={{ color: 'var(--app-muted)', fontSize: 14 }}>Loading…</p>
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}
```

- [ ] **Step 3: Redesign `app/auth/register/page.tsx`**

Keep all Supabase signUp logic identical. Replace the JSX. Full file:

```tsx
"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { getSafeReturnPath } from "@/lib/safe-return-path";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = getSafeReturnPath(searchParams.get("returnTo"));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    const supabase = getSupabaseBrowserClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setPending(false);
      return;
    }

    if (data.session) {
      router.push(returnTo ?? "/dashboard");
      router.refresh();
      return;
    }

    setSuccessMessage("Check your email to confirm your account");
    setPending(false);
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 16px',
    background: 'var(--app-bg)',
    border: '1.5px solid var(--app-border)',
    borderRadius: 12, fontSize: 15, color: 'var(--app-text)',
    outline: 'none', fontFamily: 'inherit',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
    textTransform: 'uppercase', color: 'var(--app-muted)', marginBottom: 8,
  };

  return (
    <main className="app-shell" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 32, height: 3, background: 'var(--app-gold)', borderRadius: 2, margin: '0 auto 12px' }} />
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--app-muted)' }}>
            Welcome to
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 56, color: 'var(--app-text)', lineHeight: 1 }}>
            Calisto.
          </h1>
        </div>

        <div style={{
          background: 'var(--app-card)', borderRadius: 18,
          border: '1.5px solid var(--app-border)', padding: 32,
        }}>
          {/* Tab switcher */}
          <div style={{ display: 'flex', background: 'var(--app-bg)', borderRadius: 12, padding: 4, marginBottom: 28 }}>
            {(['login', 'register'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => t === 'login' ? router.push('/auth/login') : undefined}
                style={{
                  flex: 1, padding: '10px 0', border: 'none', borderRadius: 10,
                  background: t === 'register' ? 'var(--app-card-solid)' : 'transparent',
                  color: t === 'register' ? 'var(--app-text)' : 'var(--app-muted)',
                  fontWeight: t === 'register' ? 600 : 400, fontSize: 14,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div><div style={labelStyle}>Full name</div><input name="name" type="text" placeholder="Antonio Kovač" autoComplete="name" style={inputStyle} onFocus={e => (e.currentTarget.style.borderColor='var(--app-gold)')} onBlur={e => (e.currentTarget.style.borderColor='var(--app-border)')} /></div>
            <div><div style={labelStyle}>Email</div><input name="email" type="email" placeholder="you@example.com" autoComplete="email" required style={inputStyle} onFocus={e => (e.currentTarget.style.borderColor='var(--app-gold)')} onBlur={e => (e.currentTarget.style.borderColor='var(--app-border)')} /></div>
            <div><div style={labelStyle}>Password</div><input name="password" type="password" placeholder="••••••••" autoComplete="new-password" required style={inputStyle} onFocus={e => (e.currentTarget.style.borderColor='var(--app-gold)')} onBlur={e => (e.currentTarget.style.borderColor='var(--app-border)')} /></div>

            {error && <p style={{ fontSize: 13, color: '#e05252', background: 'rgba(224,82,82,0.08)', padding: '10px 14px', borderRadius: 10 }}>{error}</p>}
            {successMessage && <p style={{ fontSize: 13, color: '#22a06b', background: 'rgba(34,160,107,0.08)', padding: '10px 14px', borderRadius: 10 }}>{successMessage}</p>}

            <button
              type="submit" disabled={pending}
              style={{
                width: '100%', padding: '15px', border: 'none', borderRadius: 14,
                background: 'linear-gradient(135deg, var(--app-purple) 0%, #7B3FBE 100%)',
                color: '#fff', fontSize: 15, fontWeight: 600,
                cursor: pending ? 'not-allowed' : 'pointer', opacity: pending ? 0.7 : 1,
              }}
            >
              {pending ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Link href="/auth/login" style={{ fontSize: 13, color: 'var(--app-muted)', textDecoration: 'underline' }}>
              Already have an account? Sign in
            </Link>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--app-muted)' }}>
          By continuing you agree to Calisto&apos;s Terms &amp; Privacy Policy.
        </p>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <main className="app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p style={{ color: 'var(--app-muted)', fontSize: 14 }}>Loading…</p>
      </main>
    }>
      <RegisterForm />
    </Suspense>
  );
}
```

- [ ] **Step 4: Redesign `app/auth/forgot-password/page.tsx`**

Read the current file first, then replace the JSX to match the app-shell design (centered card, gold bar, email input with gold focus, submit button in primary purple). Keep all existing form logic intact.

- [ ] **Step 5: Build**

```bash
cd /home/antonio/repo/calisto-landing && npm run build 2>&1 | tail -30
```
Expected: no type errors.

- [ ] **Step 6: Commit**

```bash
git add app/welcome/page.tsx app/auth/
git commit -m "feat(app-ui): redesign welcome and auth pages (login, register, forgot-password)"
```

---

## Task 7: Dashboard redesign

**Files:**
- Modify: `app/(app)/dashboard/DashboardClient.tsx`

The server component (`dashboard/page.tsx`) was updated in Task 5 to pass a new `userName` prop to `DashboardClient`. This task implements the visual redesign.

- [ ] **Step 1: Replace `DashboardClient.tsx` entirely**

```tsx
"use client";

import Link from "next/link";
import { startTransition, useEffect, useMemo, useState } from "react";

import { loadSavedOrder, mergeWithSavedOrder, saveOrder } from "@/lib/my-events-order";
import { loadHiddenEventIds, saveHiddenEventIds } from "@/lib/my-events-visibility";
import { GoldBar } from "@/components/app-ui/GoldBar";

type EventRow = {
  id: string;
  title: string;
  event_date: string;
  plan: string;
  access_code: string;
};

type Props = Readonly<{
  organizerId: string;
  userName: string;
  events: EventRow[];
}>;

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

function EventCard({ event, onOpen }: { event: EventRow; onOpen: (e: EventRow) => void }) {
  const [hov, setHov] = useState(false);
  const emoji = event.plan === 'premium' || event.plan === 'max' ? '💍' : '📅';

  return (
    <div
      onClick={() => onOpen(event)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'var(--app-card)', borderRadius: 18,
        border: '1.5px solid var(--app-border)',
        padding: '18px 20px',
        display: 'flex', alignItems: 'center', gap: 16,
        cursor: 'pointer',
        boxShadow: hov ? '0 8px 32px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.04)',
        transform: hov ? 'translateY(-2px)' : 'none',
        transition: 'all 0.18s',
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 12, flexShrink: 0,
        background: 'linear-gradient(135deg, color-mix(in srgb, var(--app-purple) 13%, transparent), color-mix(in srgb, var(--app-gold) 13%, transparent))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24,
      }}>
        {emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700,
          fontSize: 18, color: 'var(--app-text)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {event.title}
        </div>
        <div style={{ fontSize: 12, color: 'var(--app-muted)', marginTop: 3 }}>
          {formatDate(event.event_date)} · Organizer
        </div>
      </div>
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          fontSize: 11, fontWeight: 700, color: 'var(--app-gold)',
          background: 'color-mix(in srgb, var(--app-gold) 12%, transparent)',
          padding: '3px 10px', borderRadius: 20,
          border: '1px solid color-mix(in srgb, var(--app-gold) 27%, transparent)',
          textTransform: 'uppercase',
        }}>
          {event.plan}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 18L15 12L9 6" stroke="var(--app-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}

export function DashboardClient({ organizerId, userName, events }: Props) {
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [orderIds, setOrderIds] = useState<string[]>([]);

  useEffect(() => {
    startTransition(() => setHiddenIds(new Set(loadHiddenEventIds(organizerId))));
    startTransition(() => setOrderIds(loadSavedOrder(organizerId)));
  }, [organizerId]);

  const orderedEvents = useMemo(() => mergeWithSavedOrder(events, orderIds), [events, orderIds]);
  const visibleEvents = useMemo(() => orderedEvents.filter(e => !hiddenIds.has(e.id)), [orderedEvents, hiddenIds]);

  function handleOpen(event: EventRow) {
    window.location.href = `/events/${event.id}`;
  }

  return (
    <div style={{ padding: '40px 0 60px' }}>
      {/* Hero */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 20 }}>
        <div>
          <GoldBar />
          <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 44, color: 'var(--app-text)', lineHeight: 1.1, marginTop: 10 }}>
            Hello, {userName} 👋
          </h1>
          <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16, color: 'var(--app-muted)', marginTop: 6 }}>
            Your shared albums, all in one place.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/join" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: 'transparent', color: 'var(--app-gold)',
            border: '1.5px solid var(--app-gold)', textDecoration: 'none',
          }}>
            Join with code
          </Link>
          <Link href="/events/new" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: 'linear-gradient(135deg, var(--app-purple) 0%, #7B3FBE 100%)',
            color: '#fff', textDecoration: 'none',
          }}>
            + Create event
          </Link>
        </div>
      </div>

      {/* Events list */}
      {visibleEvents.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div style={{ width: 3, height: 18, background: 'var(--app-gold)', borderRadius: 2 }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--app-muted)' }}>
              My Events
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {visibleEvents.map(e => <EventCard key={e.id} event={e} onOpen={handleOpen} />)}
          </div>
        </div>
      )}

      {/* Empty / hint card */}
      <div style={{
        background: 'var(--app-card)', borderRadius: 18,
        border: '1.5px solid var(--app-border)',
        padding: '36px 32px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 12, textAlign: 'center',
      }}>
        <span style={{ fontSize: 40 }}>🔑</span>
        <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 15, color: 'var(--app-muted)', maxWidth: 340, lineHeight: 1.6 }}>
          {visibleEvents.length === 0
            ? 'Create a new event or join an existing one with a code from your organizer.'
            : 'Create another event or join one with a code from your organizer.'}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build**

```bash
cd /home/antonio/repo/calisto-landing && npm run build 2>&1 | tail -30
```
Expected: no type errors.

- [ ] **Step 3: Commit**

```bash
git add "app/(app)/dashboard/"
git commit -m "feat(app-ui): redesign dashboard with event cards and gold accent header"
```

---

## Task 8: Event page tab nav redesign

**Files:**
- Modify: `app/(app)/events/[id]/_tabs/EventAdminTabs.tsx`

The event page structure was simplified in Task 5. Now restyle the tab navigation pills.

- [ ] **Step 1: Replace `EventAdminTabs.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

export const EVENT_ADMIN_TABS = [
  { id: "overview", label: "Overview" },
  { id: "guests",   label: "Guests"   },
  { id: "gallery",  label: "Gallery"  },
  { id: "share",    label: "Share"    },
] as const;

export type EventAdminTabId = (typeof EVENT_ADMIN_TABS)[number]["id"];
const EVENT_ADMIN_TAB_IDS = new Set<string>(EVENT_ADMIN_TABS.map(t => t.id));

export function isEventAdminTabId(value: string | undefined): value is EventAdminTabId {
  return Boolean(value) && EVENT_ADMIN_TAB_IDS.has(value!);
}

type EventAdminTabsProps = Readonly<{
  eventId: string;
  selectedTab: EventAdminTabId;
  eventTitle: string;
  eventEmoji?: string;
}>;

function TabsInner({ eventId, selectedTab, eventTitle, eventEmoji = '📅' }: EventAdminTabsProps) {
  return (
    <div style={{ marginBottom: 24 }}>
      {/* Event heading */}
      <div style={{ width: 32, height: 3, background: 'var(--app-gold)', borderRadius: 2, marginBottom: 10 }} />
      <h1 style={{
        fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700,
        fontSize: 42, color: 'var(--app-text)', lineHeight: 1.1, marginBottom: 4,
      }}>
        {eventEmoji} {eventTitle}
      </h1>
      <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 15, color: 'var(--app-muted)', marginBottom: 20 }}>
        Share with guests to let them join.
      </p>

      {/* Tab pills */}
      <div style={{
        display: 'flex', background: 'var(--app-card)',
        border: '1.5px solid var(--app-border)',
        borderRadius: 12, overflow: 'hidden', width: 'fit-content',
      }}>
        {EVENT_ADMIN_TABS.map(tab => {
          const on = tab.id === selectedTab;
          return (
            <Link
              key={tab.id}
              href={`/events/${eventId}?tab=${tab.id}`}
              aria-current={on ? 'page' : undefined}
              style={{
                padding: '9px 20px', fontSize: 14, fontWeight: on ? 600 : 400,
                color: on ? '#fff' : 'var(--app-muted)',
                background: on ? 'linear-gradient(135deg, var(--app-purple) 0%, #7B3FBE 100%)' : 'transparent',
                textDecoration: 'none', transition: 'all 0.15s',
                display: 'block',
              }}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function EventAdminTabs(props: EventAdminTabsProps) {
  return (
    <Suspense fallback={<div style={{ height: 80 }} />}>
      <TabsInner {...props} />
    </Suspense>
  );
}
```

Note: `EventAdminTabs` is now a client component (uses `Suspense`). The parent `events/[id]/page.tsx` is a server component — this is fine since client components can be rendered from server components.

- [ ] **Step 2: Build**

```bash
cd /home/antonio/repo/calisto-landing && npm run build 2>&1 | tail -30
```
Expected: no type errors. (The `eventTitle` and `eventEmoji` props were added in Task 5's event page update.)

- [ ] **Step 3: Commit**

```bash
git add "app/(app)/events/[id]/_tabs/EventAdminTabs.tsx"
git commit -m "feat(app-ui): redesign event admin tabs with purple pill nav and Playfair heading"
```

---

## Task 9: OverviewTab redesign

**Files:**
- Modify: `app/(app)/events/[id]/_tabs/OverviewTab.tsx`

- [ ] **Step 1: Replace `OverviewTab.tsx` entirely**

```tsx
"use client";

import { useState } from "react";
import { GoldBar } from "@/components/app-ui/GoldBar";
import { StatRing } from "@/components/app-ui/StatRing";

type OverviewTabProps = Readonly<{
  eventId: string;
  eventTitle: string;
  eventDate: string;
  plan: string;
  accessCode: string;
}>;

function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
      <GoldBar vertical />
      <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 17, color: 'var(--app-text)' }}>
        {label}
      </span>
    </div>
  );
}

function InfoCard({ eventDate, plan }: { eventDate: string; plan: string }) {
  const formatted = (() => {
    try { return new Date(eventDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }); }
    catch { return eventDate; }
  })();

  return (
    <div style={{ background: 'var(--app-card)', borderRadius: 18, border: '1.5px solid var(--app-border)', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <span style={{
          fontSize: 11, fontWeight: 700, color: 'var(--app-gold)',
          background: 'color-mix(in srgb, var(--app-gold) 12%, transparent)',
          padding: '4px 12px', borderRadius: 20, textTransform: 'uppercase',
          border: '1.5px solid color-mix(in srgb, var(--app-gold) 27%, transparent)',
          letterSpacing: '0.1em',
        }}>
          {plan}
        </span>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, color: 'var(--app-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Role</div>
          <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 16, color: 'var(--app-purple)' }}>
            Organizer
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--app-text)' }}>
          <span>📅</span><span>{formatted}</span>
        </div>
        <div style={{ height: 1, background: 'var(--app-border)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#D97706', fontWeight: 600 }}>
          <span>⏳</span><span>Uploads close in 30 days</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--app-muted)' }}>
          <span>🗑️</span><span>Event deletes in 180 days</span>
        </div>
      </div>
    </div>
  );
}

function StatsCard() {
  const cameraIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M23 19C23 20.105 22.105 21 21 21H3C1.895 21 1 20.105 1 19V8C1 6.895 1.895 6 3 6H7L9 3H15L17 6H21C22.105 6 23 6.895 23 8V19Z" stroke="var(--app-muted)" strokeWidth="2" strokeLinejoin="round"/>
      <circle cx="12" cy="13" r="4" stroke="var(--app-muted)" strokeWidth="2"/>
    </svg>
  );
  const galleryIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="var(--app-muted)" strokeWidth="2"/>
      <rect x="13" y="3" width="8" height="8" rx="1.5" stroke="var(--app-muted)" strokeWidth="2"/>
      <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="var(--app-muted)" strokeWidth="2"/>
      <rect x="13" y="13" width="8" height="8" rx="1.5" stroke="var(--app-muted)" strokeWidth="2"/>
    </svg>
  );
  const guestsIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="7" r="3" stroke="var(--app-muted)" strokeWidth="2"/>
      <path d="M2 20C2 16.686 5.134 14 9 14C12.866 14 16 16.686 16 20" stroke="var(--app-muted)" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 11C18.209 11 20 9.209 20 7" stroke="var(--app-muted)" strokeWidth="2" strokeLinecap="round"/>
      <path d="M19 15C20.657 15.5 22 17.119 22 20" stroke="var(--app-muted)" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );

  return (
    <div style={{ background: 'var(--app-card)', borderRadius: 18, border: '1.5px solid var(--app-border)', padding: 24 }}>
      <SectionHeader label="Statistics" />
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <StatRing value={0} max={2000} color="var(--app-purple)" label="Photos"  sublabel="of 2000" icon={galleryIcon} />
        <StatRing value={0} max={200}  color="var(--app-muted)"  label="Videos"  sublabel="of 200"  icon={cameraIcon} />
        <StatRing value={0} max={250}  color="var(--app-gold)"   label="Guests"  sublabel="of 250"  icon={guestsIcon} />
      </div>
    </div>
  );
}

function AccessCodeCard({ accessCode }: { accessCode: string }) {
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(accessCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ background: 'var(--app-card)', borderRadius: 18, border: '1.5px solid var(--app-border)', padding: 24 }}>
      <SectionHeader label="Access Code" />
      <div style={{
        background: 'var(--app-bg)', border: '1.5px solid var(--app-border)',
        borderRadius: 12, padding: '14px 20px', textAlign: 'center',
        fontSize: 22, fontWeight: 700, color: 'var(--app-text)',
        letterSpacing: '0.12em', marginBottom: 14,
        fontFamily: 'monospace',
      }}>
        {accessCode}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          type="button"
          onClick={copy}
          style={{
            flex: 1, padding: '12px', border: '1.5px solid var(--app-border)', borderRadius: 10,
            background: 'transparent', color: 'var(--app-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
        >
          {copied ? 'Copied!' : 'Copy code'}
        </button>
        <button
          type="button"
          onClick={() => setShowQR(v => !v)}
          style={{
            flex: 1, padding: '12px', border: 'none', borderRadius: 10,
            background: 'linear-gradient(135deg, var(--app-purple) 0%, #7B3FBE 100%)',
            color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
        >
          {showQR ? 'Hide QR' : 'Show QR Invite'}
        </button>
      </div>
      {showQR && (
        <div style={{
          background: '#fff', borderRadius: 12, padding: 20, marginTop: 14,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
          border: '1.5px solid var(--app-border)',
        }}>
          {/* Placeholder QR pattern */}
          <svg width="120" height="120" viewBox="0 0 120 120">
            <rect width="120" height="120" fill="white"/>
            {([[ 4, 4], [ 4,84], [84, 4]] as [number,number][]).map(([x,y],i) => (
              <g key={i}>
                <rect x={x} y={y} width="28" height="28" rx="4" fill="#5B2D8E"/>
                <rect x={x+4} y={y+4} width="20" height="20" rx="2" fill="white"/>
                <rect x={x+8} y={y+8} width="12" height="12" rx="1" fill="#5B2D8E"/>
              </g>
            ))}
          </svg>
          <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 12, color: 'var(--app-muted)' }}>
            Scan to join the event
          </p>
          <p style={{ fontSize: 11, color: 'var(--app-muted)' }}>
            For the real QR code, use the Share tab.
          </p>
        </div>
      )}
    </div>
  );
}

function FeaturedPhotosCard() {
  return (
    <div style={{ background: 'var(--app-card)', borderRadius: 18, border: '1.5px solid var(--app-border)', padding: 24 }}>
      <SectionHeader label="Featured Photos" />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: 10 }}>
        <span style={{ fontSize: 48, opacity: 0.5 }}>📸</span>
        <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 13, color: 'var(--app-muted)', textAlign: 'center', lineHeight: 1.6, maxWidth: 240 }}>
          No featured photos yet. Go to the gallery to browse uploads.
        </p>
        <a
          href="?tab=gallery"
          style={{
            marginTop: 4, padding: '9px 18px', border: '1.5px solid var(--app-border)',
            borderRadius: 10, background: 'transparent', color: 'var(--app-muted)',
            fontSize: 13, fontWeight: 600, textDecoration: 'none',
          }}
        >
          Go to Gallery
        </a>
      </div>
    </div>
  );
}

export function OverviewTab({ eventDate, plan, accessCode }: OverviewTabProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <InfoCard eventDate={eventDate} plan={plan} />
        <StatsCard />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <AccessCodeCard accessCode={accessCode} />
        <FeaturedPhotosCard />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build**

```bash
cd /home/antonio/repo/calisto-landing && npm run build 2>&1 | tail -30
```
Expected: no type errors.

- [ ] **Step 3: Commit**

```bash
git add "app/(app)/events/[id]/_tabs/OverviewTab.tsx"
git commit -m "feat(app-ui): redesign event overview tab with info/stats/access-code/featured cards"
```

---

## Task 10: GalleryManager redesign

**Files:**
- Modify: `app/(app)/events/[id]/_tabs/GalleryManager.tsx`

Keep all Supabase data-fetching logic identical. Replace only the JSX return.

- [ ] **Step 1: Replace the return statement in `GalleryManager.tsx`**

Add `lightbox` state and replace the section's JSX. The imports and all state/logic above the `return` stay unchanged. Add after the existing state declarations:

```tsx
const [lightbox, setLightbox] = useState<MediaItem | null>(null);
const [mediaFilter, setMediaFilter] = useState<'all' | 'photos' | 'videos'>('all');
```

Replace the entire `return (...)` block with:

```tsx
  const filtered = items.filter(item => {
    if (mediaFilter === 'all') return true;
    if (mediaFilter === 'videos') return isVideoMime(item.mime_type);
    return !isVideoMime(item.mime_type);
  });

  return (
    <section>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ width: 32, height: 3, background: 'var(--app-gold)', borderRadius: 2, marginBottom: 10 }} />
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 42, color: 'var(--app-text)' }}>
              Gallery
            </h2>
            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 15, color: 'var(--app-muted)', marginTop: 4 }}>
              Browse uploaded photos &amp; videos
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ display: 'flex', background: 'var(--app-card)', border: '1.5px solid var(--app-border)', borderRadius: 12, overflow: 'hidden' }}>
              {(['all', 'photos', 'videos'] as const).map(f => (
                <button key={f} type="button" onClick={() => setMediaFilter(f)} style={{
                  padding: '9px 18px', border: 'none',
                  background: mediaFilter === f ? 'linear-gradient(135deg, var(--app-purple) 0%, #7B3FBE 100%)' : 'transparent',
                  color: mediaFilter === f ? '#fff' : 'var(--app-muted)',
                  fontWeight: mediaFilter === f ? 600 : 400,
                  fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
                  textTransform: 'capitalize',
                }}>
                  {f}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => void fetchPage(0, true)}
              style={{
                padding: '9px 18px', borderRadius: 10, border: '1.5px solid var(--app-border)',
                background: 'transparent', color: 'var(--app-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {error && <p style={{ marginBottom: 16, fontSize: 13, color: '#e05252' }}>{error}</p>}
      {loading && <p style={{ color: 'var(--app-muted)', fontSize: 14 }}>Loading gallery…</p>}
      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <span style={{ fontSize: 48, opacity: 0.4 }}>📷</span>
          <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 15, color: 'var(--app-muted)', marginTop: 12 }}>
            No uploads yet.
          </p>
        </div>
      )}

      {/* Masonry grid */}
      {filtered.length > 0 && (
        <div style={{ columns: 'auto 220px', gap: 12 }}>
          {filtered.map(item => {
            const signedUrl = item.signedUrl;
            const isVideo = isVideoMime(item.mime_type);
            const busy = busyId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => !isVideo && setLightbox(item)}
                style={{
                  breakInside: 'avoid', marginBottom: 12, position: 'relative',
                  borderRadius: 14, overflow: 'hidden', cursor: isVideo ? 'default' : 'pointer',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                }}
              >
                {signedUrl ? (
                  isVideo ? (
                    <video src={signedUrl} style={{ width: '100%', display: 'block' }} controls playsInline muted />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={signedUrl} alt=""
                      style={{ width: '100%', display: 'block', transition: 'transform 0.3s' }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                  )
                ) : (
                  <div style={{ height: 160, background: 'var(--app-border)' }} />
                )}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.55))',
                  padding: '28px 14px 12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{item.uploaded_by}</span>
                  <button
                    type="button"
                    disabled={busyId !== null}
                    onClick={e => { e.stopPropagation(); void deleteItem(item); }}
                    style={{
                      background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: 20,
                      padding: '4px 10px', color: '#fff', fontSize: 11, fontWeight: 600,
                      cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.5 : 1,
                    }}
                  >
                    {busy ? '…' : 'Delete'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasMore && (
        <button
          type="button"
          onClick={loadMore}
          style={{
            marginTop: 16, width: '100%', padding: '12px', borderRadius: 14,
            border: '1.5px solid var(--app-border)',
            background: 'transparent', color: 'var(--app-muted)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Load more
        </button>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: 24,
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: 800, maxHeight: '85vh' }}>
            {lightbox.signedUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={lightbox.signedUrl} alt="" style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 16, display: 'block' }} />
            )}
            <div style={{ position: 'absolute', bottom: 16, left: 16, color: '#fff', fontSize: 14, fontWeight: 600, background: 'rgba(0,0,0,0.5)', padding: '6px 14px', borderRadius: 20 }}>
              📷 {lightbox.uploaded_by}
            </div>
            <button
              type="button"
              onClick={() => setLightbox(null)}
              style={{
                position: 'absolute', top: -14, right: -14,
                width: 36, height: 36, borderRadius: '50%',
                background: '#fff', border: 'none', cursor: 'pointer',
                fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </section>
  );
```

- [ ] **Step 2: Build**

```bash
cd /home/antonio/repo/calisto-landing && npm run build 2>&1 | tail -30
```
Expected: no type errors.

- [ ] **Step 3: Commit**

```bash
git add "app/(app)/events/[id]/_tabs/GalleryManager.tsx"
git commit -m "feat(app-ui): redesign gallery with masonry grid, filter tabs, and lightbox"
```

---

## Task 11: Create Event redesign

**Files:**
- Modify: `app/(app)/events/new/_steps/Step1Details.tsx`
- Modify: `app/(app)/events/new/_steps/Step2Plan.tsx`

Note: `Step3Payment` handles payment and stays functionally unchanged. Give it minimal token styling only if it doesn't build cleanly.

Plan options come from `PLAN_OPTIONS = ["free", "standard", "plus", "premium", "max"]` in `page.tsx`.

- [ ] **Step 1: Replace `Step1Details.tsx`**

```tsx
import { GoldBar } from "@/components/app-ui/GoldBar";

type Step1DetailsProps = {
  defaultName: string;
  defaultDate: string;
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '13px 16px',
  background: 'var(--app-bg)',
  border: '1.5px solid var(--app-border)',
  borderRadius: 12, fontSize: 15, color: 'var(--app-text)',
  outline: 'none', fontFamily: 'inherit',
};

export function Step1Details({ defaultName, defaultDate }: Step1DetailsProps) {
  return (
    <div style={{ padding: '40px 0 60px' }}>
      <GoldBar />
      <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 42, color: 'var(--app-text)', marginTop: 10, marginBottom: 6 }}>
        Create Event
      </h1>
      <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 15, color: 'var(--app-muted)', marginBottom: 32 }}>
        You&apos;ll automatically become the organizer.
      </p>

      <form action="/events/new" method="get">
        <input type="hidden" name="step" value="2" />

        <div style={{ background: 'var(--app-card)', borderRadius: 18, border: '1.5px solid var(--app-border)', padding: 28 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label htmlFor="name" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'var(--app-muted)', display: 'block', marginBottom: 8 }}>
                Event title
              </label>
              <input
                id="name" name="name" type="text"
                defaultValue={defaultName}
                placeholder="e.g. Kyle & Laura"
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--app-gold)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--app-border)')}
              />
            </div>
            <div>
              <label htmlFor="date" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'var(--app-muted)', display: 'block', marginBottom: 8 }}>
                Event date
              </label>
              <input
                id="date" name="date" type="date"
                defaultValue={defaultDate}
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--app-gold)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--app-border)')}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          style={{
            marginTop: 24, width: '100%', padding: '15px', border: 'none', borderRadius: 14,
            background: 'linear-gradient(135deg, var(--app-purple) 0%, #7B3FBE 100%)',
            color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Continue to plan →
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Replace `Step2Plan.tsx`**

Plan card gradient colours per tier:
- free: grey `linear-gradient(135deg,#9CA3AF,#6B7280)`
- standard: blue `linear-gradient(135deg,#60A5FA,#2563EB)`
- plus: teal `linear-gradient(135deg,#34D399,#059669)`
- premium: red `linear-gradient(135deg,#F87171,#DC2626)`
- max: gold `linear-gradient(135deg,#F0C060,#C5922A)`

```tsx
import type { PlanId } from "@/lib/plan-limits";
import { GoldBar } from "@/components/app-ui/GoldBar";

type Step2PlanProps = {
  name: string;
  date: string;
  selectedPlanId: PlanId;
  planOptions: readonly PlanId[];
  validationError: "NAME_REQUIRED" | null;
};

const PLAN_META: Record<string, { sub: string; price: string; grad: string; shadowColor: string }> = {
  free:     { sub: 'Up to 5 guests',       price: 'Free',        grad: 'linear-gradient(135deg,#9CA3AF,#6B7280)', shadowColor: '#9CA3AF' },
  standard: { sub: 'Up to 20 guests',      price: '€9 / event',  grad: 'linear-gradient(135deg,#60A5FA,#2563EB)', shadowColor: '#2563EB' },
  plus:     { sub: 'Up to 40 guests',      price: '€14 / event', grad: 'linear-gradient(135deg,#34D399,#059669)', shadowColor: '#059669' },
  premium:  { sub: 'Up to 70 guests',      price: '€19 / event', grad: 'linear-gradient(135deg,#F87171,#DC2626)', shadowColor: '#DC2626' },
  max:      { sub: 'Unlimited guests',     price: '€35 / event', grad: 'linear-gradient(135deg,#F0C060,#C5922A)', shadowColor: '#C5922A' },
};

export function Step2Plan({ name, date, selectedPlanId, planOptions, validationError }: Step2PlanProps) {
  return (
    <div style={{ padding: '40px 0 60px' }}>
      <GoldBar />
      <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 42, color: 'var(--app-text)', marginTop: 10, marginBottom: 6 }}>
        Choose a Plan
      </h1>
      <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 15, color: 'var(--app-muted)', marginBottom: 32 }}>
        Select the plan that fits your event size.
      </p>

      <form action="/events/new" method="get">
        <input type="hidden" name="name" value={name} />
        <input type="hidden" name="date" value={date} />

        {validationError && (
          <p style={{ marginBottom: 16, fontSize: 13, color: '#e05252', background: 'rgba(224,82,82,0.08)', padding: '10px 14px', borderRadius: 10 }}>
            Event name is required. Please go back and enter a name.
          </p>
        )}

        <div style={{ background: 'var(--app-card)', borderRadius: 18, border: '1.5px solid var(--app-border)', padding: 28, marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
            {planOptions.map(planId => {
              const sel = selectedPlanId === planId;
              const meta = PLAN_META[planId] ?? { sub: '', price: '', grad: 'transparent', shadowColor: 'transparent' };
              return (
                <label key={planId} style={{ cursor: 'pointer' }}>
                  <input type="radio" name="planId" value={planId} defaultChecked={sel} style={{ display: 'none' }} />
                  <div style={{
                    padding: '16px 18px', borderRadius: 14, textAlign: 'left', transition: 'all 0.18s',
                    background: sel ? meta.grad : 'var(--app-bg)',
                    boxShadow: sel ? `0 4px 16px ${meta.shadowColor}44` : 'none',
                    transform: sel ? 'scale(1.02)' : 'scale(1)',
                    outline: sel ? 'none' : `1.5px solid var(--app-border)`,
                    cursor: 'pointer',
                  }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: sel ? '#fff' : 'var(--app-text)', textTransform: 'capitalize' }}>
                      {planId}
                    </div>
                    <div style={{ fontSize: 11, color: sel ? 'rgba(255,255,255,0.8)' : 'var(--app-muted)', marginTop: 3, fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
                      {meta.sub}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: sel ? 'rgba(255,255,255,0.9)' : meta.shadowColor, marginTop: 6 }}>
                      {meta.price}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="submit" formAction="/events/new" formMethod="get" name="step" value="1"
            style={{
              flex: '0 0 auto', padding: '15px 24px', borderRadius: 14,
              border: '1.5px solid var(--app-border)', background: 'transparent',
              color: 'var(--app-muted)', fontSize: 15, fontWeight: 600, cursor: 'pointer',
            }}
          >
            ← Back
          </button>
          <button
            type="submit" name="step" value="3"
            style={{
              flex: 1, padding: '15px', border: 'none', borderRadius: 14,
              background: 'linear-gradient(135deg, var(--app-purple) 0%, #7B3FBE 100%)',
              color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Continue to payment →
          </button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Build**

```bash
cd /home/antonio/repo/calisto-landing && npm run build 2>&1 | tail -30
```
Expected: no type errors.

- [ ] **Step 4: Commit**

```bash
git add "app/(app)/events/new/_steps/"
git commit -m "feat(app-ui): redesign create event steps with card layout and gradient plan cards"
```

---

## Task 12: Join Event redesign

**Files:**
- Modify: `app/join/page.tsx`
- Modify: `app/join/JoinCodeForm.tsx`

- [ ] **Step 1: Read `app/join/page.tsx` and `app/join/JoinCodeForm.tsx`**

```bash
cat /home/antonio/repo/calisto-landing/app/join/page.tsx
cat /home/antonio/repo/calisto-landing/app/join/JoinCodeForm.tsx
```

Understand how the form submits (likely router.push to `/join/[accessCode]`) before modifying.

- [ ] **Step 2: Redesign `app/join/JoinCodeForm.tsx`**

Keep all existing form logic. Replace the JSX return with:

```tsx
  // (existing state and handler logic unchanged)

  return (
    <div style={{ padding: '40px 0 60px', maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ width: 32, height: 3, background: 'var(--app-gold)', borderRadius: 2, marginBottom: 24 }} />
      <span style={{ fontSize: 64, marginBottom: 8 }}>🔑</span>
      <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 40, color: 'var(--app-text)', marginBottom: 6 }}>
        Join Event
      </h1>
      <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 15, color: 'var(--app-muted)', marginBottom: 36, lineHeight: 1.6, maxWidth: 320 }}>
        Enter the access code shared by your event organizer.
      </p>

      <div style={{ background: 'var(--app-card)', borderRadius: 18, border: '1.5px solid var(--app-border)', padding: 36, width: '100%' }}>
        {/* Keep existing form element and input, just restyle */}
        {/* The form submit handler from the existing code goes here */}
      </div>
    </div>
  );
```

For the actual input restyling inside the existing form:

```tsx
<input
  value={code}
  onChange={e => setCode(e.target.value.toUpperCase())}
  placeholder="CALISTO-XXXXXX"
  style={{
    width: '100%', padding: '18px 20px',
    background: 'var(--app-bg)',
    border: `2px solid ${code.length > 5 ? 'var(--app-gold)' : 'var(--app-border)'}`,
    borderRadius: 14, fontSize: 22, fontWeight: 700,
    color: 'var(--app-text)', outline: 'none', textAlign: 'center',
    letterSpacing: '0.12em', transition: 'border-color 0.2s',
    fontFamily: 'inherit',
  }}
/>
<p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 13, color: 'var(--app-muted)', marginTop: 10, lineHeight: 1.5 }}>
  Hint: codes look like <strong style={{ fontStyle: 'normal' }}>CALISTO-S2UAQ4</strong>
</p>
<button
  type="submit"
  style={{
    width: '100%', marginTop: 24, padding: '15px', border: 'none', borderRadius: 14,
    background: 'linear-gradient(135deg, var(--app-purple) 0%, #7B3FBE 100%)',
    color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer',
  }}
>
  Join Event →
</button>
```

- [ ] **Step 3: Redesign `app/join/page.tsx`**

The page.tsx likely just renders `<JoinCodeForm />`. Remove any hardcoded background wrapper and let it render plainly (AppShell or the auth-area cream background will show through). If it has its own `<main>` with `bg-[#1a0a2e]`, replace it with just `<JoinCodeForm />` wrapped in `<div className="app-shell">`.

- [ ] **Step 4: Build**

```bash
cd /home/antonio/repo/calisto-landing && npm run build 2>&1 | tail -30
```
Expected: no type errors.

- [ ] **Step 5: Run all tests**

```bash
cd /home/antonio/repo/calisto-landing && npm test 2>&1 | tail -30
```
Expected: all existing tests pass plus the new StatRing and AppShell tests pass.

- [ ] **Step 6: Commit**

```bash
git add app/join/
git commit -m "feat(app-ui): redesign join event page with large code input and gold focus border"
```

---

## Task 13: ShareTab light styling pass

**Files:**
- Modify: `app/(app)/events/[id]/_tabs/ShareTab.tsx`

The ShareTab has complex functionality (share sheet, clipboard, QR, message templates). Keep all logic intact. This task only updates the visual tokens — no structural changes.

- [ ] **Step 1: Replace Tailwind dark classes with app token equivalents**

In `ShareTab.tsx`, do a targeted find-and-replace of dark-specific classes:

| Old class / style | Replacement |
|---|---|
| `text-white` | `style={{ color: 'var(--app-text)' }}` |
| `text-zinc-400` | `style={{ color: 'var(--app-muted)' }}` |
| `text-zinc-300` | `style={{ color: 'var(--app-muted)' }}` |
| `text-amber-200` / `text-amber-400` | `style={{ color: 'var(--app-gold)' }}` |
| `border-white/10` / `border-white/15` | `style={{ border: '1.5px solid var(--app-border)' }}` |
| `bg-white/5` / `bg-white/10` | `style={{ background: 'var(--app-card)' }}` |
| `bg-amber-500` (share button) | `style={{ background: 'linear-gradient(135deg, var(--app-purple) 0%, #7B3FBE 100%)' }}` |
| `text-[#1a0a2e]` | `style={{ color: '#fff' }}` |

The QR code panel (`<div className="rounded-xl border border-white/10 bg-white p-6">`) stays white — QR codes need a white background.

- [ ] **Step 2: Build**

```bash
cd /home/antonio/repo/calisto-landing && npm run build 2>&1 | tail -30
```

- [ ] **Step 3: Run tests**

```bash
cd /home/antonio/repo/calisto-landing && npm test 2>&1 | tail -20
```
Expected: all tests pass.

- [ ] **Step 4: Final commit**

```bash
git add "app/(app)/events/[id]/_tabs/ShareTab.tsx"
git commit -m "feat(app-ui): apply app-shell tokens to ShareTab"
```

---

## Self-Review Checklist

Spec requirements vs tasks:

| Requirement | Task |
|---|---|
| Playfair Display font | Task 1 |
| `--app-*` CSS tokens, dark + light | Task 1 |
| `.app-shell` class scoping | Task 1 |
| GoldBar, FieldLabel, StatRing | Task 2 |
| AppCard, AppBtn, AppInput | Task 3 |
| AppShell (top-bar, sub-bar, mobile dock) | Task 4 |
| `(app)` layout wire-up | Task 5 |
| Per-page bg wrapper removal | Task 5 |
| Welcome page | Task 6 |
| Login + Register | Task 6 |
| Forgot password | Task 6 |
| Dashboard + EventCard | Task 7 |
| Event tab nav pills + event heading | Task 8 |
| Overview tab (info, stats rings, access code, featured) | Task 9 |
| Gallery masonry + lightbox + filter | Task 10 |
| Create Event (Step1Details, Step2Plan) | Task 11 |
| Join Event | Task 12 |
| ShareTab token pass | Task 13 |
