import { LanguageSelectorBar } from "@/components/LanguageSelectorBar";
import type { LandingCopy, Locale } from "@/lib/i18n";

type SiteHeaderProps = {
  copy: LandingCopy;
  locale: Locale;
};

export function SiteHeader({ copy, locale }: SiteHeaderProps) {
  return (
    <header
      className="sticky top-0 z-50"
      style={{
        padding: "18px 0",
        background: "linear-gradient(to bottom, rgba(12,10,15,0.90) 0%, rgba(12,10,15,0.75) 70%, rgba(12,10,15,0) 100%)",
        backdropFilter: "blur(14px) saturate(1.1)",
        WebkitBackdropFilter: "blur(14px) saturate(1.1)",
        borderBottom: "1px solid var(--hair)",
      }}
    >
      <div
        className="mx-auto flex items-center justify-between gap-6"
        style={{ maxWidth: 1280, padding: "0 32px" }}
      >
        {/* Brand */}
        <a
          href="#top"
          className="flex items-center gap-2.5 shrink-0 focus:outline-none"
          style={{ textDecoration: "none" }}
        >
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
            <em style={{ fontStyle: "italic", color: "var(--cream-2, #E8DCC6)", fontWeight: 400 }}>.</em>
          </span>
        </a>

        {/* Nav — hidden on mobile */}
        <nav
          className="hidden md:flex items-center"
          aria-label={copy.navAriaLabel}
          style={{ gap: 34 }}
        >
          {copy.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="nav-link"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 13,
                color: "var(--cream-2, #E8DCC6)",
                letterSpacing: "0.02em",
                padding: "6px 0",
                transition: "color 200ms",
                textDecoration: "none",
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right: lang + CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <LanguageSelectorBar copy={copy} locale={locale} variant="header" />
          <a
            href="#waitlist"
            className="hidden sm:inline-flex items-center gap-2"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              fontWeight: 500,
              padding: "9px 16px",
              borderRadius: 999,
              background: "linear-gradient(135deg, var(--gold) 0%, var(--amber) 45%, var(--gold-deep) 100%)",
              color: "#1b1208",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.28) inset, 0 10px 32px -8px rgba(240,179,75,0.45)",
              transition: "all 250ms ease",
              textDecoration: "none",
              letterSpacing: "0.01em",
            }}
          >
            {copy.joinWaitlistShort}
            <span aria-hidden style={{ transition: "transform 300ms" }}>→</span>
          </a>
          {/* Mobile CTA */}
          <a
            href="#waitlist"
            className="sm:hidden"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              fontWeight: 500,
              padding: "8px 14px",
              borderRadius: 999,
              background: "linear-gradient(135deg, var(--gold) 0%, var(--amber) 45%, var(--gold-deep) 100%)",
              color: "#1b1208",
              textDecoration: "none",
            }}
          >
            {copy.joinWaitlistShort}
          </a>
        </div>
      </div>
    </header>
  );
}
