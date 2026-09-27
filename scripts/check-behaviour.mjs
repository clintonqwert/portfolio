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
 *  - On a phone the overview carries the rail's profile — portrait, role and
 *    every contact link — and every work tile shows its screenshot, which
 *    loads as it nears the viewport and pans as it scrolls past. The same at
 *    1023px, and at 1100px with a 20px default font, where the rem breakpoint
 *    still stacks the tiles: layout, pan and loader agree on where it ends.
 *    Under reduced motion no page is fetched or panned, and with Save-Data on
 *    no page is fetched for being scrolled past.
 *  - A screenshot the deck hides at its width is never fetched.
 *  - Every deck tile's name reads whole, at every width it is shown at.
 *  - The reading path: the rail's order, every page's hero number, every deck
 *    tile's number and every page's "next" agree, AutoTrader.ca first.
 *  - A case study's screen recording fetches nothing until seen, plays in view,
 *    keeps a reader's pause, and never starts itself under reduced motion or
 *    Save-Data.
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
  headless: true,
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
async function open(path, { width, height, reduced = false, font, saveData = false, theme }) {
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

    // A shot the deck hides at this width costs nothing. The feature tile's
    // window was once fetched eagerly, and so fetched at 1024–1439 for a
    // cell that never shows it. Negative, so it waits out a settle first.
    await new Promise((r) => setTimeout(r, 500));
    const wasted = await page.evaluate(() => {
      const fetched = performance.getEntriesByType("resource").map((e) => e.name);
      return [...document.querySelectorAll(".tile-shot-frame")]
        .filter((f) => f.offsetParent === null)
        .flatMap((f) => [...f.querySelectorAll("img")])
        .map((img) => (img.getAttribute("srcset") ?? img.dataset.srcset ?? "").match(/url=([^&]+)/)?.[1])
        .filter((url) => url && fetched.some((name) => name.includes(`url=${url}&`)))
        .map((url) => decodeURIComponent(url));
    });
    check(wasted.length === 0, `deck ${width}x${height} fetches no hidden screenshot (${wasted.join(", ") || "none"})`);
    await page.close();
  }

  // ── the brand icons ─────────────────────────────────────────────────────
  // The tab icon is the <CR> badge in WebP, the home-screen icon the CR mark
  // in PNG (iOS reads no other format). Both must be linked and must serve.
  {
    const page = await open("/", { width: 1440, height: 900 });
    const links = await page.evaluate(() => ({
      icon: document.querySelector('link[rel="icon"]')?.getAttribute("href"),
      apple: document.querySelector('link[rel="apple-touch-icon"]')?.getAttribute("href"),
    }));
    const served = await page.evaluate(async (hrefs) => {
      const out = {};
      for (const [k, href] of Object.entries(hrefs)) {
        if (!href) continue;
        const r = await fetch(href);
        out[k] = `${r.status} ${r.headers.get("content-type")}`;
      }
      return out;
    }, links);
    check(
      /^200 image\/webp/.test(served.icon ?? "") && /^200 image\/png/.test(served.apple ?? ""),
      `brand icons are linked and served (icon ${links.icon}: ${served.icon}; apple ${links.apple}: ${served.apple})`,
    );
    await page.close();
  }

  // ── every tile's name reads whole ───────────────────────────────────────
  // A narrow cell once cut "Riflessi Auto Care" to "RIF…" at 1024 and still
  // trimmed it at 1440; DriftPilot, History and AutoTrader.ca were cut at
  // 1024. Short names at the narrowest widths and an arrow-only call to
  // action keep every name whole.
  for (const [width, height] of [[1024, 768], [1280, 800], [1440, 900], [1680, 1050], [1920, 1080], [390, 844]]) {
    const page = await open("/", { width, height });
    const cut = await page.evaluate(() =>
      [...document.querySelectorAll("a.tile")]
        .map((t) => {
          const name = t.querySelector(".display-hero");
          return name && name.scrollWidth > name.clientWidth + 1 ? name.innerText : null;
        })
        .filter(Boolean),
    );
    check(cut.length === 0, `deck ${width}x${height}: every tile's name reads whole (${cut.join(", ") || "none cut"})`);
    await page.close();
  }

  // ── no double rules in a tile ───────────────────────────────────────────
  // Two hairlines close together with nothing between them read as a
  // mistake. The Tadvantage tile drew exactly that on a phone: its column's
  // top rule and its stats grid's, 25px apart, the highlights between them
  // hidden below xl.
  for (const [width, height] of [[390, 844], [1024, 768], [1440, 900]]) {
    const page = await open("/", { width, height });
    const doubles = await page.evaluate(() =>
      [...document.querySelectorAll("a.tile")].flatMap((tile) => {
        const shown = [...tile.querySelectorAll("*")].filter((e) => e.getClientRects().length > 0);
        const rules = shown
          .filter((e) => {
            const cs = getComputedStyle(e);
            return parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== "none";
          })
          .map((e) => e.getBoundingClientRect().top)
          .sort((a, b) => a - b);
        const content = shown
          .filter((e) => e.matches("img, video") || [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))
          .map((e) => e.getBoundingClientRect().top);
        const out = [];
        for (let i = 1; i < rules.length; i++) {
          const [a, b] = [rules[i - 1], rules[i]];
          if (b - a > 1 && b - a < 40 && !content.some((t) => t > a && t < b)) {
            out.push(`${tile.getAttribute("href")} ${Math.round(b - a)}px`);
          }
        }
        return out;
      }),
    );
    check(doubles.length === 0, `deck ${width}x${height}: no tile draws two rules with nothing between (${doubles.join(", ") || "none"})`);
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
      // A sized image with no source draws a broken-image icon; at rest the
      // page image must draw nothing at all over its window.
      drawn: [...document.querySelectorAll(".tile-shot-frame")]
        .filter((f) => f.offsetParent !== null)
        .filter((f) => getComputedStyle(f.querySelector("img.tile-shot-image")).visibility !== "hidden").length,
      shards: document
        .getAnimations()
        .filter((a) => a.animationName?.startsWith("shard") && a.playState === "running").length,
    }));
    check(rest.pages === 0, `deck ${width}x${height} fetches no whole-page preview at rest (${rest.pages} loaded)`);
    check(rest.drawn === 0, `deck ${width}x${height} draws no empty page image over a window at rest (${rest.drawn} drawn)`);
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
        return (
          img?.getAttribute("src") && img.complete && img.naturalWidth > 0 &&
          getComputedStyle(img).visibility === "visible"
        );
      });
      check(loaded, "hovering a deck tile fetches its whole-page preview and shows it once it arrives");

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

      // What shatters is the CR mark: every shard carries its piece of the
      // letters, the mask image is actually served, and the surviving
      // shard's letters widen back to the whole mark in step with the loop.
      const mark = await page.evaluate(async () => {
        const shards = [...document.querySelectorAll(".tile-cursor-shard")];
        const masked = shards.filter((s) => getComputedStyle(s, "::after").maskImage.includes("cr-mark-letters")).length;
        const res = await fetch("/brand/cr-mark-letters.png");
        return {
          shards: shards.length,
          masked,
          served: `${res.status} ${res.headers.get("content-type")}`,
          letters: document
            .getAnimations()
            .some((a) => a.animationName === "shard-main-letters" && a.playState === "running"),
        };
      });
      check(
        mark.shards === 16 && mark.masked === 16 && mark.served === "200 image/png" && mark.letters,
        `the tile cursor shatters the CR mark (${mark.masked}/${mark.shards} shards masked, letters ${mark.served}, main shard reforming ${mark.letters})`,
      );
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

  // ── the overview stacked: profile, and scroll-driven screenshots ───────
  // A phone, and the edge of the stacked layout from both sides of its
  // breakpoint: 1023px, and 1100px at a 20px default font, where the rem
  // breakpoint (64rem = 1280px there) still stacks the tiles. The layout
  // comes from the lg: utilities, the pan from globals.css and the loader
  // from DeckPointer; all three have to agree on where "stacked" ends.
  for (const { width, height, font, reduced = false, saveData = false } of [
    { width: 390, height: 844 },
    { width: 390, height: 844, reduced: true },
    { width: 390, height: 844, saveData: true },
    { width: 1023, height: 800 },
    { width: 1100, height: 800, font: 20 },
  ]) {
    const page = await open("/", { width, height, reduced, font, saveData });
    const at = `${width}px${font ? ` at a ${font}px default font` : ""}`;
    if (!reduced) {
      const profile = await page.evaluate(() => {
        const card = document.querySelector('section[aria-label="Profile"]');
        const img = card?.querySelector("img");
        return {
          shown: card !== null && getComputedStyle(card).display !== "none",
          portrait: img !== null && img.getBoundingClientRect().width > 0,
          links: card ? card.querySelectorAll("a[href]").length : 0,
        };
      });
      check(
        profile.shown && profile.portrait && profile.links === 4,
        `stacked overview (${at}) shows the profile: portrait and ${profile.links} contact links`,
      );
      const shots = await page.evaluate(
        () => [...document.querySelectorAll(".tile-shot-frame")].filter((f) => f.offsetParent !== null).length,
      );
      check(shots === 4, `stacked overview (${at}) shows all 4 work screenshots (${shots})`);
    }

    // Bring the first shot up the screen and see whether its page loads and pans.
    await page.evaluate(() => {
      const frame = document.querySelector(".tile-shot-frame");
      window.scrollTo(0, window.scrollY + frame.getBoundingClientRect().top - 300);
    });
    const state = () =>
      page.evaluate(() => {
        const img = document.querySelector(".tile-shot-frame img.tile-shot-image");
        const top = document.querySelector(".tile-shot-frame img.tile-shot-window");
        return {
          loaded: Boolean(img.getAttribute("src")) && img.complete && img.naturalWidth > 0,
          y: Math.round(new DOMMatrix(getComputedStyle(img).transform).m42),
          window: top.complete && top.naturalWidth > 0,
          hidden: getComputedStyle(img).visibility === "hidden",
        };
      });
    if (!reduced && !saveData) {
      const panned = await becomes(page, () => {
        const img = document.querySelector(".tile-shot-frame img.tile-shot-image");
        return (
          img.complete && img.naturalWidth > 0 && getComputedStyle(img).visibility === "visible" &&
          new DOMMatrix(getComputedStyle(img).transform).m42 < -20
        );
      });
      const s = await state();
      check(panned, `stacked (${at}): scrolling a tile loads its page and pans it (loaded ${s.loaded}, moved ${s.y}px)`);
    } else if (reduced) {
      await new Promise((r) => setTimeout(r, 800));
      const s = await state();
      check(!s.loaded && s.y === 0, `stacked (${at}), reduced motion: no page fetch and no pan (loaded ${s.loaded}, moved ${s.y}px)`);
      check(s.hidden, `stacked (${at}), reduced motion: the unfetched page image draws nothing (hidden ${s.hidden})`);
    } else {
      // Saving data: the window still shows the page's top; the page itself
      // is never fetched for being scrolled past.
      await new Promise((r) => setTimeout(r, 800));
      const s = await state();
      check(
        s.window && !s.loaded && s.hidden,
        `stacked (${at}), saving data: the window shows, no page is fetched, and the empty page image draws nothing (window ${s.window}, loaded ${s.loaded}, hidden ${s.hidden})`,
      );
    }
    await page.close();
  }

  // ── the reading path ────────────────────────────────────────────────────
  // The rail's order is the site's: AutoTrader.ca and its pages first, then
  // the studio's, then the practice pages (owner's decision, 2026-09-26).
  // Every page carries its rail number in its hero, a deck tile shows the
  // number of the page it opens, and each page's close offers the next page
  // in rail order — so a reader following "Next" walks the rail exactly.
  {
    const PATH = [
      "/autotrader", "/work/tadvantage", "/work/mygarage", "/work/luxury-tax",
      "/work/driftpilot", "/work/riflessi", "/history", "/standard", "/gaps",
    ];
    const number = (href) => String(PATH.indexOf(href) + 1).padStart(2, "0");

    const page = await open("/", { width: 1440, height: 900 });
    const rail = await page.evaluate(() =>
      [...document.querySelectorAll('.rail nav[aria-label="Sections"] a[href]')]
        .map((a) => a.getAttribute("href"))
        .filter((href) => href !== "/"),
    );
    check(
      JSON.stringify(rail) === JSON.stringify(PATH),
      `rail runs AutoTrader.ca, its pages, the studio's, then practice (${rail.join(" ")})`,
    );
    const tiles = await page.evaluate(() =>
      [...document.querySelectorAll("a.tile")].map((a) => [a.getAttribute("href"), a.querySelector(".chip")?.textContent.trim()]),
    );
    const misnumbered = tiles.filter(([href, n]) => n !== number(href));
    check(
      tiles.length === 7 && misnumbered.length === 0,
      `every deck tile shows its page's rail number (${tiles.map(([h, n]) => `${n} ${h}`).join(", ")})`,
    );
    await page.close();

    for (const [i, href] of PATH.entries()) {
      const p = await open(href, { width: 1440, height: 900 });
      const r = await p.evaluate(() => ({
        hero: document.querySelector("#top .chip")?.textContent.trim(),
        next: document.querySelector('nav[aria-label="Keep reading"] > a[href]')?.getAttribute("href") ?? null,
      }));
      const want = PATH[i + 1] ?? null;
      check(
        r.hero === number(href) && r.next === want,
        `${href}: hero numbered ${r.hero} (want ${number(href)}), next ${r.next} (want ${want})`,
      );
      await p.close();
    }
  }

  // ── a case study's screen recording ─────────────────────────────────────
  // Nothing fetched until it is looked at; it plays once half on screen; a
  // reader's pause holds when they scroll away and back; a reader's Play
  // still stops when the video leaves the screen; and under reduced motion or
  // Save-Data it never starts by itself, though Play still works.
  //
  // "Away" scrolls whichever box scrolls. At 1440 that is <main>, and a
  // window.scrollTo once left the video on screen, so the pause check passed
  // without ever leaving — it now confirms the video is off screen first.
  const videoState = (page) =>
    page.evaluate(() => {
      const v = document.querySelector("figure video");
      const r = v.getBoundingClientRect();
      return {
        playing: !v.paused,
        fetched: performance.getEntriesByType("resource").some((e) => e.name.endsWith(".mp4")),
        onScreen: r.bottom > 0 && r.top < innerHeight,
      };
    });
  const showVideo = (page) =>
    page.evaluate(() => document.querySelector("figure video").scrollIntoView({ block: "center" }));
  const settle = (ms) => new Promise((r) => setTimeout(r, ms));

  for (const mode of ["normal", "reduced", "saveData"]) {
    const page = await open("/work/riflessi", {
      width: 1440,
      height: 900,
      reduced: mode === "reduced",
      saveData: mode === "saveData",
    });
    const rest = await videoState(page);
    check(!rest.fetched && !rest.playing, `recording, ${mode}: nothing fetched or playing at rest`);

    await showVideo(page);
    if (mode === "normal") {
      const played = await becomes(page, () => {
        const v = document.querySelector("figure video");
        return !v.paused && v.currentTime > 0.3;
      }, undefined, 8000);
      check(played, "recording: plays once it is on screen");

      // The reader pauses, leaves, and comes back.
      await page.click("figure video + button");
      await scrollTo(page, 0);
      await settle(700);
      const away = await videoState(page);
      await showVideo(page);
      await settle(1200);
      const back = await videoState(page);
      check(
        !away.onScreen && !back.playing,
        `recording: a reader's pause holds after scrolling away and back (left the screen ${!away.onScreen}, playing on return ${back.playing})`,
      );

      // The reader plays it, then leaves: it still stops.
      await page.click("figure video + button");
      await becomes(page, () => !document.querySelector("figure video").paused, undefined, 4000);
      await scrollTo(page, 0);
      const stopped = await becomes(page, () => document.querySelector("figure video").paused, undefined, 4000);
      check(stopped, "recording: a reader's Play still pauses when it leaves the screen");
    } else {
      await settle(1500);
      const still = await videoState(page);
      check(!still.playing && !still.fetched, `recording, ${mode}: does not start by itself (fetched ${still.fetched})`);
      await page.click("figure video + button");
      const played = await becomes(page, () => !document.querySelector("figure video").paused, undefined, 8000);
      check(played, `recording, ${mode}: the Play button still plays it`);
    }
    await page.close();
  }

  // Reduced motion is followed live, as the deck's pointer follows it.
  {
    const page = await open("/work/riflessi", { width: 1440, height: 900 });
    await showVideo(page);
    await becomes(page, () => !document.querySelector("figure video").paused, undefined, 8000);
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    const stopped = await becomes(page, () => document.querySelector("figure video").paused, undefined, 3000);
    check(stopped, "recording: switching reduced motion on mid-visit stops the loop");
    await page.close();
  }

  // The poster's head start, at a desktop width, where <main> is the scroller.
  {
    const page = await open("/work/riflessi", { width: 1440, height: 900, reduced: true });
    await page.evaluate(() => {
      const v = document.querySelector("figure video");
      const main = document.querySelector("main");
      const box = main && main.scrollHeight > main.clientHeight ? main : document.scrollingElement;
      box.scrollBy(0, v.getBoundingClientRect().top - innerHeight - 400);
    });
    const set = await becomes(page, () => Boolean(document.querySelector("figure video").getAttribute("poster")), undefined, 3000);
    const { onScreen } = await videoState(page);
    check(set && !onScreen, `recording: the poster is set before the video reaches the screen (set ${set}, on screen ${onScreen})`);
    await page.close();
  }

  // ── focus on a control over media ───────────────────────────────────────
  // The recording's Play/Pause chip sits on the video, so its ring falls on
  // whatever the frame shows. The accent ring on an ink chip once measured
  // ink on ink over Riflessi's dark frame in the light theme: focus vanished.
  // In both themes the ring must differ from the chip and carry a halo.
  for (const theme of ["light", "dark"]) {
    const page = await open("/work/riflessi", { width: 1440, height: 900, reduced: true, theme });
    await page.evaluate(() => document.querySelector("figure video").scrollIntoView({ block: "center" }));
    // Arrive by keyboard, so the ring is :focus-visible and not pointer focus.
    await page.focus("figure video + button");
    await page.keyboard.press("Tab");
    await page.keyboard.down("Shift");
    await page.keyboard.press("Tab");
    await page.keyboard.up("Shift");
    // Let the ring's transition land: under reduced motion it is 0.01ms, not
    // none, and a read in the same frame sees its starting value.
    await new Promise((r) => setTimeout(r, 300));
    const ring = await page.evaluate(() => {
      const b = document.activeElement;
      const cs = getComputedStyle(b);
      return {
        control: b.matches("figure video + button") && b.matches(":focus-visible"),
        outline: cs.outlineColor,
        chip: cs.backgroundColor,
        halo: cs.boxShadow,
      };
    });
    check(
      ring.control && ring.outline !== ring.chip && ring.halo !== "none",
      `recording control, ${theme} theme: focus ring differs from its chip and carries a halo (${ring.outline} on ${ring.chip})`,
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
