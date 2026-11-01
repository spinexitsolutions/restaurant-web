import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Geist, Geist_Mono } from "next/font/google";
import { getSettings } from "@/lib/db";
import "./globals.css";

const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-serif" });
const sans = Geist({ subsets: ["latin"], variable: "--font-geist" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: { default: s.seo.title, template: `%s — ${s.brand.name}` },
    description: s.seo.description,
    openGraph: { title: s.seo.title, description: s.seo.description, images: s.seo.ogImage ? [s.seo.ogImage] : [] },
  };
}

export const viewport: Viewport = {
  themeColor: "#141210",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  const vars = {
    "--paper": s.brand.paper,
    "--ink": s.brand.ink,
    "--accent": s.brand.accent,
    "--accent-soft": s.brand.accentSoft,
  } as React.CSSProperties;
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`} style={vars} suppressHydrationWarning>
      <body className="min-h-dvh bg-paper text-ink">{children}</body>
    </html>
  );
}
