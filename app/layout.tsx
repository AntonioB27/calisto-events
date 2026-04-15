import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Calisto — shared event photos & videos",
  description:
    "Calisto lets wedding and event guests upload and browse photos and videos in one place. Organizers share a code or QR; plans are one-time per event.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}>
      <body className="min-h-full flex flex-col text-zinc-900">{children}</body>
    </html>
  );
}
