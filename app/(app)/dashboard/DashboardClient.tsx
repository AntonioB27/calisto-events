"use client";

import Link from "next/link";
import { startTransition, useEffect, useMemo, useState } from "react";
import { Key, Plus } from "lucide-react";

import { normalizeAccessCode } from "@/lib/access-code";
import { useAppUi } from "@/components/AppUiProvider";
import { displayNavEmoji, splitEventTitleStored } from "@/lib/event-title";
import type { DashboardEventRow } from "@/lib/dashboard-events";
import { interpolate } from "@/lib/app-ui";
import { loadSavedOrder, mergeWithSavedOrder } from "@/lib/my-events-order";
import { loadHiddenEventIds } from "@/lib/my-events-visibility";

// ── Editorial Almanac palette (brand accents — stable across modes) ───────────
const INK     = '#221509';   // light-mode only; use TEXT for dynamic text color
const INK_S   = '#5A4A36';   // light-mode only; use TEXT_S for dynamic text color
const MUTED   = '#9A8570';   // light-mode only; use MUTED_T for dynamic text color
const GOLD    = '#C5922A';
const GOLD_DK = '#A37118';
const PURPLE  = '#5B2D8E';
const BORDER  = '#DDD4C5';   // light-mode only; use DIVIDER for dynamic border color
const GOLD_FOIL = 'linear-gradient(135deg, #E6BF66 0%, #C5922A 45%, #F4D88F 70%, #946C18 100%)';

// Theme-responsive values via CSS custom properties
const TEXT    = 'var(--app-text)';
const TEXT_S  = 'var(--app-text-sub)';
const MUTED_T = 'var(--app-muted)';
const DIVIDER = 'var(--app-border)';

const FB = "'DM Sans', sans-serif";
const FS = "'DM Serif Display', serif";
const FM = "'Caveat', cursive";

const GLASS_LIGHT = {
  background: 'rgba(255,255,255,0.62)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: '1px solid rgba(255,255,255,0.78)',
  boxShadow: '0 10px 30px -8px rgba(40,25,15,0.18), inset 0 1px 0 rgba(255,255,255,0.7)',
} as React.CSSProperties;

const GLASS_DARK = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 10px 30px -8px rgba(0,0,0,0.4)',
} as React.CSSProperties;

// ── Helpers ────────────────────────────────────────────────────────────────────
function parseDateDisplay(dateStr: string | null | undefined) {
  if (!dateStr) return null;
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    if (!y || !m || !d) return null;
    return {
      mon: new Date(y, m - 1, d).toLocaleDateString('en', { month: 'short' }),
      day: d,
      year: y,
    };
  } catch { return null; }
}

function roleAccent(role: DashboardEventRow['membershipRole']): string {
  if (role === 'organizer') return PURPLE;
  if (role === 'co_organizer') return '#7B3FBE';
  return GOLD;
}

function roleBannerBg(role: DashboardEventRow['membershipRole']): string {
  if (role === 'organizer') return 'linear-gradient(135deg,rgba(91,45,142,0.22),rgba(123,63,190,0.18))';
  if (role === 'co_organizer') return 'linear-gradient(135deg,rgba(123,63,190,0.18),rgba(197,146,42,0.14))';
  return 'linear-gradient(135deg,rgba(197,146,42,0.18),rgba(197,146,42,0.10))';
}

// ── Micro components ───────────────────────────────────────────────────────────
function SectionMark({ n, label, trailing }: { n: string; label: string; trailing?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, paddingBottom: 6, borderBottom: `1px solid ${DIVIDER}` }}>
      <span style={{ fontFamily: FS, fontStyle: 'italic', fontWeight: 700, fontSize: 26, color: GOLD, letterSpacing: '-0.02em', lineHeight: 1 }}>{n}</span>
      <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: TEXT_S, fontFamily: FB }}>{label}</span>
      <span style={{ flex: 1 }} />
      {trailing}
    </div>
  );
}

