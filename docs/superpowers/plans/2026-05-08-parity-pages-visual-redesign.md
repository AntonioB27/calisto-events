# Parity Pages Visual Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the app-ui design system (CSS vars, Playfair Display, AppCard/AppBtn/AppInput atoms) to eight parity-era pages so they match the already-redesigned event tabs and auth pages visually.

**Architecture:** Pure visual pass — no logic changes. Tailwind stays for layout (flex, grid, gap, padding); all colors/typography switch to `var(--app-*)` inline styles. Pages inside `(app)/` remove hardcoded bg and rely on AppShell. Pages inside `app/auth/` add their own `className="app-shell"` wrapper (matching the login/forgot-password pattern).

**Tech Stack:** Next.js 16 (React 19), Tailwind v4, `components/app-ui/` atoms (`AppCard`, `AppBtn`, `AppInput`, `GoldBar`).

---

## File map

| File | Action | Task |
|---|---|---|
| `app/(app)/settings/page.tsx` | Modify — remove hardcoded bg, token-ify heading/link, remove card wrapper | 1 |
| `app/(app)/settings/SettingsClient.tsx` | Modify — full restyle with CSS vars + GoldBar section headers | 1 |
| `app/(app)/onboarding/organizer/page.tsx` | Modify — remove hardcoded bg + card wrapper | 2 |
| `app/(app)/onboarding/organizer/OrganizeOnboardingForm.tsx` | Modify — add card container, Playfair header, token-ify kind selector + input + submit | 2 |
| `app/(app)/events/[id]/_tabs/GuestsManager.tsx` | Modify — full restyle with GoldBar header, card rows, AppBtn actions | 3 |
| `app/(app)/plan-tiers/page.tsx` | Modify — remove hardcoded bg, Playfair heading, AppCard plan cards | 4 |
| `app/auth/reset-password/ResetPasswordForm.tsx` | Modify — full restyle matching forgot-password pattern | 5 |
| `app/auth/reset-password/success/page.tsx` | Modify — full restyle matching auth page pattern | 5 |

---

## Task 1: Settings page + SettingsClient

**Files:**
- Modify: `app/(app)/settings/page.tsx`
- Modify: `app/(app)/settings/SettingsClient.tsx`

- [ ] **Step 1: Restyle settings/page.tsx**

Replace the entire file content:

```tsx
import Link from "next/link";

import { createSupabaseAuthServerClient } from "@/lib/supabase-auth-server";

import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  const supabase = await createSupabaseAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 flex items-center justify-between">
          <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 28, color: 'var(--app-text)' }}>
            Settings
          </h1>
          <Link href="/dashboard" style={{ fontSize: 13, color: 'var(--app-gold)', textDecoration: 'underline' }}>
            Events
          </Link>
        </div>

        <div style={{ background: 'var(--app-card)', borderRadius: 18, border: '1.5px solid var(--app-border)', padding: 24 }}>
          <SettingsClient email={user?.email ?? ""} />
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Restyle SettingsClient.tsx**

Replace the entire file content:

```tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { GoldBar } from "@/components/app-ui/GoldBar";

type SettingsClientProps = Readonly<{
  email: string;
}>;

