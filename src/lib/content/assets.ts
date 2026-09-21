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
 * Lighthouse scores for driftpilot.ca, shown in the Measured tile.
 *
 * This is the highest-value asset on the list: the deck asserts >=95 four
 * times, and a real run turns four assertions into evidence, which is the
 * premise the whole site rests on. 1200x400, scores legible.
 */
export const SCORES_IMAGE: ImageSlot = {
  src: "/work/placeholder-scores.svg",
  target: "/work/driftpilot-lighthouse.png",
  alt: "Lighthouse scores for driftpilot.ca: performance, accessibility, best practices and SEO",
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
