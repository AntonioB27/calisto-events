import { notFound, redirect } from "next/navigation";
import { getLandingCopy, isLocale } from "@/lib/i18n";
import { getStartPageCopy } from "@/lib/i18n-start";
import { isFoundingEventsPromotionActive } from "@/lib/founding-events-promotion";
import { WeddingOffer } from "@/components/WeddingOffer";

export const dynamic = "force-dynamic";

export default async function OfferPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  if (!isFoundingEventsPromotionActive()) redirect(`/${locale}/start`);
  return <WeddingOffer locale={locale} copy={getLandingCopy(locale)} formCopy={getStartPageCopy(locale)} />;
}
