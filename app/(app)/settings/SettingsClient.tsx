"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { useAppUi } from "@/components/AppUiProvider";
import { AppBtn } from "@/components/app-ui/AppBtn";
import { AppInput } from "@/components/app-ui/AppInput";
import { Moon, Sun } from "lucide-react";
import { applyCalistoTheme, readCalistoTheme, type CalistoTheme } from "@/lib/calisto-theme";
import type { Locale } from "@/lib/i18n";
import { setUiLocaleCookieClient } from "@/lib/set-ui-locale-cookie-client";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

const GOLD    = '#C5922A';
const GOLD_DK = '#A37118';
const PURPLE  = '#5B2D8E';

const TEXT   = 'var(--app-text)';
const TEXT_S = 'var(--app-text-sub)';
const MUTED  = 'var(--app-muted)';
const BORDER = 'var(--app-border)';

const FB = "'DM Sans', sans-serif";
const FS = "'DM Serif Display', serif";

const glassLight: React.CSSProperties = {
  background: 'rgba(255,255,255,0.62)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: '1px solid rgba(255,255,255,0.78)',
  boxShadow: '0 10px 30px -8px rgba(40,25,15,0.18), inset 0 1px 0 rgba(255,255,255,0.7)',
};
const glassDark: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 10px 30px -8px rgba(0,0,0,0.4)',
};

function SectionMark({ n, label }: { n: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, paddingBottom: 8, borderBottom: `1px solid ${BORDER}`, marginBottom: 14 }}>
      <span style={{ fontFamily: FS, fontStyle: 'italic', fontWeight: 700, fontSize: 26, color: GOLD, letterSpacing: '-0.02em', lineHeight: 1 }}>{n}</span>
      <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: TEXT_S, fontFamily: FB }}>{label}</span>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: MUTED, fontFamily: FB, marginBottom: 7 }}>
      {children}
    </div>
  );
}

type SettingsClientProps = Readonly<{
  email: string;
  initialDisplayName: string;
}>;

const UPLOAD_DISPLAY_NAME_MAX = 80;

