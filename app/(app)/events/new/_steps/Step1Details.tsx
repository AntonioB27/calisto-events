"use client";

import { useAppUi } from "@/components/AppUiProvider";
import { readCreateEventDraftFromStorage, writeCreateEventDraftToStorage } from "@/lib/create-event-draft";
import type { PlanId } from "@/lib/plan-limits";
import EmojiPicker, { type EmojiClickData, Theme } from "emoji-picker-react";
import { useEffect, useMemo, useRef, useState } from "react";

// ── Palette ───────────────────────────────────────────────────────────────────
const INK    = '#221509';
const INK_S  = '#5A4A36';
const MUTED  = '#9A8570';
const GOLD   = '#C5922A';
const GOLD_DK = '#A37118';
const PURPLE = '#5B2D8E';
const BORDER = '#DDD4C5';
const FB = "'DM Sans', sans-serif";
const FS = "'DM Serif Display', serif";

const warmGlass: React.CSSProperties = {
  background: 'rgba(244,240,234,0.9)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: `1px solid ${BORDER}`,
  boxShadow: '0 8px 24px -6px rgba(40,25,15,0.14), inset 0 1px 0 rgba(255,255,255,0.8)',
  borderRadius: 14,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.75)',
  border: `1.5px solid ${BORDER}`,
  borderRadius: 9,
  padding: '11px 13px',
  fontFamily: FB,
  fontSize: 15,
  color: INK,
  outline: 'none',
  boxSizing: 'border-box',
  colorScheme: 'light',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 9.5,
  fontWeight: 700,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: MUTED,
  fontFamily: FB,
  marginBottom: 7,
};

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
    writeCreateEventDraftToStorage({ step: "1", name, emoji, date, planId: getPlanIdForDraft() });
  };

  const writeStep2Draft = (name: string, date: string) => {
    writeCreateEventDraftToStorage({ step: "2", name, emoji, date, planId: getPlanIdForDraft() });
  };

  return (
    <div className="welcome-reveal welcome-reveal--d1">
      {/* Heading */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ width: 18, height: 2, background: GOLD, borderRadius: 1, flexShrink: 0 }} />
          <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: GOLD_DK, fontFamily: FB }}>
            {ui.createStep1.eyebrow}
          </span>
        </div>
        <h2 style={{ fontFamily: FS, fontStyle: 'italic', fontWeight: 700, fontSize: 26, color: INK, lineHeight: 1.1, letterSpacing: '-0.02em', margin: 0 }}>
          {ui.createStep1.title}
        </h2>
        <p style={{ fontFamily: FS, fontStyle: 'italic', fontSize: 14, color: INK_S, lineHeight: 1.5, marginTop: 6, marginBottom: 0 }}>
          {ui.createStep1.description}
        </p>
      </div>

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

        {/* Name + Date card */}
        <div style={{ ...warmGlass, padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label htmlFor="name" style={labelStyle}>{ui.createStep1.eventTitleLabel}</label>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={defaultName}
              placeholder={ui.createStep1.namePlaceholder}
              onChange={(e) => {
                const dateEl = document.getElementById("date");
                const currentDate = dateEl instanceof HTMLInputElement ? dateEl.value : defaultDate;
                writeStep1Draft(e.target.value, currentDate);
              }}
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="date" style={labelStyle}>{ui.createStep1.eventDateLabel}</label>
            <input
              id="date"
              name="date"
              type="date"
              defaultValue={defaultDate}
              onChange={(e) => {
                const nameEl = document.getElementById("name");
                const currentName = nameEl instanceof HTMLInputElement ? nameEl.value : defaultName;
                writeStep1Draft(currentName, e.target.value);
              }}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Emoji card */}
        <div ref={boxRef} style={{ position: 'relative', marginTop: 12 }}>
          <div style={{ ...warmGlass, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              aria-label={ui.createStep1.defaultEmojiAria}
              style={{ width: 52, height: 52, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, background: 'rgba(255,255,255,0.7)', border: `1.5px solid ${BORDER}`, flexShrink: 0 }}
            >
              {emoji || '📅'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: MUTED, fontFamily: FB, margin: '0 0 8px' }}>
                {ui.createStep1.eventIconEyebrow}
              </p>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setPickerOpen(v => !v)}
                  style={{ background: 'rgba(255,255,255,0.7)', border: `1.5px solid ${BORDER}`, color: INK_S, padding: '6px 12px', borderRadius: 8, fontFamily: FB, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                >
                  {pickerOpen ? ui.settingsTab.closePicker : ui.settingsTab.chooseEmoji}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmoji('');
                    const nameEl = document.getElementById("name");
                    const dateEl = document.getElementById("date");
                    const currentName = nameEl instanceof HTMLInputElement ? nameEl.value : defaultName;
                    const currentDate = dateEl instanceof HTMLInputElement ? dateEl.value : defaultDate;
                    writeCreateEventDraftToStorage({ step: '1', name: currentName, emoji: '', date: currentDate, planId: getPlanIdForDraft() });
                  }}
                  style={{ background: 'transparent', border: 'none', color: MUTED, padding: '6px 8px', fontFamily: FB, fontSize: 12, cursor: 'pointer' }}
                >
                  {ui.createStep1.noEmojiBtn}
                </button>
              </div>
            </div>
          </div>

          {pickerOpen && (
            <div
              role="dialog"
              aria-label={ui.settingsTab.emojiPickerAria}
              style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', zIndex: 20, borderRadius: 14, overflow: 'hidden', border: `1.5px solid ${BORDER}`, boxShadow: '0 20px 40px rgba(40,25,15,0.22)' }}
            >
              <EmojiPicker
                width={320}
                height={400}
                lazyLoadEmojis
                searchDisabled={false}
                skinTonesDisabled
                theme={Theme.LIGHT}
                onEmojiClick={(data: EmojiClickData) => {
                  const next = data.emoji;
                  setEmoji(next);
                  setPickerOpen(false);
                  const nameEl = document.getElementById("name");
                  const dateEl = document.getElementById("date");
                  const currentName = nameEl instanceof HTMLInputElement ? nameEl.value : defaultName;
                  const currentDate = dateEl instanceof HTMLInputElement ? dateEl.value : defaultDate;
                  writeCreateEventDraftToStorage({ step: '1', name: currentName, emoji: next, date: currentDate, planId: getPlanIdForDraft() });
                }}
              />
            </div>
          )}
        </div>

        <p style={{ marginTop: 10, fontSize: 12, color: MUTED, fontFamily: FB, lineHeight: 1.45 }}>
          {ui.createStep1.searchEmojiHint}
        </p>

        <button
          type="submit"
          style={{ marginTop: 20, width: '100%', background: `linear-gradient(135deg,#7B3FBE,${PURPLE})`, color: '#fff', border: 'none', borderRadius: 11, padding: '14px 20px', fontFamily: FB, fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(91,45,142,0.32)' }}
        >
          {ui.createStep1.continuePlan}
        </button>
      </form>
    </div>
  );
}
