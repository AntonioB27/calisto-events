import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Calisto",
  description: "Calisto landing page with multilingual support.",
  icons: {
    icon: "/brand/calisto-icon.png",
    apple: "/brand/calisto-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" translate="no" className="notranslate h-full scroll-smooth antialiased" suppressHydrationWarning>
      <head>
        <meta name="google" content="notranslate" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Script
          id="calisto-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("calisto-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t);}catch(e){}`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
