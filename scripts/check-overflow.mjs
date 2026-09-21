#!/usr/bin/env node
/**
 * Fail if a dashboard panel's content runs past its own edge.
 *
 * The shell is fixed to one viewport and panels do not scroll — prose flows into
 * CSS columns instead. That trade means overflowing content is silently *clipped*
 * rather than merely out of view, so nothing in the browser complains and a
 * review can miss it. It has shipped twice: once from an obsolete max-width
 * capping the flow to three columns, once from a panel given more words than it
 * had room for.
 *
 * Driven over CDP rather than by screenshotting, because Chrome clamps a real
 * window to roughly 500px wide — which once had me report a phantom mobile
 * overflow from what was actually a 500px crop. setViewport sets the metrics
 * directly, so 375px means 375px.
 *
 * usage: node scripts/check-overflow.mjs [origin]
 */
import puppeteer from "puppeteer-core";

const ORIGIN = process.argv[2] ?? "http://127.0.0.1:3000";
const CHROME =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const ROUTES = [
  "/", "/standard", "/gaps", "/history", "/autotrader",
  "/work/driftpilot", "/work/riflessi", "/work/tadvantage",
];

/** The shell is only viewport-fit at lg and up; below that it scrolls by design. */
const VIEWPORTS = [
  { name: "1440x900", width: 1440, height: 900 },
  { name: "1280x800", width: 1280, height: 800 },
  { name: "1024x768", width: 1024, height: 768 },
  { name: "375x812", width: 375, height: 812 },
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--hide-scrollbars", "--disable-gpu"],
});

let failures = 0;

try {
  const page = await browser.newPage();
  // The analytics beacon never resolves offline and would hold networkidle open.
  await page.setRequestInterception(true);
  page.on("request", (r) => {
    const host = new URL(r.url()).host;
    if (host && !ORIGIN.includes(host)) r.abort().catch(() => {});
    else r.continue().catch(() => {});
  });

  for (const vp of VIEWPORTS) {
    console.log(`── ${vp.name} ──`);
    await page.setViewport({ width: vp.width, height: vp.height });

    for (const route of ROUTES) {
      await page.goto(`${ORIGIN}${route}`, { waitUntil: "load", timeout: 30000 });
      // Webfonts change line-breaking, so measuring before they settle would
      // report overflow that a real reader never sees, and miss some they do.
      await page.evaluate(() => document.fonts.ready);

      const hits = await page.evaluate(() => {
        const out = [];
        // 2px of slack: sub-pixel rounding on fractional layouts is not a defect.
        for (const el of document.querySelectorAll(".tile")) {
          const over = el.scrollHeight - el.clientHeight - 2;
          if (over > 0) {
            const label = (el.textContent ?? "").trim().slice(0, 40).replace(/\s+/g, " ");
            out.push(`tile +${over}px [${label}]`);
          }
        }
        const de = document.documentElement;
        const wide = de.scrollWidth - de.clientWidth;
        if (wide > 2) out.push(`horizontal +${wide}px`);
        return out;
      });

      if (hits.length === 0) {
        console.log(`PASS | ${route.padEnd(18)} fits`);
      } else {
        failures += hits.length;
        console.error(`FAIL | ${route.padEnd(18)} ${hits.join("; ")}`);
      }
    }
    console.log();
  }
} finally {
  await browser.close();
}

if (failures > 0) {
  console.error(`FAILED: ${failures} overflow problem(s)`);
  process.exit(1);
}
console.log("NO PANEL OVERFLOWS AT ANY TESTED VIEWPORT");
