import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import { getSettings } from "@/lib/db";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], axes: ["opsz", "wdth"], variable: "--font-brico" });
const body = Instrument_Sans({ subsets: ["latin"], axes: ["wdth"], variable: "--font-body" });

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
  themeColor: "#0f0f12",
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
    <html lang="en" className={`${display.variable} ${body.variable}`} style={vars} suppressHydrationWarning>
      <body className="min-h-dvh bg-paper text-ink">{children}</body>
    </html>
  );
}