export function SettingsClient({ email, initialDisplayName }: SettingsClientProps) {
  const ui = useAppUi();
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
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

  useEffect(() => {
    setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    const obs = new MutationObserver(() =>
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark')
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) { setUploadNameError(ui.settingsClient.uploadNameNotSignedIn); return; }
      const trimmed = uploadName.trim().slice(0, UPLOAD_DISPLAY_NAME_MAX);
      const { error } = await supabase.from("profiles").update({ display_name: trimmed || null }).eq("id", user.id);
      if (error) { setUploadNameError(error.message || ui.settingsClient.uploadNameSaveFail); return; }
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

  const glass = isDark ? glassDark : glassLight;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* ── 01 Profile ─────────────────────────────── */}
      <div>
        <SectionMark n="01" label={ui.settingsClient.profileEyebrow} />
        <div style={{ ...glass, borderRadius: 18, padding: '20px 18px 24px' }}>

          {/* Email */}
          <div style={{ marginBottom: 20 }}>
            <FieldLabel>{ui.settingsClient.signedInAs.replace(/\s*$/, '')}</FieldLabel>
            <div style={{ fontFamily: FB, fontSize: 14, fontWeight: 600, color: TEXT, letterSpacing: '0.01em' }}>
              {email || ui.settingsClient.anon}
            </div>
          </div>

          <div style={{ height: 1, background: BORDER, marginBottom: 20 }} />

          {/* Display name */}
          <FieldLabel>{ui.settingsClient.uploadNameEyebrow}</FieldLabel>
          <AppInput
            id="settings-upload-display-name"
            value={uploadName}
            onChange={(v) => { setUploadName(v.slice(0, UPLOAD_DISPLAY_NAME_MAX)); setUploadNameError(null); setUploadNameOk(false); }}
            placeholder={ui.settingsClient.uploadNamePlaceholder}
            maxLength={UPLOAD_DISPLAY_NAME_MAX}
            autoComplete="nickname"
          />
          {uploadNameError && (
            <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--app-danger)', fontFamily: FB }}>{uploadNameError}</p>
          )}
          <p style={{ margin: '8px 0 14px', fontFamily: FS, fontStyle: 'italic', fontSize: 12, color: MUTED, lineHeight: 1.45 }}>
            {ui.settingsClient.uploadNameHint}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <AppBtn type="button" variant="gold" size="sm" disabled={!uploadNameDirty || uploadNameSaving} loading={uploadNameSaving} onClick={() => void onSaveUploadName()}>
              {ui.settingsClient.saveUploadName}
            </AppBtn>
            {uploadNameOk && (
              <span style={{ fontSize: 12, fontWeight: 600, color: GOLD, fontFamily: FB }}>{ui.settingsClient.uploadNameSaved}</span>
            )}
          </div>

        </div>
      </div>

      {/* ── 02 Language ────────────────────────────── */}
      <div>
        <SectionMark n="02" label={ui.settingsClient.languageEyebrow} />
        <div style={{ ...glass, borderRadius: 18, padding: '20px 18px 24px' }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {(
              [
                { key: "en", flag: "🇬🇧", label: ui.settingsClient.langEnglish },
                { key: "hr", flag: "🇭🇷", label: ui.settingsClient.langHrvatski },
                { key: "de", flag: "🇩🇪", label: ui.settingsClient.langDeutsch },
              ] as const
            ).map(({ key: localeKey, flag, label }) => {
              const active = ui.locale === localeKey;
              return (
                <button
                  key={localeKey}
                  type="button"
                  onClick={() => { setUiLocaleCookieClient(localeKey as Locale); router.refresh(); }}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                    padding: '10px 16px', borderRadius: 12, cursor: 'pointer',
                    background: active ? 'rgba(197,146,42,0.14)' : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.55)',
                    border: active ? `1.5px solid ${GOLD}` : `1px solid ${BORDER}`,
                    boxShadow: active ? `0 0 0 1px ${GOLD}22` : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 26, lineHeight: 1 }}>{flag}</span>
                  <span style={{ fontFamily: FB, fontSize: 10, fontWeight: active ? 700 : 500, letterSpacing: '0.06em', color: active ? GOLD_DK : MUTED, textTransform: 'uppercase' }}>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 03 Appearance ──────────────────────────── */}
      <div>
        <SectionMark n="03" label={ui.settingsClient.appearanceEyebrow} />
        <div style={{ ...glass, borderRadius: 18, padding: '20px 18px 24px' }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {(
              [
                { key: "dark" as CalistoTheme, Icon: Moon, label: ui.settingsClient.themeDarkLabel },
                { key: "light" as CalistoTheme, Icon: Sun, label: ui.settingsClient.themeLightLabel },
              ]
            ).map(({ key: t, Icon, label }) => {
              const active = theme === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => applyTheme(t)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    padding: '12px 24px', borderRadius: 12, cursor: 'pointer',
                    background: active ? 'rgba(197,146,42,0.14)' : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.55)',
                    border: active ? `1.5px solid ${GOLD}` : `1px solid ${BORDER}`,
                    boxShadow: active ? `0 0 0 1px ${GOLD}22` : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  <Icon size={22} color={active ? GOLD : isDark ? '#b5ab99' : '#9a8570'} strokeWidth={1.6} />
                  <span style={{ fontFamily: FB, fontSize: 10, fontWeight: active ? 700 : 500, letterSpacing: '0.06em', color: active ? GOLD_DK : MUTED, textTransform: 'uppercase' }}>{label}</span>
                </button>
              );
            })}
          </div>
          <p style={{ margin: '12px 0 0', fontFamily: FS, fontStyle: 'italic', fontSize: 12, color: MUTED, lineHeight: 1.45 }}>
            {ui.settingsClient.appliesNote}
          </p>
        </div>
      </div>

      {/* ── Account actions ────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', paddingTop: 4 }}>
        <AppBtn variant="danger" type="button" disabled={signingOut} loading={signingOut} onClick={() => void onSignOut()}>
          {ui.settingsClient.signOut}
        </AppBtn>
        <AppBtn variant="ghost" size="sm" href="/dashboard" as={Link}>
          {ui.settingsClient.backEvents}
        </AppBtn>
      </div>

    </div>
  );
}
