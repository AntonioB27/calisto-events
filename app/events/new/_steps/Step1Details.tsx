"use client";

import { useAppUi } from "@/components/AppUiProvider";
import { readCreateEventDraftFromStorage, writeCreateEventDraftToStorage } from "@/lib/create-event-draft";
import type { PlanId } from "@/lib/plan-limits";
import { AppBtn } from "@/components/app-ui/AppBtn";
import { AppInput } from "@/components/app-ui/AppInput";
import { Switch } from "@/components/app-ui/Switch";
import { TabHeader } from "@/components/app-ui/TabHeader";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePostHog } from "posthog-js/react";
import { ANALYTICS_EVENTS } from "@/lib/analytics-events";

type Step1DetailsProps = {
  defaultName: string;
  defaultEmoji: string;
  defaultDate: string;
  defaultModerationEnabled: boolean;
};

export function Step1Details({ defaultName, defaultEmoji, defaultDate, defaultModerationEnabled }: Step1DetailsProps) {
  const ui = useAppUi();
  const getPlanIdForDraft = (): PlanId => readCreateEventDraftFromStorage()?.planId ?? "free";
  const [moderationEnabled, setModerationEnabled] = useState(defaultModerationEnabled);

  const initialEmoji = useMemo(
    () => (readCreateEventDraftFromStorage()?.emoji ?? defaultEmoji) || "📅",
    [defaultEmoji],
  );
  const [emoji, setEmoji] = useState<string>(initialEmoji);
  const [pickerOpen, setPickerOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture(ANALYTICS_EVENTS.CREATE_STEP1_VIEWED);
  }, [posthog]);

  useEffect(() => { setEmoji(initialEmoji); }, [initialEmoji]);

  useEffect(() => {
    if (!pickerOpen) return;
    const onDocDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (boxRef.current && boxRef.current.contains(target)) return;
      setPickerOpen(false);
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [pickerOpen]);

  const writeStep1Draft = (name: string, date: string) => {
    writeCreateEventDraftToStorage({ step: "1", name, emoji, date, planId: getPlanIdForDraft(), moderationEnabled });
  };

  const writeStep2Draft = (name: string, date: string) => {
    writeCreateEventDraftToStorage({ step: "2", name, emoji, date, planId: getPlanIdForDraft(), moderationEnabled });
  };

  const currentField = (id: "name" | "date", fallback: string) => {
    const el = document.getElementById(id);
    return el instanceof HTMLInputElement ? el.value : fallback;
  };

  return (
    <div className="welcome-reveal welcome-reveal--d1">
      <TabHeader title={ui.createStep1.title} pose="planning" poseSize={104}>
        {ui.createStep1.description}
      </TabHeader>

      <form
        action="/events/new"
        method="get"
        className="create-flow"
        style={{ marginTop: 6 }}
        onSubmit={(event) => {
          const formData = new FormData(event.currentTarget);
          const name = String(formData.get("name") ?? "");
          const date = String(formData.get("date") ?? "");
          writeStep2Draft(name, date);
          posthog.capture(ANALYTICS_EVENTS.CREATE_STEP1_COMPLETED, {
            has_emoji: emoji !== "📅",
            moderation_enabled: moderationEnabled,
          });
        }}
      >
        <input type="hidden" name="step" value="2" />
        <input type="hidden" name="emoji" value={emoji} />
        <input type="hidden" name="moderationEnabled" value={String(moderationEnabled)} />

        <section className="tab-card">
          <div ref={boxRef}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
              <button
                type="button"
                className="create-emoji"
                aria-label={ui.settingsTab.chooseEmoji}
                aria-expanded={pickerOpen}
                onClick={() => setPickerOpen((v) => !v)}
              >
                <span className="calisto-emoji-upright" aria-hidden>{emoji || "📅"}</span>
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <label htmlFor="name" className="create-label">{ui.createStep1.eventTitleLabel}</label>
                <AppInput
                  id="name"
                  name="name"
                  defaultValue={defaultName}
                  placeholder={ui.createStep1.namePlaceholder}
                  onChange={(value) => writeStep1Draft(value, currentField("date", defaultDate))}
                />
              </div>
            </div>
            {pickerOpen && (
              <div role="dialog" aria-label={ui.settingsTab.emojiPickerAria} style={{ marginTop: 12, borderRadius: 16, overflow: "hidden", border: "1.5px solid var(--app-border)", boxShadow: "var(--app-shadow-lg)", background: "var(--app-surface)" }}>
                <EmojiPicker
                  width="100%"
                  height={400}
                  lazyLoadEmojis
                  skinTonesDisabled
                  onEmojiClick={(data: EmojiClickData) => {
                    const next = data.emoji;
                    setEmoji(next);
                    setPickerOpen(false);
                    writeCreateEventDraftToStorage({ step: "1", name: currentField("name", defaultName), emoji: next, date: currentField("date", defaultDate), planId: getPlanIdForDraft(), moderationEnabled });
                  }}
                />
              </div>
            )}
          </div>

          <label htmlFor="date" className="create-label" style={{ marginTop: 16 }}>{ui.createStep1.eventDateLabel}</label>
          <input
            id="date"
            name="date"
            type="date"
            className="app-input"
            defaultValue={defaultDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => writeStep1Draft(currentField("name", defaultName), e.target.value)}
          />
        </section>

        <section className="tab-card">
          <Switch
            checked={moderationEnabled}
            label={ui.createStep1.moderationToggleLabel}
            description={ui.createStep1.moderationToggleHint}
            onChange={(next) => {
              setModerationEnabled(next);
              writeCreateEventDraftToStorage({ step: "1", name: currentField("name", defaultName), emoji, date: currentField("date", defaultDate), planId: getPlanIdForDraft(), moderationEnabled: next });
            }}
          />
        </section>

        <div className="create-actions">
          <AppBtn type="submit" variant="gold" size="lg" style={{ flex: 1 }}>
            {ui.createStep1.continuePlan}
          </AppBtn>
        </div>
      </form>
    </div>
  );
}
