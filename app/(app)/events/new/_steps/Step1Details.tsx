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

        {/* Unified card */}
        <div style={{ ...warmGlass, borderRadius: 16 }}>

          {/* ── Emoji header — warm tinted, clickable ── */}
          <div
            role="button"
            tabIndex={0}
            aria-label={ui.createStep1.defaultEmojiAria}
            onClick={() => setPickerOpen(v => !v)}
            onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setPickerOpen(v => !v); } }}
            style={{
              cursor: 'pointer',
              position: 'relative',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 6,
              padding: '24px 16px 20px',
              background: 'linear-gradient(160deg, rgba(197,146,42,0.13) 0%, rgba(197,146,42,0.04) 100%)',
              borderBottom: `1px solid rgba(197,146,42,0.18)`,
              borderRadius: '15px 15px 0 0',
              userSelect: 'none',
            }}
          >
            {/* Gold corner mark top-left */}
            <span aria-hidden style={{ position: 'absolute', top: 14, left: 16, width: 18, height: 18, borderTop: `2px solid ${GOLD}60`, borderLeft: `2px solid ${GOLD}60`, borderRadius: '3px 0 0 0', pointerEvents: 'none' }} />
            {/* Gold corner mark top-right */}
            <span aria-hidden style={{ position: 'absolute', top: 14, right: 16, width: 18, height: 18, borderTop: `2px solid ${GOLD}60`, borderRight: `2px solid ${GOLD}60`, borderRadius: '0 3px 0 0', pointerEvents: 'none' }} />

            <span style={{ fontSize: 64, lineHeight: 1, filter: 'drop-shadow(0 4px 12px rgba(40,25,15,0.18))' }}>
              {emoji || '📅'}
            </span>
            <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: `${GOLD_DK}`, opacity: 0.6, fontFamily: FB }}>
              {ui.createStep1.eventIconEyebrow}
            </span>
          </div>

          {/* ── Title ── */}
          <div style={{ padding: '18px 18px 16px' }}>
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
              style={{ ...inputStyle, fontFamily: FS, fontStyle: 'italic', fontSize: 20, letterSpacing: '-0.02em', padding: '10px 14px' }}
            />
          </div>

          {/* ── Date ── */}
          <div style={{ borderTop: `1px dashed ${BORDER}`, padding: '14px 18px 16px' }}>
            <label htmlFor="date" style={labelStyle}>{ui.createStep1.eventDateLabel}</label>
            <input
              id="date"
              name="date"
              type="date"
              defaultValue={defaultDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => {
                const nameEl = document.getElementById("name");
                const currentName = nameEl instanceof HTMLInputElement ? nameEl.value : defaultName;
                writeStep1Draft(currentName, e.target.value);
              }}
              style={inputStyle}
            />
          </div>

          {/* ── Choose emoji (text row) ── */}
          <div ref={boxRef} style={{ position: 'relative', borderTop: `1px dashed ${BORDER}`, padding: '10px 18px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <p style={{ margin: 0, fontSize: 11, color: MUTED, fontFamily: FB }}>
              {ui.createStep1.searchEmojiHint}
            </p>
            <button
              type="button"
              onClick={() => setPickerOpen(v => !v)}
              style={{ flexShrink: 0, background: 'rgba(255,255,255,0.7)', border: `1.5px solid ${pickerOpen ? GOLD : BORDER}`, color: pickerOpen ? GOLD_DK : INK_S, padding: '5px 12px', borderRadius: 8, fontFamily: FB, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s' }}
            >
              {pickerOpen ? ui.settingsTab.closePicker : ui.settingsTab.chooseEmoji}
            </button>

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
        </div>

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
