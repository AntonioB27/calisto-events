"use client";

import Link from "next/link";
import { startTransition, useEffect, useState } from "react";

import { useAppUi } from "@/components/AppUiProvider";
import type { AppUiDict } from "@/lib/app-ui";
import { maybeCreateSupabaseBrowserClient } from "@/lib/supabase-browser";
import { canGuestUpload, type PlanId } from "@/lib/plan-limits";
import { displayNavEmoji, splitEventTitleStored } from "@/lib/event-title";

// ── Editorial Almanac palette (matches dashboard) ─────────────────────────────
const TEXT_S = 'var(--app-text-sub)';
const MUTED  = 'var(--app-muted)';
const GOLD   = '#C5922A';
const GOLD_DK = '#A37118';
const PURPLE = '#5B2D8E';
const BORDER = 'var(--app-border)';
const RUST   = '#B5461B';
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

function parseDateDisplay(dateStr: string | null | undefined) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return {
      mon: d.toLocaleDateString('en', { month: 'short', timeZone: 'UTC' }),
      day: d.getUTCDate(),
      year: d.getUTCFullYear(),
    };
  } catch { return null; }
}

import { GuestLeaveEvent } from "./GuestLeaveEvent";
import { MediaGrid } from "./MediaGrid";
import { UploadZone } from "./UploadZone";
import { WelcomeModal } from "./WelcomeModal";

type GuestEventPageProps = Readonly<{
  accessCode: string;
  eventId: string;
  eventTitle: string;
  organizerUserId: string;
  planId: PlanId;
  eventDate: string;
}>;

function guestJoinErrorMessage(
  raw: string,
  copy: Pick<AppUiDict["guestJoin"], "joinInvalidOrNotFound" | "joinAlreadyMember" | "joinGeneric">,
) {
  const m = raw.toLowerCase();
  if (m.includes("invalid") || m.includes("not found")) return copy.joinInvalidOrNotFound;
  if (m.includes("already")) return copy.joinAlreadyMember;
  return raw.trim() || copy.joinGeneric;
}

