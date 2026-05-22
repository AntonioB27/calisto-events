# Demo Route Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `/demo` and `/demo/demoevent` — a read-only, no-auth marketing demo showcasing a wedding event from both organizer and guest perspectives.

**Architecture:** New `app/demo/` route group, outside `(app)/` so no auth is required. A single static data file feeds all demo components. A `DemoToastProvider` context intercepts all mutation affordances and shows a "this is a demo" toast. Role switching is URL-based (`?role=organizer|guest`), resolved server-side. UI components for the demo are new (not reused from protected routes) to avoid Supabase dependencies — except `ShareTab`, which is purely prop-driven and safe to reuse.

**Tech Stack:** Next.js App Router (server + client components), React context, Vitest, inline CSS (editorial almanac style matching the rest of the app), `frontend-design` skill for all new UI components.

---

## File Map

| File | Create / Modify | Purpose |
|---|---|---|
| `app/demo/page.tsx` | Create | `/demo` landing page |
| `app/demo/demoevent/page.tsx` | Create | Server page — reads role/tab params, renders view |
| `app/demo/demoevent/demo-role.ts` | Create | `resolveDemoRole` + `resolveDemoTab` pure helpers |
| `app/demo/demoevent/demo-role.test.ts` | Create | Vitest unit tests for the helpers |
| `app/demo/demoevent/_data/demo-event.ts` | Create | Static event, guest, and photo data |
| `app/demo/demoevent/_data/demo-event.test.ts` | Create | Vitest shape/contract tests for data |
| `app/demo/demoevent/_components/DemoToastProvider.tsx` | Create | React context + fixed toast UI |
| `app/demo/demoevent/_components/DemoRoleToggle.tsx` | Create | Sticky pill toggle (Organizer / Guest) |
| `app/demo/demoevent/_components/DemoMediaGrid.tsx` | Create | Static photo grid from `/public/demo/` |
| `app/demo/demoevent/_components/DemoAdminTabs.tsx` | Create | Organizer nav shell with demo-scoped hrefs |
| `app/demo/demoevent/_components/DemoOverviewTab.tsx` | Create | Overview tab with static data (no Supabase) |
| `app/demo/demoevent/_components/DemoGalleryTab.tsx` | Create | Gallery tab with static photos + toast on delete |
| `app/demo/demoevent/_components/DemoGuestsTab.tsx` | Create | Guests tab with static guest list |
| `app/demo/demoevent/_components/DemoOrganizerView.tsx` | Create | Orchestrates DemoAdminTabs + tab content |
| `app/demo/demoevent/_components/DemoGuestView.tsx` | Create | Guest view — hero + upload zone + photo grid |
| `public/demo/.gitkeep` | Create | Placeholder — developer drops wedding photos here |

---

## Task 1: Create the feature branch

- [ ] **Step 1: Create and check out branch**

```bash
git checkout -b feature/demo
```

Expected output: `Switched to a new branch 'feature/demo'`

- [ ] **Step 2: Verify you are on the correct branch**

```bash
git branch --show-current
```

Expected output: `feature/demo`

---

## Task 2: Static demo data

**Files:**
- Create: `app/demo/demoevent/_data/demo-event.ts`
- Create: `app/demo/demoevent/_data/demo-event.test.ts`

- [ ] **Step 1: Write the failing test**

Create `app/demo/demoevent/_data/demo-event.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { DEMO_EVENT, DEMO_GUESTS, DEMO_PHOTOS } from "./demo-event";

describe("demo-event data", () => {
  it("event has a valid YYYY-MM-DD date", () => {
    expect(DEMO_EVENT.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("event has a non-empty access code", () => {
    expect(DEMO_EVENT.accessCode.length).toBeGreaterThan(0);
  });

  it("has at least 5 guests", () => {
    expect(DEMO_GUESTS.length).toBeGreaterThanOrEqual(5);
  });

  it("every guest has a non-empty name and valid role", () => {
    const validRoles = new Set(["organizer", "guest", "co_organizer"]);
    for (const g of DEMO_GUESTS) {
      expect(g.name.length).toBeGreaterThan(0);
      expect(validRoles.has(g.role)).toBe(true);
    }
  });

  it("has at least 6 photos", () => {
    expect(DEMO_PHOTOS.length).toBeGreaterThanOrEqual(6);
  });

  it("all photo src paths start with /demo/", () => {
    for (const p of DEMO_PHOTOS) {
      expect(p.src).toMatch(/^\/demo\//);
    }
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
npx vitest run app/demo/demoevent/_data/demo-event.test.ts
```

Expected: error — module not found.

- [ ] **Step 3: Create the data file**

Create `app/demo/demoevent/_data/demo-event.ts`:

```ts
export const DEMO_EVENT = {
  id: "demo",
  name: "Ana & Marco's Wedding",
  emoji: "💍",
  date: "2025-06-14",
  accessCode: "DEMO00",
  plan: "pro",
} as const;

export type DemoGuest = {
  id: string;
  name: string;
  role: "organizer" | "guest" | "co_organizer";
  photoCount: number;
};

export const DEMO_GUESTS: DemoGuest[] = [
  { id: "g1", name: "Marco T.",   role: "organizer",    photoCount: 5  },
  { id: "g2", name: "Ana P.",     role: "organizer",    photoCount: 8  },
  { id: "g3", name: "Elena M.",   role: "co_organizer", photoCount: 3  },
  { id: "g4", name: "Sofia R.",   role: "guest",        photoCount: 12 },
  { id: "g5", name: "Luca B.",    role: "guest",        photoCount: 7  },
  { id: "g6", name: "Bruno A.",   role: "guest",        photoCount: 4  },
  { id: "g7", name: "Chiara V.",  role: "guest",        photoCount: 6  },
  { id: "g8", name: "Diego F.",   role: "guest",        photoCount: 2  },
  { id: "g9", name: "Mia C.",     role: "guest",        photoCount: 9  },
];

export type DemoPhoto = {
  src: string;
  uploadedBy: string;
};

export const DEMO_PHOTOS: DemoPhoto[] = [
  { src: "/demo/photo-01.jpg", uploadedBy: "Sofia R."  },
  { src: "/demo/photo-02.jpg", uploadedBy: "Luca B."   },
  { src: "/demo/photo-03.jpg", uploadedBy: "Elena M."  },
  { src: "/demo/photo-04.jpg", uploadedBy: "Marco T."  },
  { src: "/demo/photo-05.jpg", uploadedBy: "Ana P."    },
  { src: "/demo/photo-06.jpg", uploadedBy: "Bruno A."  },
  { src: "/demo/photo-07.jpg", uploadedBy: "Chiara V." },
  { src: "/demo/photo-08.jpg", uploadedBy: "Diego F."  },
  { src: "/demo/photo-09.jpg", uploadedBy: "Mia C."    },
  { src: "/demo/photo-10.jpg", uploadedBy: "Sofia R."  },
  { src: "/demo/photo-11.jpg", uploadedBy: "Luca B."   },
  { src: "/demo/photo-12.jpg", uploadedBy: "Ana P."    },
];
```

