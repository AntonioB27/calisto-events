import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalDocPage } from "@/components/legal/LegalDocPage";
import { PRIVACY_SECTIONS } from "@/lib/legal-copy";
import { DEFAULT_LOCALE, getLandingCopy, isLocale, LOCALES, type Locale } from "@/lib/i18n";

type Props = Readonly<{ params: Promise<{ locale: string }> }>;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const copy = getLandingCopy(locale);
  return {
    title: `${copy.footerPrivacy} · Calisto`,
    description: "How Calisto collects and uses personal data.",
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = getLandingCopy(locale);

  return (
    <LegalDocPage
      locale={locale}
      title={copy.footerPrivacy}
      englishNotice={copy.legalEnglishNotice || undefined}
      sections={PRIVACY_SECTIONS}
    />
  );
}
