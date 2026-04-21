import type { LandingCopy, Locale } from "@/lib/i18n";

const localeLinks: { locale: Locale; label: string }[] = [
  { locale: "en", label: "EN" },
  { locale: "hr", label: "HR" },
  { locale: "de", label: "DE" },
];

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

type LanguageSelectorBarProps = {
  copy: LandingCopy;
  locale: Locale;
  /** `header` matches the dark ink sticky header; `bar` is the light footer-style strip. */
  variant?: "bar" | "header";
  className?: string;
};

export function LanguageSelectorBar({
  copy,
  locale,
  variant = "bar",
  className,
}: LanguageSelectorBarProps) {
  const isHeader = variant === "header";

  if (isHeader) {
    return (
      <div className={className ?? ""}>
        <nav
          className="flex items-center gap-2"
          aria-label={copy.languageLabel}
        >
          <GlobeIcon className="size-3.5 shrink-0 text-zinc-500" />
          <div className="lang-switcher-track flex items-center gap-0 rounded-full p-0.5">
            {localeLinks.map((item) => {
              const isActive = item.locale === locale;
              return (
                <a
                  key={item.locale}
                  href={`/${item.locale}`}
                  className={`relative min-w-[2rem] rounded-full px-2.5 py-1 text-center text-[11px] font-semibold tabular-nums tracking-wide transition-[color,background-color,box-shadow] duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/90 focus-visible:ring-offset-2 focus-visible:ring-offset-ink ${
                    isActive
                      ? "bg-gradient-to-b from-amber-300 to-amber-500 text-zinc-900 shadow-sm ring-1 ring-amber-200/40"
                      : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
                  }`}
                  aria-current={isActive ? "true" : undefined}
                >
                  {item.label}
                </a>
              );
            })}
          </div>
        </nav>
      </div>
    );
  }

  const outer = `mx-auto max-w-5xl px-4 ${className ?? ""}`;
  return (
    <div className={outer}>
      <div className="flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5">
        <span className="text-xs font-semibold text-zinc-500">
          {copy.languageLabel}
        </span>
        {localeLinks.map((item) => {
          const isActive = item.locale === locale;
          return (
            <a
              key={item.locale}
              href={`/${item.locale}`}
              className={`rounded-md border px-2 py-1 text-xs font-bold ${
                isActive
                  ? "border-primary bg-primary text-white"
                  : "border-zinc-300 bg-white text-zinc-700 hover:border-primary hover:text-primary"
              }`}
            >
              {item.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}