- [ ] **Step 4: Run to verify tests pass**

```bash
npx vitest run app/demo/demoevent/_data/demo-event.test.ts
```

Expected: all 6 tests pass.

- [ ] **Step 5: Create the public/demo placeholder**

```bash
mkdir -p public/demo && touch public/demo/.gitkeep
```

Add a note in `public/demo/.gitkeep` (or a README.txt):
> Drop wedding photos here as photo-01.jpg … photo-12.jpg before launch.
> These filenames must match the `src` values in `app/demo/demoevent/_data/demo-event.ts`.

- [ ] **Step 6: Commit**

```bash
git add app/demo/demoevent/_data/ public/demo/
git commit -m "feat(demo): add static wedding event data and photo placeholder"
```

---

## Task 3: Role and tab resolution helpers

**Files:**
- Create: `app/demo/demoevent/demo-role.ts`
- Create: `app/demo/demoevent/demo-role.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `app/demo/demoevent/demo-role.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { resolveDemoRole, resolveDemoTab } from "./demo-role";

describe("resolveDemoRole", () => {
  it("defaults to organizer when undefined", () => {
    expect(resolveDemoRole(undefined)).toBe("organizer");
  });

  it("accepts 'guest'", () => {
    expect(resolveDemoRole("guest")).toBe("guest");
  });

  it("accepts 'organizer'", () => {
    expect(resolveDemoRole("organizer")).toBe("organizer");
  });

  it("falls back to organizer for unknown values", () => {
    expect(resolveDemoRole("admin")).toBe("organizer");
    expect(resolveDemoRole("")).toBe("organizer");
  });
});

describe("resolveDemoTab", () => {
  it("defaults to overview when undefined", () => {
    expect(resolveDemoTab(undefined)).toBe("overview");
  });

  it("accepts valid tab ids", () => {
    expect(resolveDemoTab("gallery")).toBe("gallery");
    expect(resolveDemoTab("guests")).toBe("guests");
    expect(resolveDemoTab("share")).toBe("share");
    expect(resolveDemoTab("overview")).toBe("overview");
  });

  it("falls back to overview for unknown values", () => {
    expect(resolveDemoTab("settings")).toBe("overview");
    expect(resolveDemoTab("unknown")).toBe("overview");
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
npx vitest run app/demo/demoevent/demo-role.test.ts
```

Expected: error — module not found.

- [ ] **Step 3: Create the helper file**

Create `app/demo/demoevent/demo-role.ts`:

```ts
export type DemoRole = "organizer" | "guest";
export type DemoTabId = "overview" | "gallery" | "guests" | "share";

const DEMO_ROLES = new Set<string>(["organizer", "guest"]);
const DEMO_TABS = new Set<string>(["overview", "gallery", "guests", "share"]);

export function resolveDemoRole(value: string | undefined): DemoRole {
  if (typeof value === "string" && DEMO_ROLES.has(value)) {
    return value as DemoRole;
  }
  return "organizer";
}

export function resolveDemoTab(value: string | undefined): DemoTabId {
  if (typeof value === "string" && DEMO_TABS.has(value)) {
    return value as DemoTabId;
  }
  return "overview";
}
```

- [ ] **Step 4: Run to verify tests pass**

```bash
npx vitest run app/demo/demoevent/demo-role.test.ts
```

Expected: all 8 tests pass.

- [ ] **Step 5: Commit**

```bash
git add app/demo/demoevent/demo-role.ts app/demo/demoevent/demo-role.test.ts
git commit -m "feat(demo): add role and tab resolution helpers"
```

---

## Task 4: DemoToastProvider

> **INVOKE frontend-design skill before writing this component's UI.**

**Files:**
- Create: `app/demo/demoevent/_components/DemoToastProvider.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client";

import Link from "next/link";
import React, { createContext, useCallback, useContext, useState } from "react";

type DemoToastContextValue = { triggerDemoToast: () => void };

const DemoToastContext = createContext<DemoToastContextValue>({
  triggerDemoToast: () => {},
});

export function useDemoToast() {
  return useContext(DemoToastContext);
}

export function DemoToastProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);

  const triggerDemoToast = useCallback(() => {
    setVisible(true);
    window.setTimeout(() => setVisible(false), 3000);
  }, []);

  return (
    <DemoToastContext.Provider value={{ triggerDemoToast }}>
      {children}
      {visible && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            bottom: 28,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            background: "rgba(20,14,6,0.92)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            color: "#fff",
            borderRadius: 14,
            padding: "12px 20px",
            fontSize: 13,
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: "0 8px 28px rgba(0,0,0,0.45)",
            border: "1px solid rgba(255,255,255,0.1)",
            whiteSpace: "nowrap",
          }}
        >
          <span>This is a demo</span>
          <Link
            href="/auth/register"
            style={{
              color: "#C5922A",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: 12,
              background: "rgba(197,146,42,0.18)",
              padding: "4px 10px",
              borderRadius: 8,
              border: "1px solid rgba(197,146,42,0.38)",
            }}
          >
            Sign up →
          </Link>
        </div>
      )}
    </DemoToastContext.Provider>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/demo/demoevent/_components/DemoToastProvider.tsx
git commit -m "feat(demo): add DemoToastProvider context and toast UI"
```

---

## Task 5: DemoRoleToggle

> **INVOKE frontend-design skill before writing this component's UI.**

**Files:**
- Create: `app/demo/demoevent/_components/DemoRoleToggle.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { DemoRole, DemoTabId } from "../demo-role";

type Props = {
  currentRole: DemoRole;
  currentTab: DemoTabId;
};

export function DemoRoleToggle({ currentRole, currentTab }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchRole(role: DemoRole) {
    startTransition(() => {
      router.push(`/demo/demoevent?role=${role}&tab=${currentTab}`);
    });
  }

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        padding: "10px 16px",
        background: "var(--app-bg)",
        borderBottom: "1px solid var(--app-border)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        opacity: isPending ? 0.75 : 1,
        transition: "opacity 0.15s",
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--app-muted)",
          fontFamily: "'DM Sans', sans-serif",
          flexShrink: 0,
        }}
      >
        Viewing as:
      </span>
      <div
        style={{
          display: "flex",
          background: "var(--app-surface)",
          border: "1px solid var(--app-border)",
          borderRadius: 10,
          padding: 3,
          gap: 3,
        }}
      >
        {(["organizer", "guest"] as DemoRole[]).map((role) => {
          const active = currentRole === role;
          return (
            <button
              key={role}
              type="button"
              onClick={() => switchRole(role)}
              disabled={active}
              style={{
                padding: "6px 18px",
                borderRadius: 7,
                border: "none",
                cursor: active ? "default" : "pointer",
                background: active ? "#C5922A" : "transparent",
                color: active ? "#fff" : "var(--app-muted)",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                fontWeight: 700,
                transition: "all 0.15s",
                textTransform: "capitalize",
              }}
            >
              {role}
            </button>
          );
        })}
      </div>
      <span
        style={{
          fontSize: 11,
          color: "var(--app-muted)",
          fontFamily: "'DM Sans', sans-serif",
          fontStyle: "italic",
        }}
      >
        Demo mode
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/demo/demoevent/_components/DemoRoleToggle.tsx
git commit -m "feat(demo): add DemoRoleToggle pill toggle"
```

---

## Task 6: DemoMediaGrid

> **INVOKE frontend-design skill before writing this component's UI.**

**Files:**
- Create: `app/demo/demoevent/_components/DemoMediaGrid.tsx`

This renders the static photos from `DEMO_PHOTOS`. It looks identical to the real `MediaGrid` (masonry-style grid, same card styling). Delete buttons are present in organizer mode but wired to the demo toast.

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { useState } from "react";
import { DEMO_PHOTOS } from "../_data/demo-event";
import { useDemoToast } from "./DemoToastProvider";

type Props = {
  canManage?: boolean;
};

export function DemoMediaGrid({ canManage = false }: Props) {
  const { triggerDemoToast } = useDemoToast();
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  return (
    <>
      <div
        style={{
          columns: "2 160px",
          gap: 8,
        }}
      >
        {DEMO_PHOTOS.map((photo) => (
          <div
            key={photo.src}
            style={{
              position: "relative",
              marginBottom: 8,
              breakInside: "avoid",
              borderRadius: 10,
              overflow: "hidden",
              cursor: "pointer",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.src}
              alt={`Photo by ${photo.uploadedBy}`}
              style={{ width: "100%", display: "block" }}
              onClick={() => setLightboxSrc(photo.src)}
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "20px 8px 6px",
                background: "linear-gradient(transparent, rgba(0,0,0,0.55))",
                fontSize: 10,
                color: "rgba(255,255,255,0.8)",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
              }}
            >
              {photo.uploadedBy}
            </div>
            {canManage && (
              <button
                type="button"
                aria-label="Delete photo"
                onClick={(e) => { e.stopPropagation(); triggerDemoToast(); }}
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 26,
                  height: 26,
                  borderRadius: 8,
                  border: "none",
                  background: "rgba(0,0,0,0.55)",
                  color: "#fff",
                  fontSize: 14,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {lightboxSrc && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9998,
            background: "rgba(0,0,0,0.88)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setLightboxSrc(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxSrc}
            alt="Full size"
            style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 12, objectFit: "contain" }}
          />
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/demo/demoevent/_components/DemoMediaGrid.tsx
git commit -m "feat(demo): add DemoMediaGrid static photo grid"
```

