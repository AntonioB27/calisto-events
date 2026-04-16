"use client";

import { useEffect, useId, useState } from "react";
import type { LandingCopy, Locale } from "@/lib/i18n";

const localeLinks: { locale: Locale; label: string }[] = [
  { locale: "en", label: "EN" },
  { locale: "hr", label: "HR" },
  { locale: "de", label: "DE" },
];

type LanguageSelectorPopupProps = {
  copy: LandingCopy;
  locale: Locale;
};

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-5 w-5"}
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-5 w-5"}
      aria-hidden
    >
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
    if (saved === "light") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate theme from DOM after mount
      setTheme("light");
    }
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

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-8"
      role="presentation"
    >
      {/* Scrim */}
      <div
        className="absolute inset-0 bg-zinc-950/60 backdrop-blur-[6px]"
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${titleId} ${subtitleId}`}
        className="relative w-full max-w-[22rem] overflow-hidden rounded-[1.75rem] border border-white/20 bg-gradient-to-b from-white to-zinc-50/95 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.35),0_0_0_1px_rgba(180,83,201,0.08)] ring-1 ring-black/[0.04]"
      >
        {/* Brand accent bar */}
        <div
          className="h-1 w-full bg-gradient-to-r from-primary via-amber-400 to-orange-400"
          aria-hidden
        />

        <div className="px-6 pb-6 pt-5 sm:px-7 sm:pb-7 sm:pt-6">
          <div className="mb-6 text-center">
            <p
              id={titleId}
              className="text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-400"
            >
              Calisto
            </p>
            <p id={subtitleId} className="mt-1 text-xs leading-relaxed text-zinc-500">
              {copy.languagePopupSubtitle}
            </p>
          </div>

          {/* Language */}
          <div className="space-y-2.5">
            <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
              {copy.languageLabel}
            </p>
            <div
              className="flex rounded-full bg-zinc-100/90 p-1 shadow-inner ring-1 ring-zinc-200/80"
              role="group"
              aria-label={copy.languageLabel}
            >
              {localeLinks.map((item) => {
                const isActive = item.locale === locale;
                return (
                  <a
                    key={item.locale}
                    href={`/${item.locale}`}
                    className={`relative flex-1 rounded-full py-2.5 text-center text-sm font-bold transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                      isActive
                        ? "bg-white text-primary shadow-[0_1px_3px_rgba(0,0,0,0.08)] ring-1 ring-zinc-200/90"
                        : "text-zinc-500 hover:text-zinc-800"
                    }`}
                    aria-current={isActive ? "true" : undefined}
                  >
                    {item.label}
                  </a>
                );
              })}
            </div>
          </div>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-200 to-zinc-200" />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-300">
              ·
            </span>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent via-zinc-200 to-zinc-200" />
          </div>

          {/* Theme */}
          <div className="space-y-2.5">
            <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
              {copy.themeLabel}
            </p>
            <div
              className="grid grid-cols-2 gap-2 rounded-2xl bg-zinc-100/90 p-1.5 shadow-inner ring-1 ring-zinc-200/80"
              role="group"
              aria-label={copy.themeLabel}
            >
              <button
                type="button"
                onClick={() => applyTheme("light")}
                aria-pressed={theme === "light"}
                className={`flex flex-col items-center gap-1 rounded-xl py-3 text-sm font-bold transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 ${
                  theme === "light"
                    ? "bg-white text-amber-700 shadow-sm ring-1 ring-amber-200/80"
                    : "text-zinc-500 hover:bg-white/50 hover:text-zinc-800"
                }`}
              >
                <SunIcon />
                {copy.themeLight}
              </button>
              <button
                type="button"
                onClick={() => applyTheme("dark")}
                aria-pressed={theme === "dark"}
                className={`flex flex-col items-center gap-1 rounded-xl py-3 text-sm font-bold transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  theme === "dark"
                    ? "bg-white text-primary shadow-sm ring-1 ring-primary/25"
                    : "text-zinc-500 hover:bg-white/50 hover:text-zinc-800"
                }`}
              >
                <MoonIcon />
                {copy.themeDark}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-7 w-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-3.5 text-sm font-bold text-zinc-900 shadow-[0_4px_14px_rgba(245,158,11,0.45)] transition hover:from-amber-300 hover:to-amber-400 hover:shadow-[0_6px_20px_rgba(245,158,11,0.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
          >
            {copy.langContinue}
          </button>
        </div>
      </div>
    </div>
  );
}
