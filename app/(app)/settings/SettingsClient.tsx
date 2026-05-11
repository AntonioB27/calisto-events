"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { useAppUi } from "@/components/AppUiProvider";
import { AppBtn } from "@/components/app-ui/AppBtn";
import { AppFormRow } from "@/components/app-ui/AppFormRow";
import { AppInput } from "@/components/app-ui/AppInput";
import { GoldBar } from "@/components/app-ui/GoldBar";
import { applyCalistoTheme, readCalistoTheme, type CalistoTheme } from "@/lib/calisto-theme";
import type { Locale } from "@/lib/i18n";
import { setUiLocaleCookieClient } from "@/lib/set-ui-locale-cookie-client";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type SettingsClientProps = Readonly<{
  email: string;
  initialDisplayName: string;
}>;

const UPLOAD_DISPLAY_NAME_MAX = 80;

export function SettingsClient({ email, initialDisplayName }: SettingsClientProps) {
  const ui = useAppUi();
  const router = useRouter();
  const [theme, setTheme] = useState<CalistoTheme>("dark");
  const [signingOut, setSigningOut] = useState(false);
  const [uploadName, setUploadName] = useState(initialDisplayName);
  const [uploadNameSaving, setUploadNameSaving] = useState(false);
  const [uploadNameError, setUploadNameError] = useState<string | null>(null);
  const [uploadNameOk, setUploadNameOk] = useState(false);

  useEffect(() => {
    setUploadName(initialDisplayName);
  }, [initialDisplayName]);

  useEffect(() => {
    queueMicrotask(() => setTheme(readCalistoTheme()));
  }, []);

  const applyTheme = useCallback((t: CalistoTheme) => {
    setTheme(t);
    applyCalistoTheme(t);
  }, []);

  const uploadNameDirty = uploadName.trim() !== initialDisplayName.trim();

  async function onSaveUploadName() {
    setUploadNameSaving(true);
    setUploadNameError(null);
    setUploadNameOk(false);
    try {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.id) {
        setUploadNameError(ui.settingsClient.uploadNameNotSignedIn);
        return;
      }
      const trimmed = uploadName.trim().slice(0, UPLOAD_DISPLAY_NAME_MAX);
      const { error } = await supabase.from("profiles").update({ display_name: trimmed || null }).eq("id", user.id);
      if (error) {
        setUploadNameError(error.message || ui.settingsClient.uploadNameSaveFail);
        return;
      }
      setUploadNameOk(true);
      router.refresh();
    } catch {
      setUploadNameError(ui.settingsClient.uploadNameSaveFail);
    } finally {
      setUploadNameSaving(false);
    }
  }

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

        <div style={{ marginTop: 22 }}>
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
              {ui.settingsClient.uploadNameEyebrow}
            </span>
          </div>
          <AppFormRow label={ui.settingsClient.uploadNameLabel} labelFor="settings-upload-display-name" errorText={uploadNameError}>
            <AppInput
              id="settings-upload-display-name"
              value={uploadName}
              onChange={(v) => {
                setUploadName(v.slice(0, UPLOAD_DISPLAY_NAME_MAX));
                setUploadNameError(null);
                setUploadNameOk(false);
              }}
              placeholder={ui.settingsClient.uploadNamePlaceholder}
              maxLength={UPLOAD_DISPLAY_NAME_MAX}
              autoComplete="nickname"
            />
          </AppFormRow>
          <p style={{ marginTop: 8, fontSize: 12, color: "var(--app-muted)", lineHeight: 1.45 }}>
            {ui.settingsClient.uploadNameHint}
          </p>
          <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
            <AppBtn
              type="button"
              variant="gold"
              size="sm"
              disabled={!uploadNameDirty || uploadNameSaving}
              loading={uploadNameSaving}
              onClick={() => void onSaveUploadName()}
            >
              {ui.settingsClient.saveUploadName}
            </AppBtn>
            {uploadNameOk ? (
              <span style={{ fontSize: 13, color: "var(--app-gold)", fontWeight: 600 }}>{ui.settingsClient.uploadNameSaved}</span>
            ) : null}
          </div>
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
