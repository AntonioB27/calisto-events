"use client";

import { useState } from "react";
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

export function LanguageSelectorPopup({ copy, locale }: LanguageSelectorPopupProps) {
  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-zinc-900/40 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl">
        <p className="mb-4 text-center text-sm font-semibold text-zinc-600">{copy.languageLabel}</p>
        <div className="mb-4 flex items-center justify-center gap-2">
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
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="w-full rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-200"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
