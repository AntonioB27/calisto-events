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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
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
