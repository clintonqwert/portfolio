#!/usr/bin/env node
/**
 * Fail the build if a committed color pair drops below WCAG 2.2 AA.
 *
 * PRODUCT.md commits to AA "verified, not assumed". Verifying in a browser needs
 * a running server and a DOM walk; the palette is the actual source of risk, so
 * this checks the pairs directly from globals.css. It caught `faint` at 3.59:1
 * against the canvas — used for 10.5px metadata, which needs 4.5:1, not the
 * large-text 3:1.
 *
 * usage: node scripts/check-contrast.mjs
 */
import { readFileSync } from "node:fs";

/** OKLCH → sRGB (0-255), gamut-clipped. */
function oklchToSrgb(L, C, H) {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);

  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;

  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];

  return lin.map((v) => {
    const x = Math.min(1, Math.max(0, v));
    const enc = x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
    return Math.round(enc * 255);
  });
}

const toLinear = (v) => {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

const luminance = ([r, g, b]) =>
  0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

const contrast = (fg, bg) => {
  const a = luminance(fg);
  const b = luminance(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};

const css = readFileSync("src/app/globals.css", "utf8");

/** Tokens declared inside a given block, e.g. `@theme` or `[data-theme="dark"]`. */
function tokensIn(blockStart) {
  const from = css.indexOf(blockStart);
  if (from === -1) throw new Error(`block not found: ${blockStart}`);
  // Blocks here are flat, so the first closing brace at column 0 ends them.
  const to = css.indexOf("\n}", from);
  const body = css.slice(from, to);
  return Object.fromEntries(
    [...body.matchAll(/--color-([a-z-]+): oklch\(([^)]+)\)/g)].map(([, name, v]) => [
      name,
      oklchToSrgb(...v.trim().split(/\s+/).map(Number)),
    ]),
  );
}

const light = tokensIn("@theme {");
// Dark declares only what it overrides; anything unset falls through to light.
const dark = { ...light, ...tokensIn('[data-theme="dark"] {') };

const hex = (c) => "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");

/**
 * [foreground, background, minimum].
 * 4.5 is body/small text. 3.0 applies only where the token is used exclusively
 * at ≥24px, or ≥18.66px bold — none currently are, so everything is 4.5.
 */
const PAIRS = [
  ["ink", "canvas", 4.5],
  ["muted", "canvas", 4.5],
  ["faint", "canvas", 4.5],
  ["faint", "panel", 4.5],
  ["accent", "canvas", 4.5],
  ["accent", "panel", 4.5],
  ["pass", "panel", 4.5],
  ["signal", "panel", 4.5],
  ["rail-ink", "rail", 4.5],
  ["rail-muted", "rail", 4.5],
  ["accent-bright", "rail", 4.5],
  ["canvas", "ink", 4.5],
];

let failures = 0;

/** Both themes are checked independently; dark is never inferred from light. */
for (const [themeName, tokens] of [
  ["light", light],
  ["dark", dark],
]) {
  console.log(`── ${themeName} ──`);
  for (const [fgName, bgName, need] of PAIRS) {
    const fg = tokens[fgName];
    const bg = tokens[bgName];
    if (!fg || !bg) {
      failures += 1;
      console.error(`FAIL | unknown token in pair ${fgName} on ${bgName}`);
      continue;
    }
    const ratio = contrast(fg, bg);
    const ok = ratio >= need;
    if (!ok) failures += 1;
    console.log(
      `${ok ? "PASS" : "FAIL"} | ${`${fgName} on ${bgName}`.padEnd(28)} ` +
        `${ratio.toFixed(2).padStart(5)}:1  (need ${need})  ${hex(fg)}`,
    );
  }
  console.log();
}

if (failures > 0) {
  console.error(`FAILED: ${failures} pair(s) below AA`);
  process.exit(1);
}
console.log("ALL PAIRS PASS WCAG 2.2 AA IN BOTH THEMES");
