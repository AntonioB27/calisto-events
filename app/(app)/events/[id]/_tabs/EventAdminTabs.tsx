"use client";

import Link from "next/link";
import { ArrowLeft, Camera, Home, Images, Settings, Share2, Users } from "lucide-react";
import { Suspense, useCallback, useEffect, useState } from "react";

import { useAppUi } from "@/components/AppUiProvider";

import { type EventAdminTabId } from "./event-admin-tabs";

const BOTTOM_NAV_TABS: EventAdminTabId[] = ["overview", "guests", "gallery"];
const ORGANIZER_NAV_TABS: EventAdminTabId[] = ["prints"];

const ICON_MAP: Record<string, React.ComponentType<{ size: number; color: string; strokeWidth: number }>> = {
  overview: Home,
  guests:   Users,
  gallery:  Images,
  prints:   Camera,
};

const GOLD_DK  = '#946C18';
const INK_SUB  = '#5A4A36';
const INK      = '#221509';
const NAV_MUTED = '#9A8570';
const FS_NAV   = "'DM Serif Display', serif";

function labelForTab(tab: EventAdminTabId, t: ReturnType<typeof useAppUi>): string {
  switch (tab) {
    case "overview":
      return t.eventNav.tabOverview;
    case "guests":
      return t.eventNav.tabGuests;
    case "gallery":
      return t.eventNav.tabGallery;
    case "share":
      return t.eventNav.tabShare;
    case "prints":
      return t.eventNav.tabPrints;
    case "settings":
      return t.eventNav.tabSettings;
  }
}


type EventAdminTabsProps = Readonly<{
  eventId: string;
  selectedTab: EventAdminTabId;
  eventTitle: string;
  eventEmoji?: string;
  showOrganizerOnlyTabs?: boolean;
  guestCount?: number;
  mediaCount?: number;
  eventDate?: string | null;
}>;

// ── Editorial Almanac palette ─────────────────────────────────────────────────
const MUTED_  = '#9A8570';
const GOLD_   = '#C5922A';
const PURPLE_ = '#5B2D8E';
const BORDER_ = '#DDD4C5';
const FB_ = "'DM Sans', sans-serif";
const FS_ = "'DM Serif Display', serif";

const TEXT_S_  = 'var(--app-text-sub)';
const MUTED_T_ = 'var(--app-muted)';
const DIVIDER_ = 'var(--app-border)';

const GLASS_LIGHT_: React.CSSProperties = {
  background: 'rgba(255,255,255,0.62)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: '1px solid rgba(255,255,255,0.78)',
  boxShadow: '0 10px 30px -8px rgba(40,25,15,0.18), inset 0 1px 0 rgba(255,255,255,0.7)',
};

const GLASS_DARK_: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 10px 30px -8px rgba(0,0,0,0.4)',
};

function parseDateFull(dateStr: string | null | undefined) {
  if (!dateStr) return null;
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    if (!y || !m || !d) return null;
    return {
      mon: new Date(y, m - 1, d).toLocaleDateString("en", { month: "short" }),
      day: d,
      year: y,
    };
  } catch { return null; }
}

