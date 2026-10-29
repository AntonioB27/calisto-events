"use client";

import { bannerCoverBackground } from "@/lib/banner-theme";
import Link from "next/link";
import { ChevronLeft, Ellipsis, Eye, Home, Images, Users } from "lucide-react";
import { Suspense, useEffect, useRef, useState } from "react";

import { useAppUi } from "@/components/AppUiProvider";
import { plural } from "@/lib/app-ui/plural";
import { daysUntilEvent, getEventPhase } from "@/lib/event-phase";
import { bcp47FromUiLocale } from "@/lib/locale-bcp47";

import { type EventAdminTabId } from "./event-admin-tabs";
import "./event-shell.css";

const FB_ = "'DM Sans', sans-serif";
const GOLD_PILL = 'linear-gradient(135deg, #f5c76b, #f0b34b)';

type BottomTab = Readonly<{ id: EventAdminTabId; Icon: typeof Home; label: (t: ReturnType<typeof useAppUi>) => string }>;

const BOTTOM_TABS: readonly BottomTab[] = [
  { id: "overview", Icon: Home, label: (t) => t.aurora.navHome },
  { id: "gallery", Icon: Images, label: (t) => t.aurora.navAlbum },
  { id: "guests", Icon: Users, label: (t) => t.aurora.navGuests },
  { id: "more", Icon: Ellipsis, label: (t) => t.aurora.navMore },
];

/** Tabs opened from More go back to More; the rest go back to the event list. */
const BACK_TO_MORE: ReadonlySet<EventAdminTabId> = new Set(["share", "rsvp", "prints", "settings"]);

type EventAdminTabsProps = Readonly<{
  eventId: string;
  selectedTab: EventAdminTabId;
  eventTitle: string;
  eventEmoji?: string;
  accessCode: string;
  mediaCount?: number;
  guestCount?: number;
  eventDate?: string | null;
  /** Newest photo, signed; Home's cover. */
  coverPhoto?: string | null;
  /** Guest page theme; colours the cover until the first photo arrives. */
  bannerTheme?: string | null;
  moderationEnabled?: boolean;
  /** Items awaiting moderation; drives the Album badge when moderation is on. */
  pendingReviewCount?: number;
}>;

function formatEventDay(eventDate: string, locale: string): string | null {
  const ms = Date.parse(eventDate.slice(0, 10) + "T00:00:00Z");
  if (Number.isNaN(ms)) return null;
  return new Date(ms).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
}

function whenLabel(eventDate: string, mediaCount: number, locale: string, ui: ReturnType<typeof useAppUi>): string {
  const phase = getEventPhase(eventDate);
  if (phase === "during") return ui.aurora.happeningNow;
  if (phase === "after") return plural(locale, mediaCount, ui.eventsList.memories);
  const days = daysUntilEvent(eventDate);
  if (days <= 0) return ui.aurora.today;
  if (days === 1) return ui.eventShell.tomorrow;
  return ui.aurora.inDays.replace("{days}", String(days));
}

