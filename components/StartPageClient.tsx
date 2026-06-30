"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import EmojiPicker, { type EmojiClickData, Theme } from "emoji-picker-react";
import type { Locale } from "@/lib/i18n";
import { buildPlanStartUrl } from "@/lib/landing-event-form";
import type { StartPageCopy } from "@/lib/i18n-start";

// ── Design tokens (warm theme — exact values from spec) ───────────
const SERIF = "'Playfair Display', serif";
const SANS = "'DM Sans', sans-serif";
const pageBg = "#EFE8DD";
const textColor = "#221509";
const muted = "#9A8570";
const faint = "#C5B7A3";
const line = "#E0D6C6";
const surface = "#FFFFFF";
const surfaceSoft = "#FBF7F1";
const gold = "#C5922A";
const goldSoft = "#E8C878";
const goldTint = "#FBF1DC";
const purple = "#5B2D8E";
const purpleHi = "#7B3FBE";

// ── Plan icon SVGs (inline per design spec) ───────────────────────
function PlanIcon({ name, color }: { name: string; color: string }) {
  const s: React.CSSProperties = { width: 16, height: 16, display: "block" };
  if (name === "leaf")
    return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 4C9 4 4 9 4 18c0 1 .5 2 .5 2S14 19 18 13c2-3 2-9 2-9Z" />
        <path d="M7 17c3-4 7-7 11-9" />
      </svg>
    );
  if (name === "star")
    return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinejoin="round">
        <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.6 1-5.8-4.3-4.1 5.9-.9z" />
      </svg>
    );
  if (name === "layers")
    return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinejoin="round">
        <path d="M12 3l9 5-9 5-9-5 9-5z" />
        <path d="M3 13l9 5 9-5" />
      </svg>
    );
  if (name === "diamond")
    return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinejoin="round">
        <path d="M12 3l8 8-8 10L4 11z" />
      </svg>
    );
  if (name === "spark")
    return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v18M3 12h18M6 6l12 12M18 6L6 18" />
      </svg>
    );
  return null;
}

// ── Fixed plan config (display data, not i18n) ────────────────────
const PLAN_CONFIG = [
  { id: "free",     name: "Free",     price: "0€",  was: null,   chip: "#E2EDDB", ink: "#4E7A4A", icon: "leaf"    },
  { id: "standard", name: "Standard", price: "15€", was: null,   chip: "#E0E8F6", ink: "#3E5FA6", icon: "star"    },
  { id: "plus",     name: "Plus",     price: "35€", was: null,   chip: "#E9E0F1", ink: "#7A4FA6", icon: "layers"  },
  { id: "premium",  name: "Premium",  price: "65€", was: "70€",  chip: "#F5E6C4", ink: "#B07E25", icon: "diamond" },
  { id: "max",      name: "Max",      price: "90€", was: "100€", chip: "#F3DBE5", ink: "#B0517A", icon: "spark"   },
] as const;

type PlanId = (typeof PLAN_CONFIG)[number]["id"];

// ── Plan detail rows (static, not locale-dependent) ───────────────
const PLAN_DETAILS: Record<PlanId, Array<{ label: string; value: string }>> = {
  free:     [
    { label: "Photos",         value: "20"  },
    { label: "Videos",         value: "0"   },
    { label: "Guest limit",    value: "5"   },
    { label: "Upload window",  value: "3 days"  },
    { label: "Gallery kept",   value: "7 days"  },
    { label: "Download all",   value: "✓"   },
  ],
  standard: [
    { label: "Photos",         value: "150" },
    { label: "Videos",         value: "10"  },
    { label: "Guest limit",    value: "30"  },
    { label: "Upload window",  value: "7 days"  },
    { label: "Gallery kept",   value: "30 days" },
    { label: "Download all",   value: "✓"   },
  ],
  plus:     [
    { label: "Photos",         value: "500" },
    { label: "Videos",         value: "50"  },
    { label: "Guest limit",    value: "100" },
    { label: "Upload window",  value: "14 days" },
    { label: "Gallery kept",   value: "90 days" },
    { label: "Download all",   value: "✓"   },
  ],
  premium:  [
    { label: "Photos",         value: "2000"     },
    { label: "Videos",         value: "200"      },
    { label: "Guest limit",    value: "250"      },
    { label: "Upload window",  value: "30 days"  },
    { label: "Gallery kept",   value: "180 days" },
    { label: "Download all",   value: "✓"        },
  ],
  max:      [
    { label: "Photos",         value: "Unlimited" },
    { label: "Videos",         value: "Unlimited" },
    { label: "Guest limit",    value: "Unlimited" },
    { label: "Upload window",  value: "60 days"   },
    { label: "Gallery kept",   value: "365 days"  },
    { label: "Download all",   value: "✓"         },
  ],
};

