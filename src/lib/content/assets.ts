import "server-only";

import type { ImageSlot } from "@/types/content";

export type { ImageSlot };

/**
 * Screenshots, and where each one came from.
 *
 * The site shipped with no imagery at all, which for a portfolio is a defect
 * rather than restraint: a link to a live URL is a weaker proof than showing
 * the thing and linking it.
 *
 * Every slot below is now a real capture of a public page, saved as WebP:
 *  - driftpilot.ca and riflessiautocare.vercel.app, taken 2026-09-25 in
 *    headless Chrome.
 *  - tadvantage.ca and autosyncmotors.com, supplied by the owner on
 *    2026-09-25. Both sites sit behind bot checks that refuse headless
 *    capture. The originals are full-page 2x PNGs (27 MB between them) and
 *    live in profile/work-originals/, out of this public repository; what
 *    ships is cropped from them.
 *
 * Crops are the page's first screen for a hero (16:10, 1600px — a hero
 * renders at up to ~600px wide, so that covers a 2x screen) and the page's
 * content column for a figure (1440px, which is the column at 2x). The
 * AutoSync crops stop short of the site's chat widget, which is chrome, not
 * the platform.
 *
 * Marketing figures inside a screenshot follow one rule, set by whose they are:
 *  - Our own are cropped out. The DriftPilot capture stops above the studio
 *    site's stat line and results ticker: those are the studio's figures, no
 *    repository here backs them, and a screenshot of your own site on your own
 *    portfolio is you making the claim.
 *  - A third party's product copy may appear, captioned as theirs. The
 *    Tadvantage features grid is AutoTrader's own marketing for its platform
 *    (DriftPilot has no relation to it), so its figures are AutoTrader's
 *    claims about AutoTrader's product, and the caption says so.
 *
 * TO REPLACE one: drop the file in public/work/, point `src` at it, set
 * `width`/`height` to its own pixels, and drop `target` if it was a
 * placeholder. Do not screenshot internal
 * Convertus or AutoTrader tooling — only the public sites.
 */

const TADVANTAGE_SITE = { label: "tadvantage.ca", href: "https://tadvantage.ca/" } as const;

/**
 * Lighthouse scores for driftpilot.ca.
 *
 * NOT CURRENTLY RENDERED, and still a placeholder. It was in the Measured tile
 * until that tile became a half-height strip with no room for it. The slot is
 * kept because the asset is still worth having — the deck asserts >=95 four
 * times, and a real run is the difference between asserting that and showing
 * it. /work/driftpilot is the obvious home. 1200x400, scores legible.
 */
export const SCORES_IMAGE: ImageSlot = {
  src: "/work/placeholder-scores.svg",
  target: "/work/driftpilot-lighthouse.png",
  alt: "Lighthouse scores for driftpilot.ca: performance, accessibility, best practices and SEO",
  width: 1200,
  height: 400,
  isPlaceholder: true,
};

/**
 * AutoSync, for the AutoTrader tile and /autotrader.
 *
 * Not in WORK_IMAGES because AutoTrader is a role rather than a case study and
 * has no slug. autosyncmotors.com is the public demo of the platform, so it is
 * the honest thing to show.
 */
export const AUTOSYNC_IMAGE: ImageSlot = {
  src: "/work/autosync-hero.webp",
  alt: "The AutoSync Motors demo dealer site, above the fold",
  width: 1600,
  height: 1000,
  isPlaceholder: false,
  source: { label: "autosyncmotors.com", href: "https://www.autosyncmotors.com/" },
};

/** The inventory listing on the same demo — shown in /autotrader's platform chapter. */
export const AUTOSYNC_INVENTORY_IMAGE: ImageSlot = {
  src: "/work/autosync-inventory.webp",
  // All inventory, not the used listing: the capture reads "Véhicules à
  // Québec — 130 Items Matching" with new stock in it, which is the count the
  // homepage's Search (130) opens. /vehicles/used/ is a different page (88
  // items, "Véhicules d'occasion"), and linking there sent the one-click check
  // somewhere other than what the picture shows.
  alt: "The AutoSync demo's inventory listing: filters, top vehicles, and the vehicle card grid with finance and lease payments",
  width: 1440,
  height: 1720,
  isPlaceholder: false,
  source: {
    label: "autosyncmotors.com/vehicles",
    href: "https://www.autosyncmotors.com/vehicles/",
  },
};

/**
 * Tadvantage's own product site, for the two chapters they illustrate: the
 * feature list the website packages are sold on, and the SEO product page.
 */
export const TADVANTAGE_FEATURES_IMAGE: ImageSlot = {
  src: "/work/tadvantage-features.webp",
  alt: "The Explore Features grid on tadvantage.ca: Quick View VDP, AutoTrader.ca IQ Badging, Video Solutions, Reputation Enhancement, Branded Overlays, Promo Builder, My Garage, and Video Fusion",
  width: 1440,
  height: 880,
  isPlaceholder: false,
  source: TADVANTAGE_SITE,
};

export const TADVANTAGE_SEO_IMAGE: ImageSlot = {
  src: "/work/tadvantage-seo.webp",
  alt: "The SEO Solutions page on tadvantage.ca, with its SEO features: custom content, optimized vehicle landing pages, and blog posts",
  width: 1440,
  height: 1540,
  isPlaceholder: false,
  source: TADVANTAGE_SITE,
};

/** Hero shot per case study, keyed by slug. */
export const WORK_IMAGES: Record<string, ImageSlot> = {
  driftpilot: {
    src: "/work/driftpilot-hero.webp",
    alt: "The DriftPilot studio site, above the fold",
    width: 1120,
    height: 600,
    isPlaceholder: false,
    source: { label: "driftpilot.ca", href: "https://driftpilot.ca" },
  },
  riflessi: {
    src: "/work/riflessi-hero.webp",
    // The home page, not a configurator: that is what the capture shows, and
    // alt text describing something the image does not contain is a small lie.
    alt: "The Riflessi Auto Care home page, with the 3D vehicle hero rendered",
    width: 1600,
    height: 1000,
    isPlaceholder: false,
    source: {
      label: "riflessiautocare.vercel.app",
      href: "https://riflessiautocare.vercel.app",
    },
  },
  tadvantage: {
    src: "/work/tadvantage-hero.webp",
    alt: "tadvantage.ca, the platform's product site, above the fold",
    width: 1600,
    height: 1000,
    isPlaceholder: false,
    source: TADVANTAGE_SITE,
  },
  mygarage: {
    src: "/work/mygarage-hero.webp",
    alt: "The MyGarage page on the AutoSync demo: two viewed vehicles with price alerts, and the garage drawer open beside them",
    width: 1600,
    height: 1118,
    isPlaceholder: false,
    source: {
      label: "autosyncmotors.com/garage/viewed",
      href: "https://www.autosyncmotors.com/garage/viewed/",
    },
  },
};