export function SettingsClient({ email }: SettingsClientProps) {
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("calisto-theme");
      if (stored === "light" || stored === "dark") {
        queueMicrotask(() => setTheme(stored));
        return;
      }
    } catch {
      /* ignore */
    }
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "light") queueMicrotask(() => setTheme("light"));
  }, []);

  const applyTheme = useCallback((t: "light" | "dark") => {
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
    try {
      localStorage.setItem("calisto-theme", t);
    } catch {
      /* ignore */
    }
  }, []);

  async function onSignOut() {
    setSigningOut(true);
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.replace("/");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <GoldBar vertical />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--app-muted)' }}>
            Account
          </span>
        </div>
        <p style={{ fontSize: 14, color: 'var(--app-muted)' }}>
          Signed in as <span style={{ fontWeight: 600, color: 'var(--app-text)' }}>{email || "—"}</span>
        </p>
      </section>

      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <GoldBar vertical />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--app-muted)' }}>
            Appearance
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(["dark", "light"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => applyTheme(t)}
              style={{
                padding: '9px 18px',
                borderRadius: 14,
                fontSize: 13,
                fontWeight: 600,
                textTransform: 'capitalize',
                transition: 'all 0.18s',
                cursor: 'pointer',
                border: theme === t
                  ? '1.5px solid var(--app-gold)'
                  : '1.5px solid var(--app-border)',
                background: theme === t
                  ? 'color-mix(in srgb, var(--app-gold) 12%, transparent)'
                  : 'transparent',
                color: theme === t ? 'var(--app-gold)' : 'var(--app-muted)',
              }}
            >
              {t}
            </button>
          ))}
        </div>
        <p style={{ marginTop: 8, fontSize: 11, color: 'var(--app-muted)' }}>
          Applies to pages that support light and dark.
        </p>
      </section>

      <section>
        <button
          type="button"
          disabled={signingOut}
          onClick={() => void onSignOut()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            borderRadius: 14,
            padding: '13px 24px',
            fontSize: 14,
            fontWeight: 600,
            background: 'rgba(224,82,82,0.10)',
            border: '1.5px solid rgba(224,82,82,0.4)',
            color: '#fca5a5',
            cursor: signingOut ? 'not-allowed' : 'pointer',
            opacity: signingOut ? 0.6 : 1,
            transition: 'all 0.18s',
          }}
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </section>

      <p style={{ fontSize: 13, color: 'var(--app-muted)' }}>
        <Link href="/dashboard" style={{ color: 'var(--app-gold)', textDecoration: 'underline' }}>
          ← Back to events
        </Link>
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Verify build passes**

```bash
cd /home/antonio/repo/calisto-landing && npm run build 2>&1 | tail -20
```

Expected: exits 0, no type errors.

- [ ] **Step 4: Commit**

```bash
git add app/\(app\)/settings/page.tsx app/\(app\)/settings/SettingsClient.tsx
git commit -m "feat(app-ui): apply app-shell tokens to settings pages"
```

---

## Task 2: Onboarding page + form

**Files:**
- Modify: `app/(app)/onboarding/organizer/page.tsx`
- Modify: `app/(app)/onboarding/organizer/OrganizeOnboardingForm.tsx`

- [ ] **Step 1: Simplify onboarding/organizer/page.tsx**

Replace the entire file content (removes hardcoded bg and card wrapper; form provides its own card):

```tsx
import { OrganizeOnboardingForm } from "./OrganizeOnboardingForm";

export default function OrganizerOnboardingPage() {
  return (
    <main className="px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-lg">
        <OrganizeOnboardingForm />
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Restyle OrganizeOnboardingForm.tsx**

Replace the entire file content:

```tsx
"use client";

import type { EventKind } from "@/lib/event-kind";
import { EVENT_KINDS } from "@/lib/event-kind";
import { GoldBar } from "@/components/app-ui/GoldBar";
import { AppInput } from "@/components/app-ui/AppInput";
import { AppBtn } from "@/components/app-ui/AppBtn";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const KIND_LABEL: Record<EventKind, string> = {
  wedding: "Wedding",
  birthday: "Birthday",
  corporate: "Corporate",
  other: "Something else",
};

