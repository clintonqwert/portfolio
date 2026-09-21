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
        const label = (el) =>
          (el.textContent ?? "").trim().slice(0, 40).replace(/\s+/g, " ");

        // 2px of slack: sub-pixel rounding on fractional layouts is not a defect.
        for (const el of document.querySelectorAll(".tile")) {
          const over = el.scrollHeight - el.clientHeight - 2;
          if (over > 0) out.push(`tile +${over}px [${label(el)}]`);
        }

        // Anything that *loses* its own children. Measuring only .tile missed
        // two real defects: /history cut the earliest role mid-word inside an
        // overflow-hidden child, and /gaps clipped a 640px table into a 247px
        // column. In both cases the tile was the right height, so a check that
        // only asked the tile saw nothing wrong.
        //
        // Only `hidden` counts as loss. `auto` is reachable by scrolling, and
        // flagging it buried the real hits under the mobile nav and every
        // horizontally-scrollable strip on the page — with one exception below.
        const intentional = (el) =>
          el.classList.contains("sr-only") ||
          el.closest(".marquee") !== null ||
          // An ellipsis is a signpost, not a loss — the reader can see that
          // something was shortened, which is the whole difference. Both the
          // single-line (`truncate`) and multi-line (`line-clamp-N`) forms
          // render one; only line-clamp does it without `text-overflow`.
          getComputedStyle(el).textOverflow === "ellipsis" ||
          getComputedStyle(el).webkitLineClamp !== "none" ||
          // sr-only skip links are 1px boxes by construction.
          el.clientWidth <= 1 ||
          el.clientHeight <= 1;

        for (const el of document.querySelectorAll("*")) {
          if (intentional(el)) continue;
          const cs = getComputedStyle(el);
          const tall = el.scrollHeight - el.clientHeight;
          const wide = el.scrollWidth - el.clientWidth;

          if (cs.overflowY === "hidden" && tall > 2) {
            out.push(`clipped +${tall}px tall [${label(el)}]`);
          }
          if (cs.overflowX === "hidden" && wide > 2) {
            out.push(`clipped +${wide}px wide [${label(el)}]`);
          }
          // A scrollable box holding more than twice its own width is the
          // /gaps failure: technically reachable, practically invisible. A
          // normal scroll strip (the mobile nav) stays well under 2x.
          if (cs.overflowX === "auto" && el.clientWidth > 0 &&
              el.scrollWidth > el.clientWidth * 2) {
            out.push(`buried ${el.scrollWidth}px in ${el.clientWidth}px [${label(el)}]`);
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
