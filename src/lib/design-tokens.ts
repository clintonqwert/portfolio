/**
 * Semantic design tokens.
 *
 * MIRROR RULE: these values are duplicated as CSS custom properties in
 * src/app/globals.css. Nothing enforced the mirror, so it drifted — this file
 * still described a dark slate rail long after the CSS shipped a light one that
 * flips with the theme. scripts/check-tokens.mjs now compares the two and fails
 * the build on a mismatch. Change both together.
 *
 * Components use the semantic Tailwind utilities (bg-panel, text-muted,
 * border-line). Raw hex in a component is a defect.
 *
 * Strategy: monochrome. Every value is chroma 0 on purpose — black ink, white
 * paper, grey for what recedes. Taken from Clinton's own earlier design for
 * this site, where colour arrives only through photography and the interface
 * never competes with it. Hierarchy is weight, case and rule, not hue.
 */
export const colors = {
  /** Workspace background. Sits one step below the panels. */
  canvas: "oklch(1 0 0)",
  /** Raised panels. */
  panel: "oklch(1 0 0)",
  /** Recessed strips — table captions. */
  sunk: "oklch(0.963 0 0)",

  /** Fixed navigation rail. Flips with the theme. */
  rail: "oklch(1 0 0)",
  railLine: "oklch(0.78 0 0)",
  railInk: "oklch(0.17 0 0)",
  railMuted: "oklch(0.48 0 0)",

  /** Primary text. #0b1e3f. */
  ink: "oklch(0.17 0 0)",
  /** Secondary text. */
  muted: "oklch(0.48 0 0)",
  /** Metadata only. */
  faint: "oklch(0.52 0 0)",

  /** Hairlines. */
  line: "oklch(0.80 0 0)",
  /** Structural rules. */
  rule: "oklch(0.17 0 0)",

  /** #0F5C6B, preserved from the previous design. */
  accent: "oklch(0.17 0 0)",
  accentSoft: "oklch(0.945 0 0)",
  /** Tracks the rail, which is light in this theme. */
  accentBright: "oklch(0.17 0 0)",
  pass: "oklch(0.48 0 0)",
  signal: "oklch(0.17 0 0)",
} as const;

/**
 * Families are loaded by next/font in src/app/layout.tsx, which exposes them as
 * --font-archivo / --font-plex-mono on <html>. One family carries display and
 * body with weight contrast; mono is reserved for data and labels.
 */
export const fonts = {
  display: "var(--font-display)",
  body: "var(--font-body)",
  mono: "var(--font-mono)",
} as const;

/**
 * Type scale. 15px base at 1.5; a 1.25 ratio above it so headings read as
 * headings, and a dense 11–13px band below it for labels and metadata.
 */
export const text = {
  "3xs": "10px",
  "2xs": "11px",
  xs: "12px",
  sm: "13px",
  md: "14px",
  base: "15px",
  lg: "17px",
  xl: "19px",
  "2xl": "23px",
  "3xl": "29px",
  "4xl": "37px",
  "5xl": "46px",
} as const;

/**
 * Spacing is Tailwind's own scale on a 4px base unit: p-2 is 8px, gap-3 is
 * 12px. Recorded here for reference, not for import — there is deliberately no
 * second scale left to keep in sync.
 */
export const spacingBase = "4px";

/** Corner radii. */
export const radius = {
  sm: "8px",
  md: "10px",
  lg: "12px",
  xl: "14px",
  "2xl": "22px",
} as const;

/** Surface drawing. The weight of the line a panel is ruled with. */
export const surface = {
  border: "1px",
} as const;

/**
 * Motion durations. Four steps that read as different from each other; the
 * supplied spec's 220/240 and 560/620/750 were indistinguishable neighbours.
 */
export const duration = {
  instant: "140ms",
  fast: "220ms",
  normal: "340ms",
  slow: "560ms",
} as const;

/**
 * Media conditions that script needs as well as CSS — read by matchMedia or
 * written into an image's `sizes`, so spelled once here rather than in each.
 *
 * `stacked` is everything below Tailwind's `lg` (64rem), where the rail gives
 * way to the slim bar and the deck's tiles stack: the phone profile card, and
 * the screenshots that pan as they scroll past. In rem like every breakpoint
 * on the site (see globals.css), so a reader with a larger default font gets
 * this layout later, and the pan, its loader and the image sizes move with
 * the lg: utilities instead of staying at 1024px while the layout does not.
 *
 * CSS cannot read a variable in a media query, so globals.css writes
 * `(width < 64rem)` out where the pan needs it, each with a pointer back here.
 * check:behaviour holds the two together, at a 20px default font as well.
 */
export const media = {
  stacked: "(width < 64rem)",
} as const;

/**
 * Dark theme overrides. Mirrors the [data-theme="dark"] block in globals.css.
 * Desaturated navy surfaces rather than inverted values; the accent lifts
 * because the light-mode teal reads muddy on a dark surface.
 */
export const darkColors: Record<ColorToken, string> = {
  canvas: "oklch(0.145 0 0)",
  panel: "oklch(0.145 0 0)",
  sunk: "oklch(0.195 0 0)",
  rail: "oklch(0.145 0 0)",
  railLine: "oklch(0.38 0 0)",
  railInk: "oklch(0.975 0 0)",
  railMuted: "oklch(0.72 0 0)",
  ink: "oklch(0.975 0 0)",
  muted: "oklch(0.72 0 0)",
  faint: "oklch(0.665 0 0)",
  line: "oklch(0.36 0 0)",
  rule: "oklch(0.975 0 0)",
  accent: "oklch(0.975 0 0)",
  accentSoft: "oklch(0.255 0 0)",
  accentBright: "oklch(0.975 0 0)",
  pass: "oklch(0.72 0 0)",
  signal: "oklch(0.975 0 0)",
};

export type ColorToken = keyof typeof colors;
