"use client";

import { useState } from "react";
import { DEMO_PHOTOS } from "../_data/demo-event";
import { DemoMediaGrid } from "./DemoMediaGrid";
import { useDemoToast } from "./DemoToastProvider";

function uploaderColor(seed: string): string {
  const palette = [
    "linear-gradient(135deg, #8B4FD8, #5B2D8E)",
    "linear-gradient(135deg, #D4A843, #A67620)",
    "linear-gradient(135deg, #E08585, #B04A4A)",
    "linear-gradient(135deg, #5BA8D9, #2A6FB0)",
    "linear-gradient(135deg, #6BBE8E, #2E8050)",
  ];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % palette.length;
  return palette[h];
}

const uniqueUploaders = Array.from(new Set(DEMO_PHOTOS.map((p) => p.uploadedBy)));
const totalGuests = uniqueUploaders.length;
const firstFiveUploaders = uniqueUploaders.slice(0, 5);

type FilterId = "all" | "photos" | "videos";

export function DemoGalleryTab() {
  const { triggerDemoToast } = useDemoToast();
  const [mediaFilter, setMediaFilter] = useState<FilterId>("all");
  const [columns, setColumns] = useState(3);

  const filtered = mediaFilter === "videos" ? [] : DEMO_PHOTOS;

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ── HEADER ── */}
      <div className="welcome-reveal" style={{ marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(197,146,42,0.75)" }}>
              Gallery
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: 32,
                color: "var(--app-text)",
                lineHeight: 1.05,
                margin: "0 0 12px",
                letterSpacing: "-0.01em",
              }}
            >
              All memories
            </h2>

            {/* Stacked guest avatars + counts */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                {firstFiveUploaders.map((name, i) => (
                  <div
                    key={name}
                    title={name}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: uploaderColor(name),
                      marginLeft: i === 0 ? 0 : -7,
                      border: "1.5px solid var(--app-bg)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 9,
                      fontWeight: 700,
                      color: "#fff",
                      zIndex: 5 - i,
                      position: "relative",
                      flexShrink: 0,
                    }}
                  >
                    {name[0]?.toUpperCase()}
                  </div>
                ))}
                {totalGuests > 5 && (
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.08)",
                      marginLeft: -7,
                      border: "1.5px solid var(--app-bg)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 9,
                      fontWeight: 700,
                      color: "var(--app-muted)",
                      position: "relative",
                    }}
                  >
                    +{totalGuests - 5}
                  </div>
                )}
              </div>
              <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 11, color: "var(--app-muted)" }}>
                {DEMO_PHOTOS.length} memories · {totalGuests} guests
              </span>
            </div>
          </div>

          {/* Aurora camera mascot */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: -10,
                background: "radial-gradient(circle, rgba(197,146,42,0.28), transparent 70%)",
                filter: "blur(10px)",
              }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/mascot/aurora_camera.png"
              alt=""
              aria-hidden
              style={{
                width: 72,
                height: 72,
                objectFit: "contain",
                position: "relative",
                zIndex: 1,
                filter: "drop-shadow(0 6px 18px rgba(197,146,42,0.22))",
              }}
            />
          </div>
        </div>

        {/* Filter tabs + refresh */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 18 }}>
          <div
            role="tablist"
            aria-label="Filter media"
            style={{
              flex: 1,
              display: "flex",
              gap: 4,
              padding: 3,
              background: "var(--app-surface-2)",
              borderRadius: 12,
              border: "1px solid var(--app-border)",
            }}
          >
            {(["all", "photos", "videos"] as FilterId[]).map((id) => {
              const on = mediaFilter === id;
              const label = id === "all" ? "All" : id === "photos" ? "Photos" : "Videos";
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setMediaFilter(id)}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    border: "none",
                    borderRadius: 10,
                    background: on ? "var(--app-surface)" : "transparent",
                    color: on ? "var(--app-text)" : "var(--app-muted)",
                    fontSize: 12,
                    fontWeight: on ? 600 : 500,
                    fontFamily: "inherit",
                    cursor: "pointer",
                    textTransform: "capitalize",
                    transition: "all 0.18s",
                    boxShadow: on ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={triggerDemoToast}
            style={{
              padding: "8px 12px",
              border: "1px solid var(--app-border)",
              borderRadius: 8,
              background: "transparent",
              color: "var(--app-muted)",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Polaroid upload affordance */}
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

      {/* Photo grid */}
      <div className="welcome-reveal welcome-reveal--d2">
        {filtered.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "44px 16px 64px", textAlign: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/mascot/aurora_gallery.png"
              alt=""
              aria-hidden
              style={{ width: 112, height: 112, objectFit: "contain", marginBottom: 18, filter: "drop-shadow(0 8px 22px rgba(197,146,42,0.25))", opacity: 0.9 }}
            />
            <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 20, color: "var(--app-text)", margin: 0 }}>
              No videos yet
            </p>
          </div>
        ) : (
          <DemoMediaGrid canManage columns={columns} photos={filtered} />
        )}
      </div>

      {/* Column slider */}
      <div
        style={{
          marginTop: 8,
          padding: "16px 18px",
          borderRadius: 14,
          background: "var(--app-surface)",
          border: "1px solid var(--app-border)",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--app-muted)" }}>
            Columns
          </span>
          <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 20, color: "var(--app-gold)", lineHeight: 1 }}>
            {columns}
          </span>
        </div>

        <div style={{ position: "relative" }}>
          <style>{`
            .demo-gallery-col-slider {
              -webkit-appearance: none;
              appearance: none;
              width: 100%;
              height: 3px;
              border-radius: 99px;
              background: linear-gradient(
                to right,
                var(--app-gold) 0%,
                var(--app-gold) ${((columns - 1) / 4) * 100}%,
                var(--app-border) ${((columns - 1) / 4) * 100}%,
                var(--app-border) 100%
              );
              outline: none;
              cursor: pointer;
            }
            .demo-gallery-col-slider::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 18px;
              height: 18px;
              border-radius: 50%;
              background: var(--app-gold);
              box-shadow: 0 0 0 3px color-mix(in srgb, var(--app-gold) 22%, transparent), 0 2px 8px rgba(0,0,0,0.35);
              cursor: pointer;
              transition: box-shadow 0.15s;
            }
            .demo-gallery-col-slider::-moz-range-thumb {
              width: 18px;
              height: 18px;
              border-radius: 50%;
              background: var(--app-gold);
              border: none;
              box-shadow: 0 0 0 3px color-mix(in srgb, var(--app-gold) 22%, transparent), 0 2px 8px rgba(0,0,0,0.35);
              cursor: pointer;
            }
          `}</style>
          <input
            type="range"
            className="demo-gallery-col-slider"
            min={1}
            max={5}
            step={1}
            value={columns}
            aria-label="Columns"
            onChange={(e) => setColumns(Number(e.target.value))}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 2 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setColumns(n)}
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}
            >
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${n}, 1fr)`, gap: 1.5, width: 22, height: 16 }}>
                {Array.from({ length: n }).map((_, i) => (
                  <div
                    key={i}
                    style={{ borderRadius: 1.5, background: columns === n ? "var(--app-gold)" : "var(--app-border)", transition: "background 0.15s" }}
                  />
                ))}
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", color: columns === n ? "var(--app-gold)" : "var(--app-muted)", transition: "color 0.15s" }}>
                {n}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
