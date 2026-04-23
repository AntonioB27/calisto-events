import Image from "next/image";
import type { LandingCopy } from "@/lib/i18n";

type HeroProps = { copy: LandingCopy };

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
                  background: "linear-gradient(135deg, var(--gold) 0%, var(--amber) 45%, var(--gold-deep) 100%)",
                  color: "#1b1208",
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.28) inset, 0 12px 40px -12px rgba(240,179,75,0.55)",
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
                  boxShadow: "0 0 0 1px rgba(240,179,75,0.16) inset",
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

          {/* ── Right: Aurora welcome panel ── */}
          <div
            className="relative flex justify-center items-center"
            style={{ minHeight: 560, zIndex: 2 }}
          >
            {/* Warm radial glow */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: -60,
                background: "radial-gradient(circle at center, rgba(165,132,166,0.35), transparent 55%)",
                filter: "blur(50px)",
                opacity: 0.75,
                zIndex: 0,
              }}
            />
            <div
              className="phone-float"
              style={{
                position: "relative",
                zIndex: 1,
                width: "min(420px, 92vw)",
                borderRadius: 28,
                border: "1px solid var(--hair-2)",
                background: "linear-gradient(180deg, rgba(20,16,25,0.88) 0%, rgba(12,10,15,0.92) 100%)",
                boxShadow: "0 30px 70px -24px rgba(0,0,0,0.65)",
                padding: "24px 22px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
              }}
            >
              <Image
                src="/brand/mascot.png"
                alt={copy.auroraMascotAlt}
                width={260}
                height={260}
                style={{ width: "min(260px, 70%)", height: "auto", objectFit: "contain" }}
              />
              <p
                style={{
                  margin: 0,
                  textAlign: "center",
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                  fontSize: 24,
                  color: "var(--cream)",
                  lineHeight: 1.2,
                }}
              >
                {copy.heroIntro}
              </p>
              <p
                style={{
                  margin: 0,
                  textAlign: "center",
                  fontFamily: "var(--font-sans)",
                  fontSize: 13,
                  color: "var(--cream-3, #B5AB99)",
                  lineHeight: 1.55,
                  maxWidth: 320,
                }}
              >
                {copy.heroDescription}
              </p>
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
