"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import QRCode from "react-qr-code";

import { useAppUi } from "@/components/AppUiProvider";
import { getWebJoinUrl } from "@/lib/join-link";
import {
  formatQuotaSublabelLocalized,
  getPlanLimits,
  getRetentionDeletionEndMs,
  getUploadWindowEndMs,
  isUnlimitedQuota,
  normalizePlanId,
} from "@/lib/plan-limits";
import { maybeCreateSupabaseBrowserClient } from "@/lib/supabase-browser";

// ── Aurora Theater palette ────────────────────────────────────────────────────
const GOLD   = '#C5922A';
const PURPLE = '#5B2D8E';
const RUST   = '#D17A2A';
const GOLD_FOIL = 'linear-gradient(135deg, #E6BF66 0%, #C5922A 45%, #F4D88F 70%, #946C18 100%)';

const TEXT   = 'var(--app-text)';
const TEXT_S = 'var(--app-text-sub)';
const MUTED  = 'var(--app-muted)';
const BORDER = 'var(--app-border)';

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

// ── Types and helpers ─────────────────────────────────────────────────────────
export type OverviewTabProps = Readonly<{
  eventId: string;
  eventDate: string;
  plan: string;
  scheduledDeletionAt?: string | null;
  accessCode: string;
  publicOrigin: string;
  adminRoleLabel: string;
}>;

function isVideoMime(mime: string | null | undefined) {
  return Boolean(mime?.startsWith("video/"));
}

async function countPhotos(supabase: NonNullable<ReturnType<typeof maybeCreateSupabaseBrowserClient>>, eventId: string) {
  const [{ count: nullCount }, { count: imageCount }] = await Promise.all([
    supabase.from("media_items").select("*", { count: "exact", head: true }).eq("event_id", eventId).is("mime_type", null),
    supabase.from("media_items").select("*", { count: "exact", head: true }).eq("event_id", eventId).ilike("mime_type", "image/%"),
  ]);
  return (nullCount ?? 0) + (imageCount ?? 0);
}

async function countVideos(supabase: NonNullable<ReturnType<typeof maybeCreateSupabaseBrowserClient>>, eventId: string) {
  const { count } = await supabase.from("media_items").select("*", { count: "exact", head: true }).eq("event_id", eventId).ilike("mime_type", "video/%");
  return count ?? 0;
}

async function countGuests(supabase: NonNullable<ReturnType<typeof maybeCreateSupabaseBrowserClient>>, eventId: string) {
  const { count } = await supabase.from("event_memberships").select("*", { count: "exact", head: true }).eq("event_id", eventId);
  return count ?? 0;
}

type SignedUrlEntry = { path: string | null; signedUrl: string };

function parseDateParts(dateStr: string | null | undefined) {
  if (!dateStr) return null;
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
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

// ── Status ribbon → Broadsheet dateline ──────────────────────────────────────
function StatusRibbon({
  eventDate,
  planId,
  adminRoleLabel,
}: {
  eventDate: string;
  planId: ReturnType<typeof normalizePlanId>;
  adminRoleLabel: string;
}) {
  const ui = useAppUi();
  const isDark = React.useContext(DarkCtx);
  const cal = parseDateParts(eventDate);
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

          {/* Date stamp block */}
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

          {/* Right column: plan seal + role stamp */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 10 }}>
            {/* Plan — wax seal style */}
            <div>
              <div style={{ fontSize: 7.5, fontWeight: 700, letterSpacing: '0.26em', textTransform: 'uppercase', color: isDark ? '#7a6a5a' : '#9A8570', fontFamily: FB, marginBottom: 5 }}>{ui.overview.planLabel}</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: GOLD_FOIL, borderRadius: 4, padding: '4px 12px', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 8px rgba(148,108,24,0.28)' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,255,255,0.6)', flexShrink: 0 }} />
                <span style={{ fontFamily: FS, fontStyle: 'italic', fontWeight: 700, fontSize: 15, color: '#fff', letterSpacing: '0.04em', textShadow: '0 1px 2px rgba(100,60,0,0.3)' }}>{planName}</span>
              </div>
            </div>

            {/* Role — rubber stamp */}
            <div>
              <div style={{ fontSize: 7.5, fontWeight: 700, letterSpacing: '0.26em', textTransform: 'uppercase', color: isDark ? '#7a6a5a' : '#9A8570', fontFamily: FB, marginBottom: 4 }}>{ui.overview.yourRole}</div>
              <div style={{
                display: 'inline-block',
                fontFamily: FB, fontSize: 10, fontWeight: 800,
                letterSpacing: '0.2em', textTransform: 'uppercase',
                color: PURPLE,
                border: `1.5px solid ${PURPLE}`,
                borderRadius: 3,
                padding: '3px 8px',
                opacity: 0.85,
              }}>
                {adminRoleLabel}
              </div>
            </div>
          </div>

        </div>

        {/* Bottom ruled line */}
        <div style={{ height: 1, background: isDark ? 'rgba(197,146,42,0.15)' : 'rgba(197,146,42,0.25)', margin: '0 16px' }} />
        <div style={{ padding: '5px 16px 8px', fontSize: 7.5, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: isDark ? '#5a4a3a' : '#c4b49f', fontFamily: FB }}>
          Calisto · Event Record
        </div>
      </div>
    </div>
  );
}

