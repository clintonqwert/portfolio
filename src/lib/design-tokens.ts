/**
 * Semantic design tokens.
 *
 * MIRROR RULE: these values are duplicated as CSS custom properties in
 * src/app/globals.css. Nothing enforces the mirror, so changing one without the
 * other is a defect that only shows up visually. Change both together.
 *
 * Components use the semantic Tailwind utilities (bg-surface, text-muted,
 * border-line). Raw hex in a component is a defect — see ProjectOS
 * 01-Engineering/coding-standards.md.
 */
export const colors = {
  /** Page background. */
  ground: "#EDEFF1",
  /** Raised panels, tables, cards. */
  surface: "#F7F8F9",
  /** Recessed strips — table captions. */
  sunk: "#E3E7EA",
  /** Primary text. */
  ink: "#14181C",
  /** Secondary text. */
  muted: "#5A646E",
  /** Tertiary text — rails, captions, metadata. */
  faint: "#78838D",
  /** Hairlines. */
  line: "#D3D8DD",
  /** Structural rules — heavier than line. */
  rule: "#C2C9D0",
  /** Links, rail headings, accents. */
  accent: "#0F5C6B",
  /** Passing state in assertion tables. */
  pass: "#2F6B4F",
  /** Measured-but-not-binary state. */
  signal: "#B4621A",
} as const;

/**
 * Families are loaded by next/font in src/app/layout.tsx, which exposes them as
 * --font-archivo / --font-source-serif / --font-plex-mono on <html>. globals.css
 * maps those onto the semantic --font-display / --font-serif / --font-mono.
 */
export const fonts = {
  display: "var(--font-display)",
  serif: "var(--font-serif)",
  mono: "var(--font-mono)",
} as const;

export type ColorToken = keyof typeof colors;
