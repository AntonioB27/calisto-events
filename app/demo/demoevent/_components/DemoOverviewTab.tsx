"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import QRCode from "react-qr-code";
import { useAppUi } from "@/components/AppUiProvider";
import { DEMO_EVENT, DEMO_GUESTS, DEMO_PHOTOS } from "../_data/demo-event";
import { useDemoToast } from "./DemoToastProvider";
import {
  formatQuotaSublabelLocalized,
  getPlanLimits,
  getRetentionDeletionEndMs,
  getUploadWindowEndMs,
  isUnlimitedQuota,
  normalizePlanId,
} from "@/lib/plan-limits";
import { getWebJoinUrl } from "@/lib/join-link";

const GOLD       = '#C5922A';
const PURPLE     = '#5B2D8E';
const RUST       = '#D17A2A';
const GOLD_FOIL  = 'linear-gradient(135deg, #E6BF66 0%, #C5922A 45%, #F4D88F 70%, #946C18 100%)';
const TEXT       = 'var(--app-text)';
const TEXT_S     = 'var(--app-text-sub)';
const MUTED      = 'var(--app-muted)';
const BORDER     = 'var(--app-border)';
const FB = "'DM Sans', sans-serif";
const FS = "'DM Serif Display', serif";

const GLASS_LIGHT: React.CSSProperties = {
  background: 'rgba(255,255,255,0.62)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: '1px solid rgba(255,255,255,0.78)',
  boxShadow: '0 10px 30px -8px rgba(40,25,15,0.18), inset 0 1px 0 rgba(255,255,255,0.7)',
};
const GLASS_DARK: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 10px 30px -8px rgba(0,0,0,0.4)',
};

const DarkCtx = React.createContext(false);

function parseDateParts(dateStr: string) {
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const y = Number(match[1]), m = Number(match[2]), d = Number(match[3]);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  return {
    day: d,
    month: date.toLocaleDateString('en', { month: 'long' }),
    year: y,
    weekday: date.toLocaleDateString('en', { weekday: 'short' }),
  };
}

function msToDaysHours(ms: number) {
  const clamped = Math.max(0, ms);
  return {
    days: Math.floor(clamped / (24 * 60 * 60 * 1000)),
    hours: Math.floor((clamped % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)),
  };
}

