#!/usr/bin/env node
/**
 * Fail if the site stops behaving the way it promises to.
 *
 * check-overflow measures whether things fit. This measures whether things
 * work — the promises the landing page and the secondary pages make that no
 * static check can see, and that were each verified by hand once and then
 * left to regress in silence:
 *
 *  - The landing's first screen: "View selected work" leads to the work, the
 *    résumé action serves the PDF, and at rest nothing is fetched that is not
 *    shown: no work card's whole page, and not the recording.
 *  - Four work cards, each one link named for where it goes, with pictures
 *    of one height side by side. Hovering a card loads its page and pans it.
 *  - Every id on every route is unique. Chapter ids come from headings; a
 *    duplicate would silently retarget the cue, the chapter bar and deep links.
 *  - The scroll cue shows on arrival, hides once scrolling starts, returns at
 *    the top, and — as a link — lands the first chapter just under the chapter
 *    bar, with the hash updated.
 *  - The chapter bar appears once the hero has gone and names the chapter.
 *  - On a phone the overview carries the rail's profile — portrait, role and
 *    every contact link — and each work card's screenshot loads as it nears
 *    the viewport and pans as it scrolls past. The same at 1023px, and at
 *    1100px with a 20px default font, where the rem breakpoint still stacks
 *    the cards: layout, pan and loader agree on where it ends. Under reduced
 *    motion no page is fetched or panned, and with Save-Data on no page is
 *    fetched for being scrolled past.
 *  - The reading path: the rail's order, every page's hero number and every
 *    page's "next" agree, AutoTrader.ca first.
 *  - A case study's screen recording fetches nothing until seen, plays in view,
 *    keeps a reader's pause, and never starts itself under reduced motion or
 *    Save-Data.
 *  - Under prefers-reduced-motion nothing loops or reveals.
 *  - The rail fits its window without scrolling from 768px tall.
 *  - Keyboard focus is visible inside every ink block. The ring is accent and
 *    accent is ink, so inside a chip it once drew ink on ink — identical
 *    colours, invisible focus — and neither Lighthouse nor check:contrast can
 *    see a computed outline against its computed surface. This can.
 *
 * One module per surface, in ./behaviour/, sharing harness.mjs (the browser,
 * the tally and the helpers); this file runs them in order. Split from one
 * 778-line script so a failure points at its surface (review of #32, P2-6).
 *
 * Needs a server, like check-overflow. Waits on conditions rather than fixed
 * sleeps: the cue and the bar are IntersectionObserver-driven, so they update
 * a frame or two after a scroll, and CI runners are not fast.
 *
 * usage: node scripts/check-behaviour.mjs [origin]
 */
import { browser, failures } from "./behaviour/harness.mjs";
import * as landing from "./behaviour/landing.mjs";
import * as rail from "./behaviour/rail.mjs";
import * as site from "./behaviour/site.mjs";
import * as pages from "./behaviour/pages.mjs";
import * as readingPath from "./behaviour/reading-path.mjs";
import * as recording from "./behaviour/recording.mjs";
import * as roadmap from "./behaviour/roadmap.mjs";

const SECTIONS = [landing, rail, site, pages, readingPath, recording, roadmap];

try {
  for (const section of SECTIONS) await section.run();
} finally {
  await browser.close();
}

if (failures > 0) {
  console.error(`\nFAILED: ${failures} behaviour check(s)`);
  process.exit(1);
}
console.log("\nALL BEHAVIOUR CHECKS PASS");