const ALL_LOCALES: Locale[] = ["en", "hr", "de"];

// ── Upper-case label (reused across sections) ─────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: SANS,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.16em",
        textTransform: "uppercase" as const,
        color: muted,
      }}
    >
      {children}
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────────
export type StartPageClientProps = {
  copy: StartPageCopy;
  locale: Locale;
};

export function StartPageClient({ copy, locale }: StartPageClientProps) {
  const [name, setName] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [emoji, setEmoji] = useState<string>("🎉");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("plus");
  const [detailModalPlan, setDetailModalPlan] = useState<PlanId | null>(null);
  const [modalClosing, setModalClosing] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;
  const emojiBoxRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const router = useRouter();

  useEffect(() => {
    if (!pickerOpen) return;
    const onDocDown = (e: MouseEvent) => {
      if (emojiBoxRef.current?.contains(e.target as Node)) return;
      setPickerOpen(false);
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [pickerOpen]);

  function closeModal() {
    setModalClosing(true);
  }

  function handleSubmit(planId?: PlanId) {
    const plan = planId ?? selectedPlan;
    if (!name.trim()) {
      const el = nameInputRef.current;
      if (el) {
        el.classList.remove("sp-shake");
        void el.offsetWidth;
        el.classList.add("sp-shake");
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => el.classList.remove("sp-shake"), 420);
      }
      return;
    }
    router.push(buildPlanStartUrl(name.trim(), date, emoji, plan));
  }

  return (
    <>
      {/* ── PAGE BACKGROUND ── */}
      <div
        style={{
          background: pageBg,
          fontFamily: SANS,
          color: textColor,
          position: "relative",
          minHeight: "100vh",
        }}
      >
        {/* Purple glow */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: -100,
            right: -80,
            width: 360,
            height: 300,
            background:
              "radial-gradient(ellipse at center, rgba(123,63,190,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* ── NAV ── */}
        <nav
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px",
            borderBottom: `1px solid ${line}`,
          }}
        >
          <a href={`/${locale}`} style={{ textDecoration: "none" }}>
            <span
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: 20,
                color: textColor,
              }}
            >
              Calisto.
            </span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Language switcher */}
            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
              {ALL_LOCALES.map((l) => (
                <a
                  key={l}
                  href={`/${l}/start`}
                  style={{
                    padding: "4px 9px",
                    borderRadius: 7,
                    textDecoration: "none",
                    background: l === locale ? gold : "transparent",
                    color: l === locale ? "#1a0f00" : "rgba(34,21,9,0.42)",
                    fontSize: 10,
                    fontWeight: 700,
                    fontFamily: SANS,
                    letterSpacing: "0.06em",
                    transition: "all 0.18s",
                  }}
                >
                  {l.toUpperCase()}
                </a>
              ))}
            </div>
            <a
              href="/auth/login"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: textColor,
                textDecoration: "none",
              }}
            >
              {copy.loginLink}
            </a>
          </div>
        </nav>

        {/* ── CONTENT COLUMN (430–480px centered) ── */}
        <div
          style={{
            maxWidth: 480,
            margin: "0 auto",
            position: "relative",
            zIndex: 1,
          }}
        >

          {/* ── HERO ── */}
          <div style={{ padding: "32px 26px 0" }}>
            {/* Review badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                background: goldTint,
                border: `1px solid ${goldSoft}`,
                borderRadius: 30,
                padding: "6px 13px",
                marginBottom: 16,
              }}
            >
              <span style={{ color: gold, fontSize: 12 }}>★★★★★</span>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: "#3A2A18" }}>
                {copy.reviewBadge}
              </span>
            </div>
            {/* Headline */}
            <h1
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: 36,
                lineHeight: 1.07,
                margin: 0,
                color: textColor,
              }}
            >
              {copy.heroLine1}
              <br />
              {copy.heroLine2}
            </h1>
            {/* Subcopy */}
            <p
              style={{
                fontSize: 14.5,
                color: muted,
                lineHeight: 1.55,
                margin: "14px 0 0",
                maxWidth: 340,
              }}
            >
              {copy.heroSub}
            </p>
          </div>

          {/* ── FORM CARD ── */}
          <div style={{ padding: "24px 22px 0" }}>
            <div
              style={{
                background: surface,
                borderRadius: 20,
                padding: "22px 20px 24px",
                border: `1px solid ${line}`,
                boxShadow: "0 18px 40px -22px rgba(80,55,20,0.22)",
              }}
            >
              {/* Name */}
              <div style={{ marginBottom: 11 }}>
                <label
                  htmlFor="sp-name"
                  style={{
                    fontFamily: SANS,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: muted,
                    marginBottom: 7,
                    display: "block",
                  }}
                >
                  {copy.formNameLabel}
                </label>
                <input
                  id="sp-name"
                  ref={nameInputRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={copy.formNamePlaceholder}
                  className="sp-input"
                  style={{
                    width: "100%",
                    padding: "13px 15px",
                    background: surfaceSoft,
                    border: `1.5px solid ${line}`,
                    borderRadius: 13,
                    fontSize: 15.5,
                    color: textColor,
                    fontFamily: SANS,
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Date */}
              <div style={{ marginBottom: 11 }}>
                <label
                  htmlFor="sp-date"
                  style={{
                    fontFamily: SANS,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: muted,
                    marginBottom: 7,
                    display: "block",
                  }}
                >
                  {copy.formDateLabel}
                </label>
                <input
                  id="sp-date"
                  type="date"
                  value={date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setDate(e.target.value)}
                  className="sp-input"
                  style={{
                    width: "100%",
                    padding: "13px 15px",
                    background: surfaceSoft,
                    border: `1.5px solid ${line}`,
                    borderRadius: 13,
                    fontSize: 15.5,
                    color: textColor,
                    fontFamily: SANS,
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Emoji picker */}
              <div ref={emojiBoxRef} style={{ position: "relative" }}>
                <label
                  htmlFor="sp-emoji-btn"
                  style={{
                    fontFamily: SANS,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: muted,
                    marginBottom: 7,
                    display: "block",
                  }}
                >
                  {copy.formEmojiLabel}
                </label>
                <button
                  id="sp-emoji-btn"
                  type="button"
                  onClick={() => setPickerOpen((v) => !v)}
                  aria-expanded={pickerOpen}
                  aria-haspopup="dialog"
                  style={{
                    width: "100%",
                    height: 50,
                    background: pickerOpen ? goldTint : surfaceSoft,
                    border: `1.5px solid ${pickerOpen ? gold : line}`,
                    borderRadius: 13,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "0 15px",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    boxSizing: "border-box",
                  }}
                >
                  <span style={{ fontSize: 26, lineHeight: 1 }}>{emoji}</span>
                  <span
                    style={{
                      flex: 1,
                      textAlign: "left",
                      fontSize: 13,
                      color: muted,
                      fontFamily: SANS,
                    }}
                  >
                    {pickerOpen ? copy.formEmojiClose : copy.formEmojiOpen}
                  </span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    stroke={pickerOpen ? gold : faint}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flexShrink: 0, transform: pickerOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
                  >
                    <path d="M2 5l5 5 5-5" />
                  </svg>
                </button>
                {pickerOpen && (
                  <div
                    role="dialog"
                    aria-label={copy.formEmojiLabel}
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "calc(100% + 8px)",
                      zIndex: 20,
                      borderRadius: 14,
                      overflow: "hidden",
                      border: `1.5px solid ${line}`,
                      boxShadow: "0 20px 40px rgba(40,25,15,0.22)",
                    }}
                  >
                    <EmojiPicker
                      width="min(320px, calc(100vw - 52px))"
                      height={380}
                      lazyLoadEmojis
                      skinTonesDisabled
                      theme={Theme.LIGHT}
                      onEmojiClick={(data: EmojiClickData) => {
                        setEmoji(data.emoji);
                        setPickerOpen(false);
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Plan selector — pill tabs + detail card */}
              <div style={{ marginTop: 14 }}>
                <span
                  style={{
                    fontFamily: SANS,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase" as const,
                    color: muted,
                    marginBottom: 8,
                    display: "block",
                  }}
                >
                  Plan
                </span>

                {/* Pill tabs */}
                <div
                  className="sp-plan-tabs"
                  style={{
                    display: "flex",
                    gap: 5,
                    overflowX: "auto" as const,
                    paddingBottom: 9,
                  }}
                >
                  {PLAN_CONFIG.map((p) => {
                    const sel = selectedPlan === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPlan(p.id)}
                        style={{
                          flexShrink: 0,
                          padding: "6px 13px",
                          borderRadius: 20,
                          border: `1.5px solid ${sel ? gold : line}`,
                          background: sel ? goldTint : "transparent",
                          color: sel ? "#3A2A0A" : muted,
                          fontFamily: SANS,
                          fontSize: 12.5,
                          fontWeight: sel ? 700 : 500,
                          cursor: "pointer",
                          transition: "all 0.15s",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          whiteSpace: "nowrap" as const,
                        }}
                      >
                        {!sel && p.id === "plus" && (
                          <span
                            style={{
                              width: 5,
                              height: 5,
                              borderRadius: "50%",
                              background: gold,
                              flexShrink: 0,
                            }}
                          />
                        )}
                        {p.name}
                        {sel && p.id === "plus" && (
                          <span
                            style={{
                              fontSize: 7,
                              fontWeight: 800,
                              fontFamily: SANS,
                              letterSpacing: "0.1em",
                              textTransform: "uppercase" as const,
                              background: goldSoft,
                              color: "#3A2A0A",
                              padding: "1.5px 5px",
                              borderRadius: 6,
                              marginLeft: 2,
                            }}
                          >
                            {copy.popularBadge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Selected plan detail card */}
                {(() => {
                  const p = PLAN_CONFIG.find((pl) => pl.id === selectedPlan)!;
                  return (
                    <div
                      style={{
                        background: p.chip,
                        borderRadius: 14,
                        padding: "15px 16px",
                        border: "1.5px solid rgba(0,0,0,0.06)",
                        display: "flex",
                        gap: 13,
                        alignItems: "flex-start",
                        transition: "background 0.22s",
                        position: "relative",
                      }}
                    >
                      {/* ? info button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDetailModalPlan(p.id);
                        }}
                        aria-label={`View full ${p.name} plan details`}
                        style={{
                          position: "absolute",
                          bottom: 9,
                          right: 10,
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          border: `1.5px solid ${p.ink}`,
                          background: "rgba(255,255,255,0.5)",
                          color: p.ink,
                          fontFamily: SANS,
                          fontSize: 10.5,
                          fontWeight: 700,
                          lineHeight: 1,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 0,
                          transition: "background 0.15s, transform 0.15s",
                        }}
                        className="sp-help-btn"
                      >
                        ?
                      </button>

                      {/* Icon badge */}
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 11,
                          background: "rgba(255,255,255,0.55)",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "1px solid rgba(255,255,255,0.7)",
                          marginTop: 1,
                        }}
                      >
                        <PlanIcon name={p.icon} color={p.ink} />
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            flexWrap: "wrap" as const,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: SERIF,
                              fontStyle: "italic",
                              fontWeight: 700,
                              fontSize: 16.5,
                              color: textColor,
                              lineHeight: 1,
                            }}
                          >
                            {p.name}
                          </span>
                          {p.id === "plus" && (
                            <span
                              style={{
                                fontSize: 7,
                                fontWeight: 800,
                                fontFamily: SANS,
                                letterSpacing: "0.1em",
                                textTransform: "uppercase" as const,
                                background: goldSoft,
                                color: "#3A2A0A",
                                padding: "2px 5px",
                                borderRadius: 7,
                              }}
                            >
                              {copy.popularBadge}
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: p.ink,
                            fontWeight: 600,
                            marginTop: 3,
                          }}
                        >
                          {copy.guestLimits[p.id]}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: textColor,
                            lineHeight: 1.45,
                            marginTop: 6,
                            opacity: 0.65,
                          }}
                        >
                          {copy.planDescriptions[p.id]}
                        </div>
                      </div>

                      {/* Price */}
                      <div style={{ flexShrink: 0, textAlign: "right" as const }}>
                        {p.was && (
                          <div
                            style={{
                              fontSize: 11,
                              color: faint,
                              textDecoration: "line-through",
                              marginBottom: 1,
                            }}
                          >
                            {p.was}
                          </div>
                        )}
                        <div
                          style={{
                            fontFamily: SERIF,
                            fontWeight: 700,
                            fontSize: 22,
                            color: p.ink,
                            lineHeight: 1,
                          }}
                        >
                          {p.price}
                        </div>
                        <div
                          style={{
                            fontFamily: SANS,
                            fontSize: 8.5,
                            fontWeight: 700,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase" as const,
                            color: p.ink,
                            opacity: 0.6,
                            marginTop: 3,
                          }}
                        >
                          {copy.perEvent}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Primary CTA */}
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="sp-cta"
                style={{
                  width: "100%",
                  border: "none",
                  borderRadius: 14,
                  padding: "15px 24px",
                  marginTop: 17,
                  background: `linear-gradient(135deg, ${purpleHi} 0%, ${purple} 100%)`,
                  color: "#fff",
                  fontFamily: SANS,
                  fontSize: 14.5,
                  fontWeight: 700,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                {copy.formCta}
              </button>

              {/* Reassurance */}
              <p
                style={{
                  textAlign: "center",
                  fontSize: 12,
                  color: muted,
                  margin: "11px 0 0",
                }}
              >
                {copy.formReassurance}
              </p>

              {/* Demo link */}
              <div style={{ textAlign: "center", marginTop: 10 }}>
                <a
                  href="/demo"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 12,
                    fontFamily: SANS,
                    fontWeight: 600,
                    color: muted,
                    textDecoration: "none",
                    padding: "5px 10px",
                    borderRadius: 8,
                    border: `1px solid ${line}`,
                    background: surfaceSoft,
                    transition: "border-color 0.15s, color 0.15s",
                  }}
                  className="sp-demo-link"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  {copy.demoCta}
                </a>
              </div>
            </div>
          </div>

          {/* ── HOW IT WORKS ── */}
          <div style={{ padding: "38px 26px 0" }}>
            <div style={{ textAlign: "center", marginBottom: 18 }}>
              <SectionLabel>{copy.howLabel}</SectionLabel>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {copy.howSteps.map((step, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    background: surface,
                    border: `1px solid ${line}`,
                    borderRadius: 14,
                    padding: "13px 15px",
                  }}
                >
                  {/* Number medallion */}
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      flexShrink: 0,
                      borderRadius: "50%",
                      background: goldTint,
                      border: `1px solid ${goldSoft}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: SERIF,
                      fontStyle: "italic",
                      fontWeight: 700,
                      color: gold,
                      fontSize: 15,
                      lineHeight: 1,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: textColor }}>
                      {step.title}
                    </div>
                    <div style={{ fontSize: 12.5, color: muted, marginTop: 1 }}>
                      {step.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── REVIEWS ── */}
          <div style={{ padding: "40px 26px 0" }}>
            <div style={{ textAlign: "center", marginBottom: 18 }}>
              <SectionLabel>{copy.reviewsLabel}</SectionLabel>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {copy.reviews.map((review, i) => (
                <div
                  key={i}
                  style={{
                    background: surface,
                    border: `1px solid ${line}`,
                    borderRadius: 16,
                    padding: "18px 20px",
                  }}
                >
                  <div style={{ color: gold, fontSize: 13, marginBottom: 10 }}>★★★★★</div>
                  <p
                    style={{
                      fontFamily: SERIF,
                      fontStyle: "italic",
                      fontSize: 14,
                      lineHeight: 1.55,
                      color: textColor,
                      margin: "0 0 14px",
                    }}
                  >
                    &ldquo;{review.quote}&rdquo;
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: goldTint,
                        border: `1px solid ${goldSoft}`,
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: SERIF,
                        fontStyle: "italic",
                        fontWeight: 700,
                        fontSize: 13,
                        color: gold,
                        lineHeight: 1,
                      }}
                    >
                      {review.name[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: textColor }}>
                        {review.name}
                      </div>
                      <div style={{ fontSize: 11, color: muted }}>{review.event}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── FEATURE CHECKLIST ── */}
          <div style={{ padding: "36px 26px 0" }}>
            <div
              style={{
                background: surfaceSoft,
                border: `1px solid ${line}`,
                borderRadius: 18,
                padding: "20px 22px",
                display: "flex",
                flexDirection: "column",
                gap: 13,
              }}
            >
              {copy.features.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: purple,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 14 14"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2.5 7.5l3 3 6-7" />
                    </svg>
                  </div>
                  <span style={{ fontSize: 13.5, color: textColor }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── FAIR-USE NOTE ── */}
          <div style={{ padding: "34px 26px 0" }}>
            <p
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: 11.5,
                color: faint,
                lineHeight: 1.6,
                textAlign: "center",
                margin: 0,
              }}
            >
              {copy.fairUse}
            </p>
          </div>

          {/* Spacer so sticky bar never covers content */}
          <div style={{ height: 92 }} />
        </div>
      </div>

      {/* ── PLAN DETAIL MODAL (bottom sheet) ── */}
      {detailModalPlan && (() => {
        const p = PLAN_CONFIG.find((pl) => pl.id === detailModalPlan)!;
        const rows = PLAN_DETAILS[detailModalPlan];
        return (
          <>
            {/* Overlay */}
            <div
              role="presentation"
              onClick={closeModal}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(20,12,4,0.48)",
                zIndex: 200,
                animation: `${modalClosing ? "sp-fade-out" : "sp-fade-in"} 0.22s ease forwards`,
              }}
            />

            {/* Sheet */}
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`${p.name} plan details`}
              onAnimationEnd={() => {
                if (modalClosing) {
                  setDetailModalPlan(null);
                  setModalClosing(false);
                }
              }}
              style={{
                position: "fixed",
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 201,
                borderRadius: "22px 22px 0 0",
                overflow: "hidden",
                boxShadow: "0 -20px 60px rgba(20,12,4,0.3)",
                animation: `${modalClosing ? "sp-slide-down" : "sp-slide-up"} 0.24s cubic-bezier(0.16,1,0.3,1) forwards`,
                maxHeight: "85dvh",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Sheet header — plan color */}
              <div
                style={{
                  background: p.chip,
                  padding: "20px 20px 18px",
                  position: "relative",
                  flexShrink: 0,
                }}
              >
                {/* Drag handle */}
                <div
                  aria-hidden
                  style={{
                    width: 36,
                    height: 4,
                    borderRadius: 2,
                    background: "rgba(0,0,0,0.15)",
                    margin: "0 auto 16px",
                  }}
                />

                {/* Close button */}
                <button
                  type="button"
                  onClick={closeModal}
                  aria-label="Close"
                  style={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    border: `1.5px solid ${p.ink}`,
                    background: "rgba(255,255,255,0.45)",
                    color: p.ink,
                    fontFamily: SANS,
                    fontSize: 13,
                    fontWeight: 700,
                    lineHeight: 1,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                  }}
                >
                  ✕
                </button>

                {/* Plan identity */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.55)",
                      border: "1px solid rgba(255,255,255,0.7)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <PlanIcon name={p.icon} color={p.ink} />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span
                        style={{
                          fontFamily: SERIF,
                          fontStyle: "italic",
                          fontWeight: 700,
                          fontSize: 22,
                          color: textColor,
                          lineHeight: 1,
                        }}
                      >
                        {p.name}
                      </span>
                      {p.id === "plus" && (
                        <span
                          style={{
                            fontSize: 7.5,
                            fontWeight: 800,
                            fontFamily: SANS,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase" as const,
                            background: goldSoft,
                            color: "#3A2A0A",
                            padding: "2px 6px",
                            borderRadius: 7,
                          }}
                        >
                          {copy.popularBadge}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: p.ink, fontWeight: 600, marginTop: 3 }}>
                      {copy.guestLimits[p.id]}
                    </div>
                  </div>
                  <div style={{ marginLeft: "auto", textAlign: "right" as const, flexShrink: 0 }}>
                    {p.was && (
                      <div style={{ fontSize: 11, color: faint, textDecoration: "line-through" }}>
                        {p.was}
                      </div>
                    )}
                    <div
                      style={{
                        fontFamily: SERIF,
                        fontWeight: 700,
                        fontSize: 28,
                        color: p.ink,
                        lineHeight: 1,
                      }}
                    >
                      {p.price}
                    </div>
                    <div
                      style={{
                        fontFamily: SANS,
                        fontSize: 8.5,
                        fontWeight: 700,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase" as const,
                        color: p.ink,
                        opacity: 0.6,
                        marginTop: 2,
                      }}
                    >
                      {copy.perEvent}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p
                  style={{
                    fontFamily: SANS,
                    fontSize: 12.5,
                    color: textColor,
                    opacity: 0.65,
                    lineHeight: 1.5,
                    margin: "12px 0 0",
                  }}
                >
                  {copy.planDescriptions[p.id]}
                </p>
              </div>

              {/* Rows */}
              <div
                style={{
                  background: surface,
                  overflowY: "auto" as const,
                  flex: 1,
                }}
              >
                {rows.map((row, i) => (
                  <div
                    key={row.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 20px",
                      borderBottom: i < rows.length - 1 ? `1px solid ${line}` : "none",
                      background: i % 2 === 0 ? surfaceSoft : surface,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: SANS,
                        fontSize: 12,
                        fontWeight: 600,
                        letterSpacing: "0.04em",
                        color: muted,
                        textTransform: "uppercase" as const,
                      }}
                    >
                      {row.label}
                    </span>
                    <span
                      style={{
                        fontFamily: row.value === "✓" ? SANS : SERIF,
                        fontStyle: row.value === "✓" ? "normal" : "italic",
                        fontWeight: 700,
                        fontSize: row.value === "✓" ? 16 : 15,
                        color: row.value === "✓" ? p.ink : textColor,
                      }}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}

                {/* CTA inside sheet */}
                <div style={{ padding: "18px 20px", paddingBottom: "calc(18px + env(safe-area-inset-bottom))" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlan(p.id);
                      handleSubmit(p.id);
                    }}
                    className="sp-cta"
                    style={{
                      width: "100%",
                      border: "none",
                      borderRadius: 14,
                      padding: "15px 24px",
                      background: `linear-gradient(135deg, ${purpleHi} 0%, ${purple} 100%)`,
                      color: "#fff",
                      fontFamily: SANS,
                      fontSize: 14.5,
                      fontWeight: 700,
                      letterSpacing: "0.07em",
                      textTransform: "uppercase" as const,
                      cursor: "pointer",
                    }}
                  >
                    {copy.choosePlanCta}
                  </button>
                </div>
              </div>
            </div>
          </>
        );
      })()}

      {/* ── STICKY MOBILE CTA BAR (fixed to viewport bottom) ── */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "12px 18px",
          paddingBottom: "calc(12px + env(safe-area-inset-bottom))",
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderTop: `1px solid ${line}`,
          boxShadow: "0 -6px 20px -8px rgba(20,12,4,0.18)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          zIndex: 100,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: textColor }}>
            {copy.stickyTitle}
          </div>
          <div style={{ fontSize: 11, color: muted }}>{copy.stickySub}</div>
        </div>
        <button
          type="button"
          onClick={() => handleSubmit()}
          className="sp-cta"
          style={{
            flexShrink: 0,
            border: "none",
            borderRadius: 14,
            padding: "13px 20px",
            background: `linear-gradient(135deg, ${purpleHi} 0%, ${purple} 100%)`,
            color: "#fff",
            fontFamily: SANS,
            fontSize: 14.5,
            fontWeight: 700,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          {copy.stickyCta}
        </button>
      </div>

      {/* ── GLOBAL STYLES for this page ── */}
      <style>{`
        .sp-input:focus {
          border-color: ${gold} !important;
          outline: none;
        }
        .sp-plan-tabs {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .sp-plan-tabs::-webkit-scrollbar { display: none; }
        .sp-help-btn:hover {
          background: rgba(255,255,255,0.8) !important;
          transform: scale(1.12);
        }
        .sp-demo-link:hover {
          border-color: ${gold} !important;
          color: ${gold} !important;
        }
        @keyframes sp-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes sp-fade-out {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        @keyframes sp-slide-up {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @keyframes sp-slide-down {
          from { transform: translateY(0); }
          to   { transform: translateY(100%); }
        }
        .sp-cta {
          transition: all 0.2s;
          box-shadow: 0 5px 16px rgba(91,45,142,0.30);
        }
        .sp-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 30px rgba(91,45,142,0.30);
        }
        @keyframes sp-shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-5px); }
          40%       { transform: translateX(5px); }
          60%       { transform: translateX(-4px); }
          80%       { transform: translateX(4px); }
        }
        .sp-shake { animation: sp-shake 0.42s ease-out; }
      `}</style>
    </>
  );
}
