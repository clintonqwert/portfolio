import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "./globals.css";

import { SiteRail } from "@/components/layout/site-rail";
import { ThemeScript } from "@/components/layout/theme-script";
import { getNavLinks } from "@/lib/content/navigation";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, buildMetadata } from "@/lib/seo";

/*
  Archivo as a variable font with its width axis, not four static weights.
  The display face in the reference design is wide and blocky — squared bowls,
  flat terminals — which `wdth` reaches without shipping a second family.
  (The resume pipeline in profile/ keeps its own static TTFs: Chrome embeds
  variable fonts as Type3 in a PDF, which does not extract. That is a print
  problem only and does not apply here.)
*/
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
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
    // suppressHydrationWarning: ThemeScript sets data-theme before React runs,
    // so the server-rendered <html> deliberately differs from the client's.
    <html lang="en" className={`${archivo.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      {/*
        lg:overflow-hidden is what makes the dashboard viewport-fit: at desktop
        widths the document itself cannot scroll, and any tile that needs more
        room scrolls inside its own box. Below lg the page scrolls normally.

        <main> takes the scroll instead of the document so the rail stays put.
        The deck never uses it — it fits by construction — but a case study on a
        1280px laptop does, and without it the prose had nowhere to go but
        sideways, 307px past the edge of the page.
      */}
      <body className="min-h-dvh bg-canvas antialiased lg:h-dvh lg:overflow-hidden">
        <a
          href="#main"
          className="sr-only rounded-md bg-ink px-4 py-2 text-canvas focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[var(--z-skip)]"
        >
          Skip to content
        </a>

        <SiteRail links={navLinks} />

        {/* The rail's own border-r frames the left edge; this is its mirror
            on the right, so the whole >=1024px viewport reads as one ruled
            page. Below that the rail itself is hidden, so this hides too. */}
        <div aria-hidden="true" className="frame-line hidden lg:block" />

        <div className="lg:h-dvh lg:pl-[236px]">
          <main id="main" className="lg:h-full lg:overflow-y-auto">
            {children}
          </main>
        </div>

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
