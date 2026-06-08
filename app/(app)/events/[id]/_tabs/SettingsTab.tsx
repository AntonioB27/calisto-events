"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useAppUi } from "@/components/AppUiProvider";
import { AppBtn } from "@/components/app-ui/AppBtn";
import { AppInput } from "@/components/app-ui/AppInput";
import { ConfirmDialog } from "@/components/app-ui/ConfirmDialog";
import { composeEventTitle } from "@/lib/event-title";
import { bcp47FromUiLocale } from "@/lib/locale-bcp47";
import type { PlanId } from "@/lib/plan-limits";
import { normalizePlanId } from "@/lib/plan-limits";
import { maybeCreateSupabaseBrowserClient } from "@/lib/supabase-browser";
import { BANNER_THEMES, normalizeBannerTheme, type BannerThemeId } from "@/lib/banner-theme";

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

function toDateInputUtc(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
  const da = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${mo}-${da}`;
}

function utcMiddayIsoFromDateInput(dateStr: string): string | null {
  const parts = dateStr.trim().split("-").map((x) => parseInt(x, 10));
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
  const [y, m, d] = parts;
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0)).toISOString();
}

type SettingsTabProps = Readonly<{
  eventId: string;
  storedEmoji: string;
  storedName: string;
  /** Full `events.title` as stored — used only for destructive delete confirmation. */
  fullStoredTitle: string;
  eventDate: string;
  plan: string;
  accessCode: string;
  bannerTheme?: string;
  moderationEnabled: boolean;
}>;

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

export function SettingsTab({
  eventId,
  storedEmoji,
  storedName,
  fullStoredTitle,
  eventDate,
  plan,
  accessCode,
  bannerTheme,
  moderationEnabled: initialModerationEnabled,
}: SettingsTabProps) {
  const ui = useAppUi();
  const router = useRouter();
  const supabase = maybeCreateSupabaseBrowserClient();
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    const obs = new MutationObserver(() =>
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark')
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  const [name, setName] = useState(storedName);
  const [emoji, setEmoji] = useState(storedEmoji);
  const [activeTheme, setActiveTheme] = useState<BannerThemeId>(() => normalizeBannerTheme(bannerTheme));
  const [themeSaving, setThemeSaving] = useState(false);

  async function saveTheme(id: BannerThemeId) {
    if (!supabase || id === activeTheme) return;
    setActiveTheme(id);
    setThemeSaving(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('events').update({ banner_theme: id }).eq('id', eventId);
      router.refresh();
    } finally {
      setThemeSaving(false);
    }
  }
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletePhrase, setDeletePhrase] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [modEnabled, setModEnabled] = useState(initialModerationEnabled);
  const [modSaving, setModSaving] = useState(false);
  const [modError, setModError] = useState<string | null>(null);
  const titleTrim = fullStoredTitle.trim();
  const phraseTrim = deletePhrase.trim();
  const typedDeleteWord = phraseTrim.toUpperCase() === "DELETE";
  const typedMatchesTitle = phraseTrim === titleTrim;
  const canArmDelete = typedDeleteWord || typedMatchesTitle;

  useEffect(() => {
    setName(storedName);
    setEmoji(storedEmoji);
  }, [storedName, storedEmoji]);

  useEffect(() => {
    setScheduleDate(toDateInputUtc(eventDate));
  }, [eventDate]);

  useEffect(() => {
    if (!pickerOpen) return;
    const onDocDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (boxRef.current?.contains(target)) return;
      setPickerOpen(false);
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [pickerOpen]);

  const isEventStarted = useMemo(() => {
    const mm = eventDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!mm) return false;
    return Date.now() >= new Date(Number(mm[1]), Number(mm[2]) - 1, Number(mm[3])).getTime();
  }, [eventDate]);

  const formattedDate = useMemo(() => {
    try {
      return new Date(eventDate).toLocaleDateString(bcp47FromUiLocale(ui.locale), {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return eventDate;
    }
  }, [eventDate, ui.locale]);

  async function requestDeleteEvent() {
    setDeleteBusy(true);
    try {
      const body = typedDeleteWord
        ? { deleteWordConfirm: "DELETE" }
        : { eventTitleConfirm: phraseTrim };
      const res = await fetch(`/api/events/${eventId}/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await res.json()) as { error?: string };
      if (!res.ok) {
        const code = payload.error ?? "";
        if (code === "CONFIRM_MISMATCH") {
          throw new Error(ui.settingsTab.confirmMismatch);
        }
        throw new Error(
          code === "EVENT_DELETED_STORAGE_INCOMPLETE"
            ? ui.settingsTab.deleteStorageIncomplete
            : ui.settingsTab.deleteFail,
        );
      }
      setDeleteConfirmOpen(false);
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : ui.settingsTab.deleteFail);
    } finally {
      setDeleteBusy(false);
    }
  }

  async function saveNameAndEmoji() {
    if (!supabase || saving) return;
    const title = composeEventTitle(emoji, name);
    setSaving(true);
    setError(null);
    try {
      const { error: upErr } = await supabase.from("events").update({ title }).eq("id", eventId);
      if (upErr) throw new Error(upErr.message);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : ui.settingsTab.genericSaveFail);
    } finally {
      setSaving(false);
    }
  }

  const dirty = name.trim() !== storedName.trim() || emoji.trim() !== storedEmoji.trim();
  const scheduleDirty = scheduleDate !== toDateInputUtc(eventDate);

  async function saveSchedule() {
    if (!supabase || scheduleSaving || !scheduleDirty) return;
    const iso = utcMiddayIsoFromDateInput(scheduleDate);
    if (!iso) {
      setError(ui.settingsTab.validDateNeeded);
      return;
    }
    setScheduleSaving(true);
    setError(null);
    try {
      const { error: upErr } = await supabase.from("events").update({ event_date: iso }).eq("id", eventId);
      if (upErr) throw new Error(upErr.message);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : ui.settingsTab.scheduleSaveFail);
    } finally {
      setScheduleSaving(false);
    }
  }

  async function saveModeration(next: boolean) {
    setModSaving(true);
    setModError(null);
    try {
      const res = await fetch(`/api/events/${eventId}/moderation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_mode", enabled: next }),
      });
      if (!res.ok) throw new Error();
      setModEnabled(next);
      router.refresh();
    } catch {
      setModError(ui.settingsTab.moderationSaveFail);
    } finally {
      setModSaving(false);
    }
  }

  const glass = isDark ? glassDark : glassLight;

  if (!supabase) {
    return (
      <section style={{ padding: '18px 16px 48px' }}>
        <div style={{ ...glass, borderRadius: 18, padding: 20, border: '1.5px solid color-mix(in srgb, var(--app-danger) 35%, var(--app-border))' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--app-danger)', fontFamily: FB }}>
            {ui.supabase.missingTitle}
          </div>
          <p style={{ margin: '8px 0 0', fontFamily: FS, fontStyle: 'italic', fontSize: 14, color: MUTED, lineHeight: 1.55 }}>
            {ui.supabase.settingsBody}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section style={{ padding: '18px 16px 48px', display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* Page title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0 20px' }}>
        <span style={{ width: 18, height: 2, background: GOLD, borderRadius: 1, flexShrink: 0 }} />
        <h1 style={{ margin: 0, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: GOLD_DK, fontFamily: FB }}>{ui.settingsTab.heading}</h1>
      </div>

      {error && (
        <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 12, background: 'color-mix(in srgb, var(--app-danger) 10%, transparent)', border: '1.5px solid color-mix(in srgb, var(--app-danger) 35%, transparent)' }}>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--app-danger)', fontFamily: FB }}>{error}</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* ── 01 Name & icon ─────────────────────────── */}
        <div>
          <SectionMark n="01" label={ui.settingsTab.sectionNameIcon} />
          <div style={{ ...glass, borderRadius: 18, padding: '20px 18px 24px' }}>

            <FieldLabel>{ui.settingsTab.eventNameLabel}</FieldLabel>
            <AppInput
              id="settings-event-name"
              value={name}
              onChange={setName}
              placeholder={ui.settingsTab.namePlaceholder}
              maxLength={120}
            />

            <div style={{ height: 1, background: BORDER, margin: '20px 0' }} />

            <div ref={boxRef} style={{ position: 'relative' }}>
              <FieldLabel>{ui.settingsTab.iconEyebrow}</FieldLabel>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <div
                  aria-label={ui.settingsTab.emojiAria}
                  style={{
                    width: 56, height: 56, borderRadius: 16, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 28,
                    background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.7)',
                    border: `1.5px solid ${BORDER}`,
                  }}
                >
                  {emoji.trim() ? <span className="calisto-emoji-upright">{emoji}</span> : ui.settingsClient.anon}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <AppBtn type="button" variant="outline" size="sm" onClick={() => setPickerOpen((v) => !v)}>
                    {pickerOpen ? ui.settingsTab.closePicker : ui.settingsTab.chooseEmoji}
                  </AppBtn>
                  <AppBtn type="button" variant="ghost" size="sm" onClick={() => setEmoji('')}>
                    {ui.settingsTab.noIcon}
                  </AppBtn>
                </div>
              </div>
              {pickerOpen && (
                <div
                  role="dialog"
                  aria-label={ui.settingsTab.emojiPickerAria}
                  style={{ marginTop: 12, zIndex: 20, borderRadius: 16, overflow: 'hidden', border: `1.5px solid ${BORDER}`, boxShadow: 'var(--app-shadow-lg)', background: 'var(--app-surface)', width: 'fit-content', maxWidth: '100%' }}
                >
                  <EmojiPicker width={320} height={400} lazyLoadEmojis skinTonesDisabled onEmojiClick={(data: EmojiClickData) => { setEmoji(data.emoji); setPickerOpen(false); }} />
                </div>
              )}
              <p style={{ margin: '10px 0 0', fontFamily: FS, fontStyle: 'italic', fontSize: 12, color: MUTED, lineHeight: 1.45 }}>{ui.settingsTab.iconHint}</p>
            </div>

            <div style={{ marginTop: 22, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <AppBtn type="button" variant="gold" size="sm" disabled={!dirty || saving} loading={saving} onClick={() => void saveNameAndEmoji()}>
                {ui.settingsTab.saveChanges}
              </AppBtn>
              <AppBtn type="button" variant="ghost" size="sm" disabled={!dirty || saving} onClick={() => { setName(storedName); setEmoji(storedEmoji); setError(null); }}>
                {ui.settingsTab.reset}
              </AppBtn>
            </div>
          </div>
        </div>

        {/* ── 02 Banner style ────────────────────────── */}
        <div>
          <SectionMark n="02" label="Banner style" />
          <div style={{ ...glass, borderRadius: 18, padding: '20px 18px 22px' }}>
            <FieldLabel>Choose a style for your event banner</FieldLabel>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
              {BANNER_THEMES.map(theme => {
                const isActive = theme.id === activeTheme;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    disabled={themeSaving}
                    onClick={() => void saveTheme(theme.id)}
                    style={{ padding: 0, background: 'none', border: 'none', cursor: themeSaving ? 'wait' : 'pointer', display: 'flex', flexDirection: 'column', gap: 6, outline: 'none' }}
                  >
                    <div style={{
                      width: 96, height: 54, borderRadius: 10, overflow: 'hidden', position: 'relative',
                      background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.65)',
                      border: isActive ? `2px solid ${GOLD}` : `1.5px solid ${BORDER}`,
                      boxShadow: isActive ? `0 0 0 3px rgba(197,146,42,0.2)` : 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}>
                      <div style={{ position: 'absolute', inset: 0, background: theme.gradient }} />
                      <div style={{ position: 'absolute', inset: 0, backgroundImage: theme.pattern, backgroundSize: theme.patternSize }} />
                      <div style={{ position: 'absolute', bottom: 6, left: 6, right: 6, background: 'rgba(255,255,255,0.22)', borderRadius: 20, padding: '2px 7px', border: '1px solid rgba(255,255,255,0.3)' }}>
                        <span style={{ fontFamily: FS, fontStyle: 'italic', fontWeight: 700, fontSize: 8, color: 'rgba(255,255,255,0.9)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {storedName || 'My Event'}
                        </span>
                      </div>
                      {isActive && (
                        <div style={{ position: 'absolute', top: 5, right: 5, width: 16, height: 16, borderRadius: '50%', background: GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="9" height="9" viewBox="0 0 16 16" fill="none" aria-hidden>
                            <path d="M3 8l4 4 6-6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <span style={{ fontFamily: FB, fontSize: 10, fontWeight: isActive ? 600 : 400, color: isActive ? GOLD : MUTED, textAlign: 'center', display: 'block' }}>
                      {theme.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── 03 Moderation ─────────────────────────── */}
        <div>
          <SectionMark n="03" label={ui.settingsTab.moderationHeading} />
          <div style={{ ...glass, borderRadius: 18, padding: '20px 18px 22px' }}>
            <p style={{ margin: '0 0 16px', fontFamily: FS, fontStyle: 'italic', fontSize: 13, color: MUTED, lineHeight: 1.55 }}>
              {ui.settingsTab.moderationHint}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <AppBtn
                type="button"
                variant={modEnabled ? 'gold' : 'outline'}
                size="sm"
                disabled={modSaving || modEnabled}
                loading={modSaving && !modEnabled}
                onClick={() => void saveModeration(true)}
              >
                {ui.settingsTab.moderationOn}
              </AppBtn>
              <AppBtn
                type="button"
                variant={!modEnabled ? 'gold' : 'outline'}
                size="sm"
                disabled={modSaving || !modEnabled}
                loading={modSaving && modEnabled}
                onClick={() => void saveModeration(false)}
              >
                {ui.settingsTab.moderationOff}
              </AppBtn>
            </div>
            {modError ? (
              <p style={{ margin: '10px 0 0', fontSize: 12, color: 'var(--app-danger)' }}>{modError}</p>
            ) : null}
          </div>
        </div>

        {/* ── 04 Schedule ────────────────────────────── */}
        <div>
          <SectionMark n="04" label={ui.settingsTab.sectionSchedule} />
          <div style={{ ...glass, borderRadius: 18, padding: '20px 18px 24px' }}>

            <p style={{ margin: '0 0 18px', fontFamily: FS, fontStyle: 'italic', fontSize: 14, color: MUTED, lineHeight: 1.6 }}>
              {ui.settingsTab.scheduleNoteLead}
              <strong style={{ color: TEXT, fontStyle: 'normal', fontFamily: FB, fontSize: 13, fontWeight: 600 }}>{formattedDate}</strong>
              {ui.settingsTab.scheduleNoteTrail}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <FieldLabel>{ui.settingsTab.eventDateUtc}</FieldLabel>
                <AppInput id="settings-event-date" type="date" value={scheduleDate} onChange={setScheduleDate} disabled={isEventStarted} />
              </div>
              <div>
                <FieldLabel>{ui.settingsTab.planTier}</FieldLabel>
                <div style={{ padding: '10px 12px', borderRadius: 'var(--app-radius-md, 12px)', border: `1px solid ${BORDER}`, background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', fontSize: 14, color: TEXT, fontFamily: FB }}>
                  {ui.plans[normalizePlanId(plan)]}
                </div>
              </div>
            </div>

            {isEventStarted && (
              <div style={{
                marginTop: 16,
                padding: '10px 14px',
                borderRadius: 10,
                background: isDark ? 'rgba(197,146,42,0.12)' : 'rgba(197,146,42,0.10)',
                border: `1px solid ${isDark ? 'rgba(197,146,42,0.25)' : 'rgba(197,146,42,0.35)'}`,
                display: 'flex', alignItems: 'flex-start', gap: 8,
              }}>
                <span aria-hidden style={{ fontSize: 13, lineHeight: 1.5, flexShrink: 0 }}>🔒</span>
                <span style={{ fontSize: 12, color: isDark ? '#d4b86a' : '#7A5010', fontFamily: FB, lineHeight: 1.5 }}>
                  {ui.settingsTab.dateLockNotice}
                </span>
              </div>
            )}

            <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <AppBtn type="button" variant="gold" size="sm" disabled={isEventStarted || !scheduleDirty || scheduleSaving} loading={scheduleSaving} onClick={() => void saveSchedule()}>
                {ui.settingsTab.saveSchedule}
              </AppBtn>
              <AppBtn type="button" variant="ghost" size="sm" disabled={isEventStarted || !scheduleDirty || scheduleSaving} onClick={() => { setScheduleDate(toDateInputUtc(eventDate)); setError(null); }}>
                {ui.settingsTab.reset}
              </AppBtn>
            </div>

            <div style={{ height: 1, background: BORDER, margin: '22px 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: MUTED, fontFamily: FB }}>{ui.settingsTab.joinCodeEyebrow}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 16, color: TEXT, letterSpacing: '0.08em' }}>{accessCode}</div>
            </div>

            <AppBtn as={Link} href="/dashboard" variant="outline" size="sm" style={{ marginTop: 16 }}>
              {ui.settingsTab.dashboardBack}
            </AppBtn>
          </div>
        </div>

        {/* ── 05 Danger zone ─────────────────────────── */}
        <div>
          <SectionMark n="05" label={ui.settingsTab.dangerEyebrow} />
          <ConfirmDialog
            open={deleteConfirmOpen}
            title={ui.settingsTab.deleteTitleForever}
            message={ui.settingsTab.deleteDialogBody}
            confirmLabel={ui.settingsTab.deleteConfirmLabel}
            cancelLabel={ui.common.cancel}
            variant="danger"
            busy={deleteBusy}
            onConfirm={() => void requestDeleteEvent()}
            onCancel={() => { if (!deleteBusy) setDeleteConfirmOpen(false); }}
          />
          <div style={{
            ...glass,
            borderRadius: 18,
            padding: '20px 18px 24px',
            border: '1.5px solid color-mix(in srgb, var(--app-danger) 30%, var(--app-border))',
          }}>
            <p style={{ margin: '0 0 8px', fontFamily: FB, fontSize: 13, fontWeight: 600, color: 'var(--app-danger)' }}>
              {ui.settingsTab.deleteDangerNote}
            </p>
            <p style={{ margin: '0 0 16px', fontFamily: FS, fontStyle: 'italic', fontSize: 14, color: MUTED, lineHeight: 1.55 }}>
              {ui.settingsTab.deleteInstructionLead}
              <strong style={{ color: TEXT, fontStyle: 'normal', fontFamily: FB, fontWeight: 600, fontSize: 13 }}>
                {titleTrim || ui.settingsTab.exactParen}
              </strong>{' '}
              {ui.settingsTab.deleteInstructionTrail}
              <strong style={{ color: TEXT, fontStyle: 'normal', fontFamily: FB, fontWeight: 600, fontSize: 13 }}>{ui.settingsTab.deletePhraseWord}</strong>.
            </p>
            <FieldLabel>{ui.settingsTab.deleteConfirmPhraseLabel}</FieldLabel>
            <AppInput
              id="settings-delete-phrase"
              value={deletePhrase}
              onChange={setDeletePhrase}
              placeholder={ui.settingsTab.deletePlaceholderTitleOrWord}
            />
            <AppBtn type="button" variant="danger" size="sm" style={{ marginTop: 16 }} disabled={!canArmDelete || deleteBusy} loading={deleteBusy} onClick={() => setDeleteConfirmOpen(true)}>
              {ui.settingsTab.deleteButton}
            </AppBtn>
          </div>
        </div>

      </div>
    </section>
  );
}
