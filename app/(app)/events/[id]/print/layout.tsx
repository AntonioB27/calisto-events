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
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Dancing+Script:wght@500;600;700&family=Montserrat:wght@200;300;400;500&display=swap"
        rel="stylesheet"
      />
      {children}
    </>
  );
}
