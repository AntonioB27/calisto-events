import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { DEFAULT_LOCALE, LOCALES, isLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

function detectLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const langs = acceptLanguage
    .split(",")
    .map((s) => s.split(";")[0].trim().toLowerCase().split("-")[0]);
  for (const lang of langs) {
    if (isLocale(lang)) return lang as Locale;
  }
  return DEFAULT_LOCALE;
}

export default async function StartRedirectPage() {
  const headersList = await headers();
  const locale = detectLocale(headersList.get("accept-language"));
  redirect(`/${locale}/start`);
}
