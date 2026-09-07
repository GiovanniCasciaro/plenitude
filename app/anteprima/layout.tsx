import type { Metadata } from "next";
import "@/styles/anteprima.css";

const siteUrl = process.env.APP_URL ?? "https://plenitudeleader.it";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Plenitude Leader — Anteprima",
  description:
    "Anteprima grafica del programma commerciale Plenitude Leader per condivisione via email.",
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
