import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalDocPage } from "@/components/legal/LegalDocPage";
import { TERMS_SECTIONS } from "@/lib/legal-copy";
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
    title: `${copy.footerTerms} · Calisto`,
    description: "Terms governing use of Calisto.",
  };
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = getLandingCopy(locale);

  return (
    <LegalDocPage
      locale={locale}
      title={copy.footerTerms}
      englishNotice={copy.legalEnglishNotice || undefined}
      sections={TERMS_SECTIONS}
    />
  );
}
