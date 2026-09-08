import Image from "next/image";
import type { LandingCopy, Locale } from "@/lib/i18n";
import { HeroEventBuilder } from "@/components/HeroEventBuilder";

type HeroProps = { copy: LandingCopy; isLoggedIn: boolean; locale: Locale };

export function Hero({ copy, isLoggedIn, locale }: HeroProps) {
  return (
    <section
      id="top"
      className="relative overflow-hidden"
      style={{ padding: "clamp(28px, 5vw, 64px) 0 clamp(24px, 4vw, 48px)", zIndex: 2 }}
    >
      <div className="mx-auto" style={{ maxWidth: 1200, padding: "0 clamp(16px, 4vw, 32px)" }}>
        <div
          className="grid items-center"
          style={{ gridTemplateColumns: "1.05fr 1fr", gap: 56 }}
        >
          {/* ── Left: copy ── */}
          <div style={{ position: "relative", zIndex: 3 }}>
            <div
              style={{
                fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.28em",
                textTransform: "uppercase", color: "var(--gold)", marginBottom: 18,
              }}
            >
              {copy.heroBadge}
            </div>

            {/* Headline */}
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 400,
                fontSize: "clamp(40px, 6.4vw, 78px)",
                lineHeight: 1.0,
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
                marginTop: 24,
                fontFamily: "var(--font-sans)",
                fontSize: 17,
                lineHeight: 1.6,
                color: "var(--cream-3, #B5AB99)",
                maxWidth: 460,
              }}
            >
              {copy.heroDescription}
            </p>

            {/* CTAs */}
            <div className="flex items-center flex-wrap" style={{ marginTop: 28, gap: 14 }}>
              <a
                href={isLoggedIn ? "/dashboard" : `/${locale}/start`}
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

            {/* Signal pills */}
            <div className="flex flex-wrap" style={{ gap: 10, marginTop: 28 }}>
              {copy.heroSignals.map((signal, i) => (
                <div
                  key={i}
                  className="inline-flex items-center"
                  style={{
                    gap: 8, fontSize: 13, color: "var(--cream-3)", border: "1px solid var(--hair-2)",
                    borderRadius: 999, padding: "7px 14px", fontFamily: "var(--font-sans)",
                  }}
                >
                  <span aria-hidden style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--plum-2)", flexShrink: 0 }} />
                  {signal}
                </div>
              ))}
            </div>

            {/* Mascot quote row */}
            <div
              className="flex items-center"
              style={{ gap: 14, marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--hair)" }}
            >
              <Image
                src="/brand/mascot.png"
                alt={copy.auroraMascotAlt}
                width={64}
                height={64}
                style={{ width: 64, height: 64, objectFit: "contain", flexShrink: 0 }}
              />
              <p
                style={{
                  margin: 0, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 18,
                  lineHeight: 1.35, color: "var(--cream-2)",
                }}
              >
                {copy.heroAuroraCardBlurb}
              </p>
            </div>
          </div>

          {/* ── Right: interactive event builder ── */}
          <div id="create" className="relative" style={{ zIndex: 2 }}>
            <HeroEventBuilder copy={copy} locale={locale} />
          </div>
        </div>
      </div>

      {/* Mobile: stack copy above builder */}
      <style>{`
        @media (max-width: 960px) {
          #top > div { padding-left: 18px !important; padding-right: 18px !important; }
          #top > div > div { grid-template-columns: 1fr !important; }
          #top > div > div > div:first-child { text-align: center; margin-left: auto; margin-right: auto; }
          #top > div > div > div:first-child > p { margin-left: auto !important; margin-right: auto !important; }
          #top > div > div > div:first-child > div { justify-content: center !important; }
        }
      `}</style>
    </section>
  );
}
