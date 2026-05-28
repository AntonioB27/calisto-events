import type { Locale } from "@/lib/i18n";
import { bcp47FromUiLocale } from "@/lib/locale-bcp47";

import { defaultVisibilityFieldValues } from "./invitation-field-visibility";
import { isInvitationPrintTemplateId } from "./template-catalog";

/** Best-effort split of a display title into two partner lines for invitation defaults. */
export function guessPartnerNamesFromEventTitle(name: string): { partnerA: string; partnerB: string } {
  const n = name.trim();
  if (!n) return { partnerA: "", partnerB: "" };
  const seps = [" & ", " and ", " / ", " · "] as const;
  for (const sep of seps) {
    const parts = n.split(sep).map((s) => s.trim()).filter(Boolean);
    if (parts.length >= 2) {
      return { partnerA: parts[0] ?? "", partnerB: parts[1] ?? "" };
    }
  }
  return { partnerA: n, partnerB: "" };
}

export function formatEventDateForPrintField(iso: string, locale: Locale): string {
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T12:00:00Z` : iso;
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return "";
  try {
    return d.toLocaleDateString(bcp47FromUiLocale(locale), {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return "";
  }
}

/** Default field map for invitation-style templates (extend when new templates ship). */
export function defaultFieldValuesForTemplate(
  templateId: string,
  eventDisplayName: string,
  eventDateIso: string,
  locale: Locale,
): Record<string, string> {
  if (!isInvitationPrintTemplateId(templateId)) return {};
  const { partnerA, partnerB } = guessPartnerNamesFromEventTitle(eventDisplayName);
  const partnerBLine = partnerB || partnerA;
  return {
    partner_a: partnerA,
    partner_b: partnerBLine,
    connector_symbol: "ampersand",
    gathering_type: "",
    gathering_address: "",
    gathering_time: "",
    partner_a_gathering_address: "",
    partner_a_gathering_time: "",
    partner_b_gathering_address: "",
    partner_b_gathering_time: "",
    church_address: "",
    church_time: "",
    dinner_address: "",
    dinner_time: "",
    quote_text: "",
    quote_author: "",
    venue: "",
    venue_line_2: "",
    extra_line: "",
    ...defaultVisibilityFieldValues(),
  };
}
