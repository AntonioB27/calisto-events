import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { StartPageClient } from "@/components/StartPageClient";
import { getStartPageCopy } from "@/lib/i18n-start";
import { isLocale, LOCALES, type Locale } from "@/lib/i18n";

type LocaleStartPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: LocaleStartPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = getStartPageCopy(locale as Locale);
  return {
    title: `${copy.heroLine1} ${copy.heroLine2}`,
    description: copy.heroSub,
    robots: { index: false },
  };
}

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleStartPage({ params }: LocaleStartPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const copy = getStartPageCopy(locale as Locale);

  return <StartPageClient copy={copy} locale={locale as Locale} />;
}