function planStyle(tier: string): { bg: string; border: string; color: string; shadow: string } {
  switch (tier) {
    case 'free':
      return { bg: 'transparent', border: `1px solid ${MUTED}55`, color: MUTED_T, shadow: 'none' };
    case 'standard':
      return { bg: 'linear-gradient(135deg,#4A8CB8 0%,#2D6A96 50%,#5BAACE 100%)', border: 'none', color: '#fff', shadow: 'inset 0 1px 0 rgba(255,255,255,0.35),0 1px 2px rgba(45,106,150,0.3)' };
    case 'plus':
      return { bg: 'linear-gradient(135deg,#D4956B 0%,#B87333 45%,#E8AF80 70%,#8C5225 100%)', border: 'none', color: '#fff', shadow: 'inset 0 1px 0 rgba(255,255,255,0.35),0 1px 2px rgba(184,115,51,0.3)' };
    case 'premium':
      return { bg: GOLD_FOIL, border: 'none', color: '#fff', shadow: 'inset 0 1px 0 rgba(255,255,255,0.4),inset 0 -1px 0 rgba(0,0,0,0.15),0 1px 2px rgba(148,108,24,0.25)' };
    case 'max':
      return { bg: 'linear-gradient(135deg,#8B5FCC 0%,#5B2D8E 45%,#A87FD8 70%,#3D1A6E 100%)', border: 'none', color: '#fff', shadow: 'inset 0 1px 0 rgba(255,255,255,0.35),0 1px 2px rgba(91,45,142,0.35)' };
    default:
      return { bg: `${BORDER}80`, border: 'none', color: MUTED, shadow: 'none' };
  }
}

function PlanStamp({ tier, size = 'sm' }: { tier: string; size?: 'sm' | 'lg' }) {
  const p = size === 'lg' ? { padding: '5px 10px', font: 13, label: 8, gap: 7 } : { padding: '3px 8px', font: 11, label: 7, gap: 5 };
  const s = planStyle(tier);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: p.gap,
      background: s.bg, color: s.color, border: s.border,
      borderRadius: 4, padding: p.padding, boxShadow: s.shadow,
    }}>
      <span style={{ fontSize: p.label, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', opacity: 0.82, fontFamily: FB }}>Plan</span>
      <span style={{ fontFamily: FS, fontStyle: 'italic', fontWeight: 700, fontSize: p.font, letterSpacing: '0.04em', lineHeight: 1 }}>{tier}</span>
    </span>
  );
}

function RoleChip({ role, label }: { role: DashboardEventRow['membershipRole']; label: string }) {
  const accent = roleAccent(role);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontFamily: FB, fontSize: 10.5, fontWeight: 600,
      color: accent, padding: '2px 8px 2px 6px',
      background: `${accent}18`, border: `1px solid ${accent}30`, borderRadius: 12,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: accent, flexShrink: 0 }} />
      {label}
    </span>
  );
}

function DateStamp({ mon, day, year, accent, compact }: { mon: string; day: number; year: number; accent: string; compact?: boolean }) {
  return (
    <div style={{ width: compact ? 48 : 60, flexShrink: 0, textAlign: 'center', fontFamily: FB, borderRight: `1px dashed ${DIVIDER}`, paddingRight: compact ? 10 : 12 }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: MUTED_T }}>{mon}</div>
      <div style={{ fontFamily: FS, fontStyle: 'italic', fontWeight: 700, fontSize: compact ? 32 : 42, lineHeight: 0.9, color: accent, letterSpacing: '-0.03em', marginTop: 1 }}>{day}</div>
      <div style={{ fontFamily: FS, fontStyle: 'italic', fontSize: 10.5, color: MUTED_T, marginTop: 1 }}>{year}</div>
    </div>
  );
}

