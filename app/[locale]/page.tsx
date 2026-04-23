import { notFound } from "next/navigation";
import { AuroraQuote } from "@/components/AuroraQuote";
import { FAQ } from "@/components/FAQ";
import { FeatureGrid } from "@/components/FeatureGrid";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { LanguageSelectorPopup } from "@/components/LanguageSelectorPopup";
import { AppPreviewWindow } from "@/components/AppPreviewWindow";
import { PlanCards } from "@/components/PlanCards";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { WaitlistForm } from "@/components/WaitlistForm";
import { getLandingCopy, isLocale, LOCALES, type Locale } from "@/lib/i18n";

type LocalePageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocalePage({ params }: LocalePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const copy = getLandingCopy(locale);

  return (
    <div className="vibrant-page-bg flex min-h-0 flex-1 flex-col overflow-x-clip">
      <div className="page-vignette" aria-hidden />
      <LanguageSelectorPopup copy={copy} locale={locale as Locale} />
      <SiteHeader copy={copy} locale={locale as Locale} />
      <main className="flex-1">
        <Hero copy={copy} />
        <AppPreviewWindow copy={copy} />
        <FeatureGrid copy={copy} />
        <HowItWorks copy={copy} />
        <PlanCards copy={copy} />
        <AuroraQuote copy={copy} />
        <FAQ copy={copy} />
        <WaitlistForm copy={copy.waitlist} mascotAlt={copy.auroraMascotAlt} locale={locale as Locale} />
      </main>
      <SiteFooter copy={copy} />
    </div>
  );
}
