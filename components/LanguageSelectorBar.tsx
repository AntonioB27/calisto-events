import type { LandingCopy, Locale } from "@/lib/i18n";

const localeLinks: { locale: Locale; label: string }[] = [
  { locale: "en", label: "EN" },
  { locale: "hr", label: "HR" },
  { locale: "de", label: "DE" },
];

type LanguageSelectorBarProps = {
  copy: LandingCopy;
  locale: Locale;
  className?: string;
};

export function LanguageSelectorBar({ copy, locale, className }: LanguageSelectorBarProps) {
  return (
    <div className={`mx-auto max-w-5xl px-4 ${className ?? ""}`}>
      <div className="flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5">
        <span className="text-xs font-semibold text-zinc-500">{copy.languageLabel}</span>
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