function ArrowIcon({ size = 13, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}


// ── Featured event card ────────────────────────────────────────────────────────
function FeaturedEvent({ event, onOpen, roleLabel, glassStyle, mostRecentLabel }: { event: DashboardEventRow; onOpen: () => void; roleLabel: string; glassStyle: React.CSSProperties; mostRecentLabel: string }) {
  const { emoji: storedEmoji, name } = splitEventTitleStored(String(event.title));
  const emoji = displayNavEmoji(storedEmoji);
  const date = parseDateDisplay(event.event_date);
  const accent = roleAccent(event.membershipRole);

  return (
    <div onClick={onOpen} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onOpen(); }} style={{ marginTop: 14, cursor: 'pointer' }}>
      {/* Banner */}
      <div style={{ ...glassStyle, borderRadius: 14, overflow: 'hidden', position: 'relative', height: 128 }}>
        <div style={{ position: 'absolute', inset: 0, background: roleBannerBg(event.membershipRole) }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg,rgba(255,255,255,0.12) 0 2px,transparent 2px 12px)' }} />
        {/* big emoji */}
        <div style={{ position: 'absolute', right: -8, bottom: -14, fontSize: 120, lineHeight: 1, opacity: 0.9, transform: 'rotate(-8deg)', filter: 'drop-shadow(0 4px 12px rgba(40,25,15,0.18))', pointerEvents: 'none' }}>{emoji}</div>
        {/* stamps */}
        <div style={{ position: 'absolute', top: 10, left: 12 }}><PlanStamp tier={event.plan} size="lg" /></div>
        <div style={{ position: 'absolute', top: 10, right: 12 }}><RoleChip role={event.membershipRole} label={roleLabel} /></div>
        {/* name pill */}
        <div style={{ position: 'absolute', bottom: 10, left: 10, right: 96, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderRadius: 100, padding: '5px 14px', border: '1px solid rgba(255,255,255,0.38)', overflow: 'hidden' }}>
          <span style={{ fontFamily: FS, fontStyle: 'italic', fontWeight: 700, fontSize: 14, color: 'rgba(255,255,255,0.95)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textShadow: '0 1px 4px rgba(40,25,15,0.5)', display: 'block' }}>{name}</span>
        </div>
        {/* arrow button */}
        <div style={{ position: 'absolute', bottom: 10, right: 12, width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#7B3FBE,#5B2D8E)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 10px rgba(91,45,142,0.32)' }}>
          <ArrowIcon size={12} color="#fff" />
        </div>
      </div>
      {/* Meta row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginTop: 12 }}>
        {date && <DateStamp mon={date.mon} day={date.day} year={date.year} accent={accent} />}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: MUTED, fontFamily: FB }}>{mostRecentLabel}</div>
          <h2 style={{ fontFamily: FS, fontStyle: 'italic', fontWeight: 700, fontSize: 24, lineHeight: 1.05, color: TEXT, letterSpacing: '-0.015em', marginTop: 4 }}>{name}</h2>
        </div>
      </div>
    </div>
  );
}

// ── Compact event row ──────────────────────────────────────────────────────────
function CompactEventRow({ event, onOpen, roleLabel, last, isDark }: { event: DashboardEventRow; onOpen: () => void; roleLabel: string; last: boolean; isDark: boolean }) {
  const { emoji: storedEmoji, name } = splitEventTitleStored(String(event.title));
  const emoji = displayNavEmoji(storedEmoji);
  const date = parseDateDisplay(event.event_date);
  const accent = roleAccent(event.membershipRole);

  return (
    <div onClick={onOpen} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onOpen(); }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: last ? 'none' : `1px dashed ${DIVIDER}`, cursor: 'pointer' }}>
      {date && <DateStamp mon={date.mon} day={date.day} year={date.year} accent={accent} compact />}
      <div style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 10, background: `${accent}18`, border: `1px solid ${DIVIDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)' }}>{emoji}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FS, fontStyle: 'italic', fontWeight: 700, fontSize: 18, lineHeight: 1.05, color: TEXT, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5, flexWrap: 'wrap' }}>
          <RoleChip role={event.membershipRole} label={roleLabel} />
          <PlanStamp tier={event.plan} size="sm" />
        </div>
      </div>
      <div style={{ width: 26, height: 26, borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.7)', border: `1px solid ${DIVIDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <ArrowIcon size={11} color={isDark ? '#c4b49e' : INK_S} />
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
type Props = Readonly<{
  organizerId: string;
  userName: string;
  events: DashboardEventRow[];
}>;

export function DashboardClient({ organizerId, userName, events }: Props) {
  const ui = useAppUi();
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [orderIds, setOrderIds] = useState<string[]>([]);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    startTransition(() => setHiddenIds(new Set(loadHiddenEventIds(organizerId))));
    startTransition(() => setOrderIds(loadSavedOrder(organizerId)));
  }, [organizerId]);

  useEffect(() => {
    setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    const obs = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  const orderedEvents = useMemo(() => mergeWithSavedOrder(events, orderIds), [events, orderIds]);
  const visibleEvents = useMemo(() => orderedEvents.filter((e) => !hiddenIds.has(e.id)), [orderedEvents, hiddenIds]);

  function handleOpen(event: DashboardEventRow) {
    if (event.membershipRole === 'guest') {
      window.location.href = `/join/${encodeURIComponent(normalizeAccessCode(event.access_code))}`;
      return;
    }
    window.location.href = `/events/${event.id}`;
  }

  function getRoleLabel(role: DashboardEventRow['membershipRole']): string {
    if (role === 'organizer') return ui.dashboard.roleOrganizer;
    if (role === 'co_organizer') return ui.dashboard.roleCoOrganizer;
    return ui.dashboard.roleGuest;
  }

  const isEmpty = visibleEvents.length === 0;
  const [featured, ...rest] = visibleEvents;

  // used to avoid lint warning — helloTemplate contains the name placeholder
  void interpolate;

  return (
    <div className="welcome-reveal" style={{ padding: '18px 16px 48px', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Masthead ─────────────────────────────────────────────── */}
      <div style={{ padding: '8px 0 4px', position: 'relative' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/mascot/aurora.png" alt="" style={{ position: 'absolute', top: 0, right: -8, width: 110, height: 110, objectFit: 'contain', objectPosition: 'top right', pointerEvents: 'none', transform: 'scale(1.35)', transformOrigin: 'top right' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 18, height: 2, background: GOLD, borderRadius: 1, flexShrink: 0 }} />
          <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: GOLD_DK, fontFamily: FB }}>{ui.dashboard.eyebrow}</span>
        </div>

        <h1 style={{ marginTop: 12, lineHeight: 0.95, letterSpacing: '-0.025em', paddingRight: 96 }}>
          <span style={{ fontFamily: FS, fontStyle: 'italic', fontWeight: 700, fontSize: 48, color: TEXT }}>Hello,{' '}</span>
          <span style={{ fontFamily: FM, fontWeight: 700, color: PURPLE, fontSize: 54 }}>{userName}</span>
          <span style={{ fontFamily: FS, fontStyle: 'italic', fontWeight: 700, fontSize: 48, color: GOLD }}>.</span>
        </h1>

        <p style={{ marginTop: 10, fontFamily: FS, fontStyle: 'italic', fontSize: 14, color: TEXT_S, lineHeight: 1.45 }}>
          {ui.dashboard.subtitle}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginTop: 16 }}>
          <Link href="/join" style={{
            background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.55)',
            border: `1px solid ${DIVIDER}`,
            color: 'var(--app-purple)', padding: '12px 10px', borderRadius: 11,
            fontFamily: FB, fontSize: 13, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            textDecoration: 'none',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          }}>
            <Key size={14} /> {ui.dashboard.joinWithCode}
          </Link>
          <Link href="/events/new" style={{
            background: 'linear-gradient(135deg,#7B3FBE,#5B2D8E)', border: 'none',
            color: '#fff', padding: '12px 10px', borderRadius: 11,
            fontFamily: FB, fontSize: 13, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(91,45,142,0.32)',
          }}>
            <Plus size={14} /> {ui.dashboard.createEvent}
          </Link>
        </div>
      </div>

      {/* ── Events section ───────────────────────────────────────── */}
      {!isEmpty && (
        <div>
          <SectionMark
            n="01"
            label={ui.dashboard.yourEvents}
            trailing={
              <span style={{ fontFamily: FS, fontStyle: 'italic', fontWeight: 700, fontSize: 18, color: GOLD, letterSpacing: '-0.02em', lineHeight: 1 }}>
                {visibleEvents.length}
              </span>
            }
          />
          <FeaturedEvent event={featured} onOpen={() => handleOpen(featured)} roleLabel={getRoleLabel(featured.membershipRole)} glassStyle={isDark ? GLASS_DARK : GLASS_LIGHT} mostRecentLabel={ui.dashboard.mostRecent} />
          {rest.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: MUTED_T, fontFamily: FB, marginBottom: 8 }}>
                {ui.dashboard.earlierSeason}
              </div>
              {rest.map((ev, i) => (
                <CompactEventRow key={ev.id} event={ev} onOpen={() => handleOpen(ev)} roleLabel={getRoleLabel(ev.membershipRole)} last={i === rest.length - 1} isDark={isDark} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────── */}
      {isEmpty && (
        <div style={{ ...(isDark ? GLASS_DARK : GLASS_LIGHT), borderRadius: 18, padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/mascot/aurora_key.png" alt="" style={{ width: 88, height: 132, objectFit: 'contain' }} />
          <p style={{ fontFamily: FS, fontStyle: 'italic', fontSize: 15, color: MUTED_T, textAlign: 'center', lineHeight: 1.6, margin: 0 }}>
            {ui.dashboard.emptyHint}
          </p>
          <Link href="/events/new" style={{
            background: 'linear-gradient(135deg,#7B3FBE,#5B2D8E)', color: '#fff',
            padding: '12px 24px', borderRadius: 12,
            fontFamily: FB, fontSize: 14, fontWeight: 600, textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(91,45,142,0.32)',
          }}>
            {ui.dashboard.createEvent}
          </Link>
        </div>
      )}

      {/* ── Add-another nudge ────────────────────────────────────── */}
      {!isEmpty && (
        <div>
          <SectionMark n="02" label={ui.dashboard.addAnother} />
          <div style={{ marginTop: 22, position: 'relative' }}>
            {/* Washi tape */}
            <div aria-hidden style={{ position: 'absolute', top: -8, left: '33%', width: 64, height: 14, background: 'rgba(212,168,67,0.48)', border: '0.5px solid rgba(212,168,67,0.6)', transform: 'rotate(-3deg)', boxShadow: '0 2px 6px rgba(0,0,0,0.22)', zIndex: 2, borderRadius: 2, pointerEvents: 'none' }} />
            {/* Polaroid card */}
            <div style={{ position: 'relative', background: '#f4f0ea', borderRadius: 2, boxShadow: '0 8px 28px rgba(0,0,0,0.42), 0 2px 6px rgba(0,0,0,0.2)', transform: 'rotate(-0.5deg)', padding: '16px 100px 20px 16px' }}>
              {/* Camera mascot */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/mascot/aurora_camera.png" alt="" style={{ position: 'absolute', top: '50%', right: 0, width: 112, height: 112, objectFit: 'contain', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <div style={{ fontFamily: FS, fontStyle: 'italic', fontWeight: 700, fontSize: 17, color: '#2a1d0f', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
                {ui.dashboard.oneMoreHeading}
              </div>
              <p style={{ marginTop: 6, fontSize: 11, color: 'rgba(60,40,20,0.55)', fontFamily: FB, lineHeight: 1.45, margin: '6px 0 0' }}>
                {ui.dashboard.moreHint}
              </p>
              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                <Link href="/join" style={{ background: 'transparent', border: `1px solid ${PURPLE}80`, color: PURPLE, padding: '6px 11px', borderRadius: 8, fontFamily: FB, fontSize: 11.5, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}>
                  <Key size={12} /> {ui.dashboard.joinWithCode}
                </Link>
                <Link href="/events/new" style={{ background: PURPLE, border: 'none', color: '#fff', padding: '6px 11px', borderRadius: 8, fontFamily: FB, fontSize: 11.5, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}>
                  <Plus size={12} /> {ui.dashboard.createEvent}
                </Link>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 20, textAlign: 'center', fontFamily: FS, fontStyle: 'italic', fontSize: 11.5, color: MUTED_T }}>
            Vol. I · Calisto
          </div>
        </div>
      )}
    </div>
  );
}
