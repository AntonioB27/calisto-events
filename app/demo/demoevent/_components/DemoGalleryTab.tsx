"use client";

import { GoldBar } from "@/components/app-ui/GoldBar";
import { DemoMediaGrid } from "./DemoMediaGrid";
import { useDemoToast } from "./DemoToastProvider";

export function DemoGalleryTab() {
  const { triggerDemoToast } = useDemoToast();

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="welcome-reveal">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <GoldBar vertical />
          <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 20, color: "var(--app-text)" }}>
            Gallery
          </span>
        </div>
        <p style={{ fontSize: 13, color: "var(--app-muted)", lineHeight: 1.55 }}>
          All memories shared by guests at Ana & Marco's wedding.
        </p>
      </div>

      {/* Polaroid-style upload affordance — disabled, triggers toast */}
      <div className="welcome-reveal welcome-reveal--d1" style={{ position: "relative" }}>
        <div
          aria-hidden
          style={{ position: "absolute", top: -8, left: "33%", width: 64, height: 14, background: "rgba(212,168,67,0.48)", border: "0.5px solid rgba(212,168,67,0.6)", transform: "rotate(-3deg)", boxShadow: "0 2px 6px rgba(0,0,0,0.22)", zIndex: 2, borderRadius: 2, pointerEvents: "none" }}
        />
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

      <div className="welcome-reveal welcome-reveal--d2">
        <DemoMediaGrid canManage />
      </div>
    </section>
  );
}
