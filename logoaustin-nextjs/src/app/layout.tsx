import type { Metadata, Viewport } from "next";
import type React from "react";
import { Inter, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { site, SITE_URL } from "@/data/site";
import { robotsMeta } from "@/lib/seo";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StickyBar from "@/components/layout/StickyBar";
import ConsultationModal from "@/components/consultation/ConsultationModal";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-sans" });
const serif = DM_Serif_Display({ subsets: ["latin"], weight: "400", display: "swap", variable: "--font-display" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${site.brandName}, TX | Custom Logos & AI Logo Fixes`, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.brandName,
  robots: robotsMeta,
  openGraph: { siteName: site.brandName, locale: site.locale, type: "website" },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: true },
};

export const viewport: Viewport = {
  themeColor: "#24262b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${serif.variable}`}>
      <body>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <StickyBar />
        <ConsultationModal />
      </body>
    </html>
  );
}
