import type { Metadata } from "next";
import "@/styles/anteprima.css";

const siteUrl = process.env.APP_URL ?? "https://plenitudedealerita.it";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Plenitude Dealer — Anteprima",
  description:
    "Anteprima grafica del programma commerciale Plenitude Dealer per condivisione via email.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AnteprimaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
