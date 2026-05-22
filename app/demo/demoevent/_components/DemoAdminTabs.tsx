"use client";

import Link from "next/link";
import { Camera, Share2, Users } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { DEMO_EVENT, DEMO_GUESTS, DEMO_PHOTOS } from "../_data/demo-event";
import type { DemoTabId } from "../demo-role";

// Palette matches EventAdminTabs exactly
const MUTED   = 'var(--app-muted)';
const GOLD    = '#C5922A';
const PURPLE  = '#5B2D8E';
const DIVIDER = 'var(--app-border)';
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

const TOC_TABS: { id: DemoTabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "guests",   label: "Guests"   },
  { id: "gallery",  label: "Gallery"  },
];

function parseDateFull(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return null;
  return {
    mon: new Date(y, m - 1, d).toLocaleDateString("en", { month: "short" }),
    day: d,
    year: y,
  };
}

function DemoAdminTabsInner({ selectedTab }: { selectedTab: DemoTabId }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const update = () => setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  const parsedDate = parseDateFull(DEMO_EVENT.date);
  const guestCount = DEMO_GUESTS.length;
  const mediaCount = DEMO_PHOTOS.length;

  function tabHref(tab: DemoTabId) {
    return `/demo/demoevent?tab=${tab}&role=organizer`;
  }

  return (
    <div className="welcome-reveal">
      {/* Top bar: back pill + share chip */}
      <div style={{ padding: "12px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
          <Link
            href="/demo"
            style={{
              background: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.55)",
              border: `1px solid ${DIVIDER}`,
              color: PURPLE,
              padding: "7px 12px",
              borderRadius: 9,
              fontFamily: FB,
              fontSize: 12,
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              textDecoration: "none",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            ← Demo
          </Link>
          <Link
            href={tabHref("share")}
            style={{
              width: 32, height: 32, borderRadius: 10,
              background: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.55)",
              border: `1px solid ${DIVIDER}`,
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: MUTED,
              textDecoration: "none",
            }}
            title="Share"
          >
            <Share2 size={15} />
          </Link>
        </div>

        {/* Glass banner */}
        <div style={{ ...(isDark ? GLASS_DARK : GLASS_LIGHT), borderRadius: 14, overflow: "hidden", position: "relative", height: 128 }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(197,146,42,0.22),rgba(91,45,142,0.14))" }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(45deg,rgba(255,255,255,0.12) 0 2px,transparent 2px 12px)" }} />
          <div style={{ position: "absolute", right: -8, bottom: -14, fontSize: 120, lineHeight: 1, opacity: 0.9, transform: "rotate(-8deg)", filter: "drop-shadow(0 4px 12px rgba(40,25,15,0.18))", pointerEvents: "none" }}>
            {DEMO_EVENT.emoji}
          </div>
          <div style={{ position: "absolute", bottom: 10, left: 10, right: 48, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", borderRadius: 100, padding: "5px 14px", border: "1px solid rgba(255,255,255,0.38)", overflow: "hidden" }}>
            <span style={{ fontFamily: FS, fontStyle: "italic", fontWeight: 700, fontSize: 14, color: "rgba(255,255,255,0.95)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textShadow: "0 1px 4px rgba(40,25,15,0.5)", display: "block" }}>
              {DEMO_EVENT.name}
            </span>
          </div>
        </div>

        {/* Date + stats row */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 14, marginBottom: 4 }}>
          {parsedDate && (
            <div style={{ width: 52, flexShrink: 0, textAlign: "center", fontFamily: FB, borderRight: `1px dashed ${DIVIDER}`, paddingRight: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: MUTED }}>{parsedDate.mon}</div>
              <div style={{ fontFamily: FS, fontStyle: "italic", fontWeight: 700, fontSize: 36, lineHeight: 0.9, color: GOLD, letterSpacing: "-0.03em", marginTop: 1 }}>{parsedDate.day}</div>
              <div style={{ fontFamily: FS, fontStyle: "italic", fontSize: 10.5, color: MUTED, marginTop: 1 }}>{parsedDate.year}</div>
            </div>
          )}
          <div style={{ flex: 1, display: "flex", gap: 8 }}>
            <div style={{ flex: 1, background: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.55)", border: `1px solid ${DIVIDER}`, borderRadius: 10, padding: "8px 10px", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
                <Camera size={11} color={MUTED} />
                <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: MUTED, fontFamily: FB }}>memories</span>
              </div>
              <div style={{ fontFamily: FS, fontStyle: "italic", fontWeight: 700, fontSize: 22, lineHeight: 1, color: GOLD, letterSpacing: "-0.02em" }}>{mediaCount}</div>
            </div>
            <div style={{ flex: 1, background: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.55)", border: `1px solid ${DIVIDER}`, borderRadius: 10, padding: "8px 10px", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
                <Users size={11} color={MUTED} />
                <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: MUTED, fontFamily: FB }}>guests</span>
              </div>
              <div style={{ fontFamily: FS, fontStyle: "italic", fontWeight: 700, fontSize: 22, lineHeight: 1, color: PURPLE, letterSpacing: "-0.02em" }}>{guestCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Editorial TOC nav */}
      <nav className="event-toc" role="tablist" aria-label="Demo event tabs">
        {TOC_TABS.map(({ id, label }) => {
          const on = id === selectedTab;
          const count = id === "guests" ? guestCount : id === "gallery" ? mediaCount : null;
          return (
            <Link
              key={id}
              href={tabHref(id)}
              role="tab"
              aria-selected={on}
              aria-current={on ? "page" : undefined}
              className="event-toc__tab"
            >
              {label}
              {count !== null && <span className="event-toc__count">{count}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function DemoAdminTabs({ selectedTab }: { selectedTab: DemoTabId }) {
  return (
    <Suspense fallback={<div style={{ height: 120 }} />}>
      <DemoAdminTabsInner selectedTab={selectedTab} />
    </Suspense>
  );
}
