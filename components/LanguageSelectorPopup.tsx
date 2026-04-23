"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { LandingCopy, Locale } from "@/lib/i18n";

const localeLinks: { locale: Locale; label: string; fullName: string }[] = [
  { locale: "en", label: "EN", fullName: "English" },
  { locale: "hr", label: "HR", fullName: "Hrvatski" },
  { locale: "de", label: "DE", fullName: "Deutsch" },
];

type LanguageSelectorPopupProps = { copy: LandingCopy; locale: Locale };

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }} aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }} aria-hidden>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function ThemeSwatch({ variant }: { variant: "light" | "dark" }) {
  if (variant === "light") {
    return (
      <div
        aria-hidden
        className="mb-1 h-5 w-full overflow-hidden rounded"
        style={{
          background: "linear-gradient(90deg, #F9F5EE 0%, #EDE8DF 50%, #F5C76B 100%)",
          boxShadow: "inset 0 0 0 1px rgba(12,10,15,0.08)",
        }}
      />
    );
  }
  return (
    <div
      aria-hidden
      className="mb-1 h-5 w-full overflow-hidden rounded"
      style={{
        background: "linear-gradient(90deg, #0C0A0F 0%, #1C1724 40%, #A584A6 100%)",
        boxShadow: "inset 0 0 0 1px rgba(244,234,217,0.1)",
      }}
    />
  );
}