function TabsInner({
  eventId,
  selectedTab,
  eventTitle,
  eventEmoji = "📅",
  showOrganizerOnlyTabs = false,
  guestCount = 0,
  mediaCount = 0,
  eventDate,
}: EventAdminTabsProps) {
  const ui = useAppUi();
  const parsedDate = parseDateFull(eventDate);

  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    const obs = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  const countFor = useCallback((tabId: EventAdminTabId): number | null => {
    if (tabId === "guests")  return guestCount  > 0 ? guestCount  : null;
    if (tabId === "gallery") return mediaCount  > 0 ? mediaCount  : null;
    return null;
  }, [guestCount, mediaCount]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLElement>) {
    const tabEls = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]'));
    const idx = tabEls.indexOf(document.activeElement as HTMLElement);
    if (idx === -1) return;
    if (e.key === "ArrowRight") { e.preventDefault(); tabEls[(idx + 1) % tabEls.length]?.focus(); }
    else if (e.key === "ArrowLeft")  { e.preventDefault(); tabEls[(idx - 1 + tabEls.length) % tabEls.length]?.focus(); }
    else if (e.key === "Home") { e.preventDefault(); tabEls[0]?.focus(); }
    else if (e.key === "End")  { e.preventDefault(); tabEls[tabEls.length - 1]?.focus(); }
  }

  const memoriesLabel = ui.eventNav.memoriesCount?.replace("{count}", "").trim() || "memories";
  const guestsLabel   = ui.eventNav.guestsCount?.replace("{count}", "").trim() || "guests";

  return (
    <>
    <div className="welcome-reveal">
      {/* ── Event hero ── */}
      <div style={{ padding: '12px 16px 0' }}>

        {/* Top bar: back pill + action chips */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
          <Link href="/dashboard" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.55)', border: `1px solid ${DIVIDER_}`, color: 'var(--app-purple)', padding: '7px 12px', borderRadius: 9, fontFamily: FB_, fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5, textDecoration: 'none', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
            <ArrowLeft size={11} /> {ui.eventNav.myEvents}
          </Link>
          <div style={{ display: 'flex', gap: 6 }}>
            <Link href={`/events/${eventId}?tab=share`} style={{
              width: 32, height: 32, borderRadius: 10,
              background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.55)',
              border: `1px solid ${DIVIDER_}`,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: MUTED_T_, textDecoration: 'none', flexShrink: 0,
            }} title={ui.eventNav.tabShare}>
              <Share2 size={15} />
            </Link>
            {showOrganizerOnlyTabs && (
              <Link href={`/events/${eventId}?tab=settings`} style={{
                width: 32, height: 32, borderRadius: 10,
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.55)',
                border: `1px solid ${DIVIDER_}`,
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: MUTED_T_, textDecoration: 'none', flexShrink: 0,
              }} title={ui.eventNav.tabSettings}>
                <Settings size={15} />
              </Link>
            )}
          </div>
        </div>

        {/* Glass banner */}
        <div style={{ ...(isDark ? GLASS_DARK_ : GLASS_LIGHT_), borderRadius: 14, overflow: 'hidden', position: 'relative', height: 128 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(91,45,142,0.22),rgba(123,63,190,0.18))' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg,rgba(255,255,255,0.12) 0 2px,transparent 2px 12px)' }} />
          {/* Big emoji */}
          <div style={{ position: 'absolute', right: -8, bottom: -14, fontSize: 120, lineHeight: 1, opacity: 0.9, transform: 'rotate(-8deg)', filter: 'drop-shadow(0 4px 12px rgba(40,25,15,0.18))', pointerEvents: 'none', fontStyle: 'normal' }}>
            <span className="calisto-emoji-upright">{eventEmoji}</span>
          </div>
          {/* Name pill */}
          <div style={{ position: 'absolute', bottom: 10, left: 10, right: 48, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderRadius: 100, padding: '5px 14px', border: '1px solid rgba(255,255,255,0.38)', overflow: 'hidden' }}>
            <span style={{ fontFamily: FS_, fontStyle: 'italic', fontWeight: 700, fontSize: 14, color: 'rgba(255,255,255,0.95)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textShadow: '0 1px 4px rgba(40,25,15,0.5)', display: 'block' }}>
              {eventTitle}
            </span>
          </div>
        </div>

        {/* Date + stats row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 14, marginBottom: 4 }}>
          {parsedDate && (
            <div style={{ width: 52, flexShrink: 0, textAlign: 'center', fontFamily: FB_, borderRight: `1px dashed ${DIVIDER_}`, paddingRight: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: MUTED_T_ }}>{parsedDate.mon}</div>
              <div style={{ fontFamily: FS_, fontStyle: 'italic', fontWeight: 700, fontSize: 36, lineHeight: 0.9, color: GOLD_, letterSpacing: '-0.03em', marginTop: 1 }}>{parsedDate.day}</div>
              <div style={{ fontFamily: FS_, fontStyle: 'italic', fontSize: 10.5, color: MUTED_T_, marginTop: 1 }}>{parsedDate.year}</div>
            </div>
          )}
          {(mediaCount > 0 || guestCount > 0) && (
            <div style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'stretch' }}>
              {mediaCount > 0 && (
                <div style={{ flex: 1, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.55)', border: `1px solid ${DIVIDER_}`, borderRadius: 10, padding: '8px 10px', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                    <Camera size={11} color={MUTED_T_} />
                    <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: MUTED_T_, fontFamily: FB_ }}>
                      {memoriesLabel}
                    </span>
                  </div>
                  <div style={{ fontFamily: FS_, fontStyle: 'italic', fontWeight: 700, fontSize: 22, lineHeight: 1, color: GOLD_, letterSpacing: '-0.02em' }}>
                    {mediaCount}
                  </div>
                </div>
              )}
              {guestCount > 0 && (
                <div style={{ flex: 1, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.55)', border: `1px solid ${DIVIDER_}`, borderRadius: 10, padding: '8px 10px', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                    <Users size={11} color={MUTED_T_} />
                    <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: MUTED_T_, fontFamily: FB_ }}>
                      {guestsLabel}
                    </span>
                  </div>
                  <div style={{ fontFamily: FS_, fontStyle: 'italic', fontWeight: 700, fontSize: 22, lineHeight: 1, color: PURPLE_, letterSpacing: '-0.02em' }}>
                    {guestCount}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

    </div>

    {/* ── Liquid glass bottom nav — mobile only; desktop uses top nav ── */}
    <nav
        aria-label={ui.eventNav.tabsAria}
        onKeyDown={handleKeyDown}
        className="flex md:hidden"
        style={{
          position: 'fixed',
          left: 18,
          right: 18,
          bottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
          background: 'rgba(255,252,248,0.38)',
          backdropFilter: 'blur(48px) saturate(180%) brightness(1.04)',
          WebkitBackdropFilter: 'blur(48px) saturate(180%) brightness(1.04)',
          borderRadius: 28,
          padding: 5,
          border: '1px solid rgba(255,255,255,0.38)',
          boxShadow: [
            '0 16px 40px rgba(0,0,0,0.28)',
            '0 4px 12px rgba(0,0,0,0.14)',
            'inset 0 1.5px 0 rgba(255,255,255,0.72)',
            'inset 0 -1px 0 rgba(255,255,255,0.10)',
          ].join(', '),
          gap: 4,
          zIndex: 100,
        }}
      >
        {[...BOTTOM_NAV_TABS, ...(showOrganizerOnlyTabs ? ORGANIZER_NAV_TABS : [])].map((tabId) => {
          const active = tabId === selectedTab;
          const count = countFor(tabId);
          const Icon = ICON_MAP[tabId];
          return (
            <Link
              key={tabId}
              href={`/events/${eventId}?tab=${tabId}`}
              role="tab"
              aria-selected={active}
              aria-current={active ? 'page' : undefined}
              aria-label={labelForTab(tabId, ui)}
              style={{
                flex: active ? 1.4 : 1,
                background: active ? 'rgba(255,252,248,0.52)' : 'transparent',
                borderRadius: 22,
                padding: '9px 6px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: active ? [
                  '0 2px 10px rgba(0,0,0,0.18)',
                  'inset 0 1.5px 0 rgba(255,255,255,0.95)',
                  'inset 0 -0.5px 0 rgba(0,0,0,0.06)',
                ].join(', ') : 'none',
                transition: 'flex 200ms ease',
                textDecoration: 'none',
                outline: 'none',
              }}
            >
              {Icon && (
                <Icon
                  size={18}
                  color={active ? GOLD_DK : INK_SUB}
                  strokeWidth={active ? 2.2 : 1.7}
                />
              )}
              {active && (
                <span style={{
                  fontFamily: FS_NAV,
                  fontStyle: 'italic',
                  fontWeight: 400,
                  fontSize: 14.7,
                  letterSpacing: '-0.005em',
                  color: INK,
                  whiteSpace: 'nowrap',
                }}>
                  {labelForTab(tabId, ui)}
                </span>
              )}
              {!active && count !== null && (
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: 9.5,
                  color: NAV_MUTED,
                  marginLeft: -2,
                }}>
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export function EventAdminTabs(props: EventAdminTabsProps) {
  return (
    <Suspense fallback={<div style={{ height: 120 }} />}>
      <TabsInner {...props} />
    </Suspense>
  );
}
