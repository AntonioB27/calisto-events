import type { ReactNode } from "react";

/**
 * Invitation print uses distinct serif/script webfonts; load only on this route.
 */
export default function EventPrintLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font -- route-local serif/script for invitation print */}
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Dancing+Script:wght@500;600;700&family=Montserrat:wght@200;300;400;500&family=Space+Grotesk:wght@300;400;500;600;700&family=Pinyon+Script&family=Bodoni+Moda:ital,wght@0,400;0,500;1,400;1,500&family=Jost:wght@300;400;500;600&family=Cinzel:wght@400;500;600&family=Marcellus&family=Fredoka:wght@400;500;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap"
        rel="stylesheet"
      />
      {children}
    </>
  );
}
