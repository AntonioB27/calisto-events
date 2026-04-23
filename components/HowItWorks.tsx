import type { LandingCopy } from "@/lib/i18n";

type HowItWorksProps = { copy: LandingCopy };

function QrStepVisual({ copy }: HowItWorksProps) {
  return (
    <div style={{ display: "flex", gap: 14, height: "100%", alignItems: "center" }}>
      <div
        style={{
          width: 90,
          height: 90,
          background: "var(--cream)",
          borderRadius: 8,
          padding: 7,
          flexShrink: 0,
        }}
      >
        <svg viewBox="0 0 29 29" width="100%" height="100%" shapeRendering="crispEdges">
          <rect width="29" height="29" fill="#F4EAD9" />
          <g fill="#0C0A0F">
            <rect x="0" y="0" width="7" height="7" /><rect x="1" y="1" width="5" height="5" fill="#F4EAD9" /><rect x="2" y="2" width="3" height="3" />
            <rect x="22" y="0" width="7" height="7" /><rect x="23" y="1" width="5" height="5" fill="#F4EAD9" /><rect x="24" y="2" width="3" height="3" />
            <rect x="0" y="22" width="7" height="7" /><rect x="1" y="23" width="5" height="5" fill="#F4EAD9" /><rect x="2" y="24" width="3" height="3" />
            <rect x="9" y="1" width="1" height="1" /><rect x="11" y="2" width="1" height="1" /><rect x="13" y="1" width="2" height="2" /><rect x="17" y="2" width="1" height="1" /><rect x="19" y="1" width="1" height="2" />
            <rect x="8" y="8" width="2" height="1" /><rect x="11" y="9" width="1" height="2" /><rect x="14" y="8" width="1" height="2" /><rect x="17" y="9" width="2" height="1" />
            <rect x="9" y="11" width="1" height="2" /><rect x="12" y="12" width="2" height="1" /><rect x="16" y="11" width="1" height="2" /><rect x="19" y="12" width="2" height="1" />
            <rect x="8" y="14" width="1" height="1" /><rect x="10" y="15" width="2" height="1" /><rect x="14" y="14" width="2" height="2" /><rect x="18" y="14" width="1" height="2" />
            <rect x="9" y="17" width="1" height="2" /><rect x="12" y="17" width="2" height="1" /><rect x="15" y="18" width="1" height="1" /><rect x="17" y="17" width="1" height="2" />
            <rect x="8" y="20" width="1" height="2" /><rect x="11" y="21" width="2" height="1" /><rect x="14" y="20" width="1" height="2" /><rect x="17" y="21" width="2" height="1" />
          </g>
        </svg>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", color: "var(--cream-3, #B5AB99)" }}>
          calisto.co<span style={{ color: "var(--cream-4, #6E6758)" }}>/your-wedding</span>
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--plum-2, #A584A6)", letterSpacing: "0.08em" }}>
          ● {copy.howVisualLive}
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--cream-4, #6E6758)", letterSpacing: "0.08em" }}>
          {copy.howVisualGuests}
        </div>
      </div>
    </div>
  );
}

function UploadStepVisual({ copy }: HowItWorksProps) {
  const bars = [
    { thumb: "#5c3d1f", name: "IMG_4021.heic", pct: 100, label: copy.howUploadDone },
    { thumb: "#4a3347", name: "IMG_4022.heic", pct: 72,  label: "72%" },
    { thumb: "#5a3436", name: "IMG_4023.heic", pct: 34,  label: "34%" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, height: "100%", justifyContent: "flex-end" }}>
      {bars.map((b) => (
        <div
          key={b.name}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: "9px 11px",
            background: "var(--ink)",
            borderRadius: 9,
            border: "1px solid var(--hair)",
            fontSize: 11,
            color: "var(--cream-2, #E8DCC6)",
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 5,
              background: `linear-gradient(135deg, ${b.thumb}, #0e0b12)`,
              flexShrink: 0,
            }}
          />
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {b.name}
          </span>
          <div
            style={{
              flex: 1,
              height: 3,
              borderRadius: 999,
              background: "var(--ink-3)",
              position: "relative",
              overflow: "hidden",
              minWidth: 40,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                width: `${b.pct}%`,
                background: "var(--plum-2, #A584A6)",
                boxShadow: "0 0 8px rgba(165,132,166,0.4)",
                borderRadius: 999,
              }}
            />
          </div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--cream-4, #6E6758)", minWidth: 28, textAlign: "right" }}>
            {b.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function OrgStepVisual({ copy }: HowItWorksProps) {
  const plus12 = copy.howModerationNewTemplate.replace("{count}", "12");
  const plus8 = copy.howModerationNewTemplate.replace("{count}", "8");
  const rows = [
    { name: "Ana K.",   color: "#E6A760", tag: plus12, muted: false },
    { name: "Toni M.",  color: "#A584A6", tag: plus8,  muted: false },
    { name: "Lena P.",  color: "#E6A760", tag: copy.howModerationApproved, muted: true },
    { name: "Marko D.", color: "#A584A6", tag: copy.howModerationApproved, muted: true },
  ];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 7 }}>
      {rows.map((r) => (
        <div
          key={r.name}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "9px 11px",
            borderRadius: 9,
            background: "var(--ink)",
            border: "1px solid var(--hair)",
            fontSize: 12,
            color: "var(--cream-2, #E8DCC6)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${r.color}, #3a2020)`,
                flexShrink: 0,
              }}
            />
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 12 }}>{r.name}</span>
          </div>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: r.muted ? "var(--cream-4, #6E6758)" : "var(--plum-2, #A584A6)",
            }}
          >
            {r.tag}
          </span>
        </div>
      ))}
    </div>
  );
}

