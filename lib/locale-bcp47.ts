import type { Locale } from "@/lib/i18n";

/** BCP-47 tag for `Intl` formatting (no server-only dependencies — safe in client bundles). */
export function bcp47FromUiLocale(locale: Locale): string {
  switch (locale) {
    case "hr":
      return "hr-HR";
    case "de":
      return "de-DE";
    default:
      return "en-GB";
  }
}
