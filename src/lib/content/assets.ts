import "server-only";

/**
 * Image slots, and what is still a placeholder.
 *
 * The site shipped with no imagery at all, which for a portfolio is a defect
 * rather than restraint: a link to a live URL is a weaker proof than showing
 * the thing and linking it.
 *
 * DriftPilot and Riflessi are real captures of their live sites, taken
 * 2026-09-25 in headless Chrome and saved as WebP. The rest still point at a
 * shared placeholder. TO REPLACE one: drop the real file at its `target` path,
 * change `src` to match, set `width`/`height` to the file's own pixels and
 * `isPlaceholder` to false. A case-study hero renders these at up to ~600px
 * wide, so 1600px covers a 2x screen and anything past it is wasted bytes.
 *
 * The DriftPilot capture stops above the studio site's stat line and results
 * ticker on purpose. Those are the studio's marketing figures, not anything a
 * repository here can back, and a screenshot on this site is still this site
 * making the claim.
 *
 * Do not screenshot internal Convertus or AutoTrader tooling. autosyncmotors.com
 * is a public demo site and is safe to capture — but it sits behind a
 * Cloudflare bot check that blocks headless capture, so those two slots need a
 * screenshot taken in an ordinary browser, cookie banner and chat widget closed.
 */
export interface ImageSlot {
  src: string;
  /** Where the real asset belongs once it exists. */
  target: string;
  alt: string;
  /** Intrinsic pixels, so a frame reserves the image's exact shape before it loads. */
  width: number;
  height: number;
  isPlaceholder: boolean;
}

const PLACEHOLDER = "/work/placeholder-screenshot.svg";

/**
 * Lighthouse scores for driftpilot.ca.
 *
 * NOT CURRENTLY RENDERED. It was in the Measured tile until that tile became a
 * half-height strip with no room for it. The slot is kept because the asset is
 * still worth having — the deck asserts >=95 four times, and a real run is the
 * difference between asserting that and showing it. /work/driftpilot is the
 * obvious home, since that is the page making the assertions. 1200x400, scores
 * legible.
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
 * has no slug. autosyncmotors.com is the public demo of the same platform, so
 * it is the honest thing to show and safe to capture.
 */
export const AUTOSYNC_IMAGE: ImageSlot = {
  src: PLACEHOLDER,
  target: "/work/autosync-hero.png",
  alt: "An AutoSync dealer site — the inventory listing shoppers search",
  width: 800,
  height: 500,
  isPlaceholder: true,
};

/** Hero shot per case study, keyed by slug. */
export const WORK_IMAGES: Record<string, ImageSlot> = {
  driftpilot: {
    src: "/work/driftpilot-hero.webp",
    target: "/work/driftpilot-hero.webp",
    alt: "The DriftPilot studio site, above the fold",
    width: 1120,
    height: 600,
    isPlaceholder: false,
  },
  riflessi: {
    src: "/work/riflessi-hero.webp",
    target: "/work/riflessi-hero.webp",
    // The home page, not a configurator: that is what the capture shows, and
    // alt text describing something the image does not contain is a small lie.
    alt: "The Riflessi Auto Care home page, with the 3D vehicle hero rendered",
    width: 1600,
    height: 1000,
    isPlaceholder: false,
  },
  tadvantage: {
    src: PLACEHOLDER,
    target: "/work/tadvantage-hero.png",
    alt: "An AutoSync dealer site — the vehicle detail page the SEO subsystem generates",
    width: 800,
    height: 500,
    isPlaceholder: true,
  },
};
