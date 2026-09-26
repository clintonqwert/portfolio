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
 * Deliberately NOT checked here: WCAG target size. It was added and removed
 * on 2026-09-21. The rule has real exceptions — a target inline in a sentence
 * is exempt, and so is one with 24px of clear space around it — and flex items
 * are blockified, so `display: inline` does not identify the exempt ones. The
 * naive version flagged the skip link, every breadcrumb and every live URL,
 * none of which Lighthouse flags. A gate that cries wolf gets ignored, so
 * target size stays with Lighthouse, which implements the exceptions properly.
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
  "/work/driftpilot", "/work/riflessi", "/work/tadvantage", "/work/mygarage", "/work/luxury-tax",
];

/** The shell is only viewport-fit at lg and up; below that it scrolls by design. */
const VIEWPORTS = [
  // 1920 and 1680 are not vanity sizes here: the deck reveals screenshots and
  // extra points above 1440, so they are the only widths where that content
  // exists at all. Testing 1440 down would have shipped it unmeasured.
  { name: "1920x1080", width: 1920, height: 1080 },
  { name: "1680x1050", width: 1680, height: 1050 },
  { name: "1440x900", width: 1440, height: 900 },
  { name: "1280x800", width: 1280, height: 800 },
  { name: "1024x768", width: 1024, height: 768 },
  // Short and wide. Every other desktop entry scales height with width, so the
  // suite never tested this shape — which is exactly what breaks a full-height
  // fixed rail. A 1366x768 laptop is roughly this once browser chrome is gone,
  // and at this height the rail was hiding two of its five contact links.
  { name: "1440x700", width: 1440, height: 700 },
  { name: "375x812", width: 375, height: 812 },
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  // --no-sandbox only in CI: Ubuntu 24.04 runners restrict the user
  // namespaces Chrome's sandbox needs, and the pages are our own build.
  args: ["--hide-scrollbars", "--disable-gpu", ...(process.env.CI ? ["--no-sandbox"] : [])],
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
        // Only `hidden` and `clip` count as loss. `auto` is reachable by
        // scrolling, and flagging it buried the real hits under the mobile nav
        // and every horizontally-scrollable strip on the page — with one
        // exception below. `clip` was once exempt by omission, which meant any
        // content the title block ever cut off would have passed unseen.
        const loses = (v) => v === "hidden" || v === "clip";
        const intentional = (el) =>
          el.classList.contains("sr-only") ||
          el.closest(".marquee") !== null ||
          // The scroll cue's dots fall the length of its thread and shrink
          // away — that is the animation. Decorative and aria-hidden.
          el.classList.contains("scroll-cue-thread") ||
          // A deck tile's screenshot is a window onto a whole page, which it
          // pans down on hover. The page running past the window is the
          // design, the image is one element with alt text, and every tile
          // is still measured: this only exempts the window itself.
          el.classList.contains("tile-shot-frame") ||
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

          if (loses(cs.overflowY) && tall > 2) {
            out.push(`clipped +${tall}px tall [${label(el)}]`);
          }
          if (loses(cs.overflowX) && wide > 2) {
            out.push(`clipped +${wide}px wide [${label(el)}]`);
          }
          // A scrollable box holding more than twice its own width is the
          // /gaps failure: technically reachable, practically invisible.
          // Navigation is exempt — a scrolling nav strip is a known pattern
          // with its own affordance, and the mobile bar legitimately runs to
          // 829px of links inside 375px.
          if (cs.overflowX === "auto" && el.clientWidth > 0 &&
              el.closest("nav") === null &&
              el.scrollWidth > el.clientWidth * 2) {
            out.push(`buried ${el.scrollWidth}px in ${el.clientWidth}px [${label(el)}]`);
          }
        }
        // Fixed panels that hide their own content. A position:fixed element
        // cannot be scrolled by the page, so anything past its edge is
        // unreachable unless it scrolls itself. The rail failed exactly this
        // way and no tile-based check could see it: the rail is not a tile.
        for (const el of document.querySelectorAll("*")) {
          const cs = getComputedStyle(el);
          if (cs.position !== "fixed") continue;
          const over = el.scrollHeight - el.clientHeight;
          if (over <= 2) continue;
          const scrolls = ["auto", "scroll"].includes(cs.overflowY);
          if (!scrolls) {
            out.push(`unreachable +${over}px in fixed panel [${label(el)}]`);
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