---

## Task 7: DemoAdminTabs

> **INVOKE frontend-design skill before writing this component's UI.**

**Files:**
- Create: `app/demo/demoevent/_components/DemoAdminTabs.tsx`

This mirrors `EventAdminTabs` visually (glass hero banner, editorial TOC nav strip) but all links point to `/demo/demoevent?tab=...&role=organizer`. No Settings tab. Uses static counts from `DEMO_GUESTS` and `DEMO_PHOTOS`.

- [ ] **Step 1: Create the file**

```tsx
"use client";

import Link from "next/link";
import { Camera, Share2, Users } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { DEMO_EVENT, DEMO_GUESTS, DEMO_PHOTOS } from "../_data/demo-event";
import type { DemoTabId } from "../demo-role";

// Palette matches EventAdminTabs exactly
const MUTED   = 'var(--app-muted)';
const GOLD    = '#C5922A';
const PURPLE  = '#5B2D8E';
const DIVIDER = 'var(--app-border)';
const FB = "'DM Sans', sans-serif";
const FS = "'DM Serif Display', serif";

const GLASS_LIGHT: React.CSSProperties = {
  background: 'rgba(255,255,255,0.62)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: '1px solid rgba(255,255,255,0.78)',
  boxShadow: '0 10px 30px -8px rgba(40,25,15,0.18), inset 0 1px 0 rgba(255,255,255,0.7)',
};

const GLASS_DARK: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 10px 30px -8px rgba(0,0,0,0.4)',
};

const TOC_TABS: { id: DemoTabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "guests",   label: "Guests"   },
  { id: "gallery",  label: "Gallery"  },
];

function parseDateFull(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return null;
  return {
    mon: new Date(y, m - 1, d).toLocaleDateString("en", { month: "short" }),
    day: d,
    year: y,
  };
}

function DemoAdminTabsInner({ selectedTab }: { selectedTab: DemoTabId }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const update = () => setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  const parsedDate = parseDateFull(DEMO_EVENT.date);
  const guestCount = DEMO_GUESTS.length;
  const mediaCount = DEMO_PHOTOS.length;

  function tabHref(tab: DemoTabId) {
    return `/demo/demoevent?tab=${tab}&role=organizer`;
  }

  return (
    <div className="welcome-reveal">
      {/* Top bar: back pill + share chip */}
      <div style={{ padding: "12px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
          <Link
            href="/demo"
            style={{
              background: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.55)",
              border: `1px solid ${DIVIDER}`,
              color: PURPLE,
              padding: "7px 12px",
              borderRadius: 9,
              fontFamily: FB,
              fontSize: 12,
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              textDecoration: "none",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            ← Demo
          </Link>
          <Link
            href={tabHref("share")}
            style={{
              width: 32, height: 32, borderRadius: 10,
              background: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.55)",
              border: `1px solid ${DIVIDER}`,
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: MUTED,
              textDecoration: "none",
            }}
            title="Share"
          >
            <Share2 size={15} />
          </Link>
        </div>

        {/* Glass banner */}
        <div style={{ ...(isDark ? GLASS_DARK : GLASS_LIGHT), borderRadius: 14, overflow: "hidden", position: "relative", height: 128 }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(197,146,42,0.22),rgba(91,45,142,0.14))" }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(45deg,rgba(255,255,255,0.12) 0 2px,transparent 2px 12px)" }} />
          <div style={{ position: "absolute", right: -8, bottom: -14, fontSize: 120, lineHeight: 1, opacity: 0.9, transform: "rotate(-8deg)", filter: "drop-shadow(0 4px 12px rgba(40,25,15,0.18))", pointerEvents: "none" }}>
            {DEMO_EVENT.emoji}
          </div>
          <div style={{ position: "absolute", bottom: 10, left: 10, right: 48, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", borderRadius: 100, padding: "5px 14px", border: "1px solid rgba(255,255,255,0.38)", overflow: "hidden" }}>
            <span style={{ fontFamily: FS, fontStyle: "italic", fontWeight: 700, fontSize: 14, color: "rgba(255,255,255,0.95)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textShadow: "0 1px 4px rgba(40,25,15,0.5)", display: "block" }}>
              {DEMO_EVENT.name}
            </span>
          </div>
        </div>

        {/* Date + stats row */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 14, marginBottom: 4 }}>
          {parsedDate && (
            <div style={{ width: 52, flexShrink: 0, textAlign: "center", fontFamily: FB, borderRight: `1px dashed ${DIVIDER}`, paddingRight: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: MUTED }}>{parsedDate.mon}</div>
              <div style={{ fontFamily: FS, fontStyle: "italic", fontWeight: 700, fontSize: 36, lineHeight: 0.9, color: GOLD, letterSpacing: "-0.03em", marginTop: 1 }}>{parsedDate.day}</div>
              <div style={{ fontFamily: FS, fontStyle: "italic", fontSize: 10.5, color: MUTED, marginTop: 1 }}>{parsedDate.year}</div>
            </div>
          )}
          <div style={{ flex: 1, display: "flex", gap: 8 }}>
            <div style={{ flex: 1, background: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.55)", border: `1px solid ${DIVIDER}`, borderRadius: 10, padding: "8px 10px", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
                <Camera size={11} color={MUTED} />
                <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: MUTED, fontFamily: FB }}>memories</span>
              </div>
              <div style={{ fontFamily: FS, fontStyle: "italic", fontWeight: 700, fontSize: 22, lineHeight: 1, color: GOLD, letterSpacing: "-0.02em" }}>{mediaCount}</div>
            </div>
            <div style={{ flex: 1, background: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.55)", border: `1px solid ${DIVIDER}`, borderRadius: 10, padding: "8px 10px", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
                <Users size={11} color={MUTED} />
                <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: MUTED, fontFamily: FB }}>guests</span>
              </div>
              <div style={{ fontFamily: FS, fontStyle: "italic", fontWeight: 700, fontSize: 22, lineHeight: 1, color: PURPLE, letterSpacing: "-0.02em" }}>{guestCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Editorial TOC nav */}
      <nav className="event-toc" role="tablist" aria-label="Demo event tabs">
        {TOC_TABS.map(({ id, label }) => {
          const on = id === selectedTab;
          const count = id === "guests" ? guestCount : id === "gallery" ? mediaCount : null;
          return (
            <Link
              key={id}
              href={tabHref(id)}
              role="tab"
              aria-selected={on}
              aria-current={on ? "page" : undefined}
              className="event-toc__tab"
            >
              {label}
              {count !== null && <span className="event-toc__count">{count}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function DemoAdminTabs({ selectedTab }: { selectedTab: DemoTabId }) {
  return (
    <Suspense fallback={<div style={{ height: 120 }} />}>
      <DemoAdminTabsInner selectedTab={selectedTab} />
    </Suspense>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/demo/demoevent/_components/DemoAdminTabs.tsx
git commit -m "feat(demo): add DemoAdminTabs organizer nav shell"
```