export function OrganizeOnboardingForm() {
  const router = useRouter();
  const [kind, setKind] = useState<EventKind | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!kind) {
      setError("Choose what you're planning.");
      return;
    }
    setBusy(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in.");

      const now = new Date().toISOString();
      const trimmedName = displayName.trim();

      const { error: saveError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          display_name: trimmedName || null,
          onboarding_completed_at: now,
        },
        { onConflict: "id" },
      );

      if (saveError) throw saveError;

      try {
        window.localStorage.setItem("calisto_onboarding_event_kind", kind);
      } catch {
        /* ignore */
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{
      background: 'var(--app-card)',
      borderRadius: 18,
      border: '1.5px solid var(--app-border)',
      padding: 32,
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    }}>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <header>
          <GoldBar />
          <p style={{ marginTop: 12, fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--app-muted)' }}>
            Welcome
          </p>
          <h1 style={{ marginTop: 6, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 28, color: 'var(--app-text)', lineHeight: 1.2 }}>
            Tell us about your event
          </h1>
          <p style={{ marginTop: 8, fontSize: 14, color: 'var(--app-muted)' }}>
            This personalizes your space. You can create your first event from the dashboard next.
          </p>
        </header>

        <section>
          <p style={{ marginBottom: 12, fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--app-muted)' }}>
            What are you planning?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {EVENT_KINDS.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setKind(k);
                  if (error) setError(null);
                }}
                style={{
                  padding: '14px 16px',
                  borderRadius: 14,
                  textAlign: 'left',
                  fontSize: 14,
                  fontWeight: 600,
                  transition: 'all 0.18s',
                  cursor: 'pointer',
                  border: kind === k
                    ? '1.5px solid var(--app-gold)'
                    : '1.5px solid var(--app-border)',
                  background: kind === k
                    ? 'color-mix(in srgb, var(--app-gold) 12%, transparent)'
                    : 'var(--app-card)',
                  color: kind === k ? 'var(--app-text)' : 'var(--app-muted)',
                }}
              >
                {KIND_LABEL[k]}
              </button>
            ))}
          </div>
        </section>

        <section>
          <label
            htmlFor="displayName"
            style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--app-muted)', marginBottom: 8 }}
          >
            What should we call you?{" "}
            <span style={{ fontWeight: 400 }}>(optional)</span>
          </label>
          <AppInput
            id="displayName"
            name="displayName"
            value={displayName}
            onChange={setDisplayName}
            placeholder="e.g. Alex"
            autoComplete="name"
          />
        </section>

        {error ? (
          <p style={{ fontSize: 13, color: '#e05252', background: 'rgba(224,82,82,0.08)', padding: '10px 14px', borderRadius: 10 }}>
            {error}
          </p>
        ) : null}

        <AppBtn type="submit" disabled={busy || !kind} style={{ width: '100%', justifyContent: 'center' }}>
          {busy ? "Saving…" : "Continue to dashboard"}
        </AppBtn>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Verify build passes**

```bash
cd /home/antonio/repo/calisto-landing && npm run build 2>&1 | tail -20
```

Expected: exits 0, no type errors.

- [ ] **Step 4: Commit**

```bash
git add "app/(app)/onboarding/organizer/page.tsx" "app/(app)/onboarding/organizer/OrganizeOnboardingForm.tsx"
git commit -m "feat(app-ui): apply app-shell tokens to onboarding form"
```

---

## Task 3: GuestsManager

**Files:**
- Modify: `app/(app)/events/[id]/_tabs/GuestsManager.tsx`

- [ ] **Step 1: Restyle GuestsManager.tsx**

Replace the entire file content (logic is identical — only the JSX return and imports change):

