import type { LandingCopy } from "@/lib/i18n";

type HeroProps = { copy: LandingCopy };

const PHOTO_TILES = [
  { cls: "ph-amber ph-glow", label: "first dance",  tall: true  },
  { cls: "ph-rose",          label: "bouquet",      tall: false },
  { cls: "ph-plum",          label: "table 4",      tall: false },
  { cls: "ph-gold",          label: "candlelight",  tall: false },
  { cls: "ph-sage",          label: "olive trees",  tall: false },
  { cls: "ph-ink",           label: "late night",   tall: false },
  { cls: "ph-plum ph-glow",  label: "grandma",      tall: false },
  { cls: "ph-rose",          label: "dance floor",  tall: true  },
  { cls: "ph-amber",         label: "toast",        tall: false },
  { cls: "ph-teal",          label: "sea view",     tall: false },
  { cls: "ph-gold ph-glow",  label: "cake",         tall: false },
];

function QrSvg({ size = 56 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 29 29"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      style={{ display: "block", borderRadius: 4 }}
    >
      <rect width="29" height="29" fill="#F4EAD9" />
      <g fill="#0C0A0F">
        <rect x="0" y="0" width="7" height="7" />
        <rect x="1" y="1" width="5" height="5" fill="#F4EAD9" />
        <rect x="2" y="2" width="3" height="3" />
        <rect x="22" y="0" width="7" height="7" />
        <rect x="23" y="1" width="5" height="5" fill="#F4EAD9" />
        <rect x="24" y="2" width="3" height="3" />
        <rect x="0" y="22" width="7" height="7" />
        <rect x="1" y="23" width="5" height="5" fill="#F4EAD9" />
        <rect x="2" y="24" width="3" height="3" />
        <rect x="9" y="1" width="1" height="1" /><rect x="11" y="1" width="1" height="1" /><rect x="13" y="2" width="2" height="1" /><rect x="17" y="1" width="1" height="2" /><rect x="19" y="2" width="1" height="1" />
        <rect x="9" y="4" width="2" height="1" /><rect x="12" y="4" width="1" height="2" /><rect x="15" y="4" width="1" height="1" /><rect x="18" y="4" width="2" height="1" />
        <rect x="8" y="8" width="1" height="1" /><rect x="10" y="8" width="2" height="1" /><rect x="14" y="8" width="1" height="2" /><rect x="17" y="8" width="1" height="1" /><rect x="20" y="8" width="1" height="1" /><rect x="22" y="9" width="2" height="1" />
        <rect x="8" y="11" width="1" height="2" /><rect x="11" y="11" width="2" height="1" /><rect x="14" y="11" width="1" height="1" /><rect x="16" y="12" width="2" height="1" /><rect x="19" y="11" width="1" height="2" /><rect x="22" y="12" width="1" height="1" />
        <rect x="9" y="14" width="1" height="1" /><rect x="11" y="15" width="2" height="1" /><rect x="14" y="14" width="1" height="2" /><rect x="17" y="14" width="2" height="1" /><rect x="20" y="15" width="1" height="1" /><rect x="22" y="14" width="1" height="2" />
        <rect x="8" y="17" width="2" height="1" /><rect x="11" y="17" width="1" height="2" /><rect x="13" y="18" width="1" height="1" /><rect x="15" y="17" width="2" height="1" /><rect x="19" y="17" width="1" height="1" /><rect x="21" y="18" width="2" height="1" />
        <rect x="8" y="21" width="1" height="1" /><rect x="10" y="21" width="1" height="1" /><rect x="12" y="20" width="2" height="2" /><rect x="15" y="21" width="1" height="1" /><rect x="17" y="20" width="1" height="2" /><rect x="19" y="21" width="2" height="1" />
        <rect x="9" y="24" width="2" height="1" /><rect x="13" y="24" width="1" height="2" /><rect x="15" y="25" width="2" height="1" /><rect x="19" y="24" width="1" height="1" />
        <rect x="10" y="27" width="1" height="1" /><rect x="12" y="27" width="2" height="1" /><rect x="16" y="27" width="1" height="1" /><rect x="18" y="27" width="2" height="1" />
      </g>
    </svg>
  );
}

