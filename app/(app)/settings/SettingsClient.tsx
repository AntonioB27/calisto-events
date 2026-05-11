"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { useAppUi } from "@/components/AppUiProvider";
import { AppBtn } from "@/components/app-ui/AppBtn";
import { GoldBar } from "@/components/app-ui/GoldBar";
import { applyCalistoTheme, readCalistoTheme, type CalistoTheme } from "@/lib/calisto-theme";
import type { Locale } from "@/lib/i18n";
import { setUiLocaleCookieClient } from "@/lib/set-ui-locale-cookie-client";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type SettingsClientProps = Readonly<{
  email: string;
}>;

export function SettingsClient({ email }: SettingsClientProps) {
  const ui = useAppUi();
  const router = useRouter();
  const [theme, setTheme] = useState<CalistoTheme>("dark");
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setTheme(readCalistoTheme()));
  }, []);

  const applyTheme = useCallback((t: CalistoTheme) => {
    setTheme(t);
    applyCalistoTheme(t);
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
      <section id="profile" style={{ scrollMarginTop: 88 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <GoldBar vertical />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--app-muted)' }}>
            {ui.settingsClient.profileEyebrow}
          </span>
        </div>
        <p style={{ fontSize: 14, color: "var(--app-muted)" }}>
          {ui.settingsClient.signedInAs}
          <span style={{ fontWeight: 600, color: "var(--app-text)" }}>{email || ui.settingsClient.anon}</span>
        </p>
      </section>

      <section>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <GoldBar vertical />
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--app-muted)",
            }}
          >
            {ui.settingsClient.languageEyebrow}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(
            [
              ["en", ui.settingsClient.langEnglish],
              ["hr", ui.settingsClient.langHrvatski],
              ["de", ui.settingsClient.langDeutsch],
            ] as const
          ).map(([localeKey, label]) => (
            <AppBtn
              key={localeKey}
              type="button"
              variant={ui.locale === localeKey ? "gold" : "outline"}
              size="sm"
              onClick={() => {
                setUiLocaleCookieClient(localeKey as Locale);
                router.refresh();
              }}
            >
              {label}
            </AppBtn>
          ))}
        </div>
      </section>

      <section>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <GoldBar vertical />
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--app-muted)",
            }}
          >
            {ui.settingsClient.appearanceEyebrow}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(
            [
              ["dark", ui.settingsClient.themeDarkLabel],
              ["light", ui.settingsClient.themeLightLabel],
            ] as const
          ).map(([t, label]) => (
            <AppBtn key={t} type="button" variant={theme === t ? "gold" : "outline"} size="sm" onClick={() => applyTheme(t)}>
              {label}
            </AppBtn>
          ))}
        </div>
        <p style={{ marginTop: 8, fontSize: 11, color: "var(--app-muted)" }}>
          {ui.settingsClient.appliesNote}
        </p>
      </section>

      <section>
        <AppBtn variant="danger" type="button" disabled={signingOut} loading={signingOut} onClick={() => void onSignOut()}>
          {ui.settingsClient.signOut}
        </AppBtn>
      </section>

      <p style={{ fontSize: 13, color: "var(--app-muted)" }}>
        <AppBtn variant="ghost" size="sm" href="/dashboard" as={Link}>
          {ui.settingsClient.backEvents}
        </AppBtn>
      </p>
    </div>
  );
}