// ── Status ribbon — editorial paper card ──────────────────────────────────────
function StatusRibbon() {
  const isDark = React.useContext(DarkCtx);
  const ui = useAppUi();
  const cal = parseDateParts(DEMO_EVENT.date);
  const planId = normalizePlanId(DEMO_EVENT.plan);
  const planName = ui.plans[planId];

  return (
    <div style={{ position: 'relative' }}>
      {/* Washi tape */}
      <div aria-hidden style={{ position: 'absolute', top: -9, left: '38%', width: 64, height: 14, background: 'rgba(212,168,67,0.45)', border: '0.5px solid rgba(212,168,67,0.55)', transform: 'rotate(-2deg)', boxShadow: '0 1px 4px rgba(0,0,0,0.18)', zIndex: 2, borderRadius: 2, pointerEvents: 'none' }} />
      {/* Paper card */}
      <div style={{
        background: isDark ? '#1e1a17' : '#f4f0ea',
        borderRadius: 3,
        boxShadow: isDark
          ? '0 8px 28px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.35)'
          : '0 8px 28px rgba(0,0,0,0.32), 0 2px 8px rgba(0,0,0,0.14)',
        transform: 'rotate(-0.4deg)',
        overflow: 'hidden',
      }}>
        {/* Gold ruled header line */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, #946C18, #E6BF66 40%, #C5922A 70%, #946C18)', opacity: 0.9 }} />
        <div style={{ padding: '14px 16px 16px', display: 'flex', alignItems: 'stretch', gap: 0 }}>
          {/* Date stamp */}
          <div style={{ paddingRight: 16, marginRight: 16, borderRight: `1px dashed ${isDark ? 'rgba(197,146,42,0.3)' : 'rgba(197,146,42,0.4)'}`, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 72 }}>
            {cal ? (
              <>
                <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: isDark ? '#7a6a5a' : '#9A8570', fontFamily: FB }}>{cal.weekday}</div>
                <div style={{ fontFamily: FS, fontStyle: 'italic', fontWeight: 700, fontSize: 52, lineHeight: 0.85, color: GOLD, letterSpacing: '-0.04em', marginTop: 2 }}>{cal.day}</div>
                <div style={{ fontFamily: FS, fontStyle: 'italic', fontSize: 13, color: isDark ? '#d4c4a8' : '#2a1d0f', marginTop: 3, lineHeight: 1 }}>{cal.month}</div>
                <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', color: isDark ? '#7a6a5a' : '#9A8570', fontFamily: FB, marginTop: 2 }}>{cal.year}</div>
              </>
            ) : (
              <div style={{ fontFamily: FS, fontStyle: 'italic', fontSize: 28, color: GOLD }}>—</div>
            )}
          </div>
          {/* Plan seal + role stamp */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 10 }}>
            <div>
              <div style={{ fontSize: 7.5, fontWeight: 700, letterSpacing: '0.26em', textTransform: 'uppercase', color: isDark ? '#7a6a5a' : '#9A8570', fontFamily: FB, marginBottom: 5 }}>{ui.overview.planLabel}</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: GOLD_FOIL, borderRadius: 4, padding: '4px 12px', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 8px rgba(148,108,24,0.28)' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,255,255,0.6)', flexShrink: 0 }} />
                <span style={{ fontFamily: FS, fontStyle: 'italic', fontWeight: 700, fontSize: 15, color: '#fff', letterSpacing: '0.04em', textShadow: '0 1px 2px rgba(100,60,0,0.3)' }}>{planName}</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 7.5, fontWeight: 700, letterSpacing: '0.26em', textTransform: 'uppercase', color: isDark ? '#7a6a5a' : '#9A8570', fontFamily: FB, marginBottom: 4 }}>{ui.overview.yourRole}</div>
              <div style={{ display: 'inline-block', fontFamily: FB, fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: PURPLE, border: `1.5px solid ${PURPLE}`, borderRadius: 3, padding: '3px 8px', opacity: 0.85 }}>
                Organizer
              </div>
            </div>
          </div>
        </div>
        <div style={{ height: 1, background: isDark ? 'rgba(197,146,42,0.15)' : 'rgba(197,146,42,0.25)', margin: '0 16px' }} />
        <div style={{ padding: '5px 16px 8px', fontSize: 7.5, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: isDark ? '#5a4a3a' : '#c4b49f', fontFamily: FB }}>
          Calisto · Event Record
        </div>
      </div>
    </div>
  );
}

