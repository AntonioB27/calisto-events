"use client";

import Link from "next/link";
import { ArrowLeft, Camera, Settings, Share2, Users } from "lucide-react";
import { Suspense, useCallback } from "react";

import { useAppUi } from "@/components/AppUiProvider";

import { type EventAdminTabId } from "./event-admin-tabs";

// These always appear in the editorial TOC strip.
// Share + Settings are glass icon chips in the hero.
// Prints is appended when the viewer has organizer access.
const TOC_TAB_IDS: EventAdminTabId[] = ["overview", "guests", "gallery"];
const ORGANIZER_TOC_TAB_IDS: EventAdminTabId[] = ["prints"];

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

const glass_: React.CSSProperties = {
  background: 'rgba(255,255,255,0.62)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: '1px solid rgba(255,255,255,0.78)',
  boxShadow: '0 10px 30px -8px rgba(40,25,15,0.18), inset 0 1px 0 rgba(255,255,255,0.7)',
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

const GLASS_CHIP: React.CSSProperties = {
  width: 32, height: 32, borderRadius: 10,
  background: 'rgba(255,255,255,0.55)',
  border: `1px solid ${BORDER_}`,
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: MUTED_, textDecoration: 'none', flexShrink: 0,
};

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
    <div className="welcome-reveal">
      {/* ── Event hero ── */}
      <div style={{ padding: '12px 16px 0' }}>

        {/* Top bar: back pill + action chips */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
          <Link href="/dashboard" style={{ background: 'rgba(255,255,255,0.55)', border: `1px solid ${BORDER_}`, color: PURPLE_, padding: '7px 12px', borderRadius: 9, fontFamily: FB_, fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5, textDecoration: 'none', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
            <ArrowLeft size={11} /> {ui.eventNav.myEvents}
          </Link>
          <div style={{ display: 'flex', gap: 6 }}>
            <Link href={`/events/${eventId}?tab=share`} style={GLASS_CHIP} title={ui.eventNav.tabShare}>
              <Share2 size={15} />
            </Link>
            {showOrganizerOnlyTabs && (
              <Link href={`/events/${eventId}?tab=settings`} style={GLASS_CHIP} title={ui.eventNav.tabSettings}>
                <Settings size={15} />
              </Link>
            )}
          </div>
        </div>

        {/* Glass banner */}
        <div style={{ ...glass_, borderRadius: 14, overflow: 'hidden', position: 'relative', height: 128 }}>
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
            <div style={{ width: 52, flexShrink: 0, textAlign: 'center', fontFamily: FB_, borderRight: `1px dashed ${BORDER_}`, paddingRight: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: MUTED_ }}>{parsedDate.mon}</div>
              <div style={{ fontFamily: FS_, fontStyle: 'italic', fontWeight: 700, fontSize: 36, lineHeight: 0.9, color: GOLD_, letterSpacing: '-0.03em', marginTop: 1 }}>{parsedDate.day}</div>
              <div style={{ fontFamily: FS_, fontStyle: 'italic', fontSize: 10.5, color: MUTED_, marginTop: 1 }}>{parsedDate.year}</div>
            </div>
          )}
          {(mediaCount > 0 || guestCount > 0) && (
            <div style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'stretch' }}>
              {mediaCount > 0 && (
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.55)', border: `1px solid ${BORDER_}`, borderRadius: 10, padding: '8px 10px', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                    <Camera size={11} color={MUTED_} />
                    <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: MUTED_, fontFamily: FB_ }}>
                      {memoriesLabel}
                    </span>
                  </div>
                  <div style={{ fontFamily: FS_, fontStyle: 'italic', fontWeight: 700, fontSize: 22, lineHeight: 1, color: GOLD_, letterSpacing: '-0.02em' }}>
                    {mediaCount}
                  </div>
                </div>
              )}
              {guestCount > 0 && (
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.55)', border: `1px solid ${BORDER_}`, borderRadius: 10, padding: '8px 10px', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                    <Users size={11} color={MUTED_} />
                    <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: MUTED_, fontFamily: FB_ }}>
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

      {/* ── Editorial TOC nav — Overview / Guests / Gallery (+ Prints for organizer) ── */}
      <nav
        className="event-toc"
        role="tablist"
        aria-label={ui.eventNav.tabsAria}
        onKeyDown={handleKeyDown}
      >
        {[...TOC_TAB_IDS, ...(showOrganizerOnlyTabs ? ORGANIZER_TOC_TAB_IDS : [])].map((tabId) => {
          const on = tabId === selectedTab;
          const count = countFor(tabId);
          return (
            <Link
              key={tabId}
              href={`/events/${eventId}?tab=${tabId}`}
              role="tab"
              aria-selected={on}
              aria-current={on ? "page" : undefined}
              className="event-toc__tab"
            >
              {labelForTab(tabId, ui)}
              {count !== null && (
                <span className="event-toc__count">{count}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function EventAdminTabs(props: EventAdminTabsProps) {
  return (
    <Suspense fallback={<div style={{ height: 120 }} />}>
      <TabsInner {...props} />
    </Suspense>
  );
}