---

## Task 8: DemoOverviewTab

> **INVOKE frontend-design skill before writing this component's UI.**

**Files:**
- Create: `app/demo/demoevent/_components/DemoOverviewTab.tsx`

Mirrors `OverviewTab` visually: StatusRibbon, countdown cards (both show "ended" since the wedding was June 2025), stats tiles with static counts, access code card (copy button → demo toast, QR shown as read-only), photo carousel from `DEMO_PHOTOS`.

- [ ] **Step 1: Create the file**

```tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "react-qr-code";
import { Camera, Clapperboard, Users } from "lucide-react";
import { DEMO_EVENT, DEMO_GUESTS, DEMO_PHOTOS } from "../_data/demo-event";
import { useDemoToast } from "./DemoToastProvider";
import { getWebJoinUrl } from "@/lib/join-link";

const GOLD       = '#C5922A';
const PURPLE     = '#5B2D8E';
const RUST       = '#D17A2A';
const GOLD_FOIL  = 'linear-gradient(135deg, #E6BF66 0%, #C5922A 45%, #F4D88F 70%, #946C18 100%)';
const TEXT       = 'var(--app-text)';
const TEXT_S     = 'var(--app-text-sub)';
const MUTED      = 'var(--app-muted)';
const BORDER     = 'var(--app-border)';
const FB = "'DM Sans', sans-serif";
const FS = "'DM Serif Display', serif";

const GLASS_LIGHT: React.CSSProperties = {
  background: 'rgba(255,255,255,0.62)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: '1px solid rgba(255,255,255,0.78)',
  boxShadow: '0 10px 30px -8px rgba(40,25,15,0.18), inset 0 1px 0 rgba(255,255,255,0.7)',
};
const GLASS_DARK: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 10px 30px -8px rgba(0,0,0,0.4)',
};

const DarkCtx = React.createContext(false);

function useDarkMode() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const update = () => setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);
  return isDark;
}

function StatusRibbon() {
  const isDark = React.useContext(DarkCtx);
  return (
    <div style={{ ...(isDark ? GLASS_DARK : GLASS_LIGHT), borderRadius: 18, padding: "12px 14px", display: "grid", gridTemplateColumns: "1.4fr 1px 1fr 1px 1fr", gap: 12, alignItems: "center" }}>
      <div>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: MUTED, fontFamily: FB }}>Event date</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 4 }}>
          <span style={{ fontFamily: FS, fontStyle: "italic", fontWeight: 400, fontSize: 30, color: TEXT, letterSpacing: "-0.02em", lineHeight: 1 }}>14</span>
          <div>
            <div style={{ fontFamily: FS, fontStyle: "italic", fontSize: 12, color: TEXT, fontWeight: 400, lineHeight: 1 }}>June</div>
            <div style={{ fontSize: 9.5, color: MUTED, fontWeight: 600, marginTop: 2, fontFamily: FB }}>2025 · Sat</div>
          </div>
        </div>
      </div>
      <div style={{ width: 1, height: "70%", background: "rgba(154,133,112,0.25)", justifySelf: "center" as const }} />
      <div>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: MUTED, fontFamily: FB }}>Plan</div>
        <div style={{ marginTop: 5, display: "inline-block", background: GOLD_FOIL, color: "#fff", padding: "3px 10px", borderRadius: 12, fontFamily: FS, fontStyle: "italic", fontWeight: 400, fontSize: 15, letterSpacing: "0.04em", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 2px 6px rgba(148,108,24,0.25)" }}>Pro</div>
      </div>
      <div style={{ width: 1, height: "70%", background: "rgba(154,133,112,0.25)", justifySelf: "center" as const }} />
      <div>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: MUTED, fontFamily: FB }}>Your role</div>
        <div style={{ fontFamily: FS, fontStyle: "italic", fontWeight: 400, fontSize: 15, color: PURPLE, marginTop: 4 }}>Organizer</div>
      </div>
    </div>
  );
}

function CountdownCards() {
  const isDark = React.useContext(DarkCtx);

  function Card({ label, accent, endedLabel }: { label: string; accent: string; endedLabel: string }) {
    return (
      <div style={{ ...(isDark ? GLASS_DARK : GLASS_LIGHT), borderRadius: 18, padding: "14px 14px 12px", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -24, right: -24, width: 80, height: 80, borderRadius: "50%", background: accent, opacity: 0.13, filter: "blur(20px)", pointerEvents: "none" }} />
        <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: accent, fontFamily: FB, position: "relative" }}>{label}</div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingTop: 8, position: "relative" }}>
          <div style={{ fontFamily: FS, fontStyle: "italic", fontSize: 14, color: accent, lineHeight: 1.3, paddingBottom: 6 }}>{endedLabel}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      <Card label="Upload window" accent={RUST} endedLabel="Window closed" />
      <Card label="Auto-deletion" accent={PURPLE} endedLabel="In 11 months" />
    </div>
  );
}

function StatsTiles() {
  const isDark = React.useContext(DarkCtx);
  const photos = DEMO_PHOTOS.length;
  const guests = DEMO_GUESTS.length;

  function Tile({ n, label, cap, accent, icon }: { n: number; label: string; cap: string; accent: string; icon: React.ReactNode }) {
    return (
      <div style={{ ...(isDark ? GLASS_DARK : GLASS_LIGHT), borderRadius: 16, padding: "12px 10px 12px 12px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 116, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 80, height: 80, borderRadius: "50%", background: accent, opacity: 0.1, filter: "blur(20px)", pointerEvents: "none" }} />
        <div>
          <div style={{ fontFamily: FS, fontStyle: "italic", fontWeight: 400, fontSize: 44, color: accent, letterSpacing: "-0.04em", lineHeight: 0.85 }}>{n}</div>
          <div style={{ fontFamily: FS, fontStyle: "italic", fontSize: 14, fontWeight: 400, color: TEXT, marginTop: 4 }}>{label}</div>
          <div style={{ fontSize: 8.5, color: MUTED, fontWeight: 600, marginTop: 1, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: FB }}>{cap}</div>
        </div>
        <div style={{ alignSelf: "flex-end" }}>{icon}</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: TEXT_S, fontFamily: FB, marginBottom: 8 }}>Statistics</div>
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 8 }}>
        <Tile n={photos} label="Photos"  cap="Unlimited on Pro" accent={PURPLE} icon={<Camera size={32} color={PURPLE} opacity={0.35} />} />
        <Tile n={0}      label="Videos"  cap="Up to 5 on Pro"   accent={MUTED}  icon={<Clapperboard size={32} color={MUTED} opacity={0.35} />} />
        <Tile n={guests} label="Guests"  cap="Unlimited on Pro" accent={GOLD}   icon={<Users size={32} color={GOLD} opacity={0.35} />} />
      </div>
    </div>
  );
}

function AccessCard({ publicOrigin }: { publicOrigin: string }) {
  const isDark = React.useContext(DarkCtx);
  const { triggerDemoToast } = useDemoToast();
  const [showQR, setShowQR] = useState(false);
  const joinUrl = getWebJoinUrl(publicOrigin, DEMO_EVENT.accessCode);

  return (
    <div style={{ position: "relative", borderRadius: 20, padding: "18px 16px 16px", background: isDark ? "linear-gradient(140deg, rgba(139,79,216,0.3), rgba(197,146,42,0.18) 60%, transparent), rgba(255,255,255,0.06)" : "linear-gradient(140deg, rgba(139,79,216,0.18), rgba(197,146,42,0.12) 60%, transparent), rgba(255,255,255,0.72)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(255,255,255,0.78)", boxShadow: isDark ? "0 14px 32px -10px rgba(0,0,0,0.5)" : "0 14px 32px -10px rgba(40,25,15,0.22), inset 0 1px 0 rgba(255,255,255,0.7)", overflow: "hidden" }}>
      <div style={{ position: "absolute", bottom: -40, right: -30, width: 140, height: 140, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,79,216,0.5), transparent 65%)", filter: "blur(8px)", pointerEvents: "none" }} />
      <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: TEXT_S, fontFamily: FB, position: "relative" }}>Access code</div>
      <div style={{ marginTop: 12, padding: "14px 16px", background: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.88)", border: `1px dashed ${BORDER}`, borderRadius: 12, fontFamily: "var(--font-mono, ui-monospace)", fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: "0.12em", textAlign: "center", position: "relative" }}>
        {DEMO_EVENT.accessCode}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 8, marginTop: 10, position: "relative" }}>
        <button type="button" onClick={triggerDemoToast} style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.9)", border: `1px solid ${BORDER}`, color: TEXT, padding: "11px 12px", borderRadius: 12, fontFamily: FB, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          Copy code
        </button>
        <button type="button" onClick={() => setShowQR(v => !v)} style={{ background: "linear-gradient(135deg, #8B4FD8, #5B2D8E)", border: "none", color: "#fff", padding: "11px 12px", borderRadius: 12, fontFamily: FB, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 6px 14px rgba(91,45,142,0.35)" }}>
          {showQR ? "Hide QR" : "Show QR"}
        </button>
      </div>
      {showQR && (
        <div style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.92)", borderRadius: 12, padding: 20, marginTop: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, border: `1px solid ${BORDER}`, position: "relative" }}>
          <div className="qr-frame qr-reveal"><QRCode value={joinUrl} size={168} /></div>
          <p style={{ fontFamily: FS, fontStyle: "italic", fontSize: 12, color: MUTED, margin: 0, textAlign: "center" }}>Scan to join the event</p>
        </div>
      )}
    </div>
  );
}

function PhotoCarousel() {
  const isDark = React.useContext(DarkCtx);
  const preview = DEMO_PHOTOS.slice(0, 6);
  const [spotlight, ...rest] = preview;
  const thumbs = rest.slice(0, 5);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{ position: "absolute", inset: -6, background: "radial-gradient(circle, rgba(197,146,42,0.35), transparent 70%)", filter: "blur(8px)" }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/mascot/aurora_camera.png" alt="Aurora" style={{ width: 44, height: 44, objectFit: "contain", position: "relative" }} />
        </div>
        <div>
          <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: TEXT_S, fontFamily: FB }}>Recent photos</div>
          <div style={{ fontFamily: FS, fontStyle: "italic", fontWeight: 400, fontSize: 18, color: TEXT, marginTop: 1 }}>The latest six</div>
        </div>
      </div>
      <div style={{ ...(isDark ? GLASS_DARK : GLASS_LIGHT), borderRadius: 18, padding: 10 }}>
        {spotlight && (
          <Link href="?tab=gallery&role=organizer" style={{ display: "block", borderRadius: 12, overflow: "hidden", marginBottom: 6, position: "relative", textDecoration: "none" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={spotlight.src} alt="" style={{ width: "100%", display: "block", aspectRatio: "16/9", objectFit: "cover" }} />
          </Link>
        )}
        {thumbs.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
            {thumbs.map((photo, i) => (
              <Link key={photo.src} href="?tab=gallery&role=organizer" style={{ display: "block", borderRadius: 8, overflow: "hidden", position: "relative", aspectRatio: "1/1", textDecoration: "none" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                {i === 4 && DEMO_PHOTOS.length > 6 && (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(34,21,9,0.58)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FB, fontSize: 11, fontWeight: 700 }}>
                    +{DEMO_PHOTOS.length - 6}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function DemoOverviewTab({ publicOrigin }: { publicOrigin: string }) {
  const isDark = useDarkMode();

  return (
    <DarkCtx.Provider value={isDark}>
      <div className="welcome-reveal" style={{ padding: "18px 16px 40px", display: "flex", flexDirection: "column", gap: 16 }}>
        <StatusRibbon />
        <CountdownCards />
        <StatsTiles />
        <AccessCard publicOrigin={publicOrigin} />
        <PhotoCarousel />
      </div>
    </DarkCtx.Provider>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/demo/demoevent/_components/DemoOverviewTab.tsx
git commit -m "feat(demo): add DemoOverviewTab with static data"
```

