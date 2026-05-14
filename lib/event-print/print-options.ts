import type { Locale } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n";

import { TABLE_QR_PRINT_TEMPLATE_IDS, type TableQrPrintTemplateId } from "./template-catalog";

/** Query key for poster on-paper language (`?posterLang=de`). */
export const POSTER_LANG_QUERY = "posterLang";

/** @deprecated Use TABLE_QR_PRINT_TEMPLATE_IDS from template-catalog for new code. */
export const POSTER_TEMPLATES = TABLE_QR_PRINT_TEMPLATE_IDS;
export type PosterTemplateId = TableQrPrintTemplateId;
export const DEFAULT_POSTER_TEMPLATE: PosterTemplateId = "table-minimal";

export const PRINT_PAPERS = ["a4", "letter"] as const;
export type PrintPaperId = (typeof PRINT_PAPERS)[number];
export const DEFAULT_PRINT_PAPER: PrintPaperId = "a4";

export function parsePosterTemplate(raw: string | undefined): PosterTemplateId {
  if (raw && (POSTER_TEMPLATES as readonly string[]).includes(raw)) {
    return raw as PosterTemplateId;
  }
  return DEFAULT_POSTER_TEMPLATE;
}

export function parsePrintPaper(raw: string | undefined): PrintPaperId {
  if (raw && (PRINT_PAPERS as readonly string[]).includes(raw)) {
    return raw as PrintPaperId;
  }
  return DEFAULT_PRINT_PAPER;
}

/** Language for strings printed on the poster; invalid or missing → `fallback` (typically UI locale). */
export function parsePosterContentLocale(raw: string | undefined, fallback: Locale): Locale {
  if (raw && isLocale(raw)) {
    return raw;
  }
  return fallback;
}
