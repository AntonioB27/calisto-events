import { cookies, headers } from "next/headers";

import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n";

import { CALISTO_UI_LOCALE_COOKIE } from "@/lib/ui-locale-constants";

function preferenceFromAcceptLanguage(raw: string | null): Locale | null {
  if (!raw) return null;
  const lowered = raw.toLowerCase();
  /** Simple first-match heuristic for common primary tags. */
  const parts = lowered.split(",").map((p) => p.split(";")[0]?.trim()).filter(Boolean);
  for (const p of parts) {
    const base = p.length >= 2 ? p.slice(0, 2) : "";
    if (base === "hr") return "hr";
    if (base === "de") return "de";
    if (base === "en") return "en";
  }
  return null;
}

/**
 * Resolved UI locale: cookie wins, then Accept-Language, then `DEFAULT_LOCALE` (`en`).
 */
export async function getUiLocale(): Promise<Locale> {
  const jar = await cookies();
  const cookieVal = jar.get(CALISTO_UI_LOCALE_COOKIE)?.value ?? "";
  if (isLocale(cookieVal)) return cookieVal;

  const h = await headers();
  const guess = preferenceFromAcceptLanguage(h.get("accept-language"));
  if (guess) return guess;

  return DEFAULT_LOCALE;
}

export { bcp47FromUiLocale } from "@/lib/locale-bcp47";
