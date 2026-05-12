import Link from "next/link";
import {
  MascotSpot,
  WELCOME_HERO_COLUMN_MAX_WIDTH_PX,
  WELCOME_HERO_MASCOT_PX,
} from "@/components/MascotSpot";
import { getLandingCopy } from "@/lib/i18n";
import { getUiLocale } from "@/lib/ui-locale";
import { getWelcomePageCopy } from "@/lib/welcome-page-copy";

import { WelcomeLanguageBar } from "./WelcomeLanguageBar";

export default async function WelcomePage() {
  const locale = await getUiLocale();
  const landing = getLandingCopy(locale);
  const copy = getWelcomePageCopy(locale);

  return (
    <main
      className="app-shell"
      aria-label="Welcome to Calisto"
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        paddingTop: 24,
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: "max(24px, env(safe-area-inset-bottom, 24px))",
        overflowY: "auto",
      }}
    >
      {/* Language bar: flows above card on mobile, absolute top-right on ≥641px */}
      <div className="welcome-lang-bar welcome-reveal">
        <WelcomeLanguageBar locale={locale} languageLabel={landing.languageLabel} />
      </div>

      <div
        className="welcome-card"
        style={{ width: "100%", maxWidth: WELCOME_HERO_COLUMN_MAX_WIDTH_PX, textAlign: "center" }}
      >
        <div
          className="welcome-reveal welcome-mascot-float"
          style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}
        >
          <MascotSpot
            src="/brand/mascot/aurora_present.png"
            size={WELCOME_HERO_MASCOT_PX}
            variant="stack"
            className="welcome-mascot"
          />
        </div>

        <div
          className="welcome-reveal welcome-reveal--d1"
          style={{
            width: 32,
            height: 3,
            background: "var(--app-gold)",
            borderRadius: 2,
            margin: "0 auto 16px",
          }}
        />

        <p
          className="welcome-reveal welcome-reveal--d2"
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--app-muted)",
            marginBottom: 8,
          }}
        >
          {copy.eyebrow}
        </p>

        <h1
          className="welcome-reveal welcome-reveal--d3"
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: "clamp(36px, 13vw, 56px)",
            color: "var(--app-text)",
            lineHeight: 1,
            marginBottom: 12,
          }}
        >
          Calisto.
        </h1>

        <p
          className="welcome-reveal welcome-reveal--d4"
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: 16,
            color: "var(--app-muted)",
            marginBottom: 32,
            lineHeight: 1.6,
          }}
        >
          {copy.tagline}
        </p>

        <div
          className="welcome-reveal welcome-reveal--d5"
          style={{ display: "flex", flexDirection: "column", gap: 10 }}
        >
          {/* Primary: gold gradient, italic display font, sparkle icon */}
          <Link href="/events/new" className="welcome-btn welcome-btn--create">
            <span className="welcome-btn__inner">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 1.5 L9.18 6.82 L14.5 8 L9.18 9.18 L8 14.5 L6.82 9.18 L1.5 8 L6.82 6.82 Z" />
              </svg>
              <span>{copy.createEvent}</span>
            </span>
          </Link>

          {/* Secondary: gradient-border glass, key icon left, chevron right */}
          <Link href="/join" className="welcome-btn welcome-btn--join">
            <span className="welcome-btn__inner">
              <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="6" cy="7" r="3.2" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M8.5 9.5 L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  <path d="M11.5 11.5 L13 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                <span>{copy.joinEvent}</span>
              </span>
              <svg className="welcome-btn-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M6 3 L11 8 L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </Link>
        </div>

        {/* Tertiary: pure text-link action */}
        <div className="welcome-reveal welcome-reveal--d6" style={{ display: "flex", justifyContent: "center" }}>
          <Link
            href={`/auth/login?returnTo=${encodeURIComponent("/dashboard")}`}
            className="welcome-btn welcome-btn--account"
          >
            <span className="welcome-btn__inner">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <circle cx="7" cy="4.5" r="2.4" stroke="currentColor" strokeWidth="1.3" />
                <path d="M1 13.5 C1.5 10 4 8.5 7 8.5 S12.5 10 13 13.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <span>{copy.haveAccount}</span>
              <svg className="welcome-btn-arrow" width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                <path d="M2 6.5 H10.5 M7.5 3.5 L10.5 6.5 L7.5 9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </Link>
        </div>

        <p
          className="welcome-reveal welcome-reveal--d6"
          style={{ marginTop: 24, fontSize: 13, color: "var(--app-muted)" }}
        >
          <Link href="/" style={{ color: "var(--app-gold)", textDecoration: "underline" }}>
            {copy.backHome}
          </Link>
        </p>
      </div>
    </main>
  );
}
