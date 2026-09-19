/**
 * Semantic design tokens.
 *
 * MIRROR RULE: these values are duplicated as CSS custom properties in
 * src/app/globals.css. Nothing enforces the mirror, so changing one without the
 * other is a defect that only shows up visually. Change both together.
 *
 * Components use the semantic Tailwind utilities (bg-panel, text-muted,
 * border-line). Raw hex in a component is a defect.
 *
 * Strategy: Committed — a dark slate rail against a true neutral canvas. Canvas
 * chroma is 0 on purpose; a warm near-white is an anti-reference in PRODUCT.md.
 */
export const colors = {
  /** Workspace background. Chroma 0 — never warm-tinted. */
  canvas: "oklch(0.982 0 0)",
  /** Raised panels. */
  panel: "oklch(1 0 0)",
  /** Recessed strips — table captions. */
  sunk: "oklch(0.955 0.002 220)",

  /** Fixed navigation rail. */
  rail: "oklch(0.215 0.028 225)",
  railLine: "oklch(0.32 0.025 225)",
  railInk: "oklch(0.93 0.006 220)",
  railMuted: "oklch(0.68 0.015 220)",

  /** Primary text. */
  ink: "oklch(0.225 0.018 230)",
  /** Secondary text. */
  muted: "oklch(0.47 0.016 230)",
  /** Metadata only — sits at the AA floor on canvas. */
  faint: "oklch(0.515 0.015 230)",

  /** Hairlines. */
  line: "oklch(0.905 0.005 220)",
  /** Structural rules. */
  rule: "oklch(0.845 0.008 220)",

  /** #0F5C6B, preserved from the previous design. */
  accent: "oklch(0.425 0.058 206)",
  accentSoft: "oklch(0.955 0.018 206)",
  /** Lifted so it stays legible on the dark rail. */
  accentBright: "oklch(0.775 0.085 198)",
  pass: "oklch(0.475 0.095 152)",
  signal: "oklch(0.545 0.125 52)",
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

export type ColorToken = keyof typeof colors;
