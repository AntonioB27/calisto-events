import type { Locale } from "@/lib/i18n";
import { bcp47FromUiLocale } from "@/lib/locale-bcp47";

import { formatEventDateForPrintField } from "./print-field-defaults";

export type WeddingInviteDateParts = Readonly<{
  month: string;
  weekday: string;
  day: string;
  year: string;
}>;

export function weddingInviteDateParts(iso: string, locale: Locale): WeddingInviteDateParts | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const bcp = bcp47FromUiLocale(locale);
  try {
    const month = d.toLocaleDateString(bcp, { month: "long" }).toUpperCase();
    const weekday = d.toLocaleDateString(bcp, { weekday: "long" }).toUpperCase();
    const day = d.toLocaleDateString(bcp, { day: "numeric" });
    const year = d.toLocaleDateString(bcp, { year: "numeric" });
    return { month, weekday, day, year };
  } catch {
    return null;
  }
}

/** If `extraLine` looks like a time (e.g. "2 PM", "at 2pm"), return a short display token for the date row. */
export function guessTimeTokenFromExtraLine(extraLine: string): string | null {
  const t = extraLine.trim();
  if (!t) return null;
  const m = t.match(/\b(\d{1,2}:\d{2}\s*(a\.?m\.?|p\.?m\.?))\b/i);
  if (m) return m[1].toUpperCase().replace(/\s+/g, " ");
  const m2 = t.match(/\b(\d{1,2}\s*(a\.?m\.?|p\.?m\.?))\b/i);
  if (m2) return m2[1].toUpperCase().replace(/\s+/g, " ");
  if (/^at\s+/i.test(t)) {
    const rest = t.replace(/^at\s+/i, "").trim();
    if (rest) return rest.toUpperCase();
  }
  return null;
}

/** True when `extraLine` is the same as the default formatted event date (avoid duplicating under the date block). */
export function isExtraLineSameAsFormattedDate(
  extraLine: string,
  eventDateIso: string,
  locale: Locale,
): boolean {
  const formatted = formatEventDateForPrintField(eventDateIso, locale).trim();
  return Boolean(formatted && extraLine.trim() === formatted);
}
