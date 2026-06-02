"use client";

import Link from "next/link";
import { ArrowLeft, Camera, Home, Images, Palette, Settings, Share2, Users } from "lucide-react";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

import { useAppUi } from "@/components/AppUiProvider";
import { BANNER_THEMES, getBannerTheme, normalizeBannerTheme, type BannerThemeId } from "@/lib/banner-theme";
import { maybeCreateSupabaseBrowserClient } from "@/lib/supabase-browser";

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
  bannerTheme?: string;
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
  bannerTheme,
}: EventAdminTabsProps) {
  const ui = useAppUi();
  const parsedDate = parseDateFull(eventDate);
  const supabase = useMemo(() => maybeCreateSupabaseBrowserClient(), []);

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

  const [activeThemeId, setActiveThemeId] = useState<BannerThemeId>(() => normalizeBannerTheme(bannerTheme));
  useEffect(() => { setActiveThemeId(normalizeBannerTheme(bannerTheme)); }, [bannerTheme]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const HINT_KEY = 'calisto_banner_hint_v1';
  const [hintVisible, setHintVisible] = useState(false);
  useEffect(() => {
    try { setHintVisible(!window.localStorage.getItem(HINT_KEY)); } catch { /* ignore */ }
  }, []);
  function dismissHint() {
    setHintVisible(false);
    try { window.localStorage.setItem(HINT_KEY, '1'); } catch { /* ignore */ }
  }

  const activeTheme = getBannerTheme(activeThemeId);

  async function applyTheme(id: BannerThemeId) {
    setActiveThemeId(id);
    setSheetOpen(false);
    if (!supabase) return;
    await supabase.from('events').update({ banner_theme: id }).eq('id', eventId);
  }

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
          <Link
            href="/dashboard"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '6px 2px',
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${GOLD_}`,
              textDecoration: 'none',
              color: PURPLE_,
              fontFamily: FB_,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={13} strokeWidth={2.2} />
            {ui.eventNav.myEvents}
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
          <div style={{ position: 'absolute', inset: 0, background: activeTheme.gradient, transition: 'background 0.4s ease' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: activeTheme.pattern, backgroundSize: activeTheme.patternSize, transition: 'background-image 0.4s ease' }} />
          {/* Big emoji */}
          <div style={{ position: 'absolute', right: -8, bottom: -14, fontSize: 120, lineHeight: 1, opacity: 0.9, transform: 'rotate(-8deg)', filter: 'drop-shadow(0 4px 12px rgba(40,25,15,0.18))', pointerEvents: 'none', fontStyle: 'normal' }}>
            <span className="calisto-emoji-upright">{eventEmoji}</span>
          </div>
          {/* Name pill */}
          <div style={{ position: 'absolute', bottom: 10, left: 10, right: 86, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderRadius: 100, padding: '5px 14px', border: '1px solid rgba(255,255,255,0.38)', overflow: 'hidden' }}>
            <span style={{ fontFamily: FS_, fontStyle: 'italic', fontWeight: 700, fontSize: 14, color: 'rgba(255,255,255,0.95)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textShadow: '0 1px 4px rgba(40,25,15,0.5)', display: 'block' }}>
              {eventTitle}
            </span>
          </div>
        </div>

        {/* Dismissible customise hint — organizer only, shown once */}
        {showOrganizerOnlyTabs && hintVisible && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, padding: '9px 12px', borderRadius: 12, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.6)', border: `1px solid ${DIVIDER_}`, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
            <Palette size={13} color={MUTED_T_} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, fontFamily: FB_, fontSize: 12, color: MUTED_T_, lineHeight: 1.4 }}>
              {ui.eventNav.bannerHint}
            </span>
            <button type="button" onClick={dismissHint} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: MUTED_T_, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-label="Dismiss">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}

        {/* Date + stats row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 14, marginBottom: 4 }}>
          {parsedDate && (
            <div style={{ width: 52, flexShrink: 0, textAlign: 'center', fontFamily: FB_, borderRight: `1px dashed ${DIVIDER_}`, paddingRight: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: MUTED_T_ }}>{parsedDate.mon}</div>
              <div style={{ fontFamily: FS_, fontStyle: 'italic', fontWeight: 700, fontSize: 36, lineHeight: 0.9, color: GOLD_, letterSpacing: '-0.03em', marginTop: 1 }}>{parsedDate.day}</div>
              <div style={{ fontFamily: FS_, fontStyle: 'italic', fontSize: 10.5, color: MUTED_T_, marginTop: 1 }}>{parsedDate.year}</div>
            </div>
          )}
          {mediaCount > 0 && (
            <div style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'stretch' }}>
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
          const pending = !active && pendingTab === tabId;
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
              onClick={() => setPendingTab(tabId)}
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
                opacity: pending ? 0.45 : 1,
                cursor: pending ? 'wait' : undefined,
                animation: pending ? 'appNavPending 1.4s ease-in-out infinite' : undefined,
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

    {/* ── Banner theme sheet ── */}
    {sheetOpen && (
      <>
        {/* Backdrop */}
        <div
          onClick={() => setSheetOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200 }}
        />
        {/* Sheet */}
        <div
          style={{
            position: 'fixed', left: 0, right: 0, bottom: 0,
            background: isDark ? '#1a1714' : '#f9f6f1',
            borderRadius: '24px 24px 0 0',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.32)',
            zIndex: 201,
            padding: '12px 20px calc(32px + env(safe-area-inset-bottom, 0px))',
          }}
        >
          {/* Drag handle */}
          <div style={{ width: 40, height: 4, borderRadius: 2, background: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)', margin: '0 auto 18px' }} />

          {/* Heading */}
          <p style={{ margin: '0 0 16px', fontFamily: FS_, fontStyle: 'italic', fontWeight: 700, fontSize: 18, color: isDark ? 'rgba(255,255,255,0.9)' : '#221509' }}>
            Banner style
          </p>

          {/* Theme tiles */}
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
            {BANNER_THEMES.map(theme => {
              const isActive = theme.id === activeThemeId;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => void applyTheme(theme.id)}
                  style={{
                    flexShrink: 0,
                    width: 110,
                    padding: 0,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 7,
                    outline: 'none',
                  }}
                >
                  {/* Preview tile */}
                  <div style={{
                    width: 110, height: 62,
                    borderRadius: 10,
                    overflow: 'hidden',
                    position: 'relative',
                    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.65)',
                    backdropFilter: 'blur(10px)',
                    border: isActive
                      ? `2px solid ${GOLD_}`
                      : `1.5px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                    boxShadow: isActive ? `0 0 0 3px rgba(197,146,42,0.22)` : 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}>
                    <div style={{ position: 'absolute', inset: 0, background: theme.gradient }} />
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: theme.pattern, backgroundSize: theme.patternSize }} />
                    {/* Tiny name pill */}
                    <div style={{ position: 'absolute', bottom: 7, left: 7, right: 7, background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(6px)', borderRadius: 20, padding: '2px 8px', border: '1px solid rgba(255,255,255,0.3)' }}>
                      <span style={{ fontFamily: FS_, fontStyle: 'italic', fontWeight: 700, fontSize: 9, color: 'rgba(255,255,255,0.9)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {eventTitle}
                      </span>
                    </div>
                    {/* Active checkmark */}
                    {isActive && (
                      <div style={{ position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: '50%', background: GOLD_, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden>
                          <path d="M3 8l4 4 6-6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {/* Theme name */}
                  <span style={{ fontFamily: FB_, fontSize: 11, fontWeight: isActive ? 600 : 400, color: isActive ? GOLD_ : (isDark ? 'rgba(255,255,255,0.55)' : '#9A8570'), textAlign: 'center', display: 'block' }}>
                    {theme.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </>
    )}
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
