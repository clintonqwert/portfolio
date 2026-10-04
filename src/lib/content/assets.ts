import "server-only";

import { REPO_HREF } from "@/lib/content/profile";
import type { DeckPreview, ImageSlot, VideoSlot } from "@/types/content";

export type { ImageSlot };

/**
 * Screenshots, and where each one came from.
 *
 * The site shipped with no imagery at all, which for a portfolio is a defect
 * rather than restraint: a link to a live URL is a weaker proof than showing
 * the thing and linking it.
 *
 * Every slot below is now a real capture of a public page, saved as WebP:
 *  - driftpilot.ca, taken 2026-09-25 in headless Chrome.
 *  - riflessiautocare.ca: the hero and the deck window re-taken 2026-09-28,
 *    after the site moved to its own domain and gained its header mark.
 *    The deck's full-page preview is still the 2026-09-25 capture: a
 *    full-page capture of today's scroll sequence renders its acts blank,
 *    because their reveals only fire as a visitor scrolls.
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
 * Lighthouse scores for driftpilot.ca, on /work/driftpilot.
 *
 * A real run, not a mock-up: DriftPilot's own gate re-run on 2026-09-26 with
 * the repository's lighthouserc.json (desktop preset, three runs a route)
 * against a production build of its main branch at 14f649f, on this machine
 * rather than a CI runner. Its CI keeps reports only when a run fails, so
 * there was no CI report to capture. This is the homepage's median run; all
 * nine runs across the three gated routes passed every budget. The report
 * header, uncropped, shows the local URL it was run against.
 *
 * To refresh: build driftpilot-site, serve it, `lhci collect` the three
 * routes with --settings.preset=desktop, `lhci assert` with its config, and
 * capture the median report's header at 720px wide, 2x.
 */
export const SCORES_IMAGE: ImageSlot = {
  src: "/work/driftpilot-lighthouse.webp",
  alt: "Lighthouse report header for a production build of driftpilot.ca: Performance 100, Accessibility 100, Best Practices 96, SEO 100",
  width: 1440,
  height: 284,
  isPlaceholder: false,
  source: {
    label: "lighthouserc.json",
    href: `${REPO_HREF.driftpilot}/blob/main/lighthouserc.json`,
  },
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

/**
 * Riflessi's scroll-driven sequence, recorded — the reason the site carries a
 * 3D model at all, which no screenshot can show.
 *
 * A screen recording of the live homepage, not a render or a mock-up: Chrome
 * on this machine (Apple M4, WebGL on the GPU, so the capability gate let the
 * scene load, as it would for a visitor), 1280x720, scrolled by wheel so the
 * site's own smooth scrolling paced it, from the first act to the last, on
 * 2026-09-26. Played at twice the speed it was scrolled — the motion follows
 * scroll position, not a clock, so that is a faster scroll, not a different
 * animation. H.264, 15 s, 2.2 MB; the poster is its first frame.
 *
 * Kept in git while it is the only one: every re-recording stays in the
 * repository's history for good, which one 2 MB file can afford and a set of
 * them cannot. The second recording moves recordings to Vercel Blob (or Git
 * LFS), addressed by `src` as this one is, so no component changes.
 */
export const RIFLESSI_SCROLL_VIDEO: VideoSlot = {
  src: "/work/riflessi-scroll.mp4",
  poster: "/work/riflessi-scroll-poster.webp",
  label:
    "Screen recording of the Riflessi Auto Care homepage scrolling through its seven acts: the camera moves around the car to a new angle for each, and the light and the paint's finish change with it",
  width: 1280,
  height: 720,
  source: { label: "riflessiautocare.ca", href: "https://riflessiautocare.ca/" },
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
      label: "riflessiautocare.ca",
      href: "https://riflessiautocare.ca",
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

/**
 * Whole-page previews for the deck tiles, keyed by slug (AutoTrader, which has
 * no slug, as "autotrader").
 *
 * A tile shows a fixed window onto the top of the page and pans down it on
 * hover, like scrolling the site — so these are full-page captures rather
 * than the 16:10 heroes above.
 *
 * 1200px wide at q82, downsampled from 2x sources. A whole desktop page in a
 * ~450px window is nearly all fine text, so sharpness is the whole job: the
 * first cut was 800px from 1x captures at q68, which the widest window had
 * to upscale and which then lost a second round to the optimizer's q75 —
 * that is what read as blur. TileShot asks for q90 (see next.config.ts).
 *
 *  - Tadvantage and AutoSync are the owner's full-page 2x originals, the
 *    AutoSync one cropped at the right edge to keep its chat widget out.
 *  - Riflessi was captured at 1440 wide and 2x in headless Chrome, in bands
 *    stitched top to bottom — one page, contiguous — and cut at the end of
 *    its gallery.
 *  - DriftPilot is two cuts of the same full-page 2x capture, joined on the
 *    black between them: the hero down to just above its stat line, then "What we
 *    build" through the process section. Left out are the results ticker and
 *    "The work." case results — the studio's own marketing figures, which the
 *    screenshot rule above keeps off this site, pan or no pan.
 */
export const DECK_PREVIEWS: Record<string, DeckPreview> = {
  driftpilot: preview("driftpilot", 2790, {
    alt: "The DriftPilot studio site, from the hero down through its services and delivery process",
    source: { label: "driftpilot.ca", href: "https://driftpilot.ca" },
  }),
  riflessi: preview("riflessi", 6800, {
    alt: "The Riflessi Auto Care home page, from the 3D hero down through its services and the bay",
    source: {
      label: "riflessiautocare.ca",
      href: "https://riflessiautocare.ca",
    },
  }),
  tadvantage: preview("tadvantage", 2052, {
    alt: "The tadvantage.ca home page, top to bottom",
    source: TADVANTAGE_SITE,
  }),
  autotrader: preview("autosync", 1881, {
    alt: "The AutoSync Motors demo dealer site, top to bottom",
    source: { label: "autosyncmotors.com", href: "https://www.autosyncmotors.com/" },
  }),
};

/**
 * One deck preview from its two files: `<name>-window.webp`, the page's first
 * 780px (at 1200 wide, a 0.65 ratio — taller than any window the deck draws,
 * 268×173 at 1440 being the squarest), and `<name>-preview.webp`, the page.
 * At rest a tile shows only the window: measured at 1728@2x, fetching all four
 * whole pages up front cost 598 kB for the ~130px strips on show.
 */
function preview(
  name: string,
  pageHeight: number,
  meta: Pick<ImageSlot, "alt" | "source">,
): DeckPreview {
  return {
    window: {
      src: `/work/${name}-window.webp`,
      width: 1200,
      height: 780,
      isPlaceholder: false,
      ...meta,
    },
    page: {
      src: `/work/${name}-preview.webp`,
      width: 1200,
      height: pageHeight,
      isPlaceholder: false,
      ...meta,
    },
  };
}
