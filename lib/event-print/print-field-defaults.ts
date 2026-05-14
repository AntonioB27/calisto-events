import type { Locale } from "@/lib/i18n";
import { bcp47FromUiLocale } from "@/lib/locale-bcp47";

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
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  try {
    return d.toLocaleDateString(bcp47FromUiLocale(locale), {
      day: "numeric",
      month: "long",
      year: "numeric",
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
  if (templateId !== "wedding-invite-simple") return {};
  const { partnerA, partnerB } = guessPartnerNamesFromEventTitle(eventDisplayName);
  const partnerBLine = partnerB || partnerA;
  return {
    partner_a: partnerA,
    partner_b: partnerBLine,
    venue: "",
    extra_line: "",
  };
}
