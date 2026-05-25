"use client";

import Link from "next/link";
import { Camera, Share2, Users } from "lucide-react";
import { Suspense } from "react";
import { DEMO_GUESTS, DEMO_PHOTOS } from "../_data/demo-event";
import { DemoEventHero } from "./DemoEventHero";
// Palette matches EventAdminTabs exactly
const MUTED   = 'var(--app-muted)';
const GOLD    = '#C5922A';
const PURPLE  = '#5B2D8E';
const DIVIDER = 'var(--app-border)';
const FB = "'DM Sans', sans-serif";
const FS = "'DM Serif Display', serif";

function DemoAdminTabsInner() {
  const isDark = false;

  const guestCount = DEMO_GUESTS.length;
  const mediaCount = DEMO_PHOTOS.length;

  return (
    <div className="welcome-reveal">
      {/* Top bar: share chip */}
      <div style={{ padding: "12px 16px 0" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
          <Link
            href="/demo/demoevent?tab=share&role=organizer"
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

        {/* Event hero banner */}
        <DemoEventHero />

        {/* Stats row */}
        <div style={{ display: "flex", gap: 8, marginTop: 14, marginBottom: 4 }}>
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
  );
}

export function DemoAdminTabs() {
  return (
    <Suspense fallback={<div style={{ height: 120 }} />}>
      <DemoAdminTabsInner />
    </Suspense>
  );
}
