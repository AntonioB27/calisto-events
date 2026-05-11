import type { Locale } from "@/lib/i18n";

import { bcp47FromUiLocale } from "@/lib/locale-bcp47";

/** Long date (e.g. “12 May 2026” / localized). */
export function formatUiDateLong(iso: string, locale: Locale): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(bcp47FromUiLocale(locale), { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

/** Short date (e.g. “12 May 2026” compact). */
export function formatUiDateShort(iso: string, locale: Locale): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(bcp47FromUiLocale(locale), { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}
