"use client";

import { useRouter } from "next/navigation";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { Lock, SmilePlus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useAppUi } from "@/components/AppUiProvider";
import { AppBtn } from "@/components/app-ui/AppBtn";
import { AppInput } from "@/components/app-ui/AppInput";
import { ConfirmDialog } from "@/components/app-ui/ConfirmDialog";
import { Switch } from "@/components/app-ui/Switch";
import { TabHeader } from "@/components/app-ui/TabHeader";
import { composeEventTitle } from "@/lib/event-title";
import { bcp47FromUiLocale } from "@/lib/locale-bcp47";
import { getRetentionDeletionEndMs, normalizePlanId } from "@/lib/plan-limits";
import { maybeCreateSupabaseBrowserClient } from "@/lib/supabase-browser";
import { BANNER_THEMES, normalizeBannerTheme, type BannerThemeId } from "@/lib/banner-theme";
import { UpgradeSettingsButton } from "../_components/UpgradePlan";
import "./settings.css";

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
  /** Full `events.title` as stored, used only for destructive delete confirmation. */
  fullStoredTitle: string;
  eventDate: string;
  plan: string;
  accessCode: string;
  bannerTheme?: string;
  moderationEnabled: boolean;
}>;

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
  const t = ui.settingsTab;
  const router = useRouter();
  const supabase = maybeCreateSupabaseBrowserClient();
  const boxRef = useRef<HTMLDivElement | null>(null);

  const [name, setName] = useState(storedName);
  const [emoji, setEmoji] = useState(storedEmoji);
  const [activeTheme, setActiveTheme] = useState<BannerThemeId>(() => normalizeBannerTheme(bannerTheme));
  const [themeSaving, setThemeSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletePhrase, setDeletePhrase] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(() => toDateInputUtc(eventDate));
  const [modEnabled, setModEnabled] = useState(initialModerationEnabled);
  const [modSaving, setModSaving] = useState(false);
  const [modError, setModError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
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

  const locale = bcp47FromUiLocale(ui.locale);
  const formattedDate = useMemo(() => {
    try {
      return new Date(eventDate).toLocaleDateString(locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      });
    } catch {
      return eventDate;
    }
  }, [eventDate, locale]);

  const planId = normalizePlanId(plan);
  const deletionMs = getRetentionDeletionEndMs({ planId, eventDate });
  const keptLine = deletionMs
    ? t.keptUntil.replace("{date}", new Date(deletionMs).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" }))
    : null;

  const nameDirty = name.trim() !== storedName.trim() || emoji.trim() !== storedEmoji.trim();
  const scheduleDirty = !isEventStarted && scheduleDate !== toDateInputUtc(eventDate);
  const dirty = nameDirty || scheduleDirty;

  async function saveTheme(id: BannerThemeId) {
    if (!supabase || id === activeTheme) return;
    const prev = activeTheme;
    setActiveTheme(id);
    setThemeSaving(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: upErr } = await (supabase as any).from("events").update({ banner_theme: id }).eq("id", eventId);
      if (upErr) setActiveTheme(prev);
      else router.refresh();
    } finally {
      setThemeSaving(false);
    }
  }

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
          throw new Error(t.confirmMismatch);
        }
        throw new Error(
          code === "EVENT_DELETED_STORAGE_INCOMPLETE"
            ? t.deleteStorageIncomplete
            : t.deleteFail,
        );
      }
      setDeleteConfirmOpen(false);
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : t.deleteFail);
      // Close the dialog so the error next to the delete field is visible.
      setDeleteConfirmOpen(false);
    } finally {
      setDeleteBusy(false);
    }
  }

  /** Saves name/icon and date together; only changed fields are sent. */
  async function saveChanges() {
    if (!supabase || saving || !dirty) return;
    const update: { title?: string; event_date?: string } = {};
    if (nameDirty) update.title = composeEventTitle(emoji, name);
    if (scheduleDirty) {
      const iso = utcMiddayIsoFromDateInput(scheduleDate);
      if (!iso) {
        setSaveError(t.validDateNeeded);
        return;
      }
      update.event_date = iso;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const { error: upErr } = await supabase.from("events").update(update).eq("id", eventId);
      if (upErr) throw new Error(upErr.message);
      router.refresh();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : nameDirty ? t.genericSaveFail : t.scheduleSaveFail);
    } finally {
      setSaving(false);
    }
  }

  function discardChanges() {
    setName(storedName);
    setEmoji(storedEmoji);
    setScheduleDate(toDateInputUtc(eventDate));
    setPickerOpen(false);
    setSaveError(null);
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
      setModError(t.moderationSaveFail);
    } finally {
      setModSaving(false);
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(accessCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the code stays on screen to copy by hand.
    }
  }

  if (!supabase) {
    return (
      <section className="settings-tab">
        <div className="tab-card settings-danger" style={{ marginTop: 0 }}>
          <h2 className="settings-danger__title">{ui.supabase.missingTitle}</h2>
          <p className="settings-note">{ui.supabase.settingsBody}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="settings-tab" style={{ paddingBottom: dirty ? 84 : 0 }}>
      <TabHeader title={t.heading} pose="key" poseSize={104}>
        {t.subtitle}
      </TabHeader>

      <section aria-labelledby="settings-name-title" className="tab-card">
        <h2 id="settings-name-title" className="tab-card__title" style={{ marginBottom: 12 }}>{t.sectionNameIcon}</h2>
        <div ref={boxRef}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            <button
              type="button"
              className="settings-emoji"
              aria-label={t.chooseEmoji}
              aria-expanded={pickerOpen}
              onClick={() => setPickerOpen((v) => !v)}
            >
              {emoji.trim() ? (
                <span className="calisto-emoji-upright" aria-hidden>{emoji}</span>
              ) : (
                <SmilePlus size={30} strokeWidth={1.8} aria-hidden />
              )}
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <label htmlFor="settings-event-name" className="settings-label" style={{ marginBottom: 6 }}>
                {t.eventNameLabel}
              </label>
              <AppInput
                id="settings-event-name"
                value={name}
                onChange={setName}
                placeholder={t.namePlaceholder}
                maxLength={120}
              />
            </div>
          </div>
          {pickerOpen && (
            <div role="dialog" aria-label={t.emojiPickerAria} style={{ marginTop: 12 }}>
              <AppBtn
                type="button"
                variant="ghost"
                size="sm"
                style={{ minHeight: 44, marginBottom: 8 }}
                onClick={() => { setEmoji(""); setPickerOpen(false); }}
              >
                {t.noIcon}
              </AppBtn>
              <div style={{ borderRadius: 16, overflow: "hidden", border: "1.5px solid var(--app-border)", boxShadow: "var(--app-shadow-lg)", background: "var(--app-surface)" }}>
                <EmojiPicker width="100%" height={400} lazyLoadEmojis skinTonesDisabled onEmojiClick={(data: EmojiClickData) => { setEmoji(data.emoji); setPickerOpen(false); }} />
              </div>
            </div>
          )}
        </div>
      </section>

      <section aria-labelledby="settings-date-title" className="tab-card">
        <h2 id="settings-date-title" className="tab-card__title" style={{ marginBottom: 12 }}>{t.sectionDatePlan}</h2>
        {isEventStarted ? (
          <>
            <div className="settings-locked">
              <span><span className="sr-only">{t.eventDateUtc}: </span>{formattedDate}</span>
              <Lock size={18} strokeWidth={1.8} aria-hidden style={{ flexShrink: 0 }} />
            </div>
            <p className="settings-note">{t.dateLockNotice}</p>
          </>
        ) : (
          <>
            <label htmlFor="settings-event-date" className="sr-only">{t.eventDateUtc}</label>
            <AppInput id="settings-event-date" type="date" value={scheduleDate} onChange={setScheduleDate} />
          </>
        )}
        <div className="settings-plan">
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--app-text)" }}>{ui.plans[planId]}</div>
          {keptLine ? <div style={{ fontSize: 14, color: "var(--app-text-sub)" }}>{keptLine}</div> : null}
          <UpgradeSettingsButton eventId={eventId} plan={plan} />
        </div>
      </section>

      <section className="tab-card">
        <Switch
          checked={modEnabled}
          onChange={(next) => void saveModeration(next)}
          busy={modSaving}
          label={<span className="tab-card__title">{t.moderationHeading}</span>}
          description={t.moderationHint}
        />
        {modError ? <p className="settings-error" role="alert">{modError}</p> : null}
      </section>

      <section aria-labelledby="settings-look-title" className="tab-card">
        <h2 id="settings-look-title" className="tab-card__title">{t.lookTitle}</h2>
        <p style={{ margin: "4px 0 0", fontSize: 14, lineHeight: 1.4, color: "var(--app-text-sub)" }}>{t.lookHint}</p>
        <div className="settings-themes">
          {BANNER_THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              className="settings-theme"
              aria-pressed={theme.id === activeTheme}
              disabled={themeSaving}
              onClick={() => void saveTheme(theme.id)}
            >
              <span
                className="settings-theme__tile"
                style={{ backgroundImage: `${theme.pattern}, ${theme.gradient}`, backgroundSize: `${theme.patternSize ?? "auto"}, auto` }}
              />
              <span className="settings-theme__name">{t.themes[theme.id]}</span>
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="settings-code-title" className="tab-card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 id="settings-code-title" className="settings-label" style={{ margin: 0 }}>{t.joinCodeEyebrow}</h2>
          <div className="settings-code">{accessCode}</div>
        </div>
        <button type="button" className="settings-copy" onClick={() => void copyCode()}>
          <span aria-live="polite">{copied ? ui.common.copied : t.copy}</span>
        </button>
      </section>

      <section aria-labelledby="settings-danger-title" className="tab-card settings-danger">
        <ConfirmDialog
          open={deleteConfirmOpen}
          title={t.deleteTitleForever}
          message={t.deleteDialogBody}
          confirmLabel={t.deleteConfirmLabel}
          cancelLabel={ui.common.cancel}
          variant="danger"
          busy={deleteBusy}
          onConfirm={() => void requestDeleteEvent()}
          onCancel={() => { if (!deleteBusy) setDeleteConfirmOpen(false); }}
        />
        <h2 id="settings-danger-title" className="settings-danger__title">{t.deleteTitle}</h2>
        <p style={{ margin: "4px 0 12px", fontSize: 14, lineHeight: 1.4, color: "var(--app-text-sub)" }}>{t.deleteConsequence}</p>
        <label htmlFor="settings-delete-phrase" className="settings-label">
          {t.deleteInstructionLead}
          {titleTrim ? <><b style={{ color: "var(--app-text)" }}>{titleTrim}</b>{t.deleteInstructionTrail}</> : null}
          <b style={{ color: "var(--app-text)" }}>{t.deletePhraseWord}</b>
        </label>
        <AppInput id="settings-delete-phrase" value={deletePhrase} onChange={setDeletePhrase} autoComplete="off" />
        {deleteError ? <p className="settings-error" role="alert">{deleteError}</p> : null}
        <AppBtn
          type="button"
          variant="danger"
          style={{ marginTop: 10, width: "100%", minHeight: 48 }}
          disabled={!canArmDelete || deleteBusy}
          loading={deleteBusy}
          onClick={() => { setDeleteError(null); setDeleteConfirmOpen(true); }}
        >
          {t.deleteButton}
        </AppBtn>
      </section>

      <div aria-live="polite">
        {dirty ? (
          <div className="settings-savebar" role="region" aria-label={t.unsavedChanges}>
            <span className={saveError ? "settings-savebar__msg settings-savebar__msg--error" : "settings-savebar__msg"}>
              {saveError ?? t.unsavedChanges}
            </span>
            <button type="button" className="settings-savebar__discard" disabled={saving} onClick={discardChanges}>
              {t.discard}
            </button>
            <AppBtn type="button" variant="gold" size="sm" style={{ padding: "0 16px", fontSize: 15 }} loading={saving} onClick={() => void saveChanges()}>
              {t.save}
            </AppBtn>
          </div>
        ) : null}
      </div>
    </section>
  );
}
