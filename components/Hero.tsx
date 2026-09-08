import Image from "next/image";
import { ScanLine, UserCheck, QrCode, type LucideIcon } from "lucide-react";
import type { LandingCopy, Locale } from "@/lib/i18n";
import { HeroEventBuilder } from "@/components/HeroEventBuilder";

type HeroProps = { copy: LandingCopy; isLoggedIn: boolean; locale: Locale };

const SIGNAL_ICONS: LucideIcon[] = [ScanLine, UserCheck, QrCode];

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

            {/* Trust bar: the three core differentiators */}
            <div className="v2-trust-row flex flex-wrap" style={{ marginTop: 28, gap: 14 }}>
              {copy.heroSignals.map((signal, i) => {
                const Icon = SIGNAL_ICONS[i] ?? ScanLine;
                return (
                  <div
                    key={signal}
                    className={`v2-chip v2-chip-${i} flex items-center`}
                    style={{
                      flex: "1 1 160px",
                      gap: 10,
                      padding: "14px 16px",
                      borderRadius: 18,
                      border: "1px solid var(--hair-2)",
                      background: "var(--glass-bg)",
                      boxShadow: "0 8px 20px rgba(0,0,0,0.16)",
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, width: 30, height: 30, borderRadius: "50%",
                        background: "rgba(245,199,107,0.14)", color: "var(--gold)",
                      }}
                    >
                      <Icon size={15} strokeWidth={2} />
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--cream)", fontFamily: "var(--font-sans)", letterSpacing: "0.005em" }}>
                      {signal}
                    </span>
                  </div>
                );
              })}
            </div>
            <style>{`
              .v2-chip {
                rotate: -3deg;
                animation: v2-float 5s ease-in-out infinite;
                transition: rotate 300ms ease, box-shadow 300ms ease;
              }
              .v2-chip-1 { rotate: 1.5deg; animation-delay: 0.5s; }
              .v2-chip-2 { rotate: -1.8deg; animation-delay: 1s; }
              .v2-chip:hover { rotate: 0deg; box-shadow: 0 14px 32px rgba(0,0,0,0.24); }
              @keyframes v2-float {
                0%, 100% { translate: 0 0; }
                50% { translate: 0 -8px; }
              }
              @media (prefers-reduced-motion: reduce) {
                .v2-chip { animation: none !important; }
              }
            `}</style>

            {/* Aurora introduction */}
            <div
              className="flex items-start"
              style={{ gap: 16, marginTop: 32, paddingTop: 28, borderTop: "1px solid var(--hair)" }}
            >
              <Image
                src="/brand/mascot/aurora_waving.png"
                alt={copy.auroraMascotAlt}
                width={160}
                height={160}
                style={{ width: 64, height: 64, objectFit: "contain", flexShrink: 0 }}
              />
              <blockquote
                style={{
                  margin: 0, flex: 1, minWidth: 0,
                  borderLeft: "1px solid rgba(245,199,107,0.4)",
                  paddingLeft: 18,
                }}
              >
                <p
                  style={{
                    margin: "0 0 6px", fontFamily: "var(--font-mono)", fontSize: 10.5,
                    letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(245,199,107,0.75)",
                  }}
                >
                  {copy.heroIntro}
                </p>
                <p
                  style={{
                    margin: 0, fontFamily: "var(--font-display)", fontStyle: "italic",
                    fontSize: 15, lineHeight: 1.5, color: "var(--cream-2)",
                  }}
                >
                  {copy.heroAuroraCardBlurb}
                </p>
              </blockquote>
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
