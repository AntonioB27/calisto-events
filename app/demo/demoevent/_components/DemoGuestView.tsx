"use client";

import React from "react";
import { DEMO_PHOTOS } from "../_data/demo-event";
import { DemoMediaGrid } from "./DemoMediaGrid";
import { DemoEventHero } from "./DemoEventHero";
import { useDemoToast } from "./DemoToastProvider";

const TEXT_S = 'var(--app-text-sub)';
const MUTED  = 'var(--app-muted)';
const GOLD   = '#C5922A';
const BORDER = 'var(--app-border)';
const FB = "'DM Sans', sans-serif";
const FS = "'DM Serif Display', serif";

export function DemoGuestView() {
  const { triggerDemoToast } = useDemoToast();

  return (
    <main className="join-shell min-h-screen px-4 pb-16 pt-10 sm:px-6">
      <div className="mx-auto max-w-3xl">

        {/* Event hero banner */}
        <DemoEventHero />

        {/* Date + tagline row */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginTop: 14, marginBottom: 24 }}>
          <div style={{ width: 52, flexShrink: 0, textAlign: "center", fontFamily: FB, borderRight: `1px dashed ${BORDER}`, paddingRight: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: MUTED }}>Jun</div>
            <div style={{ fontFamily: FS, fontStyle: "italic", fontWeight: 700, fontSize: 36, lineHeight: 0.9, color: GOLD, letterSpacing: "-0.03em", marginTop: 1 }}>14</div>
            <div style={{ fontFamily: FS, fontStyle: "italic", fontSize: 10.5, color: MUTED, marginTop: 1 }}>2025</div>
          </div>
          <div style={{ flex: 1, paddingTop: 4 }}>
            <p style={{ margin: 0, fontFamily: FS, fontStyle: "italic", fontSize: 14, color: TEXT_S, lineHeight: 1.5 }}>
              Share your favourite memories from the celebration.
            </p>
          </div>
        </div>

        {/* Upload zone — disabled, triggers toast */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ position: "relative" }}>
            <div aria-hidden style={{ position: "absolute", top: -8, left: "33%", width: 64, height: 14, background: "rgba(212,168,67,0.48)", border: "0.5px solid rgba(212,168,67,0.6)", transform: "rotate(-3deg)", boxShadow: "0 2px 6px rgba(0,0,0,0.22)", zIndex: 2, borderRadius: 2, pointerEvents: "none" }} />
            <button
              type="button"
              onClick={triggerDemoToast}
              style={{ width: "100%", background: "rgba(244,240,234,0.55)", borderRadius: 2, boxShadow: "0 8px 28px rgba(0,0,0,0.42), 0 2px 6px rgba(0,0,0,0.2)", transform: "rotate(-0.5deg)", padding: "14px 14px 18px", opacity: 0.7, cursor: "pointer", border: "none", textAlign: "left" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 56, height: 56, borderRadius: 4, background: "rgba(0,0,0,0.07)", border: "1.5px dashed rgba(0,0,0,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M12 5v14M5 12h14" stroke="rgba(60,40,20,0.5)" strokeWidth="2.4" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <p style={{ margin: 0, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 16, fontWeight: 700, color: "#2a1d0f", lineHeight: 1.2 }}>Add a memory</p>
                  <p style={{ margin: "3px 0 0", fontSize: 11, color: "rgba(60,40,20,0.55)" }}>Upload photos or videos</p>
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* Gallery */}
        <section>
          <h2 style={{ marginBottom: 16, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--app-muted)" }}>
            Gallery · {DEMO_PHOTOS.length} memories
          </h2>
          <DemoMediaGrid canManage={false} />
        </section>
      </div>
    </main>
  );
}
