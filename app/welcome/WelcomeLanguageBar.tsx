"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { setUiLocaleCookieClient } from "@/lib/set-ui-locale-cookie-client";
import type { Locale } from "@/lib/i18n";

const localeButtons: { locale: Locale; label: string }[] = [
  { locale: "en", label: "EN" },
  { locale: "hr", label: "HR" },
  { locale: "de", label: "DE" },
];

type WelcomeLanguageBarProps = {
  locale: Locale;
  languageLabel: string;
};

export function WelcomeLanguageBar({ locale, languageLabel }: WelcomeLanguageBarProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <nav aria-label={languageLabel} style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--app-muted)",
          marginRight: 4,
        }}
      >
        {languageLabel}
      </span>
      <div
        style={{
          display: "inline-flex",
          padding: 3,
          borderRadius: 999,
          border: "1px solid var(--app-border)",
          background: "var(--app-surface-2)",
          gap: 2,
        }}
      >
        {localeButtons.map((item) => {
          const isActive = item.locale === locale;
          return (
            <button
              key={item.locale}
              type="button"
              disabled={pending || isActive}
              aria-current={isActive ? "true" : undefined}
              onClick={() => {
                setUiLocaleCookieClient(item.locale);
                startTransition(() => {
                  router.refresh();
                });
              }}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10.5,
                letterSpacing: "0.14em",
                padding: "6px 11px",
                borderRadius: 999,
                textTransform: "uppercase",
                border: "none",
                cursor: isActive || pending ? "default" : "pointer",
                background: isActive ? "var(--app-gold)" : "transparent",
                color: isActive ? "var(--app-inverse)" : "var(--app-muted)",
                opacity: pending && !isActive ? 0.55 : 1,
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
