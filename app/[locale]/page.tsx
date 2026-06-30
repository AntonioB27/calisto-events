import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { AuroraQuote } from "@/components/AuroraQuote";
import { FAQ } from "@/components/FAQ";
import { FeatureGrid } from "@/components/FeatureGrid";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Testimonials } from "@/components/Testimonials";
import { LanguageSelectorPopup } from "@/components/LanguageSelectorPopup";
import { AppPreviewWindow } from "@/components/AppPreviewWindow";
import { PlanCards } from "@/components/PlanCards";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { StatBar } from "@/components/StatBar";
import { WaitlistForm } from "@/components/WaitlistForm";
import { WebMcpTools } from "@/components/WebMcpTools";
import { getLandingCopy, isLocale, LOCALES, type Locale } from "@/lib/i18n";
import { getPublicOrigin } from "@/lib/public-origin";
import { createSupabaseAuthServerClient } from "@/lib/supabase-auth-server";

type LocalePageProps = {
  params: Promise<{ locale: string }>;
};

const ogLocale: Record<Locale, string> = { en: "en_US", hr: "hr_HR", de: "de_DE" };

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const copy = getLandingCopy(locale as Locale);
  const origin = await getPublicOrigin();
  const url = `${origin}/${locale}`;

  return {
    title: copy.pageTitle,
    description: copy.pageDescription,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(LOCALES.map((l) => [l, `${origin}/${l}`])),
    },
    openGraph: {
      title: copy.pageTitle,
      description: copy.pageDescription,
      url,
      siteName: "Calisto",
      locale: ogLocale[locale as Locale],
      type: "website",
    },
  };
}

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocalePage({ params }: LocalePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const copy = getLandingCopy(locale);

  const supabase = await createSupabaseAuthServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: copy.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div className="vibrant-page-bg flex min-h-0 flex-1 flex-col overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <WebMcpTools />
      <div className="page-vignette" aria-hidden />
      <LanguageSelectorPopup copy={copy} locale={locale as Locale} />
      <SiteHeader copy={copy} locale={locale as Locale} isLoggedIn={isLoggedIn} />
      <main className="flex-1">
        <Hero copy={copy} isLoggedIn={isLoggedIn} locale={locale as Locale} />
        <StatBar copy={copy} />
        <Testimonials copy={copy} />
        <AppPreviewWindow copy={copy} />
        <FeatureGrid copy={copy} />
        <HowItWorks copy={copy} />
        <PlanCards copy={copy} />
        <AuroraQuote copy={copy} />
        <FAQ copy={copy} />
        <WaitlistForm copy={copy.waitlist} mascotAlt={copy.auroraMascotAlt} locale={locale as Locale} />
      </main>
      <SiteFooter copy={copy} locale={locale as Locale} />
    </div>
  );
}