---

## Task 9: DemoGalleryTab

> **INVOKE frontend-design skill before writing this component's UI.**

**Files:**
- Create: `app/demo/demoevent/_components/DemoGalleryTab.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { GoldBar } from "@/components/app-ui/GoldBar";
import { DemoMediaGrid } from "./DemoMediaGrid";
import { useDemoToast } from "./DemoToastProvider";

export function DemoGalleryTab() {
  const { triggerDemoToast } = useDemoToast();

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="welcome-reveal">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <GoldBar vertical />
          <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 20, color: "var(--app-text)" }}>
            Gallery
          </span>
        </div>
        <p style={{ fontSize: 13, color: "var(--app-muted)", lineHeight: 1.55 }}>
          All memories shared by guests at Ana & Marco's wedding.
        </p>
      </div>

      {/* Polaroid-style upload affordance — disabled, triggers toast */}
      <div style={{ position: "relative" }}>
        <div
          aria-hidden
          style={{ position: "absolute", top: -8, left: "33%", width: 64, height: 14, background: "rgba(212,168,67,0.48)", border: "0.5px solid rgba(212,168,67,0.6)", transform: "rotate(-3deg)", boxShadow: "0 2px 6px rgba(0,0,0,0.22)", zIndex: 2, borderRadius: 2, pointerEvents: "none" }}
        />
        <button
          type="button"
          onClick={triggerDemoToast}
          style={{ width: "100%", background: "rgba(244,240,234,0.55)", borderRadius: 2, boxShadow: "0 8px 28px rgba(0,0,0,0.42), 0 2px 6px rgba(0,0,0,0.2)", transform: "rotate(-0.5deg)", padding: "14px 14px 18px", opacity: 0.7, cursor: "pointer", border: "none", textAlign: "left" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 56, height: 56, borderRadius: 4, background: "rgba(0,0,0,0.07)", border: "1.5px dashed rgba(0,0,0,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 5v14M5 12h14" stroke="rgba(60,40,20,0.5)" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p style={{ margin: 0, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 16, fontWeight: 700, color: "#2a1d0f", lineHeight: 1.2 }}>Add a memory</p>
              <p style={{ margin: "3px 0 0", fontSize: 11, color: "rgba(60,40,20,0.55)" }}>Upload photos or videos</p>
            </div>
          </div>
        </button>
      </div>

      <DemoMediaGrid canManage />
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/demo/demoevent/_components/DemoGalleryTab.tsx
git commit -m "feat(demo): add DemoGalleryTab with static photos and toast affordance"
```

