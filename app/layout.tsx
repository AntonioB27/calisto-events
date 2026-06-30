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
  title: "Calisto",
  description: "Calisto landing page with multilingual support.",
  icons: {
    icon: "/brand/calisto-icon.png",
    apple: "/brand/calisto-icon.png",
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
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=JetBrains+Mono:wght@400;500&family=Playfair+Display:ital,wght@0,700;1,700&display=swap"
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
