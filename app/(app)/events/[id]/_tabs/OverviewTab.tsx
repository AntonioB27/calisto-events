"use client";

import Link from "next/link";
import QRCode from "react-qr-code";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Camera, Clapperboard, Users } from "lucide-react";

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
const INK    = '#221509';
const INK_S  = '#5A4A36';
const MUTED  = '#9A8570';
const GOLD   = '#C5922A';
const PURPLE = '#5B2D8E';
const RUST   = '#D17A2A';
const BORDER = '#DDD4C5';
const GOLD_FOIL = 'linear-gradient(135deg, #E6BF66 0%, #C5922A 45%, #F4D88F 70%, #946C18 100%)';

const FB = "'DM Sans', sans-serif";
const FS = "'DM Serif Display', serif";

const glass = {
  background: 'rgba(255,255,255,0.62)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: '1px solid rgba(255,255,255,0.78)',
  boxShadow: '0 10px 30px -8px rgba(40,25,15,0.18), inset 0 1px 0 rgba(255,255,255,0.7)',
} as React.CSSProperties;

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

function parseDateParts(dateStr: string) {
  const parts = dateStr?.split('-').map(Number);
  if (!parts || parts.length < 3) return null;
  const [y, m, d] = parts;
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

// ── Countdown card ────────────────────────────────────────────────────────────
function ArcGaugeCard({
  label,
  days,
  hours,
  accent,
  isEnded,
  endedLabel,
}: {
  label: string;
  days: number;
  hours: number;
  accent: string;
  isEnded?: boolean;
  endedLabel?: string;
}) {

  return (
    <div style={{
      ...glass,
      borderRadius: 18,
      padding: '14px 14px 12px',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Accent glow */}
      <div style={{
        position: 'absolute', top: -24, right: -24,
        width: 80, height: 80, borderRadius: '50%',
        background: accent, opacity: 0.13, filter: 'blur(20px)',
        pointerEvents: 'none',
      }} />

      {/* Label */}
      <div style={{
        fontSize: 8.5, fontWeight: 700, letterSpacing: '0.2em',
        textTransform: 'uppercase', color: accent, fontFamily: FB,
        position: 'relative',
      }}>
        {label}
      </div>

      {/* Main display */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingTop: 8, position: 'relative' }}>
        {isEnded ? (
          <div style={{
            fontFamily: FS, fontStyle: 'italic', fontSize: 14,
            color: accent, lineHeight: 1.3, paddingBottom: 6,
          }}>
            {endedLabel}
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
              <span style={{
                fontFamily: FS, fontStyle: 'italic', fontWeight: 400,
                fontSize: 48, color: accent, letterSpacing: '-0.03em', lineHeight: 0.9,
              }} aria-live="polite">
                {days}
              </span>
              <span style={{
                fontFamily: FB, fontSize: 10, fontWeight: 700,
                color: accent, opacity: 0.65,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                marginBottom: 3,
              }}>
                d
              </span>
            </div>
            <div style={{
              fontSize: 11, color: MUTED, fontWeight: 600,
              marginTop: 4, fontFamily: FB, letterSpacing: '0.02em',
            }}>
              + {hours}h
            </div>
          </>
        )}
      </div>

    </div>
  );
}

// ── Status ribbon ─────────────────────────────────────────────────────────────
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
  const cal = parseDateParts(eventDate);
  const planName = ui.plans[planId];

  return (
    <div style={{
      ...glass, borderRadius: 18,
      padding: '12px 14px',
      display: 'grid',
      gridTemplateColumns: '1.4fr 1px 1fr 1px 1fr',
      gap: 12,
      alignItems: 'center',
    }}>
      {/* Date */}
      <div>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: MUTED, fontFamily: FB }}>Event date</div>
        {cal ? (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
            <span style={{ fontFamily: FS, fontStyle: 'italic', fontWeight: 400, fontSize: 30, color: INK, letterSpacing: '-0.02em', lineHeight: 1 }}>{cal.day}</span>
            <div>
              <div style={{ fontFamily: FS, fontStyle: 'italic', fontSize: 12, color: INK, fontWeight: 400, lineHeight: 1 }}>{cal.month}</div>
              <div style={{ fontSize: 9.5, color: MUTED, fontWeight: 600, marginTop: 2, fontFamily: FB }}>{cal.year} · {cal.weekday}</div>
            </div>
          </div>
        ) : (
          <div style={{ fontFamily: FS, fontStyle: 'italic', fontSize: 14, color: MUTED, marginTop: 4 }}>—</div>
        )}
      </div>
      <div style={{ width: 1, height: '70%', background: 'rgba(154,133,112,0.25)', justifySelf: 'center' as const }} />
      {/* Plan */}
      <div>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: MUTED, fontFamily: FB }}>Plan</div>
        <div style={{
          marginTop: 5, display: 'inline-block',
          background: GOLD_FOIL, color: '#fff',
          padding: '3px 10px', borderRadius: 12,
          fontFamily: FS, fontStyle: 'italic', fontWeight: 400, fontSize: 15,
          letterSpacing: '0.04em',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), 0 2px 6px rgba(148,108,24,0.25)',
        }}>{planName}</div>
      </div>
      <div style={{ width: 1, height: '70%', background: 'rgba(154,133,112,0.25)', justifySelf: 'center' as const }} />
      {/* Role */}
      <div>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: MUTED, fontFamily: FB }}>Your role</div>
        <div style={{ fontFamily: FS, fontStyle: 'italic', fontWeight: 400, fontSize: 15, color: PURPLE, marginTop: 4, letterSpacing: '-0.005em' }}>
          {adminRoleLabel}
        </div>
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
      <ArcGaugeCard
        label={ui.overview.uploadCloseLabel}
        days={uploadParts.days}
        hours={uploadParts.hours}
        accent={RUST}
        isEnded={uploadEnded}
        endedLabel={ui.overview.uploadWindowEnded}
      />
      <ArcGaugeCard
        label={ui.overview.autoDeletionLabel}
        days={deletionParts.days}
        hours={deletionParts.hours}
        accent={PURPLE}
        isEnded={deletionEnded}
        endedLabel={ui.overview.autoDeletionOverdue}
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
  isMuted,
  aside,
}: {
  n: number;
  label: string;
  cap: string;
  accent: string;
  isMuted?: boolean;
  aside: React.ReactNode;
}) {
  return (
    <div style={{
      ...glass, borderRadius: 16,
      padding: '12px 10px 12px 12px',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      minHeight: 116, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -30, right: -30, width: 80, height: 80, borderRadius: '50%', background: accent, opacity: isMuted ? 0.04 : 0.1, filter: 'blur(20px)', pointerEvents: 'none' }} />
      <div>
        <div style={{ fontFamily: FS, fontStyle: 'italic', fontWeight: 400, fontSize: 44, color: accent, letterSpacing: '-0.04em', lineHeight: 0.85 }}>{n}</div>
        <div style={{ fontFamily: FS, fontStyle: 'italic', fontSize: 14, fontWeight: 400, color: INK, marginTop: 4 }}>{label}</div>
        <div style={{ fontSize: 8.5, color: MUTED, fontWeight: 600, marginTop: 1, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: FB }}>{cap}</div>
      </div>
      <div style={{ alignSelf: 'flex-end' }}>{aside}</div>
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
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: INK_S, fontFamily: FB }}>Statistics</div>
        {!supabase && <div style={{ fontSize: 10.5, color: MUTED, fontFamily: FB }}>{ui.common.loadCountsHint}</div>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 8 }}>
        <StatTile n={photos ?? 0} label={ui.overview.statsPhotos} cap={subFor(limits.photos)} accent={PURPLE} aside={<Camera size={32} color={PURPLE} opacity={0.35} aria-hidden />} />
        <StatTile n={videos ?? 0} label={ui.overview.statsVideos} cap={videoCap} accent={MUTED} isMuted aside={<Clapperboard size={32} color={MUTED} opacity={0.35} aria-hidden />} />
        <StatTile n={guestCount}  label={ui.overview.statsGuests} cap={subFor(limits.guests)} accent={GOLD} aside={<Users size={32} color={GOLD} opacity={0.35} aria-hidden />} />
      </div>
    </div>
  );
}

