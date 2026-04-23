import type { LandingCopy, Locale } from "@/lib/i18n";

const localeLinks: { locale: Locale; label: string }[] = [
  { locale: "en", label: "EN" },
  { locale: "hr", label: "HR" },
  { locale: "de", label: "DE" },
];

type LanguageSelectorBarProps = {
  copy: LandingCopy;
  locale: Locale;
  variant?: "bar" | "header";
  className?: string;
};

export function LanguageSelectorBar({
  copy,
  locale,
  variant = "bar",
  className,
}: LanguageSelectorBarProps) {
  if (variant === "header") {
    return (
      <div className={className ?? ""}>
        <nav className="lang-switcher-track" aria-label={copy.languageLabel}>
          {localeLinks.map((item) => {
            const isActive = item.locale === locale;
            return (
              <a
                key={item.locale}
                href={`/${item.locale}`}
                aria-current={isActive ? "true" : undefined}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10.5px",
                  letterSpacing: "0.18em",
                  padding: "6px 11px",
                  borderRadius: 999,
                  textTransform: "uppercase",
                  transition: "all 200ms",
                  textDecoration: "none",
                  display: "inline-block",
                  background: isActive ? "var(--cream)" : "transparent",
                  color: isActive ? "var(--ink)" : "var(--cream-3, #B5AB99)",
                }}
              >
                {item.label}
              </a>
            );
          })}
        </nav>
      </div>
    );
  }

  return (
    <div className={`mx-auto max-w-5xl px-4 ${className ?? ""}`}>
      <div
        className="flex items-center justify-center gap-2 rounded-full"
        style={{
          padding: "4px",
          border: "1px solid var(--hair-2)",
          background: "var(--glass-bg)",
          backdropFilter: "blur(10px)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--cream-4, #6E6758)",
            paddingLeft: 8,
          }}
        >
          {copy.languageLabel}
        </span>
        {localeLinks.map((item) => {
          const isActive = item.locale === locale;
          return (
            <a
              key={item.locale}
              href={`/${item.locale}`}
              aria-current={isActive ? "true" : undefined}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10.5px",
                letterSpacing: "0.14em",
                padding: "6px 12px",
                borderRadius: 999,
                textTransform: "uppercase",
                transition: "all 200ms",
                textDecoration: "none",
                background: isActive ? "var(--cream)" : "transparent",
                color: isActive ? "var(--ink)" : "var(--cream-3, #B5AB99)",
              }}
            >
              {item.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}
