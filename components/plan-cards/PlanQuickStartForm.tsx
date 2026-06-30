"use client";

import { useEffect, useRef, useState } from "react";
import EmojiPicker, { type EmojiClickData, Theme } from "emoji-picker-react";

export type PlanQuickStartFormProps = {
  name: string;
  onNameChange: (v: string) => void;
  date: string;
  onDateChange: (v: string) => void;
  emoji: string;
  onEmojiChange: (v: string) => void;
  shaking: boolean;
  nameInputRef: React.RefObject<HTMLInputElement>;
  copy: {
    plansFormNamePlaceholder: string;
    plansFormDateLabel: string;
    plansFormEmojiPlaceholder: string;
  };
};

export function PlanQuickStartForm({
  name,
  onNameChange,
  date,
  onDateChange,
  emoji,
  onEmojiChange,
  shaking,
  nameInputRef,
  copy,
}: PlanQuickStartFormProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const emojiBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pickerOpen) return;
    const onDocDown = (e: MouseEvent) => {
      if (!emojiBoxRef.current?.contains(e.target as Node)) setPickerOpen(false);
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [pickerOpen]);

  return (
    <div style={{ marginBottom: 32, position: "relative", paddingTop: 18, zIndex: 1 }}>
      {/* Washi tape */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 4,
          left: "50%",
          transform: "translateX(-50%) rotate(-2deg)",
          width: 64,
          height: 14,
          background: "rgba(212,168,67,0.48)",
          border: "0.5px solid rgba(212,168,67,0.6)",
          boxShadow: "0 2px 6px rgba(0,0,0,0.22)",
          zIndex: 2,
          borderRadius: 2,
          pointerEvents: "none",
        }}
      />

      {/* Polaroid card */}
      <div
        style={{
          background: "#f9f6f1",
          padding: "14px 18px 30px",
          borderRadius: 2,
          boxShadow: "0 8px 28px rgba(0,0,0,0.28), 0 2px 6px rgba(0,0,0,0.16)",
          transform: "rotate(-0.6deg)",
          position: "relative",
        }}
      >
        {/* Emoji header */}
        <div
          role="button"
          tabIndex={0}
          aria-label={copy.plansFormEmojiPlaceholder}
          onClick={() => setPickerOpen((v) => !v)}
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              setPickerOpen((v) => !v);
            }
          }}
          style={{
            cursor: "pointer",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            padding: "20px 16px 16px",
            background: "linear-gradient(160deg, rgba(197,146,42,0.13) 0%, rgba(197,146,42,0.04) 100%)",
            borderBottom: "1px solid rgba(197,146,42,0.18)",
            userSelect: "none",
          }}
        >
          <span aria-hidden style={{ position: "absolute", top: 12, left: 14, width: 16, height: 16, borderTop: "2px solid rgba(197,146,42,0.55)", borderLeft: "2px solid rgba(197,146,42,0.55)", borderRadius: "2px 0 0 0", pointerEvents: "none" }} />
          <span aria-hidden style={{ position: "absolute", top: 12, right: 14, width: 16, height: 16, borderTop: "2px solid rgba(197,146,42,0.55)", borderRight: "2px solid rgba(197,146,42,0.55)", borderRadius: "0 2px 0 0", pointerEvents: "none" }} />
          <span style={{ fontSize: 56, lineHeight: 1, filter: "drop-shadow(0 4px 12px rgba(40,25,15,0.18))" }}>
            {emoji || "📅"}
          </span>
          <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(163,113,24,0.6)", fontFamily: "'DM Sans', sans-serif" }}>
            {copy.plansFormEmojiPlaceholder}
          </span>
        </div>

        {/* Name + date inputs */}
        <div style={{ padding: "14px 16px 0" }}>
          <div className="plan-form-inputs">
            <input
              ref={nameInputRef}
              type="text"
              autoComplete="off"
              aria-label={copy.plansFormNamePlaceholder}
              placeholder={copy.plansFormNamePlaceholder}
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              style={{
                background: "rgba(255,255,255,0.8)",
                border: `1.5px solid ${shaking ? "rgba(210,80,110,0.65)" : "#DDD4C5"}`,
                borderRadius: 8,
                padding: "10px 13px",
                fontFamily: "'DM Serif Display', serif",
                fontStyle: "italic",
                fontSize: 16,
                color: "#221509",
                outline: "none",
                transition: "border-color 200ms",
                width: "100%",
                boxSizing: "border-box",
                letterSpacing: "-0.01em",
              }}
            />
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split("T")[0]}
              aria-label={copy.plansFormDateLabel}
              onChange={(e) => onDateChange(e.target.value)}
              style={{
                background: "rgba(255,255,255,0.8)",
                border: "1.5px solid #DDD4C5",
                borderRadius: 8,
                padding: "10px 13px",
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                color: "#221509",
                outline: "none",
                colorScheme: "light",
                width: "100%",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* Emoji picker row */}
        <div
          ref={emojiBoxRef}
          style={{
            position: "relative",
            borderTop: "1px dashed #DDD4C5",
            margin: "14px 0 0",
            padding: "10px 16px 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <p style={{ margin: 0, fontSize: 11, color: "#9A8570", fontFamily: "'DM Sans', sans-serif" }}>
            {emoji ? emoji : "📅"}&ensp;{copy.plansFormEmojiPlaceholder}
          </p>
          <button
            type="button"
            onClick={() => setPickerOpen((v) => !v)}
            style={{
              flexShrink: 0,
              background: "rgba(255,255,255,0.7)",
              border: `1.5px solid ${pickerOpen ? "#C5922A" : "#DDD4C5"}`,
              color: pickerOpen ? "#A37118" : "#5A4A36",
              padding: "5px 12px",
              borderRadius: 8,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              transition: "border-color 0.15s, color 0.15s",
            }}
          >
            {pickerOpen ? "✕" : copy.plansFormEmojiPlaceholder}
          </button>
          {pickerOpen && (
            <div
              role="dialog"
              aria-label={copy.plansFormEmojiPlaceholder}
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                zIndex: 20,
                borderRadius: 14,
                overflow: "hidden",
                border: "1.5px solid #DDD4C5",
                boxShadow: "0 20px 40px rgba(40,25,15,0.22)",
              }}
            >
              <EmojiPicker
                width={320}
                height={400}
                lazyLoadEmojis
                searchDisabled={false}
                skinTonesDisabled
                theme={Theme.LIGHT}
                onEmojiClick={(data: EmojiClickData) => {
                  onEmojiChange(data.emoji);
                  setPickerOpen(false);
                }}
              />
            </div>
          )}
        </div>
      </div>

      <style>{`
        .plan-form-inputs {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 10px;
          align-items: center;
        }
        @media (max-width: 600px) {
          .plan-form-inputs {
            grid-template-columns: 1fr !important;
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-6px); }
          40%       { transform: translateX(6px); }
          60%       { transform: translateX(-4px); }
          80%       { transform: translateX(4px); }
        }
        .input-shake { animation: shake 420ms ease; }
      `}</style>
    </div>
  );
}