// ── Countdown cards ────────────────────────────────────────────────────────────
function CountdownCard({
  label, days, hours, isEnded, endedLabel, accent, daysWord,
}: {
  label: string; days: number; hours: number; isEnded: boolean; endedLabel: string; accent: string; daysWord: string;
}) {
  const isDark = React.useContext(DarkCtx);

  return (
    <div style={{
      ...(isDark ? GLASS_DARK : GLASS_LIGHT),
      borderRadius: 18,
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Accent top strip */}
      <div style={{ height: 3, background: accent, flexShrink: 0 }} />

      <div style={{ padding: '14px 16px 16px', position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Ghost watermark number */}
        {!isEnded && (
          <div aria-hidden style={{
            position: 'absolute', right: -8, bottom: -12,
            fontFamily: FS, fontStyle: 'italic', fontWeight: 700,
            fontSize: 110, lineHeight: 1,
            color: accent, opacity: isDark ? 0.06 : 0.07,
            letterSpacing: '-0.04em',
            pointerEvents: 'none', userSelect: 'none',
          }}>
            {days}
          </div>
        )}

        {isEnded ? (
          <>
            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: accent, fontFamily: FB, marginBottom: 8 }}>
              {label}
            </div>
            <div style={{ fontFamily: FS, fontStyle: 'italic', fontSize: 15, color: accent, lineHeight: 1.35 }}>
              {endedLabel}
            </div>
          </>
        ) : (
          <>
            {/* Main number */}
            <div style={{ position: 'relative', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{
                  fontFamily: FS, fontStyle: 'italic', fontWeight: 400,
                  fontSize: 52, color: accent, letterSpacing: '-0.03em', lineHeight: 0.88,
                }} aria-live="polite">
                  {days}
                </span>
                <span style={{ fontFamily: FB, fontSize: 9.5, fontWeight: 700, color: accent, opacity: 0.6, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 4 }}>
                  {daysWord}
                </span>
              </div>
              <div style={{ marginTop: 5, fontFamily: FB, fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: '0.04em' }}>
                +{hours}h
              </div>
            </div>

            {/* Label at bottom */}
            <div style={{ marginTop: 14, paddingTop: 10, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}` }}>
              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: accent, fontFamily: FB, opacity: 0.75 }}>
                {label}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Countdown arc gauges ──────────────────────────────────────────────────────
function CountdownGauges({
  eventDate,
  planId,
  scheduledDeletionAt,
}: {
  eventDate: string;
  planId: ReturnType<typeof normalizePlanId>;
  scheduledDeletionAt: string | null | undefined;
}) {
  const ui = useAppUi();
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const uploadEndMs = useMemo(() => getUploadWindowEndMs({ planId, eventDate }), [planId, eventDate]);
  const deletionEndMs = useMemo(() => {
    if (scheduledDeletionAt) {
      const t = new Date(scheduledDeletionAt).getTime();
      return Number.isNaN(t) ? getRetentionDeletionEndMs({ planId, eventDate }) : t;
    }
    return getRetentionDeletionEndMs({ planId, eventDate });
  }, [scheduledDeletionAt, planId, eventDate]);

  const uploadRemMs = uploadEndMs ? Math.max(0, uploadEndMs - nowMs) : 0;
  const deletionRemMs = deletionEndMs ? Math.max(0, deletionEndMs - nowMs) : 0;

  const uploadParts = msToDaysHours(uploadRemMs);
  const deletionParts = msToDaysHours(deletionRemMs);
  const uploadEnded = !uploadEndMs || uploadEndMs <= nowMs;
  const deletionEnded = !deletionEndMs || deletionEndMs <= nowMs;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      <CountdownCard
        label={ui.overview.uploadCloseLabel}
        days={uploadParts.days} hours={uploadParts.hours}
        accent={RUST} isEnded={uploadEnded} endedLabel={ui.overview.uploadWindowEnded}
        daysWord={ui.createStep2.daysWord}
      />
      <CountdownCard
        label={ui.overview.autoDeletionLabel}
        days={deletionParts.days} hours={deletionParts.hours}
        accent={PURPLE} isEnded={deletionEnded} endedLabel={ui.overview.autoDeletionOverdue}
        daysWord={ui.createStep2.daysWord}
      />
    </div>
  );
}

// ── Stats tiles ───────────────────────────────────────────────────────────────

function StatTile({
  n,
  label,
  cap,
  accent,
  mascot,
  rotation,
  tape,
  imgPadding = 0,
  swayDelay = '0s',
}: {
  n: number;
  label: string;
  cap: string;
  accent: string;
  mascot: string;
  rotation: number;
  tape?: { left: string; deg: number };
  imgPadding?: number;
  swayDelay?: string;
}) {
  const isDark = React.useContext(DarkCtx);
  return (
    <div className="polaroid-sway" style={{ position: 'relative', animationDelay: swayDelay }}>
      {tape && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: -7,
            left: tape.left,
            width: 52,
            height: 12,
            background: 'rgba(212,168,67,0.45)',
            border: '0.5px solid rgba(212,168,67,0.55)',
            transform: `rotate(${tape.deg}deg)`,
            boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
            zIndex: 2,
            borderRadius: 2,
            pointerEvents: 'none',
          }}
        />
      )}
      <div
        style={{
          background: isDark ? '#1e1a17' : '#f4f0ea',
          borderRadius: 3,
          boxShadow: isDark
            ? '0 8px 28px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)'
            : '0 8px 28px rgba(0,0,0,0.38), 0 2px 8px rgba(0,0,0,0.18)',
          transform: `rotate(${rotation}deg)`,
          padding: '9px 9px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
        }}
      >
        <div
          style={{
            position: 'relative',
            borderRadius: 2,
            overflow: 'hidden',
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            aspectRatio: '1 / 1',
            marginBottom: 9,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mascot} alt="" aria-hidden style={{ position: 'absolute', inset: `${imgPadding}%`, width: `${100 - imgPadding * 2}%`, height: `${100 - imgPadding * 2}%`, objectFit: 'contain' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: FS, fontStyle: 'italic', fontWeight: 400, fontSize: 34, color: accent, letterSpacing: '-0.04em', lineHeight: 0.9 }}>{n}</div>
          <div style={{ fontFamily: FS, fontStyle: 'italic', fontSize: 12, color: isDark ? '#d4c4a8' : '#2a1d0f', marginTop: 3 }}>{label}</div>
          <div style={{ fontSize: 7.5, color: isDark ? '#7a6a5a' : '#9A8570', fontWeight: 600, marginTop: 2, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: FB }}>{cap}</div>
        </div>
      </div>
    </div>
  );
}

function StatsTiles({ eventId, planId }: { eventId: string; planId: ReturnType<typeof normalizePlanId> }) {
  const ui = useAppUi();
  const limits = useMemo(() => getPlanLimits(planId), [planId]);
  const supabase = useMemo(() => maybeCreateSupabaseBrowserClient(), []);

  const [photos, setPhotos] = useState<number | null>(null);
  const [videos, setVideos] = useState<number | null>(null);
  const [guests, setGuests] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!supabase) return;
    try {
      const [p, v, g] = await Promise.all([countPhotos(supabase, eventId), countVideos(supabase, eventId), countGuests(supabase, eventId)]);
      setPhotos(p);
      setVideos(v);
      setGuests(g);
    } catch {
      setPhotos(0); setVideos(0); setGuests(0);
    }
  }, [eventId, supabase]);

  useEffect(() => { queueMicrotask(() => { void load(); }); }, [load]);

  function subFor(cap: number) {
    return formatQuotaSublabelLocalized(cap, ui.quotas.unlimitedPlan, ui.quotas.ofCount, ui.locale);
  }

  const videoMax = limits.videos;
  const videoCap = !isUnlimitedQuota(videoMax) && videoMax <= 0 ? ui.quotas.notOnPlan : subFor(videoMax);
  const guestCount = guests ?? 0;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: TEXT_S, fontFamily: FB }}>{ui.overview.statsTitle}</div>
        {!supabase && <div style={{ fontSize: 10.5, color: MUTED, fontFamily: FB }}>{ui.common.loadCountsHint}</div>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, padding: '8px 4px 4px' }}>
        <StatTile n={photos ?? 0} label={ui.overview.statsPhotos} cap={subFor(limits.photos)} accent={PURPLE} mascot="/brand/mascot/aurora_camera.png"    rotation={-1.5} tape={{ left: '22%', deg: -3 }} imgPadding={0}  swayDelay="0s" />
        <StatTile n={videos ?? 0} label={ui.overview.statsVideos} cap={videoCap}               accent="#7A6A5A" mascot="/brand/mascot/aurora_recording.png" rotation={1}    tape={{ left: '28%', deg: 2 }} imgPadding={20} swayDelay="-1.3s" />
        <StatTile n={guestCount}  label={ui.overview.statsGuests} cap={subFor(limits.guests)}  accent={GOLD}   mascot="/brand/mascot/aurora_guests.png"     rotation={-0.5} tape={{ left: '24%', deg: -1.5 }} imgPadding={14} swayDelay="-2.6s" />
      </div>
    </div>
  );
}

// ── Access code card ──────────────────────────────────────────────────────────
function AccessCard({ accessCode, publicOrigin }: { accessCode: string; publicOrigin: string }) {
  const ui = useAppUi();
  const isDark = React.useContext(DarkCtx);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const joinUrl = useMemo(() => getWebJoinUrl(publicOrigin, accessCode), [publicOrigin, accessCode]);

  async function copy() {
    await navigator.clipboard.writeText(accessCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{
      position: 'relative', borderRadius: 20, padding: '18px 16px 16px',
      background: isDark
        ? 'linear-gradient(140deg, rgba(139,79,216,0.3), rgba(197,146,42,0.18) 60%, transparent), rgba(255,255,255,0.06)'
        : 'linear-gradient(140deg, rgba(139,79,216,0.18), rgba(197,146,42,0.12) 60%, transparent), rgba(255,255,255,0.72)',
      backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.78)',
      boxShadow: isDark ? '0 14px 32px -10px rgba(0,0,0,0.5)' : '0 14px 32px -10px rgba(40,25,15,0.22), inset 0 1px 0 rgba(255,255,255,0.7)',
      overflow: 'hidden',
    }}>
      {/* aurora glow blob */}
      <div style={{ position: 'absolute', bottom: -40, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,79,216,0.5), transparent 65%)', filter: 'blur(8px)', pointerEvents: 'none' }} />

      <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: TEXT_S, fontFamily: FB, position: 'relative' }}>
        {ui.overview.accessCodeTitle}
      </div>

      <div style={{
        marginTop: 12, padding: '14px 16px',
        background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.88)',
        border: `1px dashed ${BORDER}`,
        borderRadius: 12,
        fontFamily: 'var(--font-mono, ui-monospace)',
        fontSize: 20, fontWeight: 700, color: TEXT,
        letterSpacing: '0.12em', textAlign: 'center',
        position: 'relative',
      }}>
        {accessCode}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 8, marginTop: 10, position: 'relative' }}>
        <button
          type="button"
          onClick={() => void copy()}
          style={{
            background: copied ? 'rgba(197,146,42,0.15)' : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)',
            border: `1px solid ${copied ? GOLD : BORDER}`,
            color: copied ? GOLD : TEXT,
            padding: '11px 12px', borderRadius: 12,
            fontFamily: FB, fontSize: 13, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          {copied ? ui.common.copied : ui.overview.copyCode}
        </button>
        <button
          type="button"
          onClick={() => setShowQR(v => !v)}
          style={{
            background: 'linear-gradient(135deg, #8B4FD8, #5B2D8E)',
            border: 'none', color: '#fff',
            padding: '11px 12px', borderRadius: 12,
            fontFamily: FB, fontSize: 13, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            cursor: 'pointer', boxShadow: '0 6px 14px rgba(91,45,142,0.35)',
          }}
        >
          {showQR ? ui.overview.hideQr : ui.overview.showQr}
        </button>
      </div>

      {showQR && (
        <div style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.92)', borderRadius: 12, padding: 20, marginTop: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, border: `1px solid ${BORDER}`, position: 'relative' }}>
          <div className="qr-frame qr-reveal">
            <QRCode value={joinUrl} size={168} />
          </div>
          <p style={{ fontFamily: FS, fontStyle: 'italic', fontSize: 12, color: MUTED, margin: 0, textAlign: 'center' }}>
            {ui.overview.scanHint}
          </p>
          <Link href="?tab=share" style={{ fontSize: 13, color: PURPLE, fontFamily: FB, fontWeight: 600, textDecoration: 'none' }}>
            {ui.overview.openShareLink}
          </Link>
        </div>
      )}
    </div>
  );
}

// ── Photo carousel ────────────────────────────────────────────────────────────
function PhotoCarousel({ eventId }: { eventId: string }) {
  const ui = useAppUi();
  const isDark = React.useContext(DarkCtx);
  const supabase = useMemo(() => maybeCreateSupabaseBrowserClient(), []);
  const [urls, setUrls] = useState<{ id: string; signedUrl: string | undefined }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { queueMicrotask(() => setLoading(false)); return; }
    let cancelled = false;
    queueMicrotask(() => setLoading(true));
    void (async () => {
      try {
        const { data: rows, error } = await supabase
          .from("media_items")
          .select("id, storage_path, mime_type")
          .eq("event_id", eventId)
          .order("created_at", { ascending: false })
          .limit(48);
        if (error || cancelled || !rows?.length) {
          if (!cancelled) { setUrls([]); setLoading(false); }
          return;
        }
        const photoRows = (rows as { id: string; storage_path: string; mime_type: string | null }[])
          .filter(r => !isVideoMime(r.mime_type))
          .slice(0, 6);
        const paths = photoRows.map(r => r.storage_path);
        const { data: signed } = paths.length
          ? await supabase.storage.from("event-media").createSignedUrls(paths, 900)
          : { data: [] as SignedUrlEntry[] };
        const map = Object.fromEntries((signed ?? []).map((s: SignedUrlEntry) => [s.path, s.signedUrl]));
        if (!cancelled) {
          setUrls(photoRows.map(r => ({ id: r.id, signedUrl: map[r.storage_path] })));
          setLoading(false);
        }
      } catch {
        if (!cancelled) { setUrls([]); setLoading(false); }
      }
    })();
    return () => { cancelled = true; };
  }, [eventId, supabase]);

  const [spotlight, ...rest] = urls;
  const thumbs = rest.slice(0, 5);
  const hasMore = rest.length >= 5;

  return (
    <div>
      {/* Header with mascot */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{ position: 'absolute', inset: -6, background: 'radial-gradient(circle, rgba(197,146,42,0.35), transparent 70%)', filter: 'blur(8px)' }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/mascot/aurora_camera.png" alt="Aurora" style={{ width: 44, height: 44, objectFit: 'contain', position: 'relative' }} />
        </div>
        <div>
          <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: TEXT_S, fontFamily: FB }}>{ui.overview.recentPhotos}</div>
          <div style={{ fontFamily: FS, fontStyle: 'italic', fontWeight: 400, fontSize: 18, color: TEXT, marginTop: 1 }}>{ui.overview.carouselLatestSix}</div>
        </div>
      </div>

      {loading ? (
        <p style={{ fontSize: 13, color: MUTED, fontFamily: FB }}>{ui.common.loading}</p>
      ) : !supabase ? (
        <p style={{ fontSize: 13, color: MUTED, fontFamily: FB }}>{ui.common.configuringSupabase}</p>
      ) : urls.length === 0 ? (
        <div style={{ ...(isDark ? GLASS_DARK : GLASS_LIGHT), borderRadius: 18, padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <p style={{ fontFamily: FS, fontStyle: 'italic', fontSize: 13, color: MUTED, textAlign: 'center', lineHeight: 1.6, margin: 0 }}>
            {ui.overview.noPhotosHint}
          </p>
          <Link href="?tab=gallery" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)', border: `1px solid ${BORDER}`, color: TEXT, padding: '9px 18px', borderRadius: 10, fontFamily: FB, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            {ui.overview.openGalleryBtn}
          </Link>
        </div>
      ) : (
        <>
          <div style={{ ...(isDark ? GLASS_DARK : GLASS_LIGHT), borderRadius: 18, padding: 10 }}>
            {/* Spotlight */}
            {spotlight && (
              <Link href="?tab=gallery" style={{ display: 'block', borderRadius: 12, overflow: 'hidden', marginBottom: 6, position: 'relative', textDecoration: 'none' }}>
                {spotlight.signedUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={spotlight.signedUrl} alt="" style={{ width: '100%', display: 'block', aspectRatio: '16/9', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', aspectRatio: '16/9', background: BORDER }} />
                )}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 12px 10px', background: 'linear-gradient(transparent, rgba(0,0,0,0.55))', pointerEvents: 'none' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', fontFamily: FB }}>{ui.overview.carouselLatest}</div>
                </div>
              </Link>
            )}
            {/* Thumbnails strip */}
            {thumbs.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
                {thumbs.map((item, i) => (
                  <Link key={item.id} href="?tab=gallery" style={{ display: 'block', borderRadius: 8, overflow: 'hidden', position: 'relative', aspectRatio: '1/1', textDecoration: 'none' }}>
                    {item.signedUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.signedUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: BORDER }} />
                    )}
                    {i === 4 && hasMore && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(34,21,9,0.58)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FB, fontSize: 11, fontWeight: 700 }}>
                        {ui.overview.carouselMore}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link
            href="?tab=gallery"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              marginTop: 10, background: 'transparent', border: `1px solid var(--app-border)`,
              color: PURPLE, padding: '11px 12px', borderRadius: 12,
              fontFamily: FB, fontSize: 13, fontWeight: 600, textDecoration: 'none',
              boxSizing: 'border-box' as const,
            }}
          >
            {ui.overview.viewGalleryFull}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" stroke={PURPLE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function OverviewTab({
  eventId,
  eventDate,
  plan,
  scheduledDeletionAt,
  accessCode,
  publicOrigin,
  adminRoleLabel,
}: OverviewTabProps) {
  const planId = normalizePlanId(plan);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    const obs = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  return (
    <DarkCtx.Provider value={isDark}>
      <div
        className="welcome-reveal"
        style={{
          padding: '18px 16px 40px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <StatusRibbon eventDate={eventDate} planId={planId} adminRoleLabel={adminRoleLabel} />
        <CountdownGauges eventDate={eventDate} planId={planId} scheduledDeletionAt={scheduledDeletionAt} />
        <StatsTiles eventId={eventId} planId={planId} />
        <AccessCard accessCode={accessCode} publicOrigin={publicOrigin} />
        <PhotoCarousel eventId={eventId} />
      </div>
    </DarkCtx.Provider>
  );
}