export function GuestEventPage({
  accessCode,
  eventId,
  eventTitle,
  organizerUserId,
  planId,
  eventDate,
}: GuestEventPageProps) {
  const ui = useAppUi();
  const [isDark, setIsDark] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [membershipReady, setMembershipReady] = useState(false);
  const [membershipRpcError, setMembershipRpcError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [canManageEvent, setCanManageEvent] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    const obs = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const supabase = maybeCreateSupabaseBrowserClient();
    if (!supabase) {
      queueMicrotask(() => setHasSession(false));
      return;
    }
    void supabase.auth.getSession().then((res: unknown) => {
      const session = (res as { data?: { session?: unknown } } | null)?.data?.session ?? null;
      setHasSession(session !== null);
    });
  }, []);

  useEffect(() => {
    if (!hasSession) return;

    let cancelled = false;

    startTransition(() => {
      setMembershipReady(false);
      setMembershipRpcError(null);
    });

    async function ensureMembership() {
      const supabase = maybeCreateSupabaseBrowserClient();
      if (!supabase) {
        setMembershipReady(true);
        return;
      }
      const { error } = await supabase.rpc("join_event_with_code", {
        p_code: accessCode.toUpperCase(),
      });
      if (!cancelled) {
        if (error) {
          setMembershipRpcError(guestJoinErrorMessage(error.message ?? "", ui.guestJoin));
        } else {
          setMembershipRpcError(null);
        }
        setMembershipReady(true);
      }
    }

    void ensureMembership();
    return () => {
      cancelled = true;
    };
  }, [hasSession, accessCode]);

  useEffect(() => {
    if (!hasSession) {
      queueMicrotask(() => setUserId(null));
      return;
    }
    const supabase = maybeCreateSupabaseBrowserClient();
    if (!supabase) return;
    void supabase.auth.getUser().then((res: { data: { user: { id: string } | null } | null }) => {
      setUserId(res.data?.user?.id ?? null);
    });
  }, [hasSession]);

  useEffect(() => {
    if (!userId || !organizerUserId) {
      queueMicrotask(() => setCanManageEvent(false));
      return;
    }
    if (userId === organizerUserId) {
      queueMicrotask(() => setCanManageEvent(true));
      return;
    }

    let cancelled = false;
    const supabase = maybeCreateSupabaseBrowserClient();
    if (!supabase) {
      queueMicrotask(() => setCanManageEvent(false));
      return;
    }

    void supabase
      .from("event_memberships")
      .select("role")
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .maybeSingle()
      .then((res: { data: unknown }) => {
        if (cancelled) return;
        const data = res.data as { role?: string } | null;
        const role = typeof data?.role === "string" ? data.role : "";
        setCanManageEvent(role === "co_organizer");
      });

    return () => {
      cancelled = true;
    };
  }, [userId, organizerUserId, eventId]);

  const canLeaveAsGuest =
    Boolean(membershipReady && hasSession && userId && organizerUserId && userId !== organizerUserId);

  const { emoji: storedEmoji, name: eventName } = splitEventTitleStored(eventTitle);
  const displayEmoji = displayNavEmoji(storedEmoji);
  const parsedDate = parseDateDisplay(eventDate);

  const uploadsOpen =
    hasSession &&
    canGuestUpload({
      planId,
      eventDate,
      now: new Date().toISOString(),
    });

  if (hasSession === null) {
    return (
      <main className="join-shell mx-auto flex min-h-screen max-w-2xl items-center justify-center px-6 py-12">
        <p style={{ fontSize: 14, color: "var(--app-muted)" }}>{ui.guestJoin.loading}</p>
      </main>
    );
  }

  if (hasSession && !membershipReady) {
    return (
      <main className="join-shell mx-auto flex min-h-screen max-w-2xl items-center justify-center px-6 py-12">
        <p style={{ fontSize: 14, color: "var(--app-muted)" }}>{ui.guestJoin.joining}</p>
      </main>
    );
  }

  return (
    <main className="join-shell min-h-screen px-4 pb-16 pt-10 sm:px-6">
      {!hasSession && (
        <WelcomeModal eventTitle={eventTitle} accessCode={accessCode} onSessionReady={() => setHasSession(true)} />
      )}

      <div className="mx-auto max-w-3xl">
        {/* Nav */}
        {hasSession ? (
          <nav aria-label={ui.guestJoin.signedInNavAria} style={{ marginBottom: 18, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <Link href="/dashboard" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.55)', border: `1px solid ${BORDER}`, color: PURPLE, padding: '7px 12px', borderRadius: 9, fontFamily: FB, fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5, textDecoration: 'none', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
              ← {ui.guestJoin.myEvents}
            </Link>
            {canManageEvent ? (
              <Link href={`/events/${eventId}`} style={{ background: PURPLE, color: '#fff', border: 'none', padding: '7px 12px', borderRadius: 9, fontFamily: FB, fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5, textDecoration: 'none', boxShadow: '0 2px 8px rgba(91,45,142,0.28)' }}>
                {ui.guestJoin.manageEvent} →
              </Link>
            ) : null}
          </nav>
        ) : null}

        {/* Event hero banner */}
        <div style={{ ...(isDark ? GLASS_DARK : GLASS_LIGHT), borderRadius: 14, overflow: 'hidden', position: 'relative', height: 128, marginBottom: 0 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(197,146,42,0.22),rgba(91,45,142,0.14))' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg,rgba(255,255,255,0.12) 0 2px,transparent 2px 12px)' }} />
          {/* Big emoji */}
          <div style={{ position: 'absolute', right: -8, bottom: -14, fontSize: 120, lineHeight: 1, opacity: 0.9, transform: 'rotate(-8deg)', filter: 'drop-shadow(0 4px 12px rgba(40,25,15,0.18))', pointerEvents: 'none' }}>
            {displayEmoji}
          </div>
          {/* Name pill */}
          <div style={{ position: 'absolute', bottom: 10, left: 10, right: 48, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderRadius: 100, padding: '5px 14px', border: '1px solid rgba(255,255,255,0.38)', overflow: 'hidden' }}>
            <span style={{ fontFamily: FS, fontStyle: 'italic', fontWeight: 700, fontSize: 14, color: 'rgba(255,255,255,0.95)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textShadow: '0 1px 4px rgba(40,25,15,0.5)', display: 'block' }}>
              {eventName}
            </span>
          </div>
        </div>

        {/* Date + tagline row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginTop: 14, marginBottom: 24 }}>
          {parsedDate && (
            <div style={{ width: 52, flexShrink: 0, textAlign: 'center', fontFamily: FB, borderRight: `1px dashed ${BORDER}`, paddingRight: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: MUTED }}>{parsedDate.mon}</div>
              <div style={{ fontFamily: FS, fontStyle: 'italic', fontWeight: 700, fontSize: 36, lineHeight: 0.9, color: GOLD, letterSpacing: '-0.03em', marginTop: 1 }}>{parsedDate.day}</div>
              <div style={{ fontFamily: FS, fontStyle: 'italic', fontSize: 10.5, color: MUTED, marginTop: 1 }}>{parsedDate.year}</div>
            </div>
          )}
          <div style={{ flex: 1, paddingTop: parsedDate ? 4 : 0 }}>
            <p style={{ margin: 0, fontFamily: FS, fontStyle: 'italic', fontSize: 14, color: TEXT_S, lineHeight: 1.5 }}>
              {ui.guestJoin.tagline}
            </p>
          </div>
        </div>

        {hasSession ? <GuestLeaveEvent eventId={eventId} canShow={canLeaveAsGuest} /> : null}

        {membershipRpcError ? (
          <div role="alert" style={{ marginBottom: 20, borderRadius: 12, border: `1.5px solid ${RUST}55`, background: `${RUST}15`, padding: '12px 16px', fontSize: 13, color: RUST, fontFamily: FB }}>
            {membershipRpcError}
          </div>
        ) : null}

        {!uploadsOpen && hasSession ? (
          <div style={{ marginBottom: 28, borderRadius: 12, border: `1.5px solid ${GOLD}55`, background: `${GOLD}18`, padding: '12px 16px', fontSize: 13, color: GOLD_DK, fontFamily: FB }}>
            {ui.guestJoin.uploadClosedBanner}
          </div>
        ) : null}

        {hasSession ? (
          <>
            <section style={{ marginBottom: 40 }}>
              {/* Polaroid-style upload affordance */}
              <div style={{ position: "relative" }}>
                {/* Washi tape */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    top: -8,
                    left: "33%",
                    width: 64,
                    height: 14,
                    background: "rgba(212,168,67,0.48)",
                    border: "0.5px solid rgba(212,168,67,0.6)",
                    transform: "rotate(-3deg)",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.22)",
                    zIndex: 2,
                    borderRadius: 2,
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    position: "relative",
                    background: uploadsOpen ? "#f4f0ea" : "rgba(244,240,234,0.55)",
                    borderRadius: 2,
                    boxShadow: "0 8px 28px rgba(0,0,0,0.42), 0 2px 6px rgba(0,0,0,0.2)",
                    transform: "rotate(-0.5deg)",
                    padding: "14px 14px 18px",
                    opacity: uploadsOpen ? 1 : 0.7,
                    cursor: uploadsOpen ? "pointer" : "not-allowed",
                    overflow: "visible",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, pointerEvents: "none" }}>
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 4,
                        background: "rgba(0,0,0,0.07)",
                        border: "1.5px dashed rgba(0,0,0,0.18)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M12 5v14M5 12h14" stroke="rgba(60,40,20,0.5)" strokeWidth="2.4" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div style={{ flex: 1, textAlign: "left" }}>
                      <p style={{ margin: 0, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 16, fontWeight: 700, color: "#2a1d0f", lineHeight: 1.2 }}>
                        {ui.gallery.addMemory}
                      </p>
                      <p style={{ margin: "3px 0 0", fontSize: 11, color: "rgba(60,40,20,0.55)" }}>
                        {uploadsOpen ? ui.gallery.addMemoryHint : ui.guestJoin.uploadClosedBanner}
                      </p>
                    </div>
                  </div>
                  <UploadZone
                    eventId={eventId}
                    disabled={!uploadsOpen}
                    ghost
                    onUploaded={() => setRefreshKey((k) => k + 1)}
                  />
                </div>
              </div>
            </section>

            <section>
              <h2
                style={{
                  marginBottom: 16,
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: "var(--app-muted)",
                }}
              >
                {ui.guestJoin.sectionGallery}
              </h2>
              <MediaGrid
                eventId={eventId}
                refreshKey={refreshKey}
                userId={userId}
                organizerUserId={organizerUserId}
                canManageEvent={canManageEvent}
              />
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
