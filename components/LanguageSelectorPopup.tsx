"use client";

import { useEffect, useId, useState } from "react";
import type { LandingCopy, Locale } from "@/lib/i18n";

const localeLinks: { locale: Locale; label: string }[] = [
  { locale: "en", label: "EN" },
  { locale: "hr", label: "HR" },
  { locale: "de", label: "DE" },
];

type LanguageSelectorPopupProps = { copy: LandingCopy; locale: Locale };

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }} aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }} aria-hidden>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function LanguageSelectorPopup({ copy, locale }: LanguageSelectorPopupProps) {
  const [open, setOpen] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const titleId = useId();
  const subtitleId = useId();

  useEffect(() => {
    const saved = document.documentElement.getAttribute("data-theme");
    if (saved === "light") setTheme("light");
  }, []);

  const applyTheme = (t: "dark" | "light") => {
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem("calisto-theme", t); } catch { /* ignore */ }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-8" role="presentation">
      {/* Scrim */}
      <div
        className="absolute inset-0"
        aria-hidden
        style={{ background: "rgba(12,10,15,0.75)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${titleId} ${subtitleId}`}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 360,
          borderRadius: 24,
          border: "1px solid var(--hair-strong)",
          background: "linear-gradient(180deg, var(--ink-2, #141019) 0%, var(--ink, #0C0A0F) 100%)",
          boxShadow: "0 24px 64px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(165,132,166,0.1)",
          overflow: "hidden",
        }}
      >
        {/* Plum accent bar */}
        <div
          aria-hidden
          style={{ height: 2, width: "100%", background: "linear-gradient(to right, var(--plum), var(--plum-2, #A584A6), var(--amber, #E6A760))" }}
        />

        <div style={{ padding: "24px 28px 28px" }}>
          {/* Header text */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <p
              id={titleId}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10.5px",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--cream-4, #6E6758)",
                margin: "0 0 6px",
              }}
            >
              Calisto
            </p>
            <p
              id={subtitleId}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 13,
                lineHeight: 1.5,
                color: "var(--cream-3, #B5AB99)",
                margin: 0,
              }}
            >
              {copy.languagePopupSubtitle}
            </p>
          </div>

          {/* Language selector */}
          <div style={{ marginBottom: 20 }}>
            <p
              style={{
                textAlign: "center",
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--cream-4, #6E6758)",
                marginBottom: 10,
              }}
            >
              {copy.languageLabel}
            </p>
            <div
              role="group"
              aria-label={copy.languageLabel}
              style={{
                display: "flex",
                borderRadius: 999,
                padding: 4,
                background: "var(--glass-bg)",
                border: "1px solid var(--hair)",
              }}
            >
              {localeLinks.map((item) => {
                const isActive = item.locale === locale;
                return (
                  <a
                    key={item.locale}
                    href={`/${item.locale}`}
                    aria-current={isActive ? "true" : undefined}
                    style={{
                      flex: 1,
                      textAlign: "center",
                      padding: "10px 0",
                      borderRadius: 999,
                      fontFamily: "var(--font-mono)",
                      fontSize: 13,
                      fontWeight: 500,
                      textDecoration: "none",
                      transition: "all 200ms",
                      background: isActive ? "var(--cream)" : "transparent",
                      color: isActive ? "var(--ink)" : "var(--cream-3, #B5AB99)",
                      boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.2)" : undefined,
                    }}
                  >
                    {item.label}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <span style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, var(--hair-strong))" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--cream-4, #6E6758)", letterSpacing: "0.1em" }}>·</span>
            <span style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, var(--hair-strong))" }} />
          </div>

          {/* Theme selector */}
          <div style={{ marginBottom: 24 }}>
            <p
              style={{
                textAlign: "center",
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--cream-4, #6E6758)",
                marginBottom: 10,
              }}
            >
              {copy.themeLabel}
            </p>
            <div
              role="group"
              aria-label={copy.themeLabel}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                borderRadius: 16,
                padding: 6,
                background: "var(--glass-bg)",
                border: "1px solid var(--hair)",
              }}
            >
              {(["light", "dark"] as const).map((t) => {
                const isActive = theme === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => applyTheme(t)}
                    aria-pressed={isActive}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                      padding: "12px 8px",
                      borderRadius: 12,
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "var(--font-sans)",
                      fontSize: 13,
                      fontWeight: 500,
                      transition: "all 200ms",
                      background: isActive ? "var(--cream)" : "transparent",
                      color: isActive ? "var(--ink)" : "var(--cream-3, #B5AB99)",
                      boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.2)" : undefined,
                    }}
                  >
                    {t === "light" ? <SunIcon /> : <MoonIcon />}
                    {t === "light" ? copy.themeLight : copy.themeDark}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Continue button */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            style={{
              width: "100%",
              padding: "14px 20px",
              borderRadius: 999,
              border: "none",
              background: "var(--plum)",
              color: "var(--cream)",
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              boxShadow: "0 4px 20px -4px rgba(139,106,140,0.5)",
              transition: "all 250ms ease",
              letterSpacing: "0.01em",
            }}
          >
            {copy.langContinue}
          </button>
        </div>
      </div>
    </div>
  );
}
