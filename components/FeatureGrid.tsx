import type { LandingCopy } from "@/lib/i18n";
import Image from "next/image";

type FeatureGridProps = { copy: LandingCopy };

const ACCENTS = [
  { color: "var(--plum-2, #A584A6)",   glow: "rgba(165,132,166,0.35)",  border: "rgba(165,132,166,0.25)" },
  { color: "var(--amber, #E6A760)",     glow: "rgba(230,167,96,0.35)",   border: "rgba(230,167,96,0.25)" },
  { color: "var(--amber-2, #F2C08A)",   glow: "rgba(242,192,138,0.35)",  border: "rgba(242,192,138,0.2)" },
  { color: "var(--plum, #8B6A8C)",      glow: "rgba(139,106,140,0.35)",  border: "rgba(139,106,140,0.25)" },
  { color: "var(--amber, #E6A760)",     glow: "rgba(230,167,96,0.35)",   border: "rgba(230,167,96,0.25)" },
  { color: "var(--plum-2, #A584A6)",    glow: "rgba(165,132,166,0.35)",  border: "rgba(165,132,166,0.25)" },
];

const ICONS = [
  <svg key="key" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><circle cx="7.5" cy="15.5" r="4.5" /><path d="M10.5 12.5L19 4M17 6l2-2 2 2-2 2Z" /></svg>,
  <svg key="qr" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h2v2h-2zM18 14h3M14 18h2M18 18h3v3M6 6h1v1H6zM17 6h1v1h-1zM6 17h1v1H6z" /></svg>,
  <svg key="gallery" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
  <svg key="users" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  <svg key="cam" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><path d="M23 7L16 12l7 5Z" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>,
  <svg key="dl" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>,
];

export function FeatureGrid({ copy }: FeatureGridProps) {
  return (
    <section
      id="features"
      className="relative"
      style={{ borderTop: "1px solid var(--hair)", padding: "120px 0", zIndex: 2 }}
    >
      <div className="mx-auto" style={{ maxWidth: 1280, padding: "0 32px" }}>
        {/* Header */}
        <div
          className="flex justify-between items-end"
          style={{
            gap: 40,
            marginBottom: 72,
            paddingBottom: 28,
            borderBottom: "1px solid var(--hair)",
          }}
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
              {copy.featuresSectionLabel}
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
              {copy.featuresTitle}
            </h2>
            <p
              style={{
                marginTop: 16,
                fontFamily: "var(--font-sans)",
                fontSize: 16,
                lineHeight: 1.6,
                color: "var(--cream-3, #B5AB99)",
                maxWidth: 520,
              }}
            >
              {copy.featuresDescription}
            </p>
          </div>

          {/* Aurora with bubble */}
          <div className="hidden lg:flex flex-col items-center shrink-0" style={{ gap: 12, maxWidth: 200 }}>
            <div style={{ position: "relative", width: "100%", padding: "0 4px" }}>
              <p
                style={{
                  position: "relative",
                  borderRadius: 16,
                  border: "1px solid var(--hair-2)",
                  background: "var(--glass-bg-2)",
                  padding: "10px 14px",
                  textAlign: "center",
                  fontFamily: "var(--font-sans)",
                  fontSize: 13,
                  fontWeight: 500,
                  lineHeight: 1.4,
                  color: "var(--cream)",
                  backdropFilter: "blur(12px)",
                }}
              >
                {copy.featuresAuroraBubble}
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    bottom: -8,
                    left: "50%",
                    transform: "translateX(-50%) rotate(45deg)",
                    width: 14,
                    height: 14,
                    borderBottom: "1px solid var(--hair-2)",
                    borderRight: "1px solid var(--hair-2)",
                    background: "var(--ink-2, #141019)",
                  }}
                />
              </p>
            </div>
            <Image
              src="/brand/aurora-photo.png"
              alt={copy.auroraLabel}
              width={200}
              height={200}
              style={{ width: "100%", height: "auto", objectFit: "contain" }}
            />
          </div>
        </div>

        {/* Cards */}
        <ul
          className="grid"
          style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}
        >
          {copy.features.map((f, i) => {
            const accent = ACCENTS[i % ACCENTS.length]!;
            const Icon = ICONS[i] ?? ICONS[0];
            return (
              <li
                key={f.title}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 18,
                  border: "1px solid var(--hair)",
                  background: "var(--glass-bg)",
                  transition: "all 300ms",
                }}
              >
                {/* Accent top bar */}
                <div
                  aria-hidden
                  style={{ height: 2, width: "100%", background: accent.color, opacity: 0.7 }}
                />

                <div style={{ padding: "20px 22px 22px" }}>
                  {/* Icon */}
                  <div
                    style={{
                      marginBottom: 16,
                      display: "inline-flex",
                      width: 38,
                      height: 38,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 10,
                      background: `${accent.color}18`,
                      border: `1px solid ${accent.border}`,
                      color: accent.color,
                    }}
                  >
                    {Icon}
                  </div>

                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontStyle: "italic",
                      fontSize: 18,
                      fontWeight: 400,
                      color: "var(--cream)",
                      margin: 0,
                      lineHeight: 1.2,
                    }}
                  >
                    {f.title}
                  </h3>
                  <p
                    style={{
                      marginTop: 8,
                      fontFamily: "var(--font-sans)",
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: "var(--cream-3, #B5AB99)",
                    }}
                  >
                    {f.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <style>{`
        @media (max-width: 960px) {
          #features > div > ul { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 640px) {
          #features > div > ul { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