export function LanguageSelectorPopup({ copy, locale }: LanguageSelectorPopupProps) {
  const [open, setOpen] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const titleId = useId();
  const subtitleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("calisto-theme");
      if (stored === "light" || stored === "dark") {
        setTheme(stored);
        return;
      }
    } catch {
      /* ignore */
    }
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "light") setTheme("light");
  }, []);

  const applyTheme = (t: "dark" | "light") => {
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
    try {
      localStorage.setItem("calisto-theme", t);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLButtonElement>("button[data-lang-continue]")?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
      style={{ paddingTop: "max(24px, env(safe-area-inset-top))" }}
    >
      <style>{`
        @keyframes calistoLangIn {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes calistoScrimIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .calisto-lang-panel {
          animation: calistoLangIn 0.42s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .calisto-lang-scrim-anim {
          animation: calistoScrimIn 0.32s ease both;
        }
        @media (prefers-reduced-motion: reduce) {
          .calisto-lang-panel, .calisto-lang-scrim-anim { animation: none; }
        }
      `}</style>

      <div
        className="calisto-lang-scrim-anim absolute inset-0 z-0 cursor-pointer"
        onClick={close}
        role="presentation"
        style={{
          background: "color-mix(in srgb, var(--ink) 55%, #1a0a1e 45%)",
          opacity: 0.92,
          backdropFilter: "blur(10px) saturate(1.2)",
          WebkitBackdropFilter: "blur(10px) saturate(1.2)",
        }}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={subtitleId}
        className="calisto-lang-panel pointer-events-auto relative z-10 w-full"
        style={{ maxWidth: 420 }}
      >
        {/* Atmosphere: soft plum / amber wash behind the card */}
        <div
          className="pointer-events-none absolute -inset-px rounded-[28px] opacity-80 blur-xl"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at 20% 0%, rgba(165,132,166,0.45), transparent 55%), radial-gradient(ellipse 70% 60% at 100% 100%, rgba(240,179,75,0.2), transparent 50%)",
            zIndex: 0,
          }}
        />

        <div
          className="relative overflow-hidden rounded-[28px] border"
          style={{
            borderColor: "var(--hair-strong)",
            background: "linear-gradient(165deg, var(--ink-2, #141019) 0%, var(--ink, #0C0A0F) 48%, #0a0810 100%)",
            boxShadow: `
              0 0 0 1px color-mix(in srgb, var(--plum-2) 12%, transparent),
              0 32px 80px -20px rgba(0,0,0,0.75),
              0 0 64px -12px rgba(165,132,166,0.12)
            `,
            zIndex: 1,
          }}
        >
          <div
            className="absolute right-0 top-0 h-32 w-32 rounded-full opacity-25 blur-2xl"
            aria-hidden
            style={{ background: "radial-gradient(circle, var(--plum-2) 0%, transparent 70%)", transform: "translate(40%, -40%)" }}
          />
          <div
            className="absolute bottom-0 left-0 h-24 w-24 rounded-full opacity-20 blur-2xl"
            aria-hidden
            style={{ background: "radial-gradient(circle, var(--amber) 0%, transparent 70%)", transform: "translate(-35%, 35%)" }}
          />

          <div className="relative h-0.5 w-full" aria-hidden style={{ background: "linear-gradient(90deg, var(--plum) 0%, var(--plum-2) 40%, var(--amber) 100%)" }} />

          <div className="relative px-6 pb-6 pt-6 sm:px-8 sm:pb-7 sm:pt-7">
            <div className="text-center" style={{ marginBottom: 26 }}>
              <h2
                id={titleId}
                className="m-0"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2rem, 5vw, 2.5rem)",
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.05,
                  color: "var(--cream)",
                }}
              >
                Calisto
                <em className="not-italic" style={{ color: "var(--cream-2, #E8DCC6)", fontWeight: 400 }}>
                  .
                </em>
              </h2>
              <p
                id={subtitleId}
                className="m-0 mt-2.5"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: "var(--cream-3, #B5AB99)",
                  maxWidth: 320,
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                {copy.languagePopupSubtitle}
              </p>
            </div>

            <section className="mb-5" aria-label={copy.languageLabel}>
              <p
                className="m-0 mb-2.5 text-center"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10.5,
                  letterSpacing: "0.24em",
                  textTransform: "uppercase",
                  color: "var(--cream-4, #6E6758)",
                }}
              >
                {copy.languageLabel}
              </p>
              <div
                className="grid grid-cols-3 gap-2 sm:gap-2.5"
                role="group"
                aria-label={copy.languageLabel}
              >
                {localeLinks.map((item) => {
                  const isActive = item.locale === locale;
                  return (
                    <a
                      key={item.locale}
                      href={`/${item.locale}`}
                      aria-current={isActive ? "true" : undefined}
                      className="flex min-h-[52px] flex-col items-center justify-center rounded-2xl border transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--plum-2)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ink)]"
                      style={{
                        padding: "10px 6px 8px",
                        textDecoration: "none",
                        borderColor: isActive ? "var(--plum-2, #A584A6)" : "var(--hair-2)",
                        background: isActive
                          ? "color-mix(in srgb, var(--cream) 12%, var(--ink-2))"
                          : "var(--glass-bg)",
                        boxShadow: isActive
                          ? "0 0 0 1px color-mix(in srgb, var(--plum-2) 35%, transparent), inset 0 1px 0 rgba(255,255,255,0.06)"
                          : "inset 0 0 0 0 transparent",
                        color: isActive ? "var(--cream)" : "var(--cream-3, #B5AB99)",
                      }}
                    >
                      <span
                        className="font-mono"
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          letterSpacing: "0.1em",
                        }}
                      >
                        {item.label}
                      </span>
                      <span
                        className="mt-0.5 text-center"
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: 10,
                          lineHeight: 1.2,
                          color: isActive ? "var(--cream-3, #B5AB99)" : "var(--cream-4, #6E6758)",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {item.fullName}
                      </span>
                    </a>
                  );
                })}
              </div>
            </section>

            <div
              className="mb-5 flex items-center gap-2.5"
              style={{ color: "var(--cream-4, #6E6758)" }}
              aria-hidden
            >
              <span className="h-px min-w-0 flex-1" style={{ background: "linear-gradient(to right, transparent, var(--hair-strong))" }} />
              <span className="font-mono" style={{ fontSize: 9, letterSpacing: "0.2em" }}>
                — — —
              </span>
              <span className="h-px min-w-0 flex-1" style={{ background: "linear-gradient(to left, transparent, var(--hair-strong))" }} />
            </div>

            <section className="mb-5" aria-label={copy.themeLabel}>
              <p
                className="m-0 mb-2.5 text-center"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10.5,
                  letterSpacing: "0.24em",
                  textTransform: "uppercase",
                  color: "var(--cream-4, #6E6758)",
                }}
              >
                {copy.themeLabel}
              </p>
              <div
                className="grid grid-cols-2 gap-2.5"
                role="group"
                aria-label={copy.themeLabel}
              >
                {(["light", "dark"] as const).map((t) => {
                  const isActive = theme === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => applyTheme(t)}
                      aria-pressed={isActive}
                      className="flex min-h-[88px] flex-col items-stretch justify-between rounded-2xl border p-1.5 text-left transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--plum-2)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ink)]"
                      style={{
                        borderColor: isActive ? "var(--plum-2, #A584A6)" : "var(--hair-2)",
                        background: isActive
                          ? "color-mix(in srgb, var(--cream) 10%, var(--ink-2))"
                          : "var(--glass-bg)",
                        cursor: "pointer",
                        boxShadow: isActive
                          ? "0 0 0 1px color-mix(in srgb, var(--plum-2) 32%, transparent)"
                          : undefined,
                      }}
                    >
                      <ThemeSwatch variant={t} />
                      <div className="flex items-center justify-between gap-2 px-0.5 pb-0.5">
                        <span
                          className="flex min-w-0 items-center gap-1.5"
                          style={{ color: isActive ? "var(--cream)" : "var(--cream-3, #B5AB99)" }}
                        >
                          {t === "light" ? <SunIcon /> : <MoonIcon />}
                          <span
                            style={{
                              fontFamily: "var(--font-sans)",
                              fontSize: 13,
                              fontWeight: 500,
                            }}
                          >
                            {t === "light" ? copy.themeLight : copy.themeDark}
                          </span>
                        </span>
                        {isActive && (
                          <span
                            className="h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{
                              background: "var(--amber, #E6A760)",
                              boxShadow: "0 0 8px color-mix(in srgb, var(--amber) 50%, transparent)",
                            }}
                            aria-hidden
                          />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <button
              data-lang-continue
              type="button"
              onClick={close}
              className="w-full outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ink)]"
              style={{
                padding: "14px 22px",
                borderRadius: 999,
                border: "none",
                background: "linear-gradient(135deg, var(--gold) 0%, var(--amber) 45%, var(--gold-deep) 100%)",
                color: "#1b1208",
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                letterSpacing: "0.01em",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.22) inset, 0 12px 32px -8px rgba(240,179,75,0.5)",
                transition: "box-shadow 200ms, transform 200ms",
              }}
            >
              {copy.langContinue}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
