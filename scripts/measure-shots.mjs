#!/usr/bin/env node
/**
 * Measure the room each deck tile has for its screenshot window.
 *
 * Every window on the deck is one height, the room the most crowded tile has
 * left, and globals.css (.tile-shot-frame) states that room as a formula of
 * viewport height: `50dvh − N px`. N is measured, not chosen, and changes
 * whenever the deck's content or spacing does — so this is how it is re-taken.
 *
 * It lifts the window height to 400px on the live page (no code edit), lets
 * each frame shrink to exactly what its tile can hold, and prints that room per
 * tile, the smallest, and the N that would make `50dvh − N` equal to it. Take
 * the largest N across a band of widths, add 2px of slack, and put that in the
 * CSS. check:behaviour then holds the result: equal windows at 1680 and 1920.
 *
 * usage: node scripts/measure-shots.mjs [origin]   (needs a server)
 */
import puppeteer from "puppeteer-core";

const ORIGIN = process.argv[2] ?? "http://127.0.0.1:3000";
const CHROME =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

/** Where the formula's two bands live: DriftPilot alone, then all four. */
const VIEWPORTS = [
  [1440, 800], [1440, 900], [1440, 1000], [1600, 1000],
  [1680, 900], [1680, 1050], [1680, 1200], [1800, 1000],
  [1920, 960], [1920, 1080], [1920, 1200], [2560, 1440],
];

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new" });
try {
  const page = await browser.newPage();
  console.log("viewport    room per tile (px)                           min   N = h/2 − min");
  for (const [width, height] of VIEWPORTS) {
    await page.setViewport({ width, height });
    await page.goto(`${ORIGIN}/`, { waitUntil: "networkidle0" });
    await page.addStyleTag({ content: ".tile-shot-frame { --shot-h: 400px !important; }" });
    await page.evaluate(() => document.fonts.ready);
    const room = await page.evaluate(() => {
      const out = {};
      for (const frame of document.querySelectorAll(".tile-shot-frame")) {
        if (frame.offsetParent === null) continue;
        const name = (frame.closest(".tile")?.querySelector(".display")?.textContent ?? "?").slice(0, 10);
        out[name] = Math.round(frame.getBoundingClientRect().height);
      }
      return out;
    });
    const min = Math.min(...Object.values(room));
    console.log(
      `${width}x${height}`.padEnd(12),
      JSON.stringify(room).padEnd(44),
      String(min).padStart(4),
      String(height / 2 - min).padStart(8),
    );
  }
} finally {
  await browser.close();
}
