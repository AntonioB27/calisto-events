import { LanguageSelectorBar } from "@/components/LanguageSelectorBar";
import type { LandingCopy, Locale } from "@/lib/i18n";

type SiteHeaderProps = {
  copy: LandingCopy;
  locale: Locale;
};

export function SiteHeader({ copy, locale }: SiteHeaderProps) {
  return (
    <header className="site-header sticky top-0 z-50">
      <div
        className="mx-auto grid w-full max-w-[1280px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1.5 px-4 sm:px-6
          md:flex md:items-center md:justify-between md:gap-6 md:px-8"
      >
        {/* Brand */}
        <a
          href="#top"
          className="min-w-0 shrink-0 focus:outline-none"
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

        {/* Right: lang + CTA (row 1 on mobile; end cap on md+) */}
        <div className="flex items-center justify-self-end gap-3 shrink-0 md:order-3">
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

        {/* Nav: full-width row on mobile; between brand and tools on md+ */}
        <nav
          className="col-span-2 -mx-1 flex w-full min-w-0 flex-wrap items-center justify-center gap-x-2.5 gap-y-0.5 border-t border-[var(--hair-2)] pt-1.5 text-xs
            md:order-2 md:col-span-1 md:mx-0 md:w-auto md:min-w-0 md:flex-1 md:flex-nowrap md:justify-center md:gap-x-[34px] md:gap-y-0 md:border-0 md:pt-0 md:text-[13px]"
          aria-label={copy.navAriaLabel}
        >
          {copy.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="nav-link"
              style={{
                fontFamily: "var(--font-sans)",
                color: "var(--cream-2, #E8DCC6)",
                letterSpacing: "0.02em",
                padding: "6px 4px",
                transition: "color 200ms",
                textDecoration: "none",
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
