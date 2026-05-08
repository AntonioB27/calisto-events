"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { AppBtn } from "@/components/app-ui/AppBtn";
import { GoldBar } from "@/components/app-ui/GoldBar";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type SettingsClientProps = Readonly<{
  email: string;
}>;

export function SettingsClient({ email }: SettingsClientProps) {
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("light");
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
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(["dark", "light"] as const).map((t) => (
            <AppBtn
              key={t}
              type="button"
              variant={theme === t ? "gold" : "outline"}
              size="sm"
              onClick={() => applyTheme(t)}
              style={{ textTransform: "capitalize" }}
            >
              {t}
            </AppBtn>
          ))}
        </div>
        <p style={{ marginTop: 8, fontSize: 11, color: 'var(--app-muted)' }}>
          Applies to pages that support light and dark.
        </p>
      </section>

      <section>
        <AppBtn variant="danger" type="button" disabled={signingOut} loading={signingOut} onClick={() => void onSignOut()}>
          Sign out
        </AppBtn>
      </section>

      <p style={{ fontSize: 13, color: "var(--app-muted)" }}>
        <AppBtn variant="ghost" size="sm" href="/dashboard" as={Link}>
          ← Back to events
        </AppBtn>
      </p>
    </div>
  );
}