export function Hero({ copy }: HeroProps) {
  return (
    <section
      id="top"
      className="relative overflow-hidden"
      style={{ padding: "72px 0 140px", zIndex: 2 }}
    >
      <div className="mx-auto" style={{ maxWidth: 1280, padding: "0 32px" }}>
        <div
          className="grid items-center"
          style={{ gridTemplateColumns: "1.05fr 1fr", gap: 60 }}
        >
          {/* ── Left: copy ── */}
          <div style={{ position: "relative", zIndex: 3 }}>
            {/* Eyebrow */}
            <div
              className="inline-flex items-center gap-2.5"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10.5px",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "var(--cream-3, #B5AB99)",
                padding: "7px 14px",
                border: "1px solid var(--hair-2)",
                borderRadius: 999,
                background: "var(--glass-bg)",
                marginBottom: 32,
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--plum-2, #A584A6)",
                  boxShadow: "0 0 10px rgba(165,132,166,0.5)",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              {copy.heroBadge}
            </div>

            {/* Headline */}
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 400,
                fontSize: "clamp(52px, 8.5vw, 120px)",
                lineHeight: 0.97,
                letterSpacing: "-0.025em",
                color: "var(--cream)",
                margin: 0,
              }}
            >
              {copy.heroTitle}
            </h1>

            {/* Sub */}
            <p
              style={{
                marginTop: 28,
                fontFamily: "var(--font-sans)",
                fontSize: 17,
                lineHeight: 1.55,
                color: "var(--cream-3, #B5AB99)",
                maxWidth: 440,
              }}
            >
              {copy.heroDescription}
            </p>

            {/* CTAs */}
            <div className="flex items-center flex-wrap" style={{ marginTop: 40, gap: 14 }}>
              <a
                href="#waitlist"
                className="inline-flex items-center gap-2.5"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 13,
                  fontWeight: 500,
                  padding: "11px 22px",
                  borderRadius: 999,
                  background: "var(--plum)",
                  color: "var(--cream)",
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.08) inset, 0 10px 40px -10px rgba(139,106,140,0.45)",
                  transition: "all 250ms ease",
                  textDecoration: "none",
                  letterSpacing: "0.01em",
                }}
              >
                {copy.heroPrimaryCta}
                <span aria-hidden>→</span>
              </a>
              <a
                href="#plans"
                className="inline-flex items-center"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 13,
                  fontWeight: 500,
                  padding: "11px 22px",
                  borderRadius: 999,
                  background: "transparent",
                  color: "var(--cream)",
                  border: "1px solid var(--hair-strong)",
                  transition: "all 250ms ease",
                  textDecoration: "none",
                  letterSpacing: "0.01em",
                }}
              >
                {copy.heroSecondaryCta}
              </a>
            </div>

            {/* Signal lines */}
            <div className="flex flex-col" style={{ marginTop: 52, gap: 16 }}>
              {copy.heroSignals.map((signal, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.2}
                    strokeLinecap="round"
                    style={{ color: "var(--plum-2, #A584A6)", flexShrink: 0, marginTop: 2 }}
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "12.5px",
                      color: "var(--cream-3, #B5AB99)",
                      lineHeight: 1.5,
                      letterSpacing: "0.01em",
                    }}
                  >
                    {signal}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: phone mockup ── */}
          <div
            className="relative flex justify-center items-center"
            style={{ minHeight: 680, zIndex: 2 }}
          >
            {/* Warm radial glow behind phone */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: -40,
                background: "radial-gradient(circle at center, rgba(165,132,166,0.35), transparent 55%)",
                filter: "blur(50px)",
                opacity: 0.75,
                zIndex: 0,
              }}
            />

            {/* Phone bezel */}
            <div
              className="phone-float"
              style={{
                position: "relative",
                zIndex: 1,
                width: 300,
                height: 614,
                borderRadius: 46,
                background: "#050308",
                boxShadow:
                  "0 0 0 1.5px #1e1822, 0 0 0 10px #0a070e, 0 0 0 11px #241b2c, 0 50px 120px -20px rgba(0,0,0,0.8), 0 30px 60px -15px rgba(165,132,166,0.28)",
                padding: 10,
              }}
            >
              {/* Notch */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  top: 12,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 100,
                  height: 26,
                  background: "#050308",
                  borderRadius: 999,
                  zIndex: 5,
                }}
              />

              {/* Screen */}
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 37,
                  overflow: "hidden",
                  background: "#120E17",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Status bar */}
                <div
                  style={{
                    padding: "18px 20px 6px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontFamily: "var(--font-sans)",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--cream)",
                    flexShrink: 0,
                  }}
                >
                  <span>9:41</span>
                  <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                    <svg width="14" height="10" viewBox="0 0 18 12" fill="currentColor" style={{ color: "var(--cream)" }}>
                      <rect x="0" y="3" width="3" height="6" rx="1" />
                      <rect x="5" y="1" width="3" height="8" rx="1" />
                      <rect x="10" y="0" width="3" height="9" rx="1" opacity="0.5" />
                      <rect x="15" y="0" width="3" height="9" rx="1" opacity="0.3" />
                    </svg>
                  </div>
                </div>

                {/* Album header */}
                <div
                  style={{
                    padding: "22px 20px 12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexShrink: 0,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontStyle: "italic",
                        fontSize: 20,
                        fontWeight: 400,
                        color: "var(--cream)",
                        lineHeight: 1.1,
                      }}
                    >
                      Maya &amp; Luka
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 9,
                        color: "var(--cream-3, #B5AB99)",
                        marginTop: 3,
                        letterSpacing: "0.05em",
                      }}
                    >
                      12.06.26 · DUBROVNIK
                    </div>
                  </div>
                  {/* Avatar stack */}
                  <div style={{ display: "flex" }}>
                    {["#E6A760", "#C08B8E", "#8B6A8C"].map((c, i) => (
                      <div
                        key={i}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          border: "1.5px solid #120E17",
                          marginLeft: i === 0 ? 0 : -6,
                          background: c,
                        }}
                      />
                    ))}
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        border: "1.5px solid #120E17",
                        marginLeft: -6,
                        background: "var(--cream)",
                        color: "var(--ink)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 8,
                        fontWeight: 600,
                      }}
                    >
                      +84
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div
                  style={{
                    padding: "10px 20px",
                    display: "flex",
                    gap: 18,
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    borderBottom: "1px solid var(--hair)",
                    flexShrink: 0,
                  }}
                >
                  {["All · 247", "Mine · 18", "Starred"].map((tab, i) => (
                    <span
                      key={tab}
                      style={{
                        paddingBottom: 8,
                        position: "relative",
                        color: i === 0 ? "var(--cream)" : "var(--cream-4, #6E6758)",
                      }}
                    >
                      {tab}
                      {i === 0 && (
                        <span
                          style={{
                            position: "absolute",
                            bottom: -1,
                            left: 0,
                            right: 0,
                            height: 1.5,
                            background: "var(--plum-2, #A584A6)",
                            boxShadow: "0 0 8px rgba(165,132,166,0.5)",
                          }}
                        />
                      )}
                    </span>
                  ))}
                </div>

                {/* Photo grid — matches Screen 1 layout */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 2,
                    flex: 1,
                    overflow: "hidden",
                  }}
                >
                  {PHOTO_TILES.map((tile, i) => (
                    <div
                      key={i}
                      className={`ph ${tile.cls}`}
                      style={{
                        gridRow: tile.tall ? "span 2" : undefined,
                        aspectRatio: tile.tall ? "1/2" : "1",
                      }}
                    >
                      <span className="ph-label">{tile.label}</span>
                    </div>
                  ))}
                </div>

                {/* Upload FAB */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    bottom: 24,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "var(--plum)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 10px 30px -5px rgba(139,106,140,0.45), 0 0 0 6px rgba(139,106,140,0.12)",
                    color: "var(--cream)",
                    zIndex: 4,
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </div>
              </div>

              {/* Screen glare */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 46,
                  background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 40%, transparent 60%)",
                  pointerEvents: "none",
                }}
              />
            </div>

            {/* Floating spec card — top left */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                top: 60,
                left: -20,
                background: "rgba(20,16,25,0.80)",
                backdropFilter: "blur(20px)",
                border: "1px solid var(--hair-2)",
                borderRadius: 14,
                padding: "12px 14px",
                color: "var(--cream-2, #E8DCC6)",
                fontSize: 12,
                zIndex: 4,
                boxShadow: "0 20px 40px -10px rgba(0,0,0,0.6)",
                maxWidth: 180,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9.5px",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--cream-4, #6E6758)",
                  marginBottom: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span
                  className="live-dot"
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "var(--plum-2, #A584A6)",
                    boxShadow: "0 0 8px rgba(165,132,166,0.6)",
                    display: "inline-block",
                  }}
                />
                {copy.heroMockLiveUploading}
              </div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--cream-2, #E8DCC6)" }}>
                {copy.heroMockGuestsContributing}<br />
                <strong style={{ color: "var(--cream)", fontWeight: 500 }}>{copy.heroMockMediaSummary}</strong>
              </div>
            </div>

            {/* Floating spec card — bottom right */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                bottom: 80,
                right: -30,
                background: "rgba(20,16,25,0.80)",
                backdropFilter: "blur(20px)",
                border: "1px solid var(--hair-2)",
                borderRadius: 14,
                padding: "12px 14px",
                color: "var(--cream-2, #E8DCC6)",
                fontSize: 12,
                zIndex: 4,
                boxShadow: "0 20px 40px -10px rgba(0,0,0,0.6)",
                maxWidth: 180,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9.5px",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--cream-4, #6E6758)",
                  marginBottom: 6,
                }}
              >
                {copy.heroMockJoinAlbum}
              </div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, marginBottom: 8 }}>
                {copy.heroMockScanToUpload}{" "}
                <strong style={{ color: "var(--cream)", fontWeight: 500 }}>{copy.heroMockNoAppNoAccount}</strong>
              </div>
              <QrSvg size={52} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: stack copy above phone */}
      <style>{`
        @media (max-width: 960px) {
          #top > div > div { grid-template-columns: 1fr !important; }
          #top > div > div > div:last-child { min-height: 560px; }
        }
      `}</style>
    </section>
  );
}
