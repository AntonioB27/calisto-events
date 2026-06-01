"use client";

import Link from "next/link";
import { ArrowLeft, Camera, Settings, Share2 } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { DEMO_EVENT, DEMO_GUESTS, DEMO_PHOTOS } from "../_data/demo-event";
import { getBannerTheme } from "@/lib/banner-theme";

const MUTED_T_ = 'var(--app-muted)';
const DIVIDER_ = 'var(--app-border)';
const GOLD_    = '#C5922A';
const PURPLE_  = '#5B2D8E';
const FB_      = "'DM Sans', sans-serif";
const FS_      = "'DM Serif Display', serif";

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

function DemoAdminTabsInner() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    const obs = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  const guestCount = DEMO_GUESTS.length;
  const mediaCount = DEMO_PHOTOS.length;
  const parsedDate = parseDateFull(DEMO_EVENT.date);
  const activeTheme = getBannerTheme('aurora');

  const chipStyle: React.CSSProperties = {
    width: 32, height: 32, borderRadius: 10,
    background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.55)',
    border: `1px solid ${DIVIDER_}`,
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: MUTED_T_, textDecoration: 'none', flexShrink: 0,
  };

  return (
    <div className="welcome-reveal">
      <div style={{ padding: '12px 16px 0' }}>

        {/* Top bar: back + action chips */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
          <Link
            href="/demo"
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
            My events
          </Link>
          <div style={{ display: 'flex', gap: 6 }}>
            <Link href="/demo/demoevent?tab=share&role=organizer" style={chipStyle} title="Share">
              <Share2 size={15} />
            </Link>
            <Link href="/demo/demoevent?tab=settings&role=organizer" style={chipStyle} title="Settings">
              <Settings size={15} />
            </Link>
          </div>
        </div>

        {/* Glass banner */}
        <div style={{ ...(isDark ? GLASS_DARK_ : GLASS_LIGHT_), borderRadius: 14, overflow: 'hidden', position: 'relative', height: 128 }}>
          <div style={{ position: 'absolute', inset: 0, background: activeTheme.gradient }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: activeTheme.pattern, backgroundSize: activeTheme.patternSize }} />
          {/* Big emoji */}
          <div style={{ position: 'absolute', right: -8, bottom: -14, fontSize: 120, lineHeight: 1, opacity: 0.9, transform: 'rotate(-8deg)', filter: 'drop-shadow(0 4px 12px rgba(40,25,15,0.18))', pointerEvents: 'none', fontStyle: 'normal' }}>
            <span className="calisto-emoji-upright">{DEMO_EVENT.emoji}</span>
          </div>
          {/* Name pill */}
          <div style={{ position: 'absolute', bottom: 10, left: 10, right: 48, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderRadius: 100, padding: '5px 14px', border: '1px solid rgba(255,255,255,0.38)', overflow: 'hidden' }}>
            <span style={{ fontFamily: FS_, fontStyle: 'italic', fontWeight: 700, fontSize: 14, color: 'rgba(255,255,255,0.95)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textShadow: '0 1px 4px rgba(40,25,15,0.5)', display: 'block' }}>
              {DEMO_EVENT.name}
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
          {mediaCount > 0 && (
            <div style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'stretch' }}>
              <div style={{ flex: 1, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.55)', border: `1px solid ${DIVIDER_}`, borderRadius: 10, padding: '8px 10px', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                  <Camera size={11} color={MUTED_T_} />
                  <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: MUTED_T_, fontFamily: FB_ }}>memories</span>
                </div>
                <div style={{ fontFamily: FS_, fontStyle: 'italic', fontWeight: 700, fontSize: 22, lineHeight: 1, color: GOLD_, letterSpacing: '-0.02em' }}>{mediaCount}</div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export function DemoAdminTabs() {
  return (
    <Suspense fallback={<div style={{ height: 120 }} />}>
      <DemoAdminTabsInner />
    </Suspense>
  );
}