function TabsInner({
  eventId,
  selectedTab,
  eventTitle,
  eventEmoji = "📅",
  accessCode,
  mediaCount = 0,
  guestCount = 0,
  eventDate,
  coverPhoto = null,
  bannerTheme,
  moderationEnabled = false,
  pendingReviewCount = 0,
}: EventAdminTabsProps) {
  const ui = useAppUi();
  const isHome = selectedTab === "overview";
  const locale = bcp47FromUiLocale(ui.locale);

  // Home: the slim bar slides in once the cover has scrolled under it (same as the guest album).
  const coverRef = useRef<HTMLElement>(null);
  const [pastCover, setPastCover] = useState(false);
  useEffect(() => {
    const cover = coverRef.current;
    if (!cover) return;
    const obs = new IntersectionObserver(([entry]) => setPastCover(!entry.isIntersecting), { rootMargin: "-64px 0px 0px 0px" });
    obs.observe(cover);
    return () => obs.disconnect();
  }, [isHome]);

  const dayLabel = eventDate ? formatEventDay(eventDate, locale) : null;
  const when = eventDate ? whenLabel(eventDate, mediaCount, locale, ui) : null;
  const phase = eventDate ? getEventPhase(eventDate) : null;
  const showAlbumBadge = moderationEnabled && pendingReviewCount > 0;

  const memoriesLine = mediaCount > 0
    ? [plural(locale, mediaCount, ui.eventsList.memories), guestCount > 0 ? plural(locale, guestCount, ui.eventsList.fromGuests) : null].filter(Boolean).join(" ")
    : null;
  // The live pill already says "happening now" on the cover.
  const coverLine = [dayLabel, memoriesLine ?? (phase === "during" ? null : when)].filter(Boolean).join(" · ");
  const barLine = [dayLabel, when].filter(Boolean).join(" · ");

  const back = BACK_TO_MORE.has(selectedTab)
    ? { href: `/events/${eventId}?tab=more`, label: ui.aurora.navMore }
    : { href: "/dashboard", label: ui.eventShell.yourEvents };

  const barInner = (
    <div className="guest-album-bar__inner">
      <Link href={back.href} aria-label={back.label} className="guest-cover-btn guest-cover-btn--round guest-cover-btn--solid">
        <ChevronLeft size={20} strokeWidth={2.2} aria-hidden />
      </Link>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <span className="event-bar__title">{eventTitle}</span>
        {barLine ? <span className="event-bar__line">{barLine}</span> : null}
      </div>
    </div>
  );

  return (
    <>
    {isHome ? (
      <>
        <div className={`guest-album-bar event-home-bar${pastCover ? " is-visible" : ""}`} inert={!pastCover}>
          {barInner}
        </div>
        <header
          ref={coverRef}
          className={`guest-cover event-cover${coverPhoto ? "" : " guest-cover--empty"}`}
          style={coverPhoto ? undefined : bannerCoverBackground(bannerTheme)}
        >
          {coverPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverPhoto} alt="" className="guest-cover__photo" />
          ) : (
            <span aria-hidden className="guest-cover__emoji">{eventEmoji}</span>
          )}
          <div aria-hidden className="guest-cover__shade" />
          <Link href="/dashboard" className="guest-cover-btn guest-cover__back">
            <ChevronLeft size={20} strokeWidth={2.2} aria-hidden />
            {ui.eventShell.yourEvents}
          </Link>
          <a
            href={`/join/${encodeURIComponent(accessCode)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={ui.eventShell.viewAsGuest}
            title={ui.eventShell.viewAsGuest}
            className="guest-cover-btn guest-cover-btn--round guest-cover__menu"
          >
            <Eye size={20} strokeWidth={1.9} aria-hidden />
          </a>
          <div className="guest-cover__text">
            {phase === "during" ? <span className="event-cover__live">{ui.aurora.liveNow}</span> : null}
            <h1 className="guest-cover__title">{eventTitle}</h1>
            {coverLine ? <p className="guest-cover__line">{coverLine}</p> : null}
          </div>
        </header>
      </>
    ) : (
      <div className="guest-album-bar event-bar">{barInner}</div>
    )}

    <EventBottomNav eventId={eventId} selectedTab={selectedTab} albumBadge={showAlbumBadge ? pendingReviewCount : null} />
    </>
  );
}

/** Floating warm-glass bottom nav, mobile only; desktop uses the shell's top nav. Also used by the print screen. */
export function EventBottomNav({
  eventId,
  selectedTab,
  albumBadge = null,
}: Readonly<{ eventId: string; selectedTab: EventAdminTabId; albumBadge?: number | null }>) {
  const ui = useAppUi();
  const [pendingTab, setPendingTab] = useState<EventAdminTabId | null>(null);
  useEffect(() => { setPendingTab(null); }, [selectedTab]);

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
    <nav
      aria-label={ui.eventNav.tabsAria}
      className="grid md:hidden"
      style={{
        position: 'fixed',
        left: 14,
        right: 14,
        bottom: 'calc(22px + env(safe-area-inset-bottom, 0px))',
        height: 68,
        padding: 6,
        boxSizing: 'border-box',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: 4,
        borderRadius: 24,
        background: isDark ? 'rgba(34,28,42,0.88)' : 'rgba(255,248,236,0.88)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        border: `1px solid ${isDark ? 'rgba(240,179,75,0.18)' : 'rgba(214,176,112,0.5)'}`,
        boxShadow: isDark
          ? '0 18px 36px -14px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,220,160,0.1)'
          : '0 18px 36px -14px rgba(90,60,20,0.4), inset 0 1px 0 #fffdf6',
        zIndex: 100,
      }}
    >
      {BOTTOM_TABS.map(({ id, Icon, label }) => {
        const active = id === selectedTab;
        const pending = !active && pendingTab === id;
        const text = label(ui);
        const badge = id === "gallery" ? albumBadge : null;
        return (
          <Link
            key={id}
            href={`/events/${eventId}?tab=${id}`}
            aria-current={active ? 'page' : undefined}
            aria-label={badge !== null ? `${text}, ${ui.aurora.waitingForYou.replace("{count}", String(badge))}` : undefined}
            onClick={() => setPendingTab(id)}
            style={{
              position: 'relative',
              minHeight: 44,
              borderRadius: 18,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              textDecoration: 'none',
              fontFamily: FB_,
              fontSize: 12,
              fontWeight: active ? 700 : 600,
              color: active ? '#1b1208' : 'var(--app-muted)',
              background: active ? GOLD_PILL : 'transparent',
              boxShadow: active ? '0 6px 14px -8px rgba(150,100,20,0.7)' : 'none',
              opacity: pending ? 0.55 : 1,
              cursor: pending ? 'wait' : undefined,
              animation: pending ? 'appNavPending 1.4s ease-in-out infinite' : undefined,
            }}
          >
            <Icon size={22} strokeWidth={1.9} aria-hidden />
            {text}
            {badge !== null && (
              <span
                aria-hidden
                style={{
                  position: 'absolute', top: 2, left: 'calc(50% + 6px)', minWidth: 20, height: 20, padding: '0 5px',
                  borderRadius: 10, background: 'var(--app-purple)', color: '#fff', fontSize: 12, fontWeight: 700,
                  lineHeight: '20px', textAlign: 'center', boxSizing: 'border-box',
                }}
              >
                {badge > 99 ? '99+' : badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function EventAdminTabs(props: EventAdminTabsProps) {
  return (
    <Suspense fallback={<div style={{ height: 120 }} />}>
      <TabsInner {...props} />
    </Suspense>
  );
}
