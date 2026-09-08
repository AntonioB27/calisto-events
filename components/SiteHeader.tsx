import { LanguageSelectorBar } from "@/components/LanguageSelectorBar";
import { MobileNavMenu } from "@/components/MobileNavMenu";
import { ScrollSpyNav } from "@/components/ScrollSpyNav";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import type { LandingCopy, Locale } from "@/lib/i18n";

type SiteHeaderProps = {
  copy: LandingCopy;
  locale: Locale;
  isLoggedIn: boolean;
};

export function SiteHeader({ copy, locale, isLoggedIn }: SiteHeaderProps) {
  const ctaHref = isLoggedIn ? "/dashboard" : `/${locale}/start`;

  return (
    <header
      className="site-header sticky top-0 z-50"
      style={{ padding: "10px clamp(10px, 3vw, 24px)" }}
    >
      <div
        className="relative mx-auto flex w-full max-w-[1200px] items-center justify-between gap-2.5"
        style={{
          padding: "8px 10px 8px 18px",
          border: "1px solid var(--hair-2)",
          borderRadius: 22,
          background: "var(--header-bg)",
          backdropFilter: "blur(16px) saturate(140%)",
          WebkitBackdropFilter: "blur(16px) saturate(140%)",
          boxShadow: "var(--shadow, 0 30px 70px -34px rgba(0,0,0,0.5))",
        }}
      >
        {/* Brand */}
        <a
          href="#top"
          className="min-w-0 shrink-0 focus:outline-none"
          style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, marginRight: 4 }}
        >
          <span
            aria-hidden
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              flexShrink: 0,
              background: "linear-gradient(135deg, var(--gold) 0%, var(--amber) 45%, var(--gold-deep) 100%)",
              boxShadow: "0 0 12px rgba(240,179,75,0.65)",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 22,
              fontWeight: 500,
              letterSpacing: "0.01em",
              color: "var(--cream)",
            }}
          >
            Calisto
            <em style={{ fontStyle: "italic", color: "var(--gold)", fontWeight: 400 }}>.</em>
          </span>
        </a>

        {/* Nav: centered pill, desktop only */}
        <div className="hidden min-w-0 flex-1 md:block">
          <div
            className="mx-auto flex w-fit max-w-full items-center justify-center gap-0.5"
            style={{
              padding: 3,
              borderRadius: 999,
              background: "var(--glass-bg)",
              border: "1px solid var(--hair)",
              overflowX: "auto",
            }}
          >
            <ScrollSpyNav copy={copy} variant="pill" />
          </div>
        </div>

        {/* Right: lang + theme + CTA, desktop only */}
        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <LanguageSelectorBar copy={copy} locale={locale} variant="header" />
          <ThemeToggleButton copy={copy} />
          <a
            href={ctaHref}
            className="inline-flex items-center gap-1.5"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 13.5,
              fontWeight: 600,
              height: 36,
              padding: "0 18px",
              borderRadius: 999,
              background: "linear-gradient(135deg, var(--gold) 0%, var(--amber) 45%, var(--gold-deep) 100%)",
              color: "#1b1208",
              boxShadow: "0 10px 26px -12px rgba(240,179,75,0.75)",
              textDecoration: "none",
              letterSpacing: "0.01em",
            }}
          >
            {isLoggedIn ? copy.goToApp : copy.heroPrimaryCta}
            <span aria-hidden>→</span>
          </a>
        </div>

        {/* Right: compact CTA + hamburger, mobile only */}
        <div className="flex shrink-0 items-center gap-2 md:hidden">
          <a
            href={ctaHref}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              fontWeight: 600,
              padding: "8px 14px",
              borderRadius: 999,
              background: "linear-gradient(135deg, var(--gold) 0%, var(--amber) 45%, var(--gold-deep) 100%)",
              color: "#1b1208",
              textDecoration: "none",
            }}
          >
            {isLoggedIn ? copy.goToApp : copy.heroPrimaryCta}
          </a>
          <MobileNavMenu
            copy={copy}
            locale={locale}
            ctaHref={ctaHref}
            ctaLabel={isLoggedIn ? copy.goToApp : copy.heroPrimaryCta}
          />
        </div>
      </div>
    </header>
  );
}