// ── Access code card ──────────────────────────────────────────────────────────
function AccessCard({ accessCode, publicOrigin }: { accessCode: string; publicOrigin: string }) {
  const ui = useAppUi();
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
      background: 'linear-gradient(140deg, rgba(139,79,216,0.18), rgba(197,146,42,0.12) 60%, transparent), rgba(255,255,255,0.72)',
      backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
      border: '1px solid rgba(255,255,255,0.78)',
      boxShadow: '0 14px 32px -10px rgba(40,25,15,0.22), inset 0 1px 0 rgba(255,255,255,0.7)',
      overflow: 'hidden',
    }}>
      {/* aurora glow blob */}
      <div style={{ position: 'absolute', bottom: -40, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,79,216,0.5), transparent 65%)', filter: 'blur(8px)', pointerEvents: 'none' }} />

      <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: INK_S, fontFamily: FB, position: 'relative' }}>
        {ui.overview.accessCodeTitle}
      </div>

      <div style={{
        marginTop: 12, padding: '14px 16px',
        background: 'rgba(255,255,255,0.88)',
        border: `1px dashed ${BORDER}`,
        borderRadius: 12,
        fontFamily: 'var(--font-mono, ui-monospace)',
        fontSize: 20, fontWeight: 700, color: INK,
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
            background: copied ? 'rgba(197,146,42,0.15)' : 'rgba(255,255,255,0.9)',
            border: `1px solid ${copied ? GOLD : BORDER}`,
            color: copied ? GOLD : INK,
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
        <div style={{ background: 'rgba(255,255,255,0.92)', borderRadius: 12, padding: 20, marginTop: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, border: `1px solid ${BORDER}`, position: 'relative' }}>
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
          <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: INK_S, fontFamily: FB }}>{ui.overview.recentPhotos}</div>
          <div style={{ fontFamily: FS, fontStyle: 'italic', fontWeight: 400, fontSize: 18, color: INK, marginTop: 1 }}>The latest six</div>
        </div>
      </div>

      {loading ? (
        <p style={{ fontSize: 13, color: MUTED, fontFamily: FB }}>{ui.common.loading}</p>
      ) : !supabase ? (
        <p style={{ fontSize: 13, color: MUTED, fontFamily: FB }}>{ui.common.configuringSupabase}</p>
      ) : urls.length === 0 ? (
        <div style={{ ...glass, borderRadius: 18, padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <p style={{ fontFamily: FS, fontStyle: 'italic', fontSize: 13, color: MUTED, textAlign: 'center', lineHeight: 1.6, margin: 0 }}>
            {ui.overview.noPhotosHint}
          </p>
          <Link href="?tab=gallery" style={{ background: 'rgba(255,255,255,0.9)', border: `1px solid ${BORDER}`, color: INK, padding: '9px 18px', borderRadius: 10, fontFamily: FB, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            {ui.overview.openGalleryBtn}
          </Link>
        </div>
      ) : (
        <>
          <div style={{ ...glass, borderRadius: 18, padding: 10 }}>
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
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', fontFamily: FB }}>Latest</div>
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
                        +more
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
              marginTop: 10, background: 'transparent', border: `1px solid ${BORDER}`,
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

  return (
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
  );
}