export function HowItWorks({ copy }: HowItWorksProps) {
  return (
    <section
      id="how"
      className="relative"
      style={{ borderTop: "1px solid var(--hair)", padding: "120px 0", zIndex: 2 }}
    >
      <div className="mx-auto" style={{ maxWidth: 1280, padding: "0 32px" }}>
        {/* Header */}
        <div
          className="flex justify-between items-end"
          style={{ gap: 40, marginBottom: 72, paddingBottom: 28, borderBottom: "1px solid var(--hair)" }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10.5px",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "var(--plum-2, #A584A6)",
                marginBottom: 14,
              }}
            >
              {copy.howSectionLabel}
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 400,
                fontSize: "clamp(36px, 5vw, 64px)",
                lineHeight: 1.02,
                letterSpacing: "-0.02em",
                color: "var(--cream)",
                margin: 0,
              }}
            >
              {copy.howTitle}
            </h2>
            <p style={{ marginTop: 14, fontFamily: "var(--font-sans)", fontSize: 16, color: "var(--cream-3, #B5AB99)", maxWidth: 480 }}>
              {copy.howDescription}
            </p>
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--cream-4, #6E6758)",
              letterSpacing: "0.1em",
              paddingBottom: 8,
              whiteSpace: "nowrap",
            }}
          >
            {copy.howSetupHint}
          </div>
        </div>

        {/* Steps grid */}
        <div
          className="grid"
          style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
        >
          {copy.howItems.map((item, idx) => {
            const visuals = [
              <QrStepVisual key="qr" copy={copy} />,
              <UploadStepVisual key="up" copy={copy} />,
              <OrgStepVisual key="org" copy={copy} />,
            ] as const;
            const visual = visuals[idx] ?? visuals[0];
            return (
              <div
                key={item.step}
                style={{
                  padding: "0 32px 44px 0",
                  borderLeft: idx > 0 ? "1px solid var(--hair)" : undefined,
                  paddingLeft: idx > 0 ? 32 : 0,
                }}
              >
                {/* Step number */}
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "var(--plum-2, #A584A6)",
                    marginBottom: 28,
                  }}
                >
                  {copy.howStepPrefix} 0{item.step}
                </div>

                {/* Visual card */}
                <div
                  style={{
                    height: 200,
                    borderRadius: 14,
                    background: "var(--glass-bg)",
                    border: "1px solid var(--hair)",
                    padding: 18,
                    marginBottom: 28,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  {visual}
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontStyle: "italic",
                    fontSize: 26,
                    fontWeight: 400,
                    color: "var(--cream)",
                    margin: "0 0 10px",
                    lineHeight: 1.1,
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 13.5,
                    color: "var(--cream-3, #B5AB99)",
                    lineHeight: 1.6,
                    maxWidth: 280,
                    margin: 0,
                  }}
                >
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          #how > div > div:last-child {
            grid-template-columns: 1fr !important;
          }
          #how > div > div:last-child > div {
            border-left: none !important;
            padding-left: 0 !important;
            border-top: 1px solid var(--hair);
            padding-top: 32px;
          }
          #how > div > div:last-child > div:first-child {
            border-top: none;
            padding-top: 0;
          }
        }
      `}</style>
    </section>
  );
}
