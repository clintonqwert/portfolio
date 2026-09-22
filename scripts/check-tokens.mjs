#!/usr/bin/env node
/**
 * Fail the build when the two copies of the palette disagree.
 *
 * The palette lives twice: as CSS custom properties in src/app/globals.css, and
 * as a typed module in src/lib/design-tokens.ts. CLAUDE.md says to change both
 * together, and nothing checked that — so design-tokens.ts went on describing a
 * dark slate rail for weeks after the CSS shipped a light one that flips with
 * the theme. check-contrast.mjs reads only the CSS, so it never noticed.
 *
 * usage: node scripts/check-tokens.mjs
 */
import { readFileSync } from "node:fs";

const css = readFileSync("src/app/globals.css", "utf8");
const ts = readFileSync("src/lib/design-tokens.ts", "utf8");

/** `--color-rail-ink` ↔ `railInk`. */
const camel = (kebab) => kebab.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

/** Custom properties declared inside a given flat block. */
function cssBlock(start) {
  const from = css.indexOf(start);
  if (from === -1) throw new Error(`block not found: ${start}`);
  const body = css.slice(from, css.indexOf("\n}", from));
  return Object.fromEntries(
    [...body.matchAll(/--color-([a-z-]+):\s*(oklch\([^)]+\))/g)].map(([, k, v]) => [
      camel(k),
      v.replace(/\s+/g, " ").trim(),
    ]),
  );
}

/** Entries of a `const <name> = { ... }` object literal in the TS module. */
function tsObject(name) {
  const from = ts.indexOf(`export const ${name}`);
  if (from === -1) throw new Error(`object not found: ${name}`);
  // `colors` closes with `} as const;` and `darkColors` with `};` — take
  // whichever comes first, or the slice runs on into the next object and every
  // light token compares against its dark counterpart.
  const ends = ['\n} as const;', '\n};']
    .map((t) => ts.indexOf(t, from))
    .filter((i) => i !== -1);
  if (ends.length === 0) throw new Error(`unterminated object: ${name}`);
  const body = ts.slice(from, Math.min(...ends));
  return Object.fromEntries(
    [...body.matchAll(/(\w+):\s*"(oklch\([^)]+\))"/g)].map(([, k, v]) => [
      k,
      v.replace(/\s+/g, " ").trim(),
    ]),
  );
}

let failures = 0;

for (const [label, fromCss, fromTs] of [
  ["light", cssBlock("@theme {"), tsObject("colors")],
  ["dark", cssBlock('[data-theme="dark"] {'), tsObject("darkColors")],
]) {
  const names = new Set([...Object.keys(fromCss), ...Object.keys(fromTs)]);
  const bad = [];
  for (const name of [...names].sort()) {
    const a = fromCss[name];
    const b = fromTs[name];
    if (a === undefined) bad.push(`${name}: only in design-tokens.ts (${b})`);
    else if (b === undefined) bad.push(`${name}: only in globals.css (${a})`);
    else if (a !== b) bad.push(`${name}: css ${a} vs ts ${b}`);
  }
  if (bad.length === 0) {
    console.log(`PASS | ${label.padEnd(5)} ${names.size} tokens match`);
  } else {
    failures += bad.length;
    console.error(`FAIL | ${label} palette disagrees:`);
    for (const line of bad) console.error(`     | ${line}`);
  }
}

if (failures > 0) {
  console.error(`\nFAILED: ${failures} token mismatch(es) — change both files together`);
  process.exit(1);
}
console.log("\nPALETTE MIRRORS MATCH");
