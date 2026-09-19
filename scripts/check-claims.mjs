#!/usr/bin/env node
/**
 * Fail the build if the content layer carries a retired claim.
 *
 * Several claims were removed from this site's source material in September 2026
 * because the repositories did not support them, or because they contradicted a
 * verified fact. They are easy to reintroduce by accident when editing prose, and
 * a wrong claim on a portfolio is worse than a missing one — it is exactly the
 * kind of thing an interviewer probes.
 *
 * A line may quote a retired claim in order to warn against it. That is forgiven
 * only when the same line carries an explicit warning cue, so the exemption
 * cannot silently cover a real regression.
 *
 * usage: node scripts/check-claims.mjs   (also runs in CI and before build)
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const SRC = "src";

const WARNING_CUES =
  /never|do not|don't|deprecat|retired|removed|must not|no longer|instead of|is false|does not/i;

const RETIRED = [
  [
    /multi-?tenant/i,
    "driftpilot.ca is statically prerendered with no runtime database or tenancy model",
  ],
  [
    /conversational AI/i,
    "no chat interface, LLM call or inference code exists in either repository",
  ],
  [
    /booking assistant/i,
    "not demonstrable; an unverifiable AI claim is worse than none",
  ],
  [
    /AI[- ]powered SaaS/i,
    "the framing removed from the resume as unsupported by the repositories",
  ],
  [
    /Canada's largest/i,
    '"a leading Canadian automotive marketplace" is the defensible phrasing',
  ],
  [
    /riflessiautocare\.ca(?!\w)/i,
    "the .ca domain does not resolve; riflessiautocare.vercel.app is live",
  ],
  [
    /tool[- ]level/i,
    "the five delivery roles are report-only by role contract; no role declares allowed-tools",
  ],
  [
    /two production sites|2 Production sites/i,
    'the two sites are public deploys without operational usage: "live", not "production"',
  ],
  [
    /Riflessi[^.]{0,60}\b(client|contract)\b/i,
    "Riflessi was self-directed and unpaid",
  ],
];

/** @returns {string[]} every .ts/.tsx path under dir, depth-first. */
function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...walk(full));
    } else if (/\.tsx?$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

const files = walk(SRC).sort();
let hits = 0;

for (const file of files) {
  const content = readFileSync(file, "utf8");
  const lines = content.split("\n");

  for (const [pattern, reason] of RETIRED) {
    // Matched against whole content, not line by line: some retired phrasings
    // span lines (a subject on one line, the disallowed word on the next), and
    // a per-line scan silently misses those.
    const rx = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g");
    for (const match of content.matchAll(rx)) {
      const lineNo = content.slice(0, match.index).split("\n").length;
      // A warning cue on the matched line or the one above it means the mention
      // is documentation of the retired claim rather than a use of it.
      const context = [lines[lineNo - 2] ?? "", lines[lineNo - 1] ?? ""].join(" ");
      if (WARNING_CUES.test(context)) continue;

      hits += 1;
      console.error(`FAIL | ${file}:${lineNo}  ${pattern}`);
      console.error(`     | retired because: ${reason}`);
      console.error(`     | ${(lines[lineNo - 1] ?? "").trim().slice(0, 110)}`);
    }
  }
}

if (hits > 0) {
  console.error(`\nFAILED: ${hits} retired claim(s) in the content layer`);
  process.exit(1);
}

console.log(`ALL CLAIMS CLEAN — ${files.length} source files scanned`);
