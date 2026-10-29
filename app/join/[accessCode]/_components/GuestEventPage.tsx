"use client";

import Link from "next/link";
import { CalendarPlus, Camera } from "lucide-react";
import { startTransition, useEffect, useRef, useState } from "react";

import { useAppUi } from "@/components/AppUiProvider";
import { AppBtn } from "@/components/app-ui/AppBtn";
import { Aurora, AuroraSays } from "@/components/app-ui/Aurora";
import { AuroraHourglass } from "@/components/app-ui/AuroraHourglass";
import { CoverCountdown } from "@/components/app-ui/CoverCountdown";
import { interpolate, type AppUiDict } from "@/lib/app-ui";
import { plural } from "@/lib/app-ui/plural";
import { bcp47FromUiLocale } from "@/lib/locale-bcp47";
import { maybeCreateSupabaseBrowserClient } from "@/lib/supabase-browser";
import { canGuestUpload, type PlanId } from "@/lib/plan-limits";
import { daysUntilEvent, getEventPhase } from "@/lib/event-phase";
import { displayNavEmoji, splitEventTitleStored } from "@/lib/event-title";
import { bannerCoverBackground } from "@/lib/banner-theme";

import { GuestLeaveEvent } from "./GuestLeaveEvent";
import { MediaGrid } from "./MediaGrid";
import { UploadZone } from "./UploadZone";
import { WelcomeModal } from "./WelcomeModal";

const GOLD = "#C5922A";
const RUST = "#B5461B";
const FB = "'DM Sans', sans-serif";

/** Before the event: empty frames in real photo shapes, three masonry columns. */
const GHOST_COLUMNS = [
  ["3 / 2", "16 / 9", "4 / 5"],
  ["1 / 1", "2 / 3", "3 / 2"],
  ["2 / 3", "3 / 2", "1 / 1"],
] as const;

function ChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Dots() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
    </svg>
  );
}

