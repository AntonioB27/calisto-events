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
  // Date-only strings ("YYYY-MM-DD") are parsed as UTC midnight by spec, which shifts
  // the visible day in any timezone with a negative offset and on the server (which runs
  // in UTC). Treating them as UTC noon keeps the same calendar day across all ±12h offsets.
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T12:00:00Z` : iso;
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return null;
  const bcp = bcp47FromUiLocale(locale);
  try {
    const month = d.toLocaleDateString(bcp, { month: "long", timeZone: "UTC" }).toUpperCase();
    const weekday = d.toLocaleDateString(bcp, { weekday: "long", timeZone: "UTC" }).toUpperCase();
    const day = d.toLocaleDateString(bcp, { day: "numeric", timeZone: "UTC" });
    const year = d.toLocaleDateString(bcp, { year: "numeric", timeZone: "UTC" });
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

/** English ordinal suffix for invitation caps lines (16 → "16TH"). */
export function ordinalDayUpperEn(dayStr: string): string {
  const n = Number.parseInt(String(dayStr).replace(/\D/g, ""), 10);
  if (!Number.isFinite(n)) return String(dayStr).trim().toUpperCase();
  const mod100 = n % 100;
  let suf = "TH";
  if (mod100 < 11 || mod100 > 13) {
    switch (n % 10) {
      case 1:
        suf = "ST";
        break;
      case 2:
        suf = "ND";
        break;
      case 3:
        suf = "RD";
        break;
      default:
        suf = "TH";
    }
  }
  return `${n}${suf}`;
}

const EN_UNDER_TWENTY = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
] as const;

const EN_TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"] as const;

function englishUnder100(n: number): string {
  if (n < 20) return EN_UNDER_TWENTY[n] ?? String(n);
  const ten = Math.floor(n / 10);
  const one = n % 10;
  const tail = one === 0 ? "" : ` ${EN_UNDER_TWENTY[one]}`;
  return `${EN_TENS[ten]}${tail}`;
}

/** Lowercase spelled year for EN poster locale (2000–2099); otherwise null to use numeric fallback. */
export function weddingInviteGlitterYearWordsEnLower(iso: string): string | null {
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T12:00:00Z` : iso;
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getUTCFullYear();
  if (y < 2000 || y > 2099) return null;
  if (y === 2000) return "two thousand";
  return `two thousand ${englishUnder100(y - 2000)}`;
}

/**
 * All-caps date row like "SEPTEMBER 16TH AT 5PM" (en) or "16. SEPTEMBER · 17:00" style for other locales.
 */
export function weddingInviteGlitterCapsDateRow(iso: string, locale: Locale, extraLine: string): string | null {
  const dp = weddingInviteDateParts(iso, locale);
  if (!dp) return null;
  const timeTok = guessTimeTokenFromExtraLine(extraLine);
  if (locale === "en") {
    const mid = `${dp.month} ${ordinalDayUpperEn(dp.day)}`;
    return timeTok ? `${mid} AT ${timeTok}` : mid;
  }
  const mid = `${dp.day}. ${dp.month}`;
  return timeTok ? `${mid} · ${timeTok}` : mid;
}

/**
 * Lowercase prose line under the caps date — optional time from `extraLine` and spelled year,
 * joined with " / " (black & gold glitter invitation).
 */
export function weddingInviteGlitterTimeYearLine(
  iso: string,
  locale: Locale,
  extraLine: string,
): string | null {
  const raw = extraLine.trim();
  const timePart =
    raw && !isExtraLineSameAsFormattedDate(raw, iso, locale) ? raw.toLowerCase() : null;
  const yearPart = weddingInviteGlitterYearSubtitle(iso, locale);
  if (timePart && yearPart) return `${timePart} / ${yearPart}`;
  return timePart ?? yearPart;
}

