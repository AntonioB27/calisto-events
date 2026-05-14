"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useAppUi } from "@/components/AppUiProvider";
import { AppBtn } from "@/components/app-ui/AppBtn";
import { AppCard } from "@/components/app-ui/AppCard";
import { AppFormRow } from "@/components/app-ui/AppFormRow";
import { AppInput } from "@/components/app-ui/AppInput";
import { GoldBar } from "@/components/app-ui/GoldBar";
import { ConfirmDialog } from "@/components/app-ui/ConfirmDialog";
import { composeEventTitle } from "@/lib/event-title";
import { bcp47FromUiLocale } from "@/lib/locale-bcp47";
import type { PlanId } from "@/lib/plan-limits";
import { normalizePlanId } from "@/lib/plan-limits";
import { maybeCreateSupabaseBrowserClient } from "@/lib/supabase-browser";

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
}>;

function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
      <GoldBar vertical />
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: 17,
          color: "var(--app-text)",
        }}
      >
        {label}
      </span>
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
}: SettingsTabProps) {
  const ui = useAppUi();
  const router = useRouter();
  const supabase = maybeCreateSupabaseBrowserClient();
  const boxRef = useRef<HTMLDivElement | null>(null);

  const planEditOptions = useMemo(
    () => (["free", "standard", "plus", "premium", "max"] as const).map((id) => ({ id, label: ui.plans[id] })),
    [ui.plans],
  );

  const [name, setName] = useState(storedName);
  const [emoji, setEmoji] = useState(storedEmoji);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletePhrase, setDeletePhrase] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [schedulePlan, setSchedulePlan] = useState<PlanId>("free");
  const [scheduleSaving, setScheduleSaving] = useState(false);
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
    setSchedulePlan(normalizePlanId(plan));
  }, [plan]);

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
  const scheduleDirty =
    scheduleDate !== toDateInputUtc(eventDate) || schedulePlan !== normalizePlanId(plan);

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
      const { error: upErr } = await supabase.from("events").update({ event_date: iso, plan: schedulePlan }).eq("id", eventId);
      if (upErr) throw new Error(upErr.message);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : ui.settingsTab.scheduleSaveFail);
    } finally {
      setScheduleSaving(false);
    }
  }

  if (!supabase) {
    return (
      <section style={{ maxWidth: 640 }}>
        <div
          style={{
            marginTop: 12,
            borderRadius: "var(--app-radius-lg)",
            border: "1.5px solid color-mix(in srgb, var(--app-danger) 35%, var(--app-border))",
            background: "color-mix(in srgb, var(--app-danger) 8%, var(--app-surface))",
            padding: 16,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--app-danger)" }}>
            {ui.supabase.missingTitle}
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--app-muted)", lineHeight: 1.55 }}>
            {ui.supabase.settingsBody}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ width: 32, height: 3, background: "var(--app-gold)", borderRadius: 2, marginBottom: 10 }} />
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: 42,
            color: "var(--app-text)",
          }}
        >
          {ui.settingsTab.heading}
        </h2>
        <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 15, color: "var(--app-muted)", marginTop: 4 }}>
          {ui.settingsTab.subtitle}
        </p>
      </div>

      {error ? (
        <p
          style={{
            marginBottom: 16,
            fontSize: 13,
            color: "var(--app-danger)",
            background: "color-mix(in srgb, var(--app-danger) 10%, transparent)",
            padding: "10px 14px",
            borderRadius: 10,
            border: "1.5px solid color-mix(in srgb, var(--app-danger) 35%, transparent)",
          }}
        >
          {error}
        </p>
      ) : null}

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div>
          <SectionHeader label={ui.settingsTab.sectionNameIcon} />
          <AppCard pad="lg" style={{ borderRadius: 18 }}>
            <div style={{ display: "grid", gap: 20, gridTemplateColumns: "1fr", maxWidth: 480 }}>
              <AppFormRow label={ui.settingsTab.eventNameLabel}>
                <AppInput
                  id="settings-event-name"
                  value={name}
                  onChange={setName}
                  placeholder={ui.settingsTab.namePlaceholder}
                  maxLength={120}
                />
              </AppFormRow>

              <div ref={boxRef} style={{ position: "relative" }}>
                <p
                  style={{
                    margin: "0 0 8px",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--app-muted)",
                  }}
                >
                  {ui.settingsTab.iconEyebrow}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div
                    aria-label={ui.settingsTab.emojiAria}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 28,
                      background: "var(--app-surface-2)",
                      border: "1.5px solid var(--app-border)",
                    }}
                  >
                    {emoji.trim() ? <span className="calisto-emoji-upright">{emoji}</span> : ui.settingsClient.anon}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <AppBtn type="button" variant="outline" size="sm" onClick={() => setPickerOpen((v) => !v)}>
                      {pickerOpen ? ui.settingsTab.closePicker : ui.settingsTab.chooseEmoji}
                    </AppBtn>
                    <AppBtn type="button" variant="ghost" size="sm" onClick={() => setEmoji("")}>
                      {ui.settingsTab.noIcon}
                    </AppBtn>
                  </div>
                </div>
                {pickerOpen ? (
                  <div
                    role="dialog"
                    aria-label={ui.settingsTab.emojiPickerAria}
                    style={{
                      marginTop: 12,
                      zIndex: 20,
                      borderRadius: 16,
                      overflow: "hidden",
                      border: "1.5px solid var(--app-border)",
                      boxShadow: "var(--app-shadow-lg)",
                      background: "var(--app-surface)",
                      width: "fit-content",
                      maxWidth: "100%",
                    }}
                  >
                    <EmojiPicker
                      width={320}
                      height={400}
                      lazyLoadEmojis
                      skinTonesDisabled
                      onEmojiClick={(data: EmojiClickData) => {
                        setEmoji(data.emoji);
                        setPickerOpen(false);
                      }}
                    />
                  </div>
                ) : null}
                <p style={{ margin: "12px 0 0", fontSize: 12, color: "var(--app-subtle)", lineHeight: 1.45 }}>
                  {ui.settingsTab.iconHint}
                </p>
              </div>
            </div>

            <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
              <AppBtn type="button" variant="gold" size="sm" disabled={!dirty || saving} loading={saving} onClick={() => void saveNameAndEmoji()}>
                {ui.settingsTab.saveChanges}
              </AppBtn>
              <AppBtn
                type="button"
                variant="ghost"
                size="sm"
                disabled={!dirty || saving}
                onClick={() => {
                  setName(storedName);
                  setEmoji(storedEmoji);
                  setError(null);
                }}
              >
                {ui.settingsTab.reset}
              </AppBtn>
            </div>
          </AppCard>
        </div>

        <div>
          <SectionHeader label={ui.settingsTab.sectionSchedule} />
          <AppCard pad="lg" style={{ borderRadius: 18 }}>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--app-muted)", lineHeight: 1.55 }}>
              {ui.settingsTab.scheduleNoteLead}
              <strong style={{ color: "var(--app-text)" }}>{formattedDate}</strong>
              {ui.settingsTab.scheduleNoteTrail}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 420 }}>
              <AppFormRow label={ui.settingsTab.eventDateUtc}>
                <AppInput id="settings-event-date" type="date" value={scheduleDate} onChange={setScheduleDate} />
              </AppFormRow>
              <AppFormRow label={ui.settingsTab.planTier}>
                <select
                  id="settings-event-plan"
                  className="app-input"
                  style={{ width: "100%", borderRadius: "var(--app-radius-md, 12px)", padding: "10px 12px" }}
                  value={schedulePlan}
                  onChange={(e) => setSchedulePlan(e.target.value as PlanId)}
                >
                  {planEditOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </AppFormRow>
            </div>
            <div style={{ marginTop: 18, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
              <AppBtn
                type="button"
                variant="gold"
                size="sm"
                disabled={!scheduleDirty || scheduleSaving}
                loading={scheduleSaving}
                onClick={() => void saveSchedule()}
              >
                {ui.settingsTab.saveSchedule}
              </AppBtn>
              <AppBtn
                type="button"
                variant="ghost"
                size="sm"
                disabled={!scheduleDirty || scheduleSaving}
                onClick={() => {
                  setScheduleDate(toDateInputUtc(eventDate));
                  setSchedulePlan(normalizePlanId(plan));
                  setError(null);
                }}
              >
                {ui.settingsTab.reset}
              </AppBtn>
            </div>
            <div style={{ height: 1, background: "var(--app-border)", margin: "22px 0" }} />
            <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: 14, fontSize: 14 }}>
              <div>
                <dt style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--app-muted)", marginBottom: 4 }}>
                  {ui.settingsTab.joinCodeEyebrow}
                </dt>
                <dd style={{ margin: 0, fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--app-text)", letterSpacing: "0.04em" }}>{accessCode}</dd>
              </div>
            </dl>
            <AppBtn as={Link} href="/dashboard" variant="outline" size="sm" style={{ marginTop: 12 }}>
              {ui.settingsTab.dashboardBack}
            </AppBtn>
          </AppCard>
        </div>

        <div>
          <SectionHeader label={ui.settingsTab.dangerEyebrow} />
          <ConfirmDialog
            open={deleteConfirmOpen}
            title={ui.settingsTab.deleteTitleForever}
            message={ui.settingsTab.deleteDialogBody}
            confirmLabel={ui.settingsTab.deleteConfirmLabel}
            cancelLabel={ui.common.cancel}
            variant="danger"
            busy={deleteBusy}
            onConfirm={() => void requestDeleteEvent()}
            onCancel={() => {
              if (!deleteBusy) setDeleteConfirmOpen(false);
            }}
          />
          <AppCard
            pad="lg"
            style={{
              borderRadius: 18,
              border: "1.5px solid color-mix(in srgb, var(--app-danger) 35%, var(--app-border))",
            }}
          >
            <p style={{ marginTop: 0, fontSize: 14, color: "var(--app-danger)", fontWeight: 600 }}>
              {ui.settingsTab.deleteDangerNote}
            </p>
            <p style={{ margin: "8px 0 14px", fontSize: 13, color: "var(--app-muted)", lineHeight: 1.5 }}>
              {ui.settingsTab.deleteInstructionLead}
              <strong style={{ fontWeight: 600, color: "var(--app-text)" }}>
                {titleTrim || ui.settingsTab.exactParen}
              </strong>{" "}
              {ui.settingsTab.deleteInstructionTrail}
              <strong style={{ fontWeight: 600, color: "var(--app-text)" }}>{ui.settingsTab.deletePhraseWord}</strong>.
            </p>
            <AppFormRow label={ui.settingsTab.deleteConfirmPhraseLabel}>
              <AppInput
                id="settings-delete-phrase"
                value={deletePhrase}
                onChange={setDeletePhrase}
                placeholder={ui.settingsTab.deletePlaceholderTitleOrWord}
              />
            </AppFormRow>
            <AppBtn
              type="button"
              variant="danger"
              size="sm"
              style={{ marginTop: 14 }}
              disabled={!canArmDelete || deleteBusy}
              loading={deleteBusy}
              onClick={() => setDeleteConfirmOpen(true)}
            >
              {ui.settingsTab.deleteButton}
            </AppBtn>
          </AppCard>
        </div>
      </div>
    </section>
  );
}