// ── Pre-event countdown: Art Deco analog clock + time remaining ───────────────
function AnalogClock({ nowMs, isDark }: { nowMs: number; isDark: boolean }) {
  const now = new Date(nowMs);
  const h = now.getHours() % 12;
  const m = now.getMinutes();
  const s = now.getSeconds();
  const CX = 50, CY = 50;

  function toXY(angleDeg: number, r: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: CX + Math.cos(rad) * r, y: CY + Math.sin(rad) * r };
  }

  const hourAngle   = (h / 12) * 360 + (m / 60) * 30;
  const minuteAngle = (m / 60) * 360 + (s / 60) * 6;
  const secondAngle = (s / 60) * 360;

  const minuteTicks = Array.from({ length: 60 }, (_, i) => {
    const isHour = i % 5 === 0, isQuarter = i % 15 === 0;
    return {
      pt1: toXY((i / 60) * 360, isQuarter ? 36 : isHour ? 38 : 40),
      pt2: toXY((i / 60) * 360, 43),
      isHour, isQuarter,
    };
  });

  const romans = [
    { label: 'XII', deg: 0 }, { label: 'III', deg: 90 },
    { label: 'VI', deg: 180 }, { label: 'IX', deg: 270 },
  ].map(({ label, deg }) => ({ label, ...toXY(deg, 29) }));

  const guillo = Array.from({ length: 72 }, (_, i) => toXY((i / 72) * 360, 26));
  const face = isDark ? '#1e1a17' : '#f4f0ea';

  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <radialGradient id="demoAdFaceGrad" cx="45%" cy="38%" r="65%">
          <stop offset="0%"   stopColor={isDark ? '#2e2822' : '#fefcf8'} />
          <stop offset="100%" stopColor={face} />
        </radialGradient>
        <radialGradient id="demoAdGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor={PURPLE} stopOpacity="0.13" />
          <stop offset="100%" stopColor={PURPLE} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="demoAdBezel" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%"   stopColor="#F4D88F" />
          <stop offset="30%"  stopColor="#C5922A" />
          <stop offset="65%"  stopColor="#E6BF66" />
          <stop offset="100%" stopColor="#7A5010" />
        </linearGradient>
        <linearGradient id="demoAdHrHand" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#E6BF66" />
          <stop offset="50%"  stopColor={GOLD} />
          <stop offset="100%" stopColor="#946C18" />
        </linearGradient>
      </defs>

      <circle cx={CX} cy={CY} r={48} fill="url(#demoAdBezel)" />
      <circle cx={CX} cy={CY} r={44.2} fill="none" stroke={isDark ? 'rgba(0,0,0,0.5)' : 'rgba(60,35,5,0.3)'} strokeWidth="0.6" />
      <circle cx={CX} cy={CY} r={44} fill="url(#demoAdFaceGrad)" />
      <circle cx={CX} cy={CY} r={38} fill="url(#demoAdGlow)" />

      {guillo.map((pt, i) => (
        <line key={i} x1={CX} y1={CY} x2={pt.x} y2={pt.y}
          stroke={GOLD} strokeWidth="0.15" opacity={isDark ? 0.07 : 0.09} />
      ))}

      <circle cx={CX} cy={CY} r={43.5} fill="none" stroke={GOLD} strokeWidth="0.25" opacity="0.45" />
      <circle cx={CX} cy={CY} r={35.5} fill="none" stroke={GOLD} strokeWidth="0.2"  opacity="0.18" />

      {minuteTicks.map((t, i) => (
        <line key={i} x1={t.pt1.x} y1={t.pt1.y} x2={t.pt2.x} y2={t.pt2.y}
          stroke={GOLD}
          strokeWidth={t.isQuarter ? 1.0 : t.isHour ? 0.65 : 0.3}
          opacity={t.isQuarter ? 0.8 : t.isHour ? 0.55 : 0.28}
          strokeLinecap="square" />
      ))}

      {romans.map(({ label, x, y }) => (
        <text key={label} x={x} y={y}
          textAnchor="middle" dominantBaseline="central"
          fontFamily="'DM Serif Display', serif" fontStyle="italic"
          fontSize="5.8" fill={GOLD} opacity="0.82"
        >{label}</text>
      ))}

      <g transform={`translate(${CX} ${CY}) rotate(${hourAngle})`}>
        <path d="M 0 7 L -1.8 1 L -2 -4 L -0.7 -20 L 0 -25 L 0.7 -20 L 2 -4 L 1.8 1 Z" fill="url(#demoAdHrHand)" />
        <polygon points="0,-6 2.4,0 0,6 -2.4,0" fill="url(#demoAdHrHand)" />
      </g>

      <g transform={`translate(${CX} ${CY}) rotate(${minuteAngle})`}>
        <path d="M 0 7 L -1.3 1 L -1.5 -4 L -0.4 -28 L 0 -33 L 0.4 -28 L 1.5 -4 L 1.3 1 Z" fill={RUST} opacity="0.88" />
        <polygon points="0,-5 2,0 0,5 -2,0" fill={RUST} opacity="0.88" />
      </g>

      <g transform={`translate(${CX} ${CY}) rotate(${secondAngle})`} opacity="0.65">
        <line x1="0" y1="9" x2="0" y2="-37" stroke={PURPLE} strokeWidth="0.65" strokeLinecap="round" />
        <circle cx="0" cy="-27" r="1.4" fill={PURPLE} />
        <circle cx="0" cy="6" r="2.2" fill="none" stroke={PURPLE} strokeWidth="0.65" />
      </g>

      <circle cx={CX} cy={CY} r="4"   fill="url(#demoAdBezel)" />
      <circle cx={CX} cy={CY} r="2.4" fill={face} />
      <circle cx={CX} cy={CY} r="1"   fill={GOLD} opacity="0.75" />
    </svg>
  );
}

