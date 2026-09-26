#!/usr/bin/env node
/**
 * Fail if the site stops behaving the way it promises to.
 *
 * check-overflow measures whether things fit. This measures whether things
 * work — the promises the deck and the secondary pages make that no static
 * check can see, and that were each verified by hand once and then left to
 * regress in silence:
 *
 *  - The deck is one viewport: zero scroll at >=1024 x >=760, and none of the
 *    secondary-page chrome (scroll cue, chapter bar) on it.
 *  - Every screenshot window on the deck is the same height. At rest no tile
 *    has fetched its whole page and no cursor animation is running; hovering
 *    a tile loads its page, pans it, and brings up the tile cursor beside an
 *    arrow that stays.
 *  - Every id on every route is unique. Chapter ids come from headings; a
 *    duplicate would silently retarget the cue, the chapter bar and deep links.
 *  - The scroll cue shows on arrival, hides once scrolling starts, returns at
 *    the top, and — as a link — lands the first chapter just under the chapter
 *    bar, with the hash updated.
 *  - The chapter bar appears once the hero has gone and names the chapter.
 *  - Under prefers-reduced-motion nothing loops or reveals.
 *  - Keyboard focus is visible inside every ink block. The ring is accent and
 *    accent is ink, so inside a chip it once drew ink on ink — identical
 *    colours, invisible focus — and neither Lighthouse nor check:contrast can
 *    see a computed outline against its computed surface. This can.
 *
 * Needs a server, like check-overflow. Waits on conditions rather than fixed
 * sleeps: the cue and the bar are IntersectionObserver-driven, so they update
 * a frame or two after a scroll, and CI runners are not fast.
 *
 * usage: node scripts/check-behaviour.mjs [origin]
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

/** A case study with a hero shot, figures, an ink chapter and a diagram-free first chapter. */
const STUDY = "/work/riflessi";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: [
    "--hide-scrollbars",
    "--disable-gpu",
    // A hover-capable fine pointer on every machine. Headless Chrome on a CI
    // runner has no pointing device and reports (hover: none), so the deck's
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

let failures = 0;
const check = (ok, what) => {
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
async function open(path, { width, height, reduced = false }) {
  const page = await browser.newPage();
  await page.setViewport({ width, height });
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
const scrollTo = (page, y) =>
  page.evaluate((y) => {
    const main = document.querySelector("main");
    const el = main && main.scrollHeight > main.clientHeight ? main : document.scrollingElement;
    el.scrollTo(0, y);
  }, y);

/** Resolve true once `fn` holds, false if it never does within `timeout`. */
const becomes = (page, fn, arg, timeout = 4000) =>
  page
    .waitForFunction(fn, { timeout, polling: "raf" }, arg)
    .then(() => true)
    .catch(() => false);

try {
  // ── the deck ────────────────────────────────────────────────────────────
  for (const [width, height] of [[1024, 768], [1440, 900], [1920, 1080]]) {
    const page = await open("/", { width, height });
    const r = await page.evaluate(() => {
      const main = document.querySelector("main");
      return {
        main: main.scrollHeight - main.clientHeight,
        doc: document.scrollingElement.scrollHeight - innerHeight,
        chrome: document.querySelectorAll(".scroll-cue, .chapterbar").length,
      };
    });
    check(r.main <= 1 && r.doc <= 1, `deck ${width}x${height} does not scroll (main +${r.main}px, page +${r.doc}px)`);
    check(r.chrome === 0, `deck ${width}x${height} has no scroll cue or chapter bar`);
    await page.close();
  }

  // ── deck screenshots: one height, and a pan on hover ───────────────────
  for (const [width, height] of [[1680, 1050], [1920, 1080]]) {
    const page = await open("/", { width, height });
    const heights = await page.evaluate(() =>
      [...document.querySelectorAll(".tile-shot-frame")]
        .filter((f) => f.offsetParent !== null)
        .map((f) => Math.round(f.getBoundingClientRect().height)),
    );
    check(
      heights.length === 4 && new Set(heights).size === 1,
      `deck ${width}x${height} shows 4 screenshot windows of one height (${heights.join(", ")}px)`,
    );

    const rest = await page.evaluate(() => ({
      pages: [...document.querySelectorAll("img.tile-shot-image")].filter((i) => i.getAttribute("src")).length,
      shards: document
        .getAnimations()
        .filter((a) => a.animationName?.startsWith("shard") && a.playState === "running").length,
    }));
    check(rest.pages === 0, `deck ${width}x${height} fetches no whole-page preview at rest (${rest.pages} loaded)`);
    check(rest.shards === 0, `deck ${width}x${height} runs no cursor animation at rest (${rest.shards} running)`);

    if (width === 1920) {
      const tile = await page.$('a.tile[href="/work/tadvantage"]');
      await tile.hover();
      const panned = await becomes(
        page,
        () => {
          const img = document.querySelector('a.tile[href="/work/tadvantage"] .tile-shot-image');
          return img && new DOMMatrix(getComputedStyle(img).transform).m42 < -20;
        },
        undefined,
        3000,
      );
      const state = await page.evaluate(() => ({
        hover: matchMedia("(hover: hover)").matches,
        hovered: document.querySelector('a.tile[href="/work/tadvantage"]').matches(":hover"),
        y: Math.round(
          new DOMMatrix(
            getComputedStyle(document.querySelector('a.tile[href="/work/tadvantage"] .tile-shot-image')).transform,
          ).m42,
        ),
      }));
      check(
        panned,
        `hovering a deck tile pans its screenshot (hover media ${state.hover}, tile hovered ${state.hovered}, moved ${state.y}px)`,
      );

      const loaded = await becomes(page, () => {
        const img = document.querySelector('a.tile[href="/work/tadvantage"] img.tile-shot-image');
        return img?.getAttribute("src") && img.complete && img.naturalWidth > 0;
      });
      check(loaded, "hovering a deck tile fetches its whole-page preview");

      // The tile cursor: on, following, running its loop, and the arrow kept.
      const box = await tile.boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 4 });
      const cursor = await becomes(page, () => {
        const c = document.querySelector(".tile-cursor");
        const tileEl = document.querySelector('a.tile[href="/work/tadvantage"]');
        return (
          c?.dataset.active === "true" &&
          c.style.transform.startsWith("translate3d") &&
          getComputedStyle(tileEl).cursor !== "none" &&
          document.getAnimations().some((a) => a.animationName === "shard" && a.playState === "running")
        );
      });
      check(cursor, "hovering a deck tile brings up the tile cursor beside the arrow, running");
    }
    await page.close();
  }

  // ── unique ids, and visible focus inside ink blocks, on every route ─────
  for (const route of ROUTES) {
    const page = await open(route, { width: 1440, height: 900 });
    const dupes = await page.evaluate(() => {
      const seen = new Map();
      for (const el of document.querySelectorAll("[id]")) seen.set(el.id, (seen.get(el.id) ?? 0) + 1);
      return [...seen].filter(([, n]) => n > 1).map(([id]) => id);
    });
    check(dupes.length === 0, `${route} ids are unique${dupes.length ? ` (duplicated: ${dupes.join(", ")})` : ""}`);

    // Every focusable inside a chip: its ring must differ from the chip. A
    // keypress first, so programmatic focus counts as keyboard focus and
    // :focus-visible — the rule that draws the ring — actually applies; a
    // ring that was never drawn cannot be compared.
    await page.keyboard.press("Shift");
    const hidden = await page.evaluate(() => {
      const out = [];
      for (const el of document.querySelectorAll(
        ".chip a[href], .chip button, .chip [tabindex]:not([tabindex='-1'])",
      )) {
        if (el.closest("[aria-hidden='true']")) continue;
        el.focus({ focusVisible: true });
        if (document.activeElement !== el) continue;
        if (!el.matches(":focus-visible")) {
          out.push(`${(el.textContent ?? "").trim().slice(0, 40)} (focus-visible not applied)`);
          continue;
        }
        const ring = getComputedStyle(el).outlineColor;
        const surface = getComputedStyle(el.closest(".chip")).backgroundColor;
        if (ring === surface) out.push((el.textContent ?? "").trim().slice(0, 40));
      }
      return out;
    });
    check(hidden.length === 0, `${route} focus is visible inside ink blocks${hidden.length ? ` (invisible on: ${hidden.join("; ")})` : ""}`);
    await page.close();
  }

  // ── the scroll cue and chapter bar, desktop ─────────────────────────────
  {
    const page = await open(STUDY, { width: 1440, height: 900 });
    const cueAway = () => document.querySelector(".scroll-cue")?.dataset.away === "true";
    const cueHome = () => document.querySelector(".scroll-cue")?.dataset.away === "false";

    check(await becomes(page, cueHome), "cue is shown on arrival");
    await scrollTo(page, 250);
    check(await becomes(page, cueAway), "cue hides once scrolling starts");
    await scrollTo(page, 0);
    check(await becomes(page, cueHome), "cue returns at the top");

    // The cue links to the first chapter, so its own href names the target.
    const first = await page.evaluate(() =>
      document.querySelector(".scroll-cue")?.getAttribute("href")?.slice(1),
    );
    await page.focus(".scroll-cue");
    await page.keyboard.press("Enter");
    // Lands under the 44px bar: the section's scroll margin is 56px.
    const landed = await becomes(
      page,
      (id) => {
        const el = document.getElementById(id);
        if (!el || location.hash !== `#${id}`) return false;
        const top = el.getBoundingClientRect().top;
        return top >= 40 && top <= 72;
      },
      first,
    );
    check(landed, `Enter on the cue lands #${first} under the chapter bar`);

    const bar = await becomes(page, () => {
      const b = document.querySelector(".chapterbar");
      return b?.dataset.visible === "true" && (b.textContent ?? "").includes("/");
    });
    check(bar, "chapter bar is shown past the hero, naming the chapter");

    await scrollTo(page, 0);
    check(
      await becomes(page, () => document.querySelector(".chapterbar")?.dataset.visible === "false"),
      "chapter bar leaves again in the hero",
    );
    await page.close();
  }

  // ── the scroll cue, phone ───────────────────────────────────────────────
  {
    const page = await open(STUDY, { width: 375, height: 812 });
    await scrollTo(page, 250);
    check(
      await becomes(page, () => document.querySelector(".scroll-cue")?.dataset.away === "true"),
      "cue hides once scrolling starts, at 375px",
    );
    await page.close();
  }

  // ── reduced motion: nothing loops, reveals or pans ─────────────────────
  {
    const page = await open("/", { width: 1920, height: 1080, reduced: true });
    const tile = await page.$('a.tile[href="/work/tadvantage"]');
    await tile.hover();
    await new Promise((r) => setTimeout(r, 1200));
    const { moved, hover } = await page.evaluate(() => {
      const img = document.querySelector('a.tile[href="/work/tadvantage"] .tile-shot-image');
      return {
        moved: new DOMMatrix(getComputedStyle(img).transform).m42,
        hover: matchMedia("(hover: hover)").matches,
      };
    });
    // Only meaningful with hover available — otherwise "no pan" proves nothing.
    check(
      hover && moved === 0,
      `reduced motion: hovering a deck tile does not pan (hover media ${hover}, moved ${moved}px)`,
    );
    const after = await page.evaluate(() => ({
      cursor: document.querySelector(".tile-cursor")?.dataset.active,
      pages: [...document.querySelectorAll("img.tile-shot-image")].filter((i) => i.getAttribute("src")).length,
    }));
    check(
      after.cursor === "false" && after.pages === 0,
      `reduced motion: no tile cursor and no whole-page fetch on hover (cursor ${after.cursor}, ${after.pages} loaded)`,
    );
    await page.close();
  }

  // ── reduced motion ──────────────────────────────────────────────────────
  {
    const page = await open(STUDY, { width: 1440, height: 900, reduced: true });
    const moving = await page.evaluate(() =>
      [".scroll-cue-drop", ".rise", ".enter", ".shot", ".hero-word"]
        .map((sel) => [sel, document.querySelector(sel)])
        .filter(([, el]) => el && getComputedStyle(el).animationName !== "none")
        .map(([sel]) => sel),
    );
    check(moving.length === 0, `reduced motion stops every loop and reveal${moving.length ? ` (still animating: ${moving.join(", ")})` : ""}`);
    await page.close();
  }
} finally {
  await browser.close();
}

if (failures > 0) {
  console.error(`\nFAILED: ${failures} behaviour check(s)`);
  process.exit(1);
}
console.log("\nALL BEHAVIOUR CHECKS PASS");