```tsx
"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { startTransition, useCallback, useEffect, useMemo, useState } from "react";
import { GoldBar } from "@/components/app-ui/GoldBar";
import { AppBtn } from "@/components/app-ui/AppBtn";

type MembershipRole = "organizer" | "guest" | "co_organizer" | string;

type MemberRow = {
  user_id: string;
  role: MembershipRole;
  joined_at: string;
  display_name_at_event: string | null;
};

type MediaRow = {
  uploaded_by: string;
  mime_type: string | null;
};

function isVideoMime(mime: string | null | undefined) {
  return Boolean(mime && mime.startsWith("video/"));
}

function shortId(id: string) {
  if (id.length <= 12) return id;
  return `${id.slice(0, 6)}…${id.slice(-4)}`;
}

export function GuestsManager({ eventId }: Readonly<{ eventId: string }>) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [organizerId, setOrganizerId] = useState<string | null>(null);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [mediaByUser, setMediaByUser] = useState<Map<string, { photos: number; videos: number }>>(() => new Map());

  const isPrimaryOrganizer = Boolean(myUserId && organizerId && myUserId === organizerId);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const sessionRes = await supabase.auth.getSession();
      const uid = sessionRes.data.session?.user.id ?? null;
      setMyUserId(uid);

      const [{ data: ev, error: evErr }, { data: mems, error: memErr }, { data: media, error: mediaErr }] =
        await Promise.all([
          supabase.from("events").select("organizer_id").eq("id", eventId).single(),
          supabase
            .from("event_memberships")
            .select("user_id, role, joined_at, display_name_at_event")
            .eq("event_id", eventId)
            .order("joined_at", { ascending: true }),
          supabase.from("media_items").select("uploaded_by, mime_type").eq("event_id", eventId),
        ]);

      if (evErr) throw new Error(evErr.message);
      if (memErr) throw new Error(memErr.message);
      if (mediaErr) throw new Error(mediaErr.message);

      setOrganizerId((ev as { organizer_id: string } | null)?.organizer_id ?? null);
      setMembers((mems ?? []) as MemberRow[]);

      const map = new Map<string, { photos: number; videos: number }>();
      for (const row of (media ?? []) as MediaRow[]) {
        const key = row.uploaded_by;
        const current = map.get(key) ?? { photos: 0, videos: 0 };
        if (isVideoMime(row.mime_type)) current.videos += 1;
        else current.photos += 1;
        map.set(key, current);
      }
      setMediaByUser(map);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load guests.");
    } finally {
      setLoading(false);
    }
  }, [eventId, supabase]);

  useEffect(() => {
    void load();
  }, [load]);

  function mapRpcErrorMessage(raw: string) {
    if (raw.includes("CANNOT_REMOVE_PRIMARY_ORGANIZER")) return "You can't remove the primary organizer.";
    if (raw.includes("ONLY_PRIMARY_ORGANIZER")) return "Only the primary organizer can change roles.";
    if (raw.includes("NOT_ALLOWED")) return "Not allowed.";
    if (raw.includes("MEMBER_NOT_FOUND")) return "Member not found.";
    return raw || "Action failed.";
  }

  async function removeMember(targetUserId: string) {
    if (busyUserId) return;
    const ok = window.confirm("Remove this member from the event?");
    if (!ok) return;

    setBusyUserId(targetUserId);
    setError(null);
    try {
      const { error: rpcErr } = await supabase.rpc("remove_event_member", {
        p_event_id: eventId,
        p_target_user_id: targetUserId,
      });
      if (rpcErr) throw new Error(mapRpcErrorMessage(rpcErr.message));
      startTransition(() => setMembers((prev) => prev.filter((m) => m.user_id !== targetUserId)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not remove member.");
    } finally {
      setBusyUserId(null);
    }
  }

  async function setCoOrganizer(targetUserId: string, make: boolean) {
    if (busyUserId) return;
    setBusyUserId(targetUserId);
    setError(null);
    try {
      const { error: rpcErr } = await supabase.rpc("set_member_co_organizer_status", {
        p_event_id: eventId,
        p_target_user_id: targetUserId,
        p_make_co_organizer: make,
      });
      if (rpcErr) throw new Error(mapRpcErrorMessage(rpcErr.message));

      startTransition(() =>
        setMembers((prev) =>
          prev.map((m) => (m.user_id === targetUserId ? { ...m, role: make ? "co_organizer" : "guest" } : m)),
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update role.");
    } finally {
      setBusyUserId(null);
    }
  }

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <GoldBar vertical />
            <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 20, color: 'var(--app-text)' }}>
              Guests
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--app-muted)' }}>
            {members.length} member{members.length === 1 ? "" : "s"}
          </p>
        </div>
        <AppBtn variant="ghost" small onClick={() => void load()}>Refresh</AppBtn>
      </div>

      {error ? (
        <p style={{ fontSize: 13, color: '#e05252', background: 'rgba(224,82,82,0.08)', padding: '10px 14px', borderRadius: 10, marginBottom: 16 }}>
          {error}
        </p>
      ) : null}

      {loading ? (
        <p style={{ fontSize: 13, color: 'var(--app-muted)', marginTop: 24 }}>Loading guests…</p>
      ) : null}

      {!loading && members.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--app-muted)', marginTop: 24 }}>No guests have joined yet.</p>
      ) : null}

      {members.length > 0 ? (
        <ul style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {members.map((m) => {
            const isMe = myUserId === m.user_id;
            const isPrimary = organizerId === m.user_id;
            const uploads = mediaByUser.get(m.user_id) ?? { photos: 0, videos: 0 };
            const canRemove = isPrimaryOrganizer && !isPrimary;
            const canPromoteDemote = isPrimaryOrganizer && !isPrimary;
            const busy = busyUserId === m.user_id;
            const display = m.display_name_at_event?.trim() || (isPrimary ? "Organizer" : "Guest");
            const isOrgRole = m.role === "organizer" || m.role === "co_organizer";
            return (
              <li
                key={`${m.user_id}-${m.joined_at}`}
                style={{
                  background: 'var(--app-card)',
                  borderRadius: 18,
                  border: '1.5px solid var(--app-border)',
                  padding: '14px 18px',
                  fontSize: 14,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 700, color: 'var(--app-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {display}
                      {isMe ? (
                        <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 600, color: 'var(--app-gold)' }}>(you)</span>
                      ) : null}
                    </p>
                    <p style={{ marginTop: 4, fontFamily: 'monospace', fontSize: 11, color: 'var(--app-muted)' }} title={m.user_id}>
                      {shortId(m.user_id)}
                    </p>
                    <p style={{ marginTop: 6, fontSize: 11, color: 'var(--app-muted)' }}>
                      Uploads: {uploads.photos} photos • {uploads.videos} videos
                    </p>
                  </div>
                  <span style={{
                    flexShrink: 0,
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    background: isOrgRole
                      ? 'color-mix(in srgb, var(--app-gold) 12%, transparent)'
                      : 'color-mix(in srgb, var(--app-muted) 12%, transparent)',
                    border: isOrgRole
                      ? '1.5px solid color-mix(in srgb, var(--app-gold) 30%, transparent)'
                      : '1.5px solid var(--app-border)',
                    color: isOrgRole ? 'var(--app-gold)' : 'var(--app-muted)',
                  }}>
                    {m.role}
                  </span>
                </div>

                {isPrimaryOrganizer ? (
                  <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {canPromoteDemote && (m.role === "guest" || m.role === "co_organizer") ? (
                      <AppBtn
                        variant="ghost"
                        small
                        disabled={busyUserId !== null}
                        onClick={() => void setCoOrganizer(m.user_id, m.role === "guest")}
                      >
                        {busy
                          ? "Working…"
                          : m.role === "guest"
                            ? "Promote to co‑organizer"
                            : "Demote to guest"}
                      </AppBtn>
                    ) : null}
                    {canRemove ? (
                      <button
                        type="button"
                        disabled={busyUserId !== null}
                        onClick={() => void removeMember(m.user_id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          borderRadius: 10,
                          padding: '9px 18px',
                          fontSize: 13,
                          fontWeight: 600,
                          background: 'rgba(224,82,82,0.10)',
                          border: '1.5px solid rgba(224,82,82,0.4)',
                          color: '#fca5a5',
                          cursor: busyUserId !== null ? 'not-allowed' : 'pointer',
                          opacity: busyUserId !== null ? 0.6 : 1,
                          transition: 'all 0.18s',
                        }}
                      >
                        {busy ? "Removing…" : "Remove"}
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
```