function DemoEventStartCountdown() {
  const ui = useAppUi();
  const isDark = React.useContext(DarkCtx);
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const eventStartMs = useMemo(() => {
    const m = DEMO_EVENT.date.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return null;
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime();
  }, []);

  const remainingMs = eventStartMs ? Math.max(0, eventStartMs - nowMs) : 0;
  const totalDays = Math.floor(remainingMs / (24 * 3600 * 1000));
  const months = Math.floor(totalDays / 30);
  const showMonths = months >= 1;
  const days = showMonths ? totalDays % 30 : totalDays;
  const hours = Math.floor((remainingMs % (24 * 3600 * 1000)) / (3600 * 1000));

  const monthLabel = (months === 1 ? ui.overview.countdownMonthOne : ui.overview.countdownMonthMany).replace('{n}', '').trim();
  const dayLabel   = (days   === 1 ? ui.overview.countdownDayOne   : ui.overview.countdownDayMany  ).replace('{n}', '').trim();
  const hourLabel  = (hours  === 1 ? ui.overview.countdownHourOne  : ui.overview.countdownHourMany ).replace('{n}', '').trim();

  const units = [
    ...(showMonths ? [{ value: months, label: monthLabel, accent: GOLD   }] : []),
    { value: days,  label: dayLabel,  accent: RUST   },
    { value: hours, label: hourLabel, accent: PURPLE },
  ];

  return (
    <div style={{ ...(isDark ? GLASS_DARK : GLASS_LIGHT), borderRadius: 18, overflow: 'hidden', position: 'relative' }}>
      <div style={{ height: 3, background: 'linear-gradient(90deg, #946C18, #E6BF66 40%, #C5922A 70%, #946C18)', opacity: 0.9 }} />
      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        <div style={{ width: '44%', flexShrink: 0, padding: '16px 12px 16px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 130, aspectRatio: '1 / 1' }}>
            <AnalogClock nowMs={nowMs} isDark={isDark} />
          </div>
        </div>
        <div style={{
          width: 1, alignSelf: 'stretch', margin: '16px 0',
          background: `repeating-linear-gradient(to bottom, ${GOLD}55 0px, ${GOLD}55 5px, transparent 5px, transparent 9px)`,
        }} />
        <div style={{ flex: 1, padding: '20px 16px 20px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.26em', textTransform: 'uppercase', color: TEXT_S, fontFamily: FB, marginBottom: 14 }}>
            {ui.overview.eventStartsIn}
          </div>
          {units.map((unit, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: i < units.length - 1 ? 8 : 0 }}>
              <span style={{ fontFamily: FS, fontStyle: 'italic', fontWeight: 400, fontSize: 46, color: unit.accent, letterSpacing: '-0.03em', lineHeight: 0.88 }}>
                {unit.value}
              </span>
              <span style={{ fontFamily: FB, fontSize: 10, fontWeight: 700, color: unit.accent, opacity: 0.65, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                {unit.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Countdown cards ────────────────────────────────────────────────────────────
function CountdownCard({ label, days, hours, isEnded, endedLabel, accent, daysWord }: {
  label: string; days: number; hours: number; isEnded: boolean; endedLabel: string; accent: string; daysWord: string;
}) {
  const isDark = React.useContext(DarkCtx);
  return (
    <div style={{ ...(isDark ? GLASS_DARK : GLASS_LIGHT), borderRadius: 18, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 3, background: accent, flexShrink: 0 }} />
      <div style={{ padding: '14px 16px 16px', position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!isEnded && (
          <div aria-hidden style={{ position: 'absolute', right: -8, bottom: -12, fontFamily: FS, fontStyle: 'italic', fontWeight: 700, fontSize: 110, lineHeight: 1, color: accent, opacity: isDark ? 0.06 : 0.07, letterSpacing: '-0.04em', pointerEvents: 'none', userSelect: 'none' }}>
            {days}
          </div>
        )}
        {isEnded ? (
          <>
            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: accent, fontFamily: FB, marginBottom: 8 }}>{label}</div>
            <div style={{ fontFamily: FS, fontStyle: 'italic', fontSize: 15, color: accent, lineHeight: 1.35 }}>{endedLabel}</div>
          </>
        ) : (
          <>
            <div style={{ position: 'relative', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontFamily: FS, fontStyle: 'italic', fontWeight: 400, fontSize: 52, color: accent, letterSpacing: '-0.03em', lineHeight: 0.88 }}>{days}</span>
                <span style={{ fontFamily: FB, fontSize: 9.5, fontWeight: 700, color: accent, opacity: 0.6, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 4 }}>{daysWord}</span>
              </div>
              <div style={{ marginTop: 5, fontFamily: FB, fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: '0.04em' }}>+{hours}h</div>
            </div>
            <div style={{ marginTop: 14, paddingTop: 10, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}` }}>
              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: accent, fontFamily: FB, opacity: 0.75 }}>{label}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CountdownCards() {
  const ui = useAppUi();
  const planId = normalizePlanId(DEMO_EVENT.plan);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const uploadEndMs = useMemo(() => getUploadWindowEndMs({ planId, eventDate: DEMO_EVENT.date }), [planId]);
  const deletionEndMs = useMemo(() => getRetentionDeletionEndMs({ planId, eventDate: DEMO_EVENT.date }), [planId]);

  const uploadParts = msToDaysHours(uploadEndMs ? Math.max(0, uploadEndMs - nowMs) : 0);
  const deletionParts = msToDaysHours(deletionEndMs ? Math.max(0, deletionEndMs - nowMs) : 0);
  const uploadEnded = !uploadEndMs || uploadEndMs <= nowMs;
  const deletionEnded = !deletionEndMs || deletionEndMs <= nowMs;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      <CountdownCard label={ui.overview.uploadCloseLabel} days={uploadParts.days} hours={uploadParts.hours} accent={RUST}   isEnded={uploadEnded}   endedLabel={ui.overview.uploadWindowEnded}  daysWord={ui.createStep2.daysWord} />
      <CountdownCard label={ui.overview.autoDeletionLabel} days={deletionParts.days} hours={deletionParts.hours} accent={PURPLE} isEnded={deletionEnded} endedLabel={ui.overview.autoDeletionOverdue} daysWord={ui.createStep2.daysWord} />
    </div>
  );
}

// ── Stats tiles ───────────────────────────────────────────────────────────────
function StatsTiles() {
  const isDark = React.useContext(DarkCtx);
  const ui = useAppUi();
  const photos = DEMO_PHOTOS.length;
  const guests = DEMO_GUESTS.length;
  const planId = normalizePlanId(DEMO_EVENT.plan);
  const limits = getPlanLimits(planId);

  function subFor(cap: number) {
    return formatQuotaSublabelLocalized(cap, ui.quotas.unlimitedPlan, ui.quotas.ofCount, ui.locale);
  }

  const videoMax = limits.videos;
  const videoCap = !isUnlimitedQuota(videoMax) && videoMax <= 0 ? ui.quotas.notOnPlan : subFor(videoMax);

  function Tile({ n, label, cap, accent, mascot, rotation, tape, imgPadding = 0, swayDelay = "0s" }: { n: number; label: string; cap: string; accent: string; mascot: string; rotation: number; tape?: { left: string; deg: number }; imgPadding?: number; swayDelay?: string }) {
    return (
      <div className="polaroid-sway" style={{ position: "relative", animationDelay: swayDelay }}>
        {tape && (
          <div aria-hidden style={{ position: "absolute", top: -7, left: tape.left, width: 52, height: 12, background: "rgba(212,168,67,0.45)", border: "0.5px solid rgba(212,168,67,0.55)", transform: `rotate(${tape.deg}deg)`, boxShadow: "0 1px 4px rgba(0,0,0,0.18)", zIndex: 2, borderRadius: 2, pointerEvents: "none" }} />
        )}
        <div style={{ background: isDark ? '#1e1a17' : '#f4f0ea', borderRadius: 3, boxShadow: isDark ? '0 8px 28px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)' : '0 8px 28px rgba(0,0,0,0.38), 0 2px 8px rgba(0,0,0,0.18)', transform: `rotate(${rotation}deg)`, padding: "9px 9px 14px", display: "flex", flexDirection: "column", gap: 0 }}>
          <div style={{ position: "relative", borderRadius: 2, overflow: "hidden", background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', aspectRatio: "1 / 1", marginBottom: 9 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mascot} alt="" aria-hidden style={{ position: "absolute", inset: `${imgPadding}%`, width: `${100 - imgPadding * 2}%`, height: `${100 - imgPadding * 2}%`, objectFit: "contain" }} />
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: FS, fontStyle: "italic", fontWeight: 400, fontSize: 34, color: accent, letterSpacing: "-0.04em", lineHeight: 0.9 }}>{n}</div>
            <div style={{ fontFamily: FS, fontStyle: "italic", fontSize: 12, color: isDark ? '#d4c4a8' : '#2a1d0f', marginTop: 3 }}>{label}</div>
            <div style={{ fontSize: 7.5, color: isDark ? '#7a6a5a' : '#9A8570', fontWeight: 600, marginTop: 2, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: FB }}>{cap}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: TEXT_S, fontFamily: FB }}>{ui.overview.statsTitle}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, padding: "8px 4px 4px" }}>
        <Tile n={photos} label={ui.overview.statsPhotos} cap={subFor(limits.photos)} accent={PURPLE} mascot="/brand/mascot/aurora_camera.png"    rotation={-1.5} tape={{ left: "22%", deg: -3 }} imgPadding={0}  swayDelay="0s" />
        <Tile n={0}      label={ui.overview.statsVideos} cap={videoCap}               accent="#7A6A5A" mascot="/brand/mascot/aurora_recording.png" rotation={1}    tape={{ left: "28%", deg: 2 }} imgPadding={20} swayDelay="-1.3s" />
        <Tile n={guests} label={ui.overview.statsGuests} cap={subFor(limits.guests)}  accent={GOLD}   mascot="/brand/mascot/aurora_guests.png"     rotation={-0.5} tape={{ left: "24%", deg: -1.5 }} imgPadding={14} swayDelay="-2.6s" />
      </div>
    </div>
  );
}

// ── Access card ───────────────────────────────────────────────────────────────
function AccessCard({ publicOrigin }: { publicOrigin: string }) {
  const isDark = React.useContext(DarkCtx);
  const ui = useAppUi();
  const { triggerDemoToast } = useDemoToast();
  const [showQR, setShowQR] = useState(false);
  const joinUrl = getWebJoinUrl(publicOrigin, DEMO_EVENT.accessCode);

  return (
    <div style={{ position: "relative", borderRadius: 20, padding: "18px 16px 16px", background: isDark ? "linear-gradient(140deg, rgba(139,79,216,0.3), rgba(197,146,42,0.18) 60%, transparent), rgba(255,255,255,0.06)" : "linear-gradient(140deg, rgba(139,79,216,0.18), rgba(197,146,42,0.12) 60%, transparent), rgba(255,255,255,0.72)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(255,255,255,0.78)", boxShadow: isDark ? "0 14px 32px -10px rgba(0,0,0,0.5)" : "0 14px 32px -10px rgba(40,25,15,0.22), inset 0 1px 0 rgba(255,255,255,0.7)", overflow: "hidden" }}>
      <div style={{ position: "absolute", bottom: -40, right: -30, width: 140, height: 140, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,79,216,0.5), transparent 65%)", filter: "blur(8px)", pointerEvents: "none" }} />
      <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: TEXT_S, fontFamily: FB, position: "relative" }}>{ui.overview.accessCodeTitle}</div>
      <div style={{ marginTop: 12, padding: "14px 16px", background: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.88)", border: `1px dashed ${BORDER}`, borderRadius: 12, fontFamily: "var(--font-mono, ui-monospace)", fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: "0.12em", textAlign: "center", position: "relative" }}>
        {DEMO_EVENT.accessCode}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 8, marginTop: 10, position: "relative" }}>
        <button type="button" onClick={triggerDemoToast} style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.9)", border: `1px solid ${BORDER}`, color: TEXT, padding: "11px 12px", borderRadius: 12, fontFamily: FB, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, cursor: "pointer", transition: "all 0.2s" }}>{ui.overview.copyCode}</button>
        <button type="button" onClick={() => setShowQR(v => !v)} style={{ background: "linear-gradient(135deg, #8B4FD8, #5B2D8E)", border: "none", color: "#fff", padding: "11px 12px", borderRadius: 12, fontFamily: FB, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 6px 14px rgba(91,45,142,0.35)" }}>
          {showQR ? ui.overview.hideQr : ui.overview.showQr}
        </button>
      </div>
      {showQR && (
        <div style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.92)", borderRadius: 12, padding: 20, marginTop: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, border: `1px solid ${BORDER}`, position: "relative" }}>
          <div className="qr-frame qr-reveal"><QRCode value={joinUrl} size={168} /></div>
          <p style={{ fontFamily: FS, fontStyle: "italic", fontSize: 12, color: MUTED, margin: 0, textAlign: "center" }}>{ui.overview.scanHint}</p>
          <Link href="?tab=share&role=organizer" style={{ fontSize: 13, color: PURPLE, fontFamily: FB, fontWeight: 600, textDecoration: "none" }}>{ui.overview.openShareLink}</Link>
        </div>
      )}
    </div>
  );
}

// ── Photo carousel ─────────────────────────────────────────────────────────────
function PhotoCarousel() {
  const isDark = React.useContext(DarkCtx);
  const ui = useAppUi();
  const preview = DEMO_PHOTOS.slice(0, 6);
  const [spotlight, ...rest] = preview;
  const thumbs = rest.slice(0, 5);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{ position: "absolute", inset: -6, background: "radial-gradient(circle, rgba(197,146,42,0.35), transparent 70%)", filter: "blur(8px)" }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/mascot/aurora_camera.png" alt="Aurora" style={{ width: 44, height: 44, objectFit: "contain", position: "relative" }} />
        </div>
        <div>
          <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: TEXT_S, fontFamily: FB }}>{ui.overview.recentPhotos}</div>
          <div style={{ fontFamily: FS, fontStyle: "italic", fontWeight: 400, fontSize: 18, color: TEXT, marginTop: 1 }}>{ui.overview.carouselLatestSix}</div>
        </div>
      </div>
      <div style={{ ...(isDark ? GLASS_DARK : GLASS_LIGHT), borderRadius: 18, padding: 10 }}>
        {spotlight && (
          <Link href="?tab=gallery&role=organizer" style={{ display: "block", borderRadius: 12, overflow: "hidden", marginBottom: 6, position: "relative", textDecoration: "none" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={spotlight.src} alt="" style={{ width: "100%", display: "block", aspectRatio: "16/9", objectFit: "cover" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "24px 12px 10px", background: "linear-gradient(transparent, rgba(0,0,0,0.55))", pointerEvents: "none" }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", fontFamily: FB }}>{ui.overview.carouselLatest}</div>
            </div>
          </Link>
        )}
        {thumbs.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
            {thumbs.map((photo, i) => (
              <Link key={photo.src} href="?tab=gallery&role=organizer" style={{ display: "block", borderRadius: 8, overflow: "hidden", position: "relative", aspectRatio: "1/1", textDecoration: "none" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                {i === 4 && DEMO_PHOTOS.length > 6 && (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(34,21,9,0.58)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FB, fontSize: 11, fontWeight: 700 }}>
                    {ui.overview.carouselMore}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
      <Link href="?tab=gallery&role=organizer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 10, background: "transparent", border: "1px solid var(--app-border)", color: PURPLE, padding: "11px 12px", borderRadius: 12, fontFamily: FB, fontSize: 13, fontWeight: 600, textDecoration: "none", boxSizing: "border-box" as const }}>
        {ui.overview.viewGalleryFull}
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" stroke={PURPLE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function DemoOverviewTab({ publicOrigin }: { publicOrigin: string }) {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    const obs = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  const isEventUpcoming = useMemo(() => {
    const m = DEMO_EVENT.date.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return false;
    return Date.now() < new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime();
  }, []);

  return (
    <DarkCtx.Provider value={isDark}>
      <div className="welcome-reveal" style={{ padding: '18px 16px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <StatusRibbon />
        {isEventUpcoming ? <DemoEventStartCountdown /> : <CountdownCards />}
        <StatsTiles />
        <AccessCard publicOrigin={publicOrigin} />
        <PhotoCarousel />
      </div>
    </DarkCtx.Provider>
  );
}
