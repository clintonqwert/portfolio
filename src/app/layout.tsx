import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "./globals.css";

import { SiteRail } from "@/components/layout/site-rail";
import { getNavLinks } from "@/lib/content/navigation";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, buildMetadata } from "@/lib/seo";

/*
  Self-hosted via next/font: no third-party request, automatic subsetting, and
  size-adjusted fallbacks so swapping in the real face causes no layout shift.
  Archivo carries display and body across four weights; mono is data only.
*/
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-archivo",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...buildMetadata({
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    path: "/",
  }),
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const navLinks = await getNavLinks();

  return (
    <html lang="en" className={`${archivo.variable} ${mono.variable}`}>
      <body className="min-h-dvh bg-canvas antialiased">
        <a
          href="#main"
          className="sr-only rounded bg-ink px-4 py-2 text-canvas focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[var(--z-skip)]"
        >
          Skip to content
        </a>

        <SiteRail links={navLinks} />

        {/* The rail is fixed at ≥1024px; the workspace is inset to clear it. */}
        <div className="lg:pl-[236px]">
          <main id="main">{children}</main>
        </div>

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
