import type { Metadata } from "next";
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
    <html lang="en" className="h-full scroll-smooth antialiased" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme — runs before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("calisto-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t);}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col text-zinc-900">{children}</body>
    </html>
  );
}