---

## Task 10: DemoGuestsTab

> **INVOKE frontend-design skill before writing this component's UI.**

**Files:**
- Create: `app/demo/demoevent/_components/DemoGuestsTab.tsx`

Mirrors `GuestsManager` visually: header with GoldBar, list of member rows with name, role badge, and photo count. Management actions (remove, change role) all trigger demo toast.

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { GoldBar } from "@/components/app-ui/GoldBar";
import { DEMO_GUESTS } from "../_data/demo-event";
import { useDemoToast } from "./DemoToastProvider";

const FB = "'DM Sans', sans-serif";
const FS = "'DM Serif Display', serif";
const GOLD   = '#C5922A';
const PURPLE = '#5B2D8E';
const MUTED  = 'var(--app-muted)';

function roleLabel(role: string): string {
  if (role === "organizer") return "Organizer";
  if (role === "co_organizer") return "Co-organizer";
  return "Guest";
}

function roleColor(role: string): string {
  if (role === "organizer") return GOLD;
  if (role === "co_organizer") return PURPLE;
  return MUTED;
}

export function DemoGuestsTab() {
  const { triggerDemoToast } = useDemoToast();

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="welcome-reveal">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <GoldBar vertical />
          <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 20, color: "var(--app-text)" }}>
            Guests
          </span>
        </div>
        <p style={{ fontSize: 13, color: "var(--app-muted)", lineHeight: 1.55 }}>
          {DEMO_GUESTS.length} people joined this event.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {DEMO_GUESTS.map((guest) => (
          <div
            key={guest.id}
            style={{
              background: "var(--app-surface)",
              border: "1px solid var(--app-border)",
              borderRadius: 14,
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            {/* Avatar circle */}
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg, ${roleColor(guest.role)}44, ${roleColor(guest.role)}22)`, border: `2px solid ${roleColor(guest.role)}55`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: FS, fontStyle: "italic", fontWeight: 700, fontSize: 15, color: roleColor(guest.role) }}>
              {guest.name[0]}
            </div>

            {/* Name + role */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: FB, fontWeight: 600, fontSize: 14, color: "var(--app-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {guest.name}
              </div>
              <div style={{ fontSize: 11, color: roleColor(guest.role), fontFamily: FB, fontWeight: 600, marginTop: 1 }}>
                {roleLabel(guest.role)}
              </div>
            </div>

            {/* Photo count */}
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontFamily: FS, fontStyle: "italic", fontWeight: 700, fontSize: 20, color: GOLD, lineHeight: 1 }}>
                {guest.photoCount}
              </div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: MUTED, fontFamily: FB, marginTop: 1 }}>
                photos
              </div>
            </div>

            {/* Remove button */}
            {guest.role !== "organizer" && (
              <button
                type="button"
                onClick={triggerDemoToast}
                style={{ background: "transparent", border: "1px solid var(--app-border)", color: MUTED, padding: "5px 10px", borderRadius: 8, fontFamily: FB, fontSize: 11, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/demo/demoevent/_components/DemoGuestsTab.tsx
git commit -m "feat(demo): add DemoGuestsTab with static guest list"
```

---

## Task 11: DemoGuestView

> **INVOKE frontend-design skill before writing this component's UI.**

**Files:**
- Create: `app/demo/demoevent/_components/DemoGuestView.tsx`

Mirrors `GuestEventPage` exactly: hero banner, date display, upload zone (triggers toast), `DemoMediaGrid` (read-only, no delete buttons).

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { useEffect, useState } from "react";
import { DEMO_EVENT, DEMO_PHOTOS } from "../_data/demo-event";
import { DemoMediaGrid } from "./DemoMediaGrid";
import { useDemoToast } from "./DemoToastProvider";

const TEXT_S = 'var(--app-text-sub)';
const MUTED  = 'var(--app-muted)';
const GOLD   = '#C5922A';
const BORDER = 'var(--app-border)';
const FB = "'DM Sans', sans-serif";
const FS = "'DM Serif Display', serif";

const GLASS_LIGHT: React.CSSProperties = {
  background: 'rgba(255,255,255,0.62)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: '1px solid rgba(255,255,255,0.78)',
  boxShadow: '0 10px 30px -8px rgba(40,25,15,0.18), inset 0 1px 0 rgba(255,255,255,0.7)',
};
const GLASS_DARK: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 10px 30px -8px rgba(0,0,0,0.4)',
};

export function DemoGuestView() {
  const { triggerDemoToast } = useDemoToast();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const update = () => setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  return (
    <main className="join-shell min-h-screen px-4 pb-16 pt-10 sm:px-6">
      <div className="mx-auto max-w-3xl">

        {/* Event hero banner */}
        <div style={{ ...(isDark ? GLASS_DARK : GLASS_LIGHT), borderRadius: 14, overflow: "hidden", position: "relative", height: 128, marginBottom: 0 }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(197,146,42,0.22),rgba(91,45,142,0.14))" }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(45deg,rgba(255,255,255,0.12) 0 2px,transparent 2px 12px)" }} />
          <div style={{ position: "absolute", right: -8, bottom: -14, fontSize: 120, lineHeight: 1, opacity: 0.9, transform: "rotate(-8deg)", filter: "drop-shadow(0 4px 12px rgba(40,25,15,0.18))", pointerEvents: "none" }}>
            {DEMO_EVENT.emoji}
          </div>
          <div style={{ position: "absolute", bottom: 10, left: 10, right: 48, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", borderRadius: 100, padding: "5px 14px", border: "1px solid rgba(255,255,255,0.38)", overflow: "hidden" }}>
            <span style={{ fontFamily: FS, fontStyle: "italic", fontWeight: 700, fontSize: 14, color: "rgba(255,255,255,0.95)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textShadow: "0 1px 4px rgba(40,25,15,0.5)", display: "block" }}>
              {DEMO_EVENT.name}
            </span>
          </div>
        </div>

        {/* Date + tagline row */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginTop: 14, marginBottom: 24 }}>
          <div style={{ width: 52, flexShrink: 0, textAlign: "center", fontFamily: FB, borderRight: `1px dashed ${BORDER}`, paddingRight: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: MUTED }}>Jun</div>
            <div style={{ fontFamily: FS, fontStyle: "italic", fontWeight: 700, fontSize: 36, lineHeight: 0.9, color: GOLD, letterSpacing: "-0.03em", marginTop: 1 }}>14</div>
            <div style={{ fontFamily: FS, fontStyle: "italic", fontSize: 10.5, color: MUTED, marginTop: 1 }}>2025</div>
          </div>
          <div style={{ flex: 1, paddingTop: 4 }}>
            <p style={{ margin: 0, fontFamily: FS, fontStyle: "italic", fontSize: 14, color: TEXT_S, lineHeight: 1.5 }}>
              Share your favourite memories from the celebration.
            </p>
          </div>
        </div>

        {/* Upload zone — disabled, triggers toast */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ position: "relative" }}>
            <div aria-hidden style={{ position: "absolute", top: -8, left: "33%", width: 64, height: 14, background: "rgba(212,168,67,0.48)", border: "0.5px solid rgba(212,168,67,0.6)", transform: "rotate(-3deg)", boxShadow: "0 2px 6px rgba(0,0,0,0.22)", zIndex: 2, borderRadius: 2, pointerEvents: "none" }} />
            <button
              type="button"
              onClick={triggerDemoToast}
              style={{ width: "100%", background: "rgba(244,240,234,0.55)", borderRadius: 2, boxShadow: "0 8px 28px rgba(0,0,0,0.42), 0 2px 6px rgba(0,0,0,0.2)", transform: "rotate(-0.5deg)", padding: "14px 14px 18px", opacity: 0.7, cursor: "pointer", border: "none", textAlign: "left" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 56, height: 56, borderRadius: 4, background: "rgba(0,0,0,0.07)", border: "1.5px dashed rgba(0,0,0,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M12 5v14M5 12h14" stroke="rgba(60,40,20,0.5)" strokeWidth="2.4" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <p style={{ margin: 0, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 16, fontWeight: 700, color: "#2a1d0f", lineHeight: 1.2 }}>Add a memory</p>
                  <p style={{ margin: "3px 0 0", fontSize: 11, color: "rgba(60,40,20,0.55)" }}>Upload photos or videos</p>
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* Gallery */}
        <section>
          <h2 style={{ marginBottom: 16, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--app-muted)" }}>
            Gallery · {DEMO_PHOTOS.length} memories
          </h2>
          <DemoMediaGrid canManage={false} />
        </section>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/demo/demoevent/_components/DemoGuestView.tsx
git commit -m "feat(demo): add DemoGuestView guest perspective"
```

---

## Task 12: DemoOrganizerView

> **INVOKE frontend-design skill before writing this component's UI.**

**Files:**
- Create: `app/demo/demoevent/_components/DemoOrganizerView.tsx`

Orchestrates `DemoAdminTabs` + conditional tab content. Reuses the real `ShareTab` for the share tab (it's safe — purely prop-driven, no Supabase).

- [ ] **Step 1: Create the file**

```tsx
import { DemoAdminTabs } from "./DemoAdminTabs";
import { DemoOverviewTab } from "./DemoOverviewTab";
import { DemoGalleryTab } from "./DemoGalleryTab";
import { DemoGuestsTab } from "./DemoGuestsTab";
import { ShareTab } from "@/app/(app)/events/[id]/_tabs/ShareTab";
import { DEMO_EVENT } from "../_data/demo-event";
import type { DemoTabId } from "../demo-role";

type Props = {
  selectedTab: DemoTabId;
  publicOrigin: string;
};

export function DemoOrganizerView({ selectedTab, publicOrigin }: Props) {
  return (
    <div style={{ padding: "0 0 60px" }}>
      <DemoAdminTabs selectedTab={selectedTab} />

      <div style={{ marginTop: 24, padding: "0 16px" }}>
        {selectedTab === "overview" && (
          <DemoOverviewTab publicOrigin={publicOrigin} />
        )}
        {selectedTab === "gallery" && <DemoGalleryTab />}
        {selectedTab === "guests" && <DemoGuestsTab />}
        {selectedTab === "share" && (
          <ShareTab
            eventId={DEMO_EVENT.id}
            accessCode={DEMO_EVENT.accessCode}
            eventTitle={DEMO_EVENT.name}
            publicOrigin={publicOrigin}
          />
        )}
      </div>
    </div>
  );
}
```

Note: `DemoOrganizerView` is a server component (no `"use client"` directive) because it only imports and renders other components. `DemoAdminTabs`, `DemoOverviewTab`, `DemoGalleryTab`, `DemoGuestsTab` are all client components — Next.js handles the boundary automatically.

- [ ] **Step 2: Commit**

```bash
git add app/demo/demoevent/_components/DemoOrganizerView.tsx
git commit -m "feat(demo): add DemoOrganizerView orchestrator"
```

---

## Task 13: `/demo/demoevent/page.tsx` — server entry point

**Files:**
- Create: `app/demo/demoevent/page.tsx`

- [ ] **Step 1: Create the file**

```tsx
import { resolveDemoRole, resolveDemoTab } from "./demo-role";
import { getPublicOrigin } from "@/lib/public-origin";
import { DemoToastProvider } from "./_components/DemoToastProvider";
import { DemoRoleToggle } from "./_components/DemoRoleToggle";
import { DemoOrganizerView } from "./_components/DemoOrganizerView";
import { DemoGuestView } from "./_components/DemoGuestView";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DemoEventPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const rawRole = typeof params.role === "string" ? params.role : undefined;
  const rawTab  = typeof params.tab  === "string" ? params.tab  : undefined;

  const role = resolveDemoRole(rawRole);
  const tab  = resolveDemoTab(rawTab);
  const publicOrigin = await getPublicOrigin();

  return (
    <DemoToastProvider>
      <DemoRoleToggle currentRole={role} currentTab={tab} />
      {role === "organizer" ? (
        <DemoOrganizerView selectedTab={tab} publicOrigin={publicOrigin} />
      ) : (
        <DemoGuestView />
      )}
    </DemoToastProvider>
  );
}
```

- [ ] **Step 2: Start dev server and verify `/demo/demoevent` loads**

```bash
npm run dev
```

Open `http://localhost:3000/demo/demoevent` in a browser.

Expected: page loads without auth redirect, shows role toggle at top, organizer view by default with the wedding event header.

Open `http://localhost:3000/demo/demoevent?role=guest`.

Expected: guest view with hero banner, upload zone, photo grid (photos may be broken if `/public/demo/` is empty — that is expected until you add photos).

- [ ] **Step 3: Commit**

```bash
git add app/demo/demoevent/page.tsx
git commit -m "feat(demo): add /demo/demoevent server page with role/tab routing"
```

---

## Task 14: `/demo` landing page

> **INVOKE frontend-design skill before writing this component's UI.**

**Files:**
- Create: `app/demo/page.tsx`

- [ ] **Step 1: Create the file**

```tsx
import Link from "next/link";

const FS = "'DM Serif Display', serif";
const FB = "'DM Sans', sans-serif";
const GOLD   = '#C5922A';
const PURPLE = '#5B2D8E';

export default function DemoLandingPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        background: "var(--app-bg)",
      }}
    >
      <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
        {/* Eyebrow */}
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: GOLD, fontFamily: FB, marginBottom: 12 }}>
          Live demo
        </p>

        {/* Headline */}
        <h1 style={{ fontFamily: FS, fontStyle: "italic", fontWeight: 700, fontSize: 38, color: "var(--app-text)", lineHeight: 1.1, marginBottom: 16, letterSpacing: "-0.02em" }}>
          See Calisto in action
        </h1>

        {/* Subtitle */}
        <p style={{ fontSize: 15, color: "var(--app-muted)", lineHeight: 1.65, fontFamily: FB, marginBottom: 36 }}>
          Explore a real wedding event — no account needed. Switch between the organizer's command view and the guest experience to see both sides of Calisto.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/demo/demoevent?role=organizer"
            style={{
              background: `linear-gradient(135deg, #8B4FD8, ${PURPLE})`,
              color: "#fff",
              padding: "14px 28px",
              borderRadius: 14,
              fontFamily: FB,
              fontSize: 15,
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 6px 18px rgba(91,45,142,0.35)",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            See as Organizer →
          </Link>
          <Link
            href="/demo/demoevent?role=guest"
            style={{
              background: "var(--app-surface)",
              color: "var(--app-text)",
              border: "1.5px solid var(--app-border)",
              padding: "14px 28px",
              borderRadius: 14,
              fontFamily: FB,
              fontSize: 15,
              fontWeight: 700,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            See as Guest →
          </Link>
        </div>

        {/* Footer note */}
        <p style={{ marginTop: 32, fontSize: 12, color: "var(--app-muted)", fontFamily: FB, fontStyle: "italic" }}>
          A wedding by Ana & Marco · 12 photos · 9 guests
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify `/demo` loads in browser**

Open `http://localhost:3000/demo`.

Expected: minimal landing page with headline, subtitle, and two CTA buttons. No nav bar (no AppShell). Both buttons navigate to the correct demo event URLs.

- [ ] **Step 3: Commit**

```bash
git add app/demo/page.tsx
git commit -m "feat(demo): add /demo landing page"
```

---

## Task 15: Add demo photos and smoke test

**Files:**
- Modify: `public/demo/` — add wedding photos

- [ ] **Step 1: Add wedding photos to `/public/demo/`**

Drop your chosen wedding photos into `/public/demo/` with these exact names:
```
photo-01.jpg
photo-02.jpg
photo-03.jpg
photo-04.jpg
photo-05.jpg
photo-06.jpg
photo-07.jpg
photo-08.jpg
photo-09.jpg
photo-10.jpg
photo-11.jpg
photo-12.jpg
```

If you have fewer than 12, update `DEMO_PHOTOS` in `app/demo/demoevent/_data/demo-event.ts` to only list the files you have. The test requires at least 6.

- [ ] **Step 2: Verify photos load**

Open `http://localhost:3000/demo/demoevent?role=organizer&tab=gallery` — grid should show all photos.
Open `http://localhost:3000/demo/demoevent?role=guest` — hero, upload zone, and photo grid visible.

- [ ] **Step 3: Smoke test every interactive affordance**

- Click upload zone (guest view) → demo toast appears, "Sign up →" link visible, toast auto-dismisses.
- Click delete on a photo (organizer gallery) → same toast.
- Click "Copy code" on overview access card → same toast.
- Switch role toggle Organizer → Guest → page re-renders guest view.
- Switch back Guest → Organizer → organizer view with Overview tab default.
- Click each tab (Overview, Gallery, Guests, Share) → correct content renders.
- Verify `/demo` landing CTA "See as Organizer →" navigates to organizer view.
- Verify `/demo` landing CTA "See as Guest →" navigates to guest view.

- [ ] **Step 4: Run all tests**

```bash
npx vitest run
```

Expected: all tests pass (including the two new test files for demo-event data and demo-role helpers).

- [ ] **Step 5: Commit photos and final state**

```bash
git add public/demo/
git commit -m "feat(demo): add wedding photos for demo event"
```