type GuestEventPageProps = Readonly<{
  accessCode: string;
  eventId: string;
  eventTitle: string;
  organizerUserId: string;
  planId: PlanId;
  eventDate: string;
  bannerTheme?: string | null;
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
  bannerTheme,
}: GuestEventPageProps) {
  const ui = useAppUi();
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [membershipReady, setMembershipReady] = useState(false);
  const [membershipRpcError, setMembershipRpcError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [canManageEvent, setCanManageEvent] = useState(false);
  const [mediaCount, setMediaCount] = useState<number | null>(null);
  const [mineCount, setMineCount] = useState(0);
  const [onlyMine, setOnlyMine] = useState(false);
  const [latestPrints, setLatestPrints] = useState<string[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const [pastCover, setPastCover] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLElement>(null);

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
      if (!error) {
        // The nickname typed on the welcome screen lives on the login account; the album and the
        // organizer's guest list read the membership, so copy it there once (own row, guests only).
        const { data: auth } = await supabase.auth.getUser();
        const nickname = String(auth.user?.user_metadata?.display_name ?? "").trim();
        if (auth.user && nickname) {
          await supabase
            .from("event_memberships")
            .update({ display_name_at_event: nickname })
            .eq("event_id", eventId)
            .eq("user_id", auth.user.id)
            .eq("role", "guest")
            .is("display_name_at_event", null);
        }
      }
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
  }, [hasSession, accessCode, eventId]);

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

  // Album and "mine" counts for the cover line and the All / Mine switch.
  useEffect(() => {
    if (!hasSession || !membershipReady) return;
    const supabase = maybeCreateSupabaseBrowserClient();
    if (!supabase) return;
    let cancelled = false;
    // shortcut: guests can't count other members under RLS, so the cover shows media only; add a guest-count RPC to show "from N guests".
    void supabase
      .from("media_items")
      .select("id", { count: "exact", head: true })
      .eq("event_id", eventId)
      .then((res: { count: number | null }) => {
        if (!cancelled) setMediaCount(res.count ?? null);
      });
    if (userId) {
      void supabase
        .from("media_items")
        .select("id", { count: "exact", head: true })
        .eq("event_id", eventId)
        .eq("uploaded_by", userId)
        .then((res: { count: number | null }) => {
          if (!cancelled) setMineCount(res.count ?? 0);
        });
    }
    return () => {
      cancelled = true;
    };
  }, [hasSession, membershipReady, eventId, userId, refreshKey]);

  const showAlbum = Boolean(hasSession && membershipReady);

  // Scroll states without a scroll listener: a sentinel at the very top (Aurora leaves as soon as
  // the page moves) and the cover itself (the slim bar arrives once the cover is fully under it).
  useEffect(() => {
    if (!showAlbum) return;
    const sentinel = topSentinelRef.current;
    const cover = coverRef.current;
    if (!sentinel || !cover) return;
    const topObserver = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting));
    const coverObserver = new IntersectionObserver(([entry]) => setPastCover(!entry.isIntersecting), {
      rootMargin: "-64px 0px 0px 0px",
    });
    topObserver.observe(sentinel);
    coverObserver.observe(cover);
    return () => {
      topObserver.disconnect();
      coverObserver.disconnect();
    };
  }, [showAlbum]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const canLeaveAsGuest =
    Boolean(membershipReady && hasSession && userId && organizerUserId && userId !== organizerUserId);
  const hasMenu = canManageEvent || canLeaveAsGuest;

  const locale = bcp47FromUiLocale(ui.locale);
  const { emoji: storedEmoji, name: eventName } = splitEventTitleStored(eventTitle);
  const eventDay = new Date(eventDate.length === 10 ? eventDate + "T00:00:00Z" : eventDate);
  const validDate = !Number.isNaN(eventDay.getTime());
  const dateLabel = validDate
    ? eventDay.toLocaleDateString(locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        ...(eventDay.getUTCFullYear() !== new Date().getUTCFullYear() ? { year: "numeric" } : {}),
        timeZone: "UTC",
      })
    : null;
  const countLabel = mediaCount && mediaCount > 0 ? plural(locale, mediaCount, ui.eventsList.memories) : null;
  const coverLine = [dateLabel, countLabel].filter(Boolean).join(" · ");
  const coverPhoto = latestPrints[0];
  // Until the event day the cover is a save-the-date and uploads wait.
  const soon = validDate && getEventPhase(eventDate) === "before";
  const daysToGo = soon ? daysUntilEvent(eventDate) : 0;
  const seeYou =
    daysToGo <= 1
      ? ui.soon.seeYouTomorrow
      : interpolate(ui.soon.seeYouOn, { date: eventDay.toLocaleDateString(locale, { day: "numeric", month: "long", timeZone: "UTC" }) });

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
        <AuroraHourglass size={96} caption={ui.guestJoin.loading} />
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

  const menuButton = (extraClass: string) =>
    hasMenu ? (
      <button
        type="button"
        className={`guest-cover-btn guest-cover-btn--round ${extraClass}`}
        aria-label={ui.guestFlow.moreOptions}
        aria-haspopup="true"
        aria-expanded={menuOpen}
        aria-controls="guest-album-menu"
        onClick={() => setMenuOpen((o) => !o)}
      >
        <Dots />
      </button>
    ) : null;

  return (
    <main
      className="join-shell relative min-h-screen px-3 pt-3 sm:px-6 sm:pt-6"
      style={{
        paddingBottom: !hasSession ? 48 : uploadsOpen ? "calc(170px + env(safe-area-inset-bottom, 0px))" : soon ? "calc(200px + env(safe-area-inset-bottom, 0px))" : 48,
      }}
    >
      <div ref={topSentinelRef} aria-hidden style={{ position: "absolute", top: 0, left: 0, width: 1, height: 8 }} />

      {!hasSession && (
        <WelcomeModal eventTitle={eventTitle} eventDateLabel={dateLabel ?? undefined} accessCode={accessCode} onSessionReady={() => setHasSession(true)} />
      )}

      {/* Slim bar: slides in once the cover has scrolled away */}
      {showAlbum ? (
        <div className={`guest-album-bar${pastCover ? " is-visible" : ""}`} inert={!pastCover}>
          <div className="guest-album-bar__inner">
            <Link href="/dashboard" className="guest-cover-btn guest-cover-btn--round guest-cover-btn--solid" aria-label={ui.guestJoin.myEvents}>
              <ChevronLeft />
            </Link>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--app-text)" }}>
                {eventName}
              </div>
              {countLabel ? <div style={{ fontSize: 12, color: "var(--app-muted)" }}>{countLabel}</div> : null}
            </div>
            {menuButton("guest-cover-btn--solid")}
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-3xl">
        {/* Cover: the newest photo, the event name over it */}
        <header
          ref={coverRef}
          className={`guest-cover${soon ? " guest-cover--soon" : coverPhoto ? "" : " guest-cover--empty"}`}
          style={soon || coverPhoto ? undefined : bannerCoverBackground(bannerTheme)}
        >
          {soon ? (
            <CoverCountdown days={daysToGo} />
          ) : coverPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverPhoto} alt="" className="guest-cover__photo" />
          ) : (
            <span aria-hidden className="guest-cover__emoji">{displayNavEmoji(storedEmoji)}</span>
          )}
          {soon ? null : <div aria-hidden className="guest-cover__shade" />}
          {hasSession ? (
            <Link href="/dashboard" className="guest-cover-btn guest-cover__back">
              <ChevronLeft />
              {ui.guestJoin.myEvents}
            </Link>
          ) : null}
          {menuButton("guest-cover__menu")}
          <div className="guest-cover__text">
            <h1 className="guest-cover__title">{eventName}</h1>
            {coverLine ? <p className="guest-cover__line">{coverLine}</p> : null}
          </div>
        </header>

        {membershipRpcError ? (
          <div role="alert" style={{ marginTop: 16, borderRadius: 14, border: `1.5px solid ${RUST}55`, background: `${RUST}15`, padding: "12px 16px", fontSize: 14, color: RUST, fontFamily: FB }}>
            {membershipRpcError}
          </div>
        ) : null}

        {!uploadsOpen && hasSession && !soon ? (
          <div style={{ marginTop: 16, borderRadius: 14, border: `1.5px solid ${GOLD}55`, background: `${GOLD}18`, padding: "12px 16px", fontSize: 14, lineHeight: 1.45, color: "var(--app-gold-ink)", fontFamily: FB }}>
            {ui.guestJoin.uploadClosedBanner}
          </div>
        ) : null}

        {showAlbum && soon && !mediaCount ? (
          <section aria-labelledby="guest-gallery-title" style={{ margin: "20px 4px 0" }}>
            <h2 id="guest-gallery-title" style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 400, fontSize: 24, lineHeight: 1.1, color: "var(--app-text)" }}>
              {ui.soon.albumTitle}
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 14, lineHeight: 1.4, color: "var(--app-text-sub)" }}>{ui.soon.albumBody}</p>
            <div aria-hidden className="guest-ghost-album">
              {GHOST_COLUMNS.map((col, c) => (
                <div key={c}>
                  {col.map((ratio, i) => (
                    <span key={ratio} style={{ aspectRatio: ratio }}>
                      {(c + i) % 3 === 1 ? <Camera size={22} strokeWidth={1.6} /> : null}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </section>
        ) : showAlbum ? (
          <>
            <div style={{ margin: "14px 0 12px", minHeight: 48, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              {mineCount > 0 ? (
                <div role="group" aria-label={ui.guestFlow.viewAria} className="guest-album-switch">
                  <button type="button" aria-pressed={!onlyMine} onClick={() => setOnlyMine(false)}>
                    {interpolate(ui.guestFlow.allTab, { count: mediaCount ?? 0 })}
                  </button>
                  <button type="button" aria-pressed={onlyMine} onClick={() => setOnlyMine(true)}>
                    {interpolate(ui.guestFlow.mineTab, { count: mineCount })}
                  </button>
                </div>
              ) : (
                <span />
              )}
              <span style={{ fontSize: 13, color: "var(--app-muted)" }}>{ui.guestFlow.newestFirst}</span>
            </div>

            <section aria-labelledby="guest-gallery-title">
              <h2 id="guest-gallery-title" className="sr-only">
                {ui.guestJoin.sectionGallery}
              </h2>
              <MediaGrid
                eventId={eventId}
                refreshKey={refreshKey}
                userId={userId}
                organizerUserId={organizerUserId}
                canManageEvent={canManageEvent}
                onlyMine={onlyMine}
                onLatestPhotos={onlyMine ? undefined : setLatestPrints}
              />
            </section>

            {uploadsOpen ? (
              <div className={`guest-upload-dock${scrolled ? " is-scrolled" : ""}`}>
                <Aurora pose="camera" size={78} className="guest-upload-dock__aurora" />
                <div className="guest-upload-dock__say" aria-hidden={scrolled}>
                  <div>
                    <AuroraSays size={18} style={{ paddingLeft: 86, minHeight: 40, marginBottom: 10, display: "flex", alignItems: "center", lineHeight: 1.2 }}>
                      {ui.aurora.guestDock}
                    </AuroraSays>
                  </div>
                </div>
                <div className="guest-upload-dock__target" style={{ position: "relative" }}>
                  <div className="guest-upload-dock__btn" aria-hidden>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.6l1.2-1.8A1.5 1.5 0 0 1 10.55 3.5h2.9a1.5 1.5 0 0 1 1.25.7L15.9 6h1.6A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                      <circle cx="12" cy="12.5" r="3.2" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                    {ui.guestJoin.addPhotos}
                  </div>
                  <UploadZone
                    eventId={eventId}
                    ghost
                    celebrate
                    label={ui.guestJoin.addPhotos}
                    onUploaded={() => setRefreshKey((k) => k + 1)}
                  />
                </div>
              </div>
            ) : null}
          </>
        ) : null}

        {showAlbum && soon ? (
          <div className="guest-upload-dock guest-upload-dock--soon">
            <Aurora pose="waving" size={88} className="guest-upload-dock__aurora" />
            <AuroraSays size={20} style={{ paddingLeft: 96, minHeight: 40, display: "flex", alignItems: "center", lineHeight: 1.15 }}>
              {seeYou}
            </AuroraSays>
            <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.4, color: "var(--app-text-sub)" }}>{ui.soon.dockDetail}</p>
            <AppBtn
              href={`/api/join/calendar?code=${encodeURIComponent(accessCode)}`}
              variant="secondary"
              style={{ marginTop: 12, width: "100%", height: 50, borderRadius: 15, fontSize: 16, gap: 8 }}
            >
              <CalendarPlus size={20} strokeWidth={1.8} aria-hidden style={{ color: "var(--app-gold-ink)" }} />
              {ui.soon.addToCalendar}
            </AppBtn>
          </div>
        ) : null}
      </div>

      {/* Options menu: page level (not inside the sliding bar) so the leave dialog positions against the viewport */}
      {hasMenu ? (
        <div hidden={!menuOpen}>
          <div aria-hidden className="guest-album-menu__backdrop" onClick={() => setMenuOpen(false)} />
          <div id="guest-album-menu" className="guest-album-menu">
            {canManageEvent ? (
              <Link href={`/events/${eventId}`} className="guest-album-menu__item" onClick={() => setMenuOpen(false)}>
                {ui.guestJoin.manageEvent}
              </Link>
            ) : null}
            <GuestLeaveEvent eventId={eventId} canShow={canLeaveAsGuest} asMenuItem />
          </div>
        </div>
      ) : null}
    </main>
  );
}
