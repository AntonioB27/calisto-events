"use client";

import { useAppUi } from "@/components/AppUiProvider";
import { AppBtn } from "@/components/app-ui/AppBtn";
import { AppCard } from "@/components/app-ui/AppCard";
import { AppFormRow } from "@/components/app-ui/AppFormRow";
import { AppInput } from "@/components/app-ui/AppInput";
import { AppPageHeader } from "@/components/app-ui/AppPageHeader";
import { readCreateEventDraftFromStorage, writeCreateEventDraftToStorage } from "@/lib/create-event-draft";
import type { PlanId } from "@/lib/plan-limits";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { useEffect, useMemo, useRef, useState } from "react";

type Step1DetailsProps = {
  defaultName: string;
  defaultEmoji: string;
  defaultDate: string;
};

export function Step1Details({ defaultName, defaultEmoji, defaultDate }: Step1DetailsProps) {
  const ui = useAppUi();
  const getPlanIdForDraft = (): PlanId => readCreateEventDraftFromStorage()?.planId ?? "free";

  const initialEmoji = useMemo(
    () => (readCreateEventDraftFromStorage()?.emoji ?? defaultEmoji) || "📅",
    [defaultEmoji],
  );
  const [emoji, setEmoji] = useState<string>(initialEmoji);
  const [pickerOpen, setPickerOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setEmoji(initialEmoji);
  }, [initialEmoji]);

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
    writeCreateEventDraftToStorage({
      step: "1",
      name,
      emoji,
      date,
      planId: getPlanIdForDraft(),
    });
  };

  const writeStep2Draft = (name: string, date: string) => {
    writeCreateEventDraftToStorage({
      step: "2",
      name,
      emoji,
      date,
      planId: getPlanIdForDraft(),
    });
  };

  return (
    <div style={{ padding: "40px 0 60px" }}>
      <AppPageHeader
        eyebrow={ui.createStep1.eyebrow}
        title={ui.createStep1.title}
        description={ui.createStep1.description}
      />

      <form
        action="/events/new"
        method="get"
        onSubmit={(event) => {
          const formData = new FormData(event.currentTarget);
          const name = String(formData.get("name") ?? "");
          const date = String(formData.get("date") ?? "");
          writeStep2Draft(name, date);
        }}
      >
        <input type="hidden" name="step" value="2" />
        <input type="hidden" name="emoji" value={emoji} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 16 }}>
          <AppCard pad="md" style={{ marginBottom: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <AppFormRow label={ui.createStep1.eventTitleLabel}>
              <AppInput
                id="name"
                name="name"
                type="text"
                defaultValue={defaultName}
                placeholder={ui.createStep1.namePlaceholder}
                onChange={(value) => {
                  const dateEl = document.getElementById("date");
                  const currentDate = dateEl instanceof HTMLInputElement ? dateEl.value : defaultDate;
                  writeStep1Draft(value, currentDate);
                }}
              />
            </AppFormRow>
            <AppFormRow label={ui.createStep1.eventDateLabel}>
              <AppInput
                id="date"
                name="date"
                type="date"
                defaultValue={defaultDate}
                onChange={(value) => {
                  const nameEl = document.getElementById("name");
                  const currentName = nameEl instanceof HTMLInputElement ? nameEl.value : defaultName;
                  writeStep1Draft(currentName, value);
                }}
              />
            </AppFormRow>
          </div>
          </AppCard>

          <div ref={boxRef} style={{ position: "relative" }}>
            <AppCard pad="md" style={{ borderRadius: 18 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--app-muted)",
                }}
              >
                {ui.createStep1.eventIconEyebrow}
              </p>
              <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div
                  aria-label={ui.createStep1.defaultEmojiAria}
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
                  {emoji || "📅"}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                  <AppBtn
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPickerOpen((v) => !v)}
                    className="w-full"
                  >
                    {pickerOpen ? ui.settingsTab.closePicker : ui.settingsTab.chooseEmoji}
                  </AppBtn>
                  <AppBtn
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEmoji("");
                      const nameEl = document.getElementById("name");
                      const dateEl = document.getElementById("date");
                      const currentName = nameEl instanceof HTMLInputElement ? nameEl.value : defaultName;
                      const currentDate = dateEl instanceof HTMLInputElement ? dateEl.value : defaultDate;
                      writeCreateEventDraftToStorage({
                        step: "1",
                        name: currentName,
                        emoji: "",
                        date: currentDate,
                        planId: getPlanIdForDraft(),
                      });
                    }}
                    className="w-full"
                  >
                    {ui.createStep1.noEmojiBtn}
                  </AppBtn>
                </div>
              </div>

              <p style={{ margin: "12px 0 0", fontSize: 12, color: "var(--app-subtle)", lineHeight: 1.45 }}>
                {ui.createStep1.searchEmojiHint}
              </p>
            </AppCard>

            {pickerOpen ? (
              <div
                role="dialog"
                aria-label={ui.settingsTab.emojiPickerAria}
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 10px)",
                  zIndex: 20,
                  borderRadius: 16,
                  overflow: "hidden",
                  border: "1.5px solid var(--app-border)",
                  boxShadow: "var(--app-shadow-lg)",
                  background: "var(--app-surface)",
                }}
              >
                <EmojiPicker
                  width={340}
                  height={420}
                  lazyLoadEmojis
                  searchDisabled={false}
                  skinTonesDisabled
                  onEmojiClick={(data: EmojiClickData) => {
                    const next = data.emoji;
                    setEmoji(next);
                    setPickerOpen(false);
                    const nameEl = document.getElementById("name");
                    const dateEl = document.getElementById("date");
                    const currentName = nameEl instanceof HTMLInputElement ? nameEl.value : defaultName;
                    const currentDate = dateEl instanceof HTMLInputElement ? dateEl.value : defaultDate;
                    writeCreateEventDraftToStorage({
                      step: "1",
                      name: currentName,
                      emoji: next,
                      date: currentDate,
                      planId: getPlanIdForDraft(),
                    });
                  }}
                />
              </div>
            ) : null}
          </div>
        </div>

        <AppBtn type="submit" variant="primary" style={{ width: "100%", marginTop: 24 }}>
          {ui.createStep1.continuePlan}
        </AppBtn>
      </form>
    </div>
  );
}
