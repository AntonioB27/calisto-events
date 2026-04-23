import type { LandingCopy } from "@/lib/i18n";
import Image from "next/image";

type AuroraQuoteProps = { copy: LandingCopy };

export function AuroraQuote({ copy }: AuroraQuoteProps) {
  return (
    <section
      className="aurora-quote-section relative overflow-hidden"
      aria-label={copy.auroraQuoteSectionAria}
      style={{ borderTop: "1px solid var(--hair)", zIndex: 2 }}
    >
      {/* Warm spotlight */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: [
            "radial-gradient(ellipse 55% 90% at 82% 60%, rgba(230,167,96,0.10) 0%, transparent 65%)",
            "radial-gradient(ellipse 35% 60% at 88% 55%, rgba(165,132,166,0.08) 0%, transparent 55%)",
          ].join(", "),
        }}
      />

      {/* Top rule */}
      <div className="mx-auto" style={{ maxWidth: 1280, padding: "0 32px" }}>
        <div style={{ height: 1, background: "linear-gradient(to right, transparent, rgba(230,167,96,0.25), transparent)" }} />
      </div>

      {/* Main layout */}
      <div
        className="mx-auto grid"
        style={{
          maxWidth: 1280,
          padding: "0 32px",
          gridTemplateColumns: "1fr 320px",
          alignItems: "flex-end",
          gap: 0,
          paddingTop: 80,
          paddingBottom: 80,
          overflow: "visible",
        }}
      >
        {/* Left: quote */}
        <div className="aurora-quote-copy" style={{ position: "relative", paddingRight: 48 }}>
          {/* Giant open-quote */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: -8,
              top: -48,
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontSize: "clamp(9rem, 22vw, 16rem)",
              lineHeight: 0.8,
              color: "rgba(230,167,96,0.06)",
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            &ldquo;
          </div>

          <blockquote
            style={{
              position: "relative",
              paddingLeft: 24,
              borderLeft: "1px solid rgba(230,167,96,0.4)",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10.5px",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "rgba(230,167,96,0.65)",
                marginBottom: 24,
                margin: "0 0 24px",
              }}
            >
              {copy.auroraQuoteIntro}
            </p>

            <p
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: "clamp(1.6rem, 3.5vw, 2.6rem)",
                lineHeight: 1.12,
                letterSpacing: "-0.022em",
                color: "var(--cream)",
                margin: 0,
              }}
            >
              {copy.auroraQuote}
            </p>

            <footer style={{ marginTop: 28, display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  height: 1,
                  width: 40,
                  background: "linear-gradient(to right, rgba(230,167,96,0.55), rgba(230,167,96,0.1))",
                }}
              />
              <cite style={{ fontStyle: "normal" }}>
                <span
                  style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 14, color: "var(--amber, #E6A760)" }}
                >
                  {copy.auroraLabel}
                </span>
                <span
                  style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--cream-4, #6E6758)", marginLeft: 10, letterSpacing: "0.08em" }}
                >
                  {copy.auroraJobTitle}
                </span>
              </cite>
            </footer>
          </blockquote>
        </div>

        {/* Right: Aurora */}
        <div
          className="aurora-quote-mascot-wrap"
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignSelf: "flex-end",
            overflow: "visible",
            width: "100%",
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: 280,
              height: 280,
              background: "radial-gradient(ellipse at 50% 80%, rgba(230,167,96,0.14) 0%, rgba(165,132,166,0.07) 40%, transparent 70%)",
              filter: "blur(20px)",
            }}
          />
          <Image
            className="aurora-quote-mascot"
            src="/brand/aurora_photo.png"
            alt={copy.auroraMascotAlt}
            width={400}
            height={400}
            style={{
              position: "relative",
              zIndex: 1,
              width: "100%",
              maxWidth: 260,
              height: "auto",
              objectFit: "contain",
            }}
          />
        </div>
      </div>

      {/* Bottom rule */}
      <div className="mx-auto" style={{ maxWidth: 1280, padding: "0 32px" }}>
        <div style={{ height: 1, background: "linear-gradient(to right, transparent, rgba(230,167,96,0.25), transparent)" }} />
      </div>

      <style>{`
        @media (max-width: 960px) {
          .aurora-quote-section {
            overflow: visible;
          }
          section[aria-label="${copy.auroraQuoteSectionAria}"] > div:last-of-type {
            grid-template-columns: 1fr !important;
            padding-top: 56px !important;
            padding-bottom: 56px !important;
            padding-right: 40px !important;
          }
          .aurora-quote-copy {
            padding-right: 0 !important;
          }
          .aurora-quote-mascot-wrap {
            margin-top: 28px;
            justify-content: center !important;
          }
          .aurora-quote-mascot {
            width: min(78vw, 320px) !important;
            max-width: 320px !important;
          }
        }
      `}</style>
    </section>
  );
}
