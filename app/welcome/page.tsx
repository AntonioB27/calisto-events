import Link from "next/link";
import { redirect } from "next/navigation";
import {
  MascotSpot,
  WELCOME_HERO_COLUMN_MAX_WIDTH_PX,
  WELCOME_HERO_MASCOT_PX,
} from "@/components/MascotSpot";
import { getLandingCopy } from "@/lib/i18n";
import { getUiLocale } from "@/lib/ui-locale";
import { getWelcomePageCopy } from "@/lib/welcome-page-copy";
import { createSupabaseAuthServerClient } from "@/lib/supabase-auth-server";

import { WelcomeLanguageBar } from "./WelcomeLanguageBar";

export default async function WelcomePage() {
  const supabase = await createSupabaseAuthServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    redirect("/dashboard");
  }

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
      {/* Language bar */}
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
          style={{ width: 32, height: 3, background: "#C5922A", borderRadius: 2, margin: "0 auto 16px" }}
        />

        <p
          className="welcome-reveal welcome-reveal--d2"
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#9A8570",
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
            color: "#221509",
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
            color: "#9A8570",
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
          {/* Primary: Register — gold gradient */}
          <Link
            href="/auth/login?mode=register&returnTo=%2Fwelcome%2Fonboarding"
            className="welcome-btn welcome-btn--create"
          >
            <span className="welcome-btn__inner">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 1.5 L9.18 6.82 L14.5 8 L9.18 9.18 L8 14.5 L6.82 9.18 L1.5 8 L6.82 6.82 Z" />
              </svg>
              <span>{copy.register}</span>
            </span>
          </Link>

          {/* Secondary: Log in — glass with gradient border */}
          <Link
            href="/auth/login?returnTo=%2Fdashboard"
            className="welcome-btn welcome-btn--join"
          >
            <span className="welcome-btn__inner">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <circle cx="7" cy="4.5" r="2.4" stroke="currentColor" strokeWidth="1.3" />
                <path d="M1 13.5 C1.5 10 4 8.5 7 8.5 S12.5 10 13 13.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <span>{copy.logIn}</span>
            </span>
          </Link>
        </div>

        {/* Tertiary: Join with a code — muted text link */}
        <div
          className="welcome-reveal welcome-reveal--d6"
          style={{ display: "flex", justifyContent: "center", marginTop: 4 }}
        >
          <Link
            href="/join"
            style={{
              fontSize: 13,
              color: "#9A8570",
              textDecoration: "none",
              padding: "10px 14px",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="6" cy="7" r="3.2" stroke="currentColor" strokeWidth="1.4" />
              <path d="M8.5 9.5 L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M11.5 11.5 L13 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            {copy.joinWithCode}
          </Link>
        </div>

        <p
          className="welcome-reveal welcome-reveal--d6"
          style={{ marginTop: 20, fontSize: 13, color: "#9A8570" }}
        >
          <Link href="/" style={{ color: "#C5922A", textDecoration: "underline" }}>
            {copy.backHome}
          </Link>
        </p>
      </div>
    </main>
  );
}
