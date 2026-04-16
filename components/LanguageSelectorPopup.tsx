"use client";

import { useEffect, useState } from "react";
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

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function LanguageSelectorPopup({ copy, locale }: LanguageSelectorPopupProps) {
  const [open, setOpen] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = document.documentElement.getAttribute("data-theme");
    if (saved === "light") setTheme("light");
  }, []);

  const applyTheme = (t: "dark" | "light") => {
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem("calisto-theme", t); } catch {}
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-zinc-900/40 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl">

        {/* Language */}
        <p className="mb-4 text-center text-sm font-semibold text-zinc-600">{copy.languageLabel}</p>
        <div className="flex items-center justify-center gap-2">
          {localeLinks.map((item) => {
            const isActive = item.locale === locale;
            return (
              <a
                key={item.locale}
                href={`/${item.locale}`}
                className={`rounded-md border px-3 py-1.5 text-sm font-bold ${
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

        {/* Divider */}
        <div className="my-4 border-t border-zinc-100" />

        {/* Theme */}
        <p className="mb-3 text-center text-sm font-semibold text-zinc-600">Appearance</p>
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => applyTheme("light")}
            className={`inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-bold transition ${
              theme === "light"
                ? "border-amber-400 bg-amber-50 text-amber-700"
                : "border-zinc-300 bg-white text-zinc-600 hover:border-zinc-400"
            }`}
          >
            <SunIcon />
            Light
          </button>
          <button
            type="button"
            onClick={() => applyTheme("dark")}
            className={`inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-bold transition ${
              theme === "dark"
                ? "border-primary bg-primary/5 text-primary"
                : "border-zinc-300 bg-white text-zinc-600 hover:border-zinc-400"
            }`}
          >
            <MoonIcon />
            Dark
          </button>
        </div>

        {/* Continue */}
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-4 w-full rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-200"
        >
          {copy.langContinue}
        </button>
      </div>
    </div>
  );
}