- [ ] **Step 2: Verify build passes**

```bash
cd /home/antonio/repo/calisto-landing && npm run build 2>&1 | tail -20
```

Expected: exits 0, no type errors.

- [ ] **Step 3: Commit**

```bash
git add app/\(app\)/events/\[id\]/_tabs/GuestsManager.tsx
git commit -m "feat(app-ui): apply app-shell tokens to GuestsManager"
```

---

## Task 4: Plan tiers page

**Files:**
- Modify: `app/(app)/plan-tiers/page.tsx`

- [ ] **Step 1: Restyle plan-tiers/page.tsx**

Replace the entire file content:

```tsx
import Link from "next/link";

import { AppCard } from "@/components/app-ui/AppCard";
import { getPlanLimits } from "@/lib/plan-limits";

const PLANS = ["free", "standard", "plus", "premium", "max"] as const;

export default function PlanTiersPage() {
  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-start justify-between gap-3">
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--app-gold)' }}>
              Plans
            </p>
            <h1 style={{ marginTop: 8, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 28, color: 'var(--app-text)', lineHeight: 1.2 }}>
              Plan tiers
            </h1>
            <p style={{ marginTop: 6, fontSize: 14, color: 'var(--app-muted)' }}>
              A quick summary of guest and upload limits.
            </p>
          </div>
          <Link href="/dashboard" style={{ fontSize: 13, color: 'var(--app-gold)', textDecoration: 'underline', flexShrink: 0 }}>
            Back
          </Link>
        </div>

        <div className="grid gap-4">
          {PLANS.map((planId) => {
            const limits = getPlanLimits(planId);
            return (
              <AppCard key={planId} hover style={{ padding: 24 }}>
                <div className="flex items-start justify-between gap-3">
                  <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 20, color: 'var(--app-text)', textTransform: 'capitalize' }}>
                    {planId}
                  </h2>
                  <span style={{
                    flexShrink: 0,
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    background: 'color-mix(in srgb, var(--app-gold) 12%, transparent)',
                    border: '1.5px solid color-mix(in srgb, var(--app-gold) 30%, transparent)',
                    color: 'var(--app-gold)',
                  }}>
                    {limits.uploadDaysAfterEvent} days uploads
                  </span>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {(
                    [
                      { label: "Guests", value: limits.guests },
                      { label: "Photos", value: limits.photos },
                      { label: "Videos", value: limits.videos },
                    ] as const
                  ).map(({ label, value }) => (
                    <div
                      key={label}
                      style={{
                        background: 'var(--app-card-solid)',
                        border: '1.5px solid var(--app-border)',
                        borderRadius: 12,
                        padding: 16,
                      }}
                    >
                      <dt style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--app-muted)' }}>
                        {label}
                      </dt>
                      <dd style={{ marginTop: 8, fontSize: 22, fontWeight: 700, color: 'var(--app-text)' }}>
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </AppCard>
            );
          })}
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify build passes**

```bash
cd /home/antonio/repo/calisto-landing && npm run build 2>&1 | tail -20
```

Expected: exits 0, no type errors.

- [ ] **Step 3: Commit**

```bash
git add "app/(app)/plan-tiers/page.tsx"
git commit -m "feat(app-ui): apply app-shell tokens to plan tiers page"
```

---

## Task 5: Reset password pages

**Files:**
- Modify: `app/auth/reset-password/ResetPasswordForm.tsx`
- Modify: `app/auth/reset-password/success/page.tsx`

These pages live outside `(app)/layout.tsx` so each render state needs its own `<main className="app-shell">` wrapper (matching the `forgot-password` page pattern). Password inputs use raw `<input>` with inline styles + `onFocus`/`onBlur` gold border (same as login/forgot-password — AppInput doesn't expose a `disabled` prop).

- [ ] **Step 1: Restyle ResetPasswordForm.tsx**

Replace the entire file content:

```tsx
"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useRef, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mountedRef.current) return;
      if (session) {
        setHasRecoverySession(true);
        setReady(true);
      }
    });

    async function init() {
      const code = searchParams.get("code");
      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      }
      let {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        await new Promise((r) => setTimeout(r, 200));
        const second = await supabase.auth.getSession();
        session = second.data.session;
      }
      if (!mountedRef.current) return;
      setHasRecoverySession(!!session);
      setReady(true);
    }

    void init();

    return () => {
      subscription.unsubscribe();
    };
  }, [searchParams]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      router.replace("/auth/reset-password/success");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update password.");
    } finally {
      setPending(false);
    }
  }

  const shellStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '100vh', padding: 24,
  };

  if (!ready) {
    return (
      <main className="app-shell" style={shellStyle}>
        <p style={{ fontSize: 14, color: 'var(--app-muted)' }}>Verifying reset link…</p>
      </main>
    );
  }

  if (!hasRecoverySession) {
    return (
      <main className="app-shell" style={shellStyle}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 32, height: 3, background: 'var(--app-gold)', borderRadius: 2, margin: '0 auto 12px' }} />
            <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 36, color: 'var(--app-text)', lineHeight: 1 }}>
              Link expired
            </h1>
          </div>
          <div style={{
            background: 'var(--app-card)', borderRadius: 18,
            border: '1.5px solid var(--app-border)', padding: 32,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            <p style={{ fontSize: 14, color: 'var(--app-muted)', lineHeight: 1.6 }}>
              Open the latest link from your email, or request a new one.
            </p>
            <Link href="/auth/forgot-password" style={{ fontSize: 14, fontWeight: 600, color: 'var(--app-gold)', textDecoration: 'underline' }}>
              Request a new reset link
            </Link>
            <Link href="/auth/login" style={{ fontSize: 13, color: 'var(--app-muted)', textDecoration: 'underline' }}>
              Back to sign in
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell" style={shellStyle}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 32, height: 3, background: 'var(--app-gold)', borderRadius: 2, margin: '0 auto 12px' }} />
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--app-muted)' }}>
            Account
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 40, color: 'var(--app-text)', lineHeight: 1 }}>
            Set a new password
          </h1>
          <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 15, color: 'var(--app-muted)', marginTop: 10 }}>
            Choose a strong password you haven&apos;t used here before.
          </p>
        </div>

        <div style={{
          background: 'var(--app-card)', borderRadius: 18,
          border: '1.5px solid var(--app-border)', padding: 32,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--app-muted)', marginBottom: 8 }}>
                New password
              </div>
              <input
                name="password"
                type="password"
                placeholder="New password"
                autoComplete="new-password"
                value={password}
                onChange={(ev) => {
                  setPassword(ev.target.value);
                  if (error) setError(null);
                }}
                disabled={pending}
                style={{
                  width: '100%', padding: '13px 16px',
                  background: 'var(--app-bg)',
                  border: '1.5px solid var(--app-border)',
                  borderRadius: 12, fontSize: 15, color: 'var(--app-text)',
                  outline: 'none', fontFamily: 'inherit',
                  opacity: pending ? 0.7 : 1,
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--app-gold)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--app-border)')}
              />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--app-muted)', marginBottom: 8 }}>
                Confirm password
              </div>
              <input
                name="confirm"
                type="password"
                placeholder="Confirm new password"
                autoComplete="new-password"
                value={confirm}
                onChange={(ev) => {
                  setConfirm(ev.target.value);
                  if (error) setError(null);
                }}
                disabled={pending}
                style={{
                  width: '100%', padding: '13px 16px',
                  background: 'var(--app-bg)',
                  border: '1.5px solid var(--app-border)',
                  borderRadius: 12, fontSize: 15, color: 'var(--app-text)',
                  outline: 'none', fontFamily: 'inherit',
                  opacity: pending ? 0.7 : 1,
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--app-gold)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--app-border)')}
              />
            </div>
            {error ? (
              <p style={{ fontSize: 13, color: '#e05252', background: 'rgba(224,82,82,0.08)', padding: '10px 14px', borderRadius: 10 }}>
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={pending}
              style={{
                width: '100%', padding: '15px 28px', border: 'none', borderRadius: 14,
                background: 'linear-gradient(135deg, var(--app-purple) 0%, #7B3FBE 100%)',
                color: '#fff', fontSize: 15, fontWeight: 600,
                cursor: pending ? 'not-allowed' : 'pointer',
                opacity: pending ? 0.7 : 1, transition: 'all 0.18s',
                boxShadow: '0 4px 16px color-mix(in srgb, var(--app-purple) 27%, transparent)',
              }}
            >
              {pending ? "Saving…" : "Update password"}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Link href="/auth/login" style={{ fontSize: 13, color: 'var(--app-muted)', textDecoration: 'underline' }}>
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export function ResetPasswordForm() {
  return (
    <Suspense
      fallback={
        <main className="app-shell" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', padding: 24,
        }}>
          <p style={{ fontSize: 14, color: 'var(--app-muted)' }}>Loading…</p>
        </main>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  );
}
```

- [ ] **Step 2: Restyle reset-password/success/page.tsx**

Replace the entire file content:

```tsx
import Link from "next/link";

export default function ResetPasswordSuccessPage() {
  return (
    <main className="app-shell" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 32, height: 3, background: 'var(--app-gold)', borderRadius: 2, margin: '0 auto 12px' }} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 40, color: 'var(--app-text)', lineHeight: 1 }}>
            Password updated
          </h1>
          <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 15, color: 'var(--app-muted)', marginTop: 10 }}>
            You can sign in with your new password.
          </p>
        </div>
        <div style={{
          background: 'var(--app-card)', borderRadius: 18,
          border: '1.5px solid var(--app-border)', padding: 32,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <Link
            href="/auth/login"
            style={{
              display: 'flex', justifyContent: 'center',
              padding: '15px 28px', borderRadius: 14,
              background: 'linear-gradient(135deg, var(--app-purple) 0%, #7B3FBE 100%)',
              color: '#fff', fontSize: 15, fontWeight: 600,
              textDecoration: 'none', transition: 'all 0.18s',
              boxShadow: '0 4px 16px color-mix(in srgb, var(--app-purple) 27%, transparent)',
            }}
          >
            Go to sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Verify build passes**

```bash
cd /home/antonio/repo/calisto-landing && npm run build 2>&1 | tail -20
```

Expected: exits 0, no type errors.

- [ ] **Step 4: Commit**

```bash
git add app/auth/reset-password/ResetPasswordForm.tsx app/auth/reset-password/success/page.tsx
git commit -m "feat(app-ui): apply app-shell tokens to reset password pages"
```
