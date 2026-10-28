import { redirect } from "next/navigation";

// The launch offer ended; keep old shared links landing somewhere useful.
export default async function OfferPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/start`);
}
