import { notFound } from "next/navigation";
import { AuroraQuote } from "@/components/AuroraQuote";
import { FeatureGrid } from "@/components/FeatureGrid";
import { FutureRoadmap } from "@/components/FutureRoadmap";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { LanguageSelectorBar } from "@/components/LanguageSelectorBar";
import { LanguageSelectorPopup } from "@/components/LanguageSelectorPopup";
import { Lifecycle } from "@/components/Lifecycle";
import { AppPreviewWindow } from "@/components/AppPreviewWindow";
import { PlanCards } from "@/components/PlanCards";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { StatBar } from "@/components/StatBar";
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
    <div className="flex min-h-0 flex-1 flex-col bg-[#1a0a2e]">
      <LanguageSelectorPopup copy={copy} locale={locale as Locale} />
      <SiteHeader copy={copy} />
      <main className="flex-1">
        <Hero copy={copy} />
        <AppPreviewWindow />
        <StatBar />
        <FeatureGrid copy={copy} />
        <HowItWorks copy={copy} />
        <PlanCards copy={copy} />
        <Lifecycle copy={copy} />
        <AuroraQuote copy={copy} />
        <FutureRoadmap copy={copy} />
        <WaitlistForm copy={copy.waitlist} />
        <LanguageSelectorBar copy={copy} locale={locale as Locale} className="bg-[#1a0a2e] pb-6 pt-4" />
      </main>
      <SiteFooter copy={copy} />
    </div>
  );
}