/** Second line under caps date — spelled English years for locale `en`, else calendar year digits. */
export function weddingInviteGlitterYearSubtitle(iso: string, locale: Locale): string | null {
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T12:00:00Z` : iso;
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getUTCFullYear();
  if (locale === "en") {
    return weddingInviteGlitterYearWordsEnLower(iso) ?? String(y);
  }
  return String(y);
}

/** Calendar day → spelled ordinal word (English invitation prose). */
const DAY_ORDINAL_WORD_UPPER_EN = [
  "",
  "FIRST",
  "SECOND",
  "THIRD",
  "FOURTH",
  "FIFTH",
  "SIXTH",
  "SEVENTH",
  "EIGHTH",
  "NINTH",
  "TENTH",
  "ELEVENTH",
  "TWELFTH",
  "THIRTEENTH",
  "FOURTEENTH",
  "FIFTEENTH",
  "SIXTEENTH",
  "SEVENTEENTH",
  "EIGHTEENTH",
  "NINETEENTH",
  "TWENTIETH",
  "TWENTY-FIRST",
  "TWENTY-SECOND",
  "TWENTY-THIRD",
  "TWENTY-FOURTH",
  "TWENTY-FIFTH",
  "TWENTY-SIXTH",
  "TWENTY-SEVENTH",
  "TWENTY-EIGHTH",
  "TWENTY-NINTH",
  "THIRTIETH",
  "THIRTY-FIRST",
] as const;

export function weddingInviteGoldArchOrdinalDayWordUpperEn(dayNumericStr: string): string {
  const n = Number.parseInt(String(dayNumericStr).replace(/\D/g, ""), 10);
  if (!Number.isFinite(n) || n < 1 || n > 31) return ordinalDayUpperEn(dayNumericStr);
  return DAY_ORDINAL_WORD_UPPER_EN[n] ?? ordinalDayUpperEn(dayNumericStr);
}

/** Primary date line inside gold-arch layout — EN uses “JUNE FIFTEENTH”; other locales month + day. */
export function weddingInviteGoldArchPrimaryDateLine(iso: string, locale: Locale): string | null {
  const dp = weddingInviteDateParts(iso, locale);
  if (!dp) return null;
  if (locale === "en") {
    const ord = weddingInviteGoldArchOrdinalDayWordUpperEn(dp.day);
    return `${dp.month} ${ord}`;
  }
  const dayTok = String(dp.day).replace(/\.$/, "").trim();
  return `${dayTok}. ${dp.month}`.trim();
}

/** Second detail line — typically spelled-out time from the optional extra field (guest-facing copy). */
export function weddingInviteGoldArchExtraCapsLine(extraLine: string): string | null {
  const t = extraLine.trim();
  return t ? t.toUpperCase() : null;
}

/**
 * "SATURDAY, JUNE 1, 2026" (en) / "SUBOTA, 1. LIPNJA 2026." (hr) / "SAMSTAG, 1. JUNI 2026" (de).
 * Mirrors the long-form serif date used in cherry-blossom stationery.
 */
export function weddingInviteCherryLongDateLine(iso: string, locale: Locale): string | null {
  const dp = weddingInviteDateParts(iso, locale);
  if (!dp) return null;
  if (locale === "en") {
    return `${dp.weekday}, ${dp.month} ${dp.day}, ${dp.year}`;
  }
  const dayTok = String(dp.day).replace(/\.$/, "").trim();
  return `${dp.weekday}, ${dayTok}. ${dp.month} ${dp.year}`;
}

/** Alias — some bundles import this name (long-form weekday + date for cherry template). */
export const weddingInviteCherryLongDateCapsLine = weddingInviteCherryLongDateLine;

/** Caps date row with pipe separators — "30TH | MAY | 2026" (watercolor coast layout). */
export function weddingInviteWatercolorPipeDateLine(iso: string, locale: Locale): string | null {
  const dp = weddingInviteDateParts(iso, locale);
  if (!dp) return null;
  if (locale === "en") {
    return `${ordinalDayUpperEn(dp.day)} | ${dp.month} | ${dp.year}`;
  }
  const dayTok = String(dp.day).replace(/\.$/, "").trim();
  return `${dayTok} | ${dp.month} | ${dp.year}`;
}

/** EN ceremony row like "SATURDAY, AUGUST TWENTY-SIXTH"; mirrors olive stationery caps layout. */
export function weddingInviteOliveCeremonyDateCapsLine(iso: string, locale: Locale): string | null {
  const dp = weddingInviteDateParts(iso, locale);
  if (!dp) return null;
  if (locale === "en") {
    const ord = weddingInviteGoldArchOrdinalDayWordUpperEn(dp.day);
    return `${dp.weekday}, ${dp.month} ${ord}`;
  }
  const dayTok = String(dp.day).replace(/\.$/, "").trim();
  return `${dp.weekday}, ${dayTok}. ${dp.month}`.trim();
}

/** EN spelled year like "two thousand and twenty-five" (bridging wording used on botanical layouts). */
export function weddingInviteOliveYearWordsEnLower(iso: string): string | null {
  const w = weddingInviteGlitterYearWordsEnLower(iso);
  if (!w) return null;
  if (w === "two thousand") return w;
  if (w.startsWith("two thousand ") && !w.startsWith("two thousand and ")) {
    return `two thousand and ${w.slice("two thousand ".length)}`;
  }
  return w;
}
