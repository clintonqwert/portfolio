/**
 * The shared harness for check:behaviour: one browser, the pass/fail tally,
 * and the helpers every section uses. Imported once by check-behaviour.mjs,
 * which runs the sections in ./ in order and reads `failures` at the end.
 */
import puppeteer from "puppeteer-core";

export const ORIGIN = process.argv[2] ?? "http://127.0.0.1:3000";
const CHROME =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

export const ROUTES = [
  "/", "/standard", "/roadmap", "/history", "/autotrader",
  "/work/driftpilot", "/work/riflessi", "/work/tadvantage", "/work/mygarage", "/work/luxury-tax",
];

/** A case study with a hero shot, figures, an ink chapter and a diagram-free first chapter. */
export const STUDY = "/work/riflessi";

/** The landing's DriftPilot card, and the whole-page image its hover pans. */
export const DRIFTPILOT_CARD = '.work-card:has(a[href="/work/driftpilot"])';
export const DRIFTPILOT_PAGE = `${DRIFTPILOT_CARD} img.work-shot-image`;

export const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: [
    "--hide-scrollbars",
    "--disable-gpu",
    // A hover-capable fine pointer on every machine. Headless Chrome on a CI
    // runner has no pointing device and reports (hover: none), so the cards'
    // hover-only pan was never enabled there: the pan check failed, and the
    // reduced-motion "does not pan" check passed for the wrong reason. CDP's
    // setEmulatedMedia ignores hover and pointer on that build — only the
    // prefers-* features took — so this is set in Blink's own settings.
    // (2 = hover, 4 = fine.)
    "--blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4",
    // --no-sandbox only in CI: Ubuntu 24.04 runners restrict the user
    // namespaces Chrome's sandbox needs, and the pages are our own build.
    ...(process.env.CI ? ["--no-sandbox"] : []),
  ],
});

export let failures = 0;
export const check = (ok, what) => {
  if (ok) console.log(`PASS | ${what}`);
  else {
    failures += 1;
    console.error(`FAIL | ${what}`);
  }
};

/**
 * Open a page with offsite requests dropped — analytics never resolve offline.
 * Hover and pointer come from the launch flags above; reduced motion is set
 * per page, so a check that needs it says so.
 */
export async function open(path, { width, height, reduced = false, font, saveData = false, theme }) {
  const page = await browser.newPage();
  await page.setViewport({ width, height });
  // A stored theme, as the pre-paint script reads it; unset, the system's.
  if (theme) {
    await page.evaluateOnNewDocument((t) => {
      try {
        localStorage.setItem("theme", t);
      } catch {}
    }, theme);
  }
  // Two reader settings that live in the browser rather than the page: a
  // default font size (rem media queries follow it, px ones do not), and
  // Save-Data (navigator.connection.saveData).
  if (font || saveData) {
    const cdp = await page.createCDPSession();
    if (font) await cdp.send("Page.setFontSizes", { fontSizes: { standard: font } });
    if (saveData) await cdp.send("Emulation.setDataSaverOverride", { dataSaverEnabled: true });
  }
  await page.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: reduced ? "reduce" : "no-preference" },
  ]);
  await page.setRequestInterception(true);
  page.on("request", (r) => {
    const host = new URL(r.url()).host;
    if (host && !ORIGIN.includes(host)) r.abort().catch(() => {});
    else r.continue().catch(() => {});
  });
  await page.goto(`${ORIGIN}${path}`, { waitUntil: "load", timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);
  return page;
}

/** Whichever element is scrolling: <main> at desktop, the document below it. */
export const scrollTo = (page, y) =>
  page.evaluate((y) => {
    const main = document.querySelector("main");
    const el = main && main.scrollHeight > main.clientHeight ? main : document.scrollingElement;
    el.scrollTo(0, y);
  }, y);

/** Resolve true once `fn` holds, false if it never does within `timeout`. */
export const becomes = (page, fn, arg, timeout = 4000) =>
  page
    .waitForFunction(fn, { timeout, polling: "raf" }, arg)
    .then(() => true)
    .catch(() => false);
