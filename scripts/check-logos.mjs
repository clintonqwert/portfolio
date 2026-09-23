#!/usr/bin/env node
/**
 * Fail the build when the logo set has drifted from the skills it serves.
 *
 * Three things have to agree and nothing used to check them: the skill list in
 * getSkillMarquee(), the label→slug map in scripts/generate-logos.mjs, and the
 * committed src/lib/logos.ts it produces. Adding a skill gave it no mark,
 * silently. Editing the map without re-running the generator left a stale file,
 * also silently.
 *
 * This regenerates into memory and compares, then checks every generated mark
 * is still wanted by a skill that exists.
 *
 * usage: node scripts/check-logos.mjs
 */
import { readFileSync } from "node:fs";
import { MAP } from "./generate-logos.mjs";
import * as si from "simple-icons";

const key = (slug) => "si" + slug.charAt(0).toUpperCase() + slug.slice(1);

/** String literals inside the getSkillMarquee return array. */
function skillsFromContent() {
  const src = readFileSync("src/lib/content/practice.ts", "utf8");
  const from = src.indexOf("export async function getSkillMarquee");
  const open = src.indexOf("return [", from);
  const close = src.indexOf("];", open);
  return [...src.slice(open, close).matchAll(/"([^"]+)"/g)].map((m) => m[1]);
}

/** Keys of the committed LOGOS record. */
function committed() {
  const src = readFileSync("src/lib/logos.ts", "utf8");
  return new Map(
    [...src.matchAll(/^  "([^"]+)": "([^"]*)",$/gm)].map((m) => [m[1], m[2]]),
  );
}

const skills = skillsFromContent();
const have = committed();
let failures = 0;

// 1. Everything the map claims is in the file, byte for byte.
for (const [label, slug] of Object.entries(MAP)) {
  const icon = si[key(slug)];
  if (!icon) {
    failures += 1;
    console.error(`FAIL | simple-icons has no "${slug}" for ${label}`);
    continue;
  }
  if (!have.has(label)) {
    failures += 1;
    console.error(`FAIL | ${label} is mapped but missing from logos.ts — run npm run gen:logos`);
  } else if (have.get(label) !== icon.path) {
    failures += 1;
    console.error(`FAIL | ${label} path is stale in logos.ts — run npm run gen:logos`);
  }
}

// 2. Nothing is shipped that no skill asks for.
for (const label of have.keys()) {
  if (!skills.includes(label)) {
    failures += 1;
    console.error(`FAIL | logos.ts ships "${label}" but no skill uses it — dead bytes`);
  }
}

// 3. A skill with no mark is allowed, but say which, so it stays a decision.
const bare = skills.filter((s) => !have.has(s));
if (bare.length > 0) {
  console.log(`NOTE | no mark, rendered as label: ${bare.join(", ")}`);
}

if (failures > 0) {
  console.error(`\nFAILED: ${failures} logo drift problem(s)`);
  process.exit(1);
}
console.log(`PASS | ${have.size} marks match the generator and the skill list`);
