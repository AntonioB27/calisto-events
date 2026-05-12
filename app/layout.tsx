import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { AppUiProvider } from "@/components/AppUiProvider";
import { CalistoThemeInit } from "@/components/CalistoThemeInit";
import { getAppStrings } from "@/lib/app-ui";
import { bcp47FromUiLocale } from "@/lib/locale-bcp47";
import { getUiLocale } from "@/lib/ui-locale";
import { getUiTheme } from "@/lib/ui-theme";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Calisto — shared event photos & videos",
    template: "%s | Calisto",
  },
  description:
    "Calisto lets wedding and event guests upload and browse photos and videos together. No app download — just a QR code or join link.",
  icons: {
    icon: "/brand/calisto-icon.png",
    apple: "/brand/calisto-icon.png",
  },
  twitter: {
    card: "summary_large_image",
    title: "Calisto — shared event photos & videos",
    description:
      "Calisto lets wedding and event guests upload and browse photos and videos together. No app download — just a QR code or join link.",
  },
  openGraph: {
    type: "website",
    title: "Calisto — shared event photos & videos",
    description:
      "Calisto lets wedding and event guests upload and browse photos and videos together. No app download — just a QR code or join link.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getUiLocale();
  const dict = getAppStrings(locale);
  const lang = bcp47FromUiLocale(locale);
  const theme = await getUiTheme();

  return (
    <html lang={lang} translate="no" data-theme={theme ?? undefined} className="notranslate h-full scroll-smooth antialiased" suppressHydrationWarning>
      <head>
        <meta name="google" content="notranslate" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- App Router root layout is the correct place for Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <CalistoThemeInit />
        <AppUiProvider value={{ locale, ...dict }}>{children}</AppUiProvider>
        <Analytics />
      </body>
    </html>
  );
}
