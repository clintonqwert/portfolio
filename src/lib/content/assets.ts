import "server-only";

/**
 * Image slots, and what is still a placeholder.
 *
 * The site shipped with no imagery at all, which for a portfolio is a defect
 * rather than restraint: a link to a live URL is a weaker proof than showing
 * the thing and linking it.
 *
 * Every entry below currently points at a shared placeholder. TO REPLACE: drop
 * the real file at the `target` path, change `src` to match it, and set
 * `isPlaceholder` to false. Screenshots should be 1600x1000 (16:10) — the frame
 * renders them at up to 320px wide, so anything past 640px is wasted bytes.
 *
 * Do not screenshot internal Convertus or AutoTrader tooling. autosyncmotors.com
 * is a public demo site and is safe to capture.
 */
export interface ImageSlot {
  src: string;
  /** Where the real asset belongs once it exists. */
  target: string;
  alt: string;
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
  isPlaceholder: true,
};

/** Hero shot per case study, keyed by slug. */
export const WORK_IMAGES: Record<string, ImageSlot> = {
  driftpilot: {
    src: PLACEHOLDER,
    target: "/work/driftpilot-hero.png",
    alt: "The DriftPilot studio site, above the fold",
    isPlaceholder: true,
  },
  riflessi: {
    src: PLACEHOLDER,
    target: "/work/riflessi-hero.png",
    alt: "Riflessi Auto Care, showing the configurator",
    isPlaceholder: true,
  },
  tadvantage: {
    src: PLACEHOLDER,
    target: "/work/tadvantage-hero.png",
    alt: "An AutoSync dealer site — the vehicle detail page the SEO subsystem generates",
    isPlaceholder: true,
  },
};
