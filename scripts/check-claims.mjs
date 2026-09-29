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

/**
 * The one place a retired claim may appear as rendered copy: a closed gap,
 * shown struck through under its closed date. Only rules marked
 * `quotableWhenClosed` are exempt there, so an unrelated retired claim still
 * fails in this file, and the same words in an open gap fail everywhere else.
 */
const CLOSED_GAPS_FILE = join("src", "lib", "content", "closed-gaps.ts");

/** A line comment, or the first line of a block comment. */
const COMMENT_LINE = /^\s*(\/\/|\/\*|\*|\{\/\*)/;

/** Where the block comments sit in a file, as [start, end) offsets. */
function blockComments(content) {
  return [...content.matchAll(/\/\*[\s\S]*?\*\//g)].map((m) => [m.index, m.index + m[0].length]);
}

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
  [
    // The claim, not the word: "a Redis cluster in staging" and "deliberately
    // not a cluster in production" are both true and must pass.
    /(?<!not an? )\b(Redis )?clusters? (in|for|across) production|against shared Redis clusters/i,
    "production ran on a dedicated Redis host, deliberately not a cluster; clusters were dev and staging",
  ],
  [
    /near[- ]zero downtime|downtime[^.]{0,40}\b(near[- ]zero|to zero)|zero downtime|~0 (network-level )?downtime|observed downtime/i,
    "no source backs a downtime figure; the repository's churn record carries the caching story",
  ],
  [
    /\b22 reverts|\b73 commits touched/i,
    "a keyword-search count the evidence said to check before quoting, and never checked line by line",
  ],
  [
    /blocks? (the |a )?merges?|merge blocked/i,
    "nothing requires DriftPilot's Lighthouse check before merging: GitHub applies no rules or protection to main (2026-09-27); a failure turns the pull request red",
  ],
  [
    /(carried over|survived) untouched/i,
    "Riflessi adapted 11 of the 15 component files it shares with DriftPilot; the content layer, tokens and lead pipeline are what carried over",
  ],
  [
    /Claude and OpenAI APIs|structured outputs with schema validation|role-scoped write access/i,
    "no project in this workspace calls the Claude or OpenAI APIs, and the AI roles are report-only by contract, not by tool permissions; name a real implementation before this returns",
  ],
  [
    /Project Achilles/i,
    "a former employer's internal codename: it tells a reader nothing and is not this site's to publish",
  ],
  [
    /thousands of (Canadian )?(dealerships|dealers)/i,
    "no source gives a dealer count (AutoTrader's sites block checks, and the one internal figure is 1,012 Tadvantage accounts, Feb 2023): say \"Canadian dealerships nationwide\" (owner, 2026-09-29)",
  ],
  [
    /riflessiautocare\.vercel\.app/i,
    "Riflessi's canonical address is riflessiautocare.ca (live 2026-09-28); the Vercel preview host still answers, but it is not where the site lives",
  ],
  [
    /no test runner|neither (project|site) has (any |automated )?tests?/i,
    "both sites run tests in CI since 2026-09-28 (driftpilot-site #54, riflessiautocare #14); what's missing is tests for Riflessi's booking path",
    { quotableWhenClosed: true },
  ],
  [
    // Present tense only: "still saw the thank-you page" tells the history
    // and must pass.
    /still sees (a|the) thank-you page|webhook with one retry/i,
    "since driftpilot-site #54 (2026-09-28) DriftPilot tries a lead up to three times, tells the visitor if it fails, and posts it to Slack",
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
  const blocks = blockComments(content);
  const inComment = (index, line) =>
    COMMENT_LINE.test(line) || blocks.some(([start, end]) => index >= start && index < end);

  for (const [pattern, reason, options = {}] of RETIRED) {
    if (file === CLOSED_GAPS_FILE && options.quotableWhenClosed) continue;
    // Matched against whole content, not line by line: some retired phrasings
    // span lines (a subject on one line, the disallowed word on the next), and
    // a per-line scan silently misses those.
    const rx = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g");
    for (const match of content.matchAll(rx)) {
      const lineNo = content.slice(0, match.index).split("\n").length;
      // A comment that warns against the claim documents it rather than using
      // it: a cue on the matched comment line, or the line above it, excuses
      // it. Rendered copy is never excused this way, whatever sits above it.
      const matched = lines[lineNo - 1] ?? "";
      const context = [lines[lineNo - 2] ?? "", matched].join(" ");
      if (inComment(match.index, matched) && WARNING_CUES.test(context)) continue;

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
