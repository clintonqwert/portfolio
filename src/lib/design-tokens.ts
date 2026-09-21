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
 * Strategy: Restrained — a near-neutral navy-tinted workspace, one teal accent,
 * hierarchy carried by elevation rather than by colour. Canvas chroma leans to
 * the navy ink and never to warm; a warm near-white is an anti-reference in
 * PRODUCT.md.
 */
export const colors = {
  /** Workspace background. Sits one step below the panels. */
  canvas: "oklch(0.976 0.004 260)",
  /** Raised panels. */
  panel: "oklch(1 0 0)",
  /** Recessed strips — table captions. */
  sunk: "oklch(0.950 0.006 260)",

  /** Fixed navigation rail. Flips with the theme. */
  rail: "oklch(0.945 0.006 260)",
  railLine: "oklch(0.882 0.009 260)",
  railInk: "oklch(0.241 0.068 261)",
  railMuted: "oklch(0.470 0.040 263)",

  /** Primary text. #0b1e3f. */
  ink: "oklch(0.241 0.068 261)",
  /** Secondary text. */
  muted: "oklch(0.470 0.040 263)",
  /** Metadata only. */
  faint: "oklch(0.512 0.034 263)",

  /** Hairlines. */
  line: "oklch(0.908 0.008 260)",
  /** Structural rules. */
  rule: "oklch(0.848 0.011 260)",

  /** #0F5C6B, preserved from the previous design. */
  accent: "oklch(0.439 0.073 215)",
  accentSoft: "oklch(0.958 0.020 215)",
  /** Tracks the rail, which is light in this theme. */
  accentBright: "oklch(0.439 0.073 215)",
  pass: "oklch(0.470 0.098 152)",
  signal: "oklch(0.540 0.128 52)",
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
  "2xs": "11px",
  xs: "12px",
  sm: "13px",
  base: "15px",
  lg: "19px",
  xl: "23px",
  "2xl": "29px",
  "3xl": "37px",
  "4xl": "46px",
} as const;

/** 4pt spacing scale. */
export const space = {
  1: "2px",
  2: "4px",
  3: "8px",
  4: "12px",
  5: "16px",
  6: "24px",
  7: "32px",
  8: "48px",
} as const;

/** Corner radii. */
export const radius = {
  sm: "8px",
  md: "10px",
  lg: "12px",
  xl: "14px",
  "2xl": "22px",
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
 * Dark theme overrides. Mirrors the [data-theme="dark"] block in globals.css.
 * Desaturated navy surfaces rather than inverted values; the accent lifts
 * because the light-mode teal reads muddy on a dark surface.
 */
export const darkColors: Record<ColorToken, string> = {
  canvas: "oklch(0.185 0.018 262)",
  panel: "oklch(0.232 0.020 262)",
  sunk: "oklch(0.158 0.016 262)",
  rail: "oklch(0.145 0.016 262)",
  railLine: "oklch(0.292 0.020 262)",
  railInk: "oklch(0.952 0.006 260)",
  railMuted: "oklch(0.778 0.014 260)",
  ink: "oklch(0.952 0.006 260)",
  muted: "oklch(0.778 0.014 260)",
  faint: "oklch(0.660 0.016 260)",
  line: "oklch(0.318 0.018 262)",
  rule: "oklch(0.378 0.020 262)",
  accent: "oklch(0.80 0.085 198)",
  accentSoft: "oklch(0.30 0.035 200)",
  accentBright: "oklch(0.83 0.09 198)",
  pass: "oklch(0.78 0.11 155)",
  signal: "oklch(0.80 0.12 62)",
};

export type ColorToken = keyof typeof colors;
