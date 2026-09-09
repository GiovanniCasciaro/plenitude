import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { BackToTop } from "@/components/BackToTop";
import { CookieConsent } from "@/components/CookieConsent";
import "@/styles/site.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const siteUrl = process.env.APP_URL ?? "https://plenitudeleader.it";
const siteTitle = "Plenitude Dealer — Collabora con noi";
const siteDescription =
  "Programma commerciale Plenitude Dealer: offerte energia, provvigioni strutturate e form di candidatura partner per agenzie.";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: "/",
    siteName: "Plenitude Dealer",
    title: siteTitle,
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={inter.className}>
        <div className="bg-orbs" aria-hidden="true">
          <span className="orb orb-1" />
          <span className="orb orb-2" />
          <span className="orb orb-3" />
        </div>
        {children}
        <CookieConsent />
        <BackToTop />
      </body>
    </html>
  );
}
