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
  "/", "/standard", "/roadmap", "/history", "/autotrader",
  "/work/driftpilot", "/work/riflessi", "/work/tadvantage", "/work/mygarage", "/work/luxury-tax",
];

/** A case study with a hero shot, figures, an ink chapter and a diagram-free first chapter. */
const STUDY = "/work/riflessi";

/** The landing's DriftPilot card, and the whole-page image its hover pans. */
const DRIFTPILOT_CARD = '.work-card:has(a[href="/work/driftpilot"])';
const DRIFTPILOT_PAGE = `${DRIFTPILOT_CARD} img.work-shot-image`;

const browser = await puppeteer.launch({
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
  // ── the landing's first screen ──────────────────────────────────────────
  // The two things a reader came to do: the primary action lands on the
  // work, and the résumé is a real PDF. At rest nothing is fetched that is
  // not shown: no work card's whole page, and not the recording, which waits
  // until it is half on screen. Negative checks, so each waits out a settle.
  for (const [width, height] of [[390, 844], [1024, 768], [1440, 900], [1920, 1080]]) {
    const page = await open("/", { width, height });
    const r = await page.evaluate(async () => {
      const primary = document.querySelector('#top a[href="#work"]');
      const resume = document.querySelector('#top a[download][href$=".pdf"]');
      const res = resume ? await fetch(resume.getAttribute("href")) : null;
      return {
        primary: primary !== null && document.getElementById("work") !== null,
        resume: res ? `${res.status} ${res.headers.get("content-type")}` : "missing",
      };
    });
    check(r.primary, `landing ${width}x${height}: "View selected work" leads to #work`);
    check(/^200 application\/pdf/.test(r.resume), `landing ${width}x${height}: the résumé action serves the PDF (${r.resume})`);

    await new Promise((r) => setTimeout(r, 500));
    const rest = await page.evaluate(() => ({
      pages: [...document.querySelectorAll("img.work-shot-image")].filter((i) => i.getAttribute("src")).length,
      // A sized image with no source draws a broken-image icon; at rest the
      // page image must draw nothing at all over its window.
      drawn: [...document.querySelectorAll("img.work-shot-image")].filter((i) => getComputedStyle(i).visibility !== "hidden").length,
      video: performance.getEntriesByType("resource").some((e) => e.name.endsWith(".mp4")),
    }));
    check(rest.pages === 0, `landing ${width}x${height} fetches no whole-page preview at rest (${rest.pages} loaded)`);
    check(rest.drawn === 0, `landing ${width}x${height} draws no empty page image over a window at rest (${rest.drawn} drawn)`);
    check(!rest.video, `landing ${width}x${height} fetches no recording at rest`);
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

  // ── the work cards ──────────────────────────────────────────────────────
  // Four cards, each with one link named for where it goes ("Read the …
  // case study", "See the AI workflow"), so a screen reader hears four
  // specific links rather than four "Read more"s. Side by side, their
  // pictures share one height, so the text under them starts on one line.
  for (const [width, height] of [[1024, 768], [1440, 900], [1920, 1080]]) {
    const page = await open("/", { width, height });
    const r = await page.evaluate(() => {
      const cards = [...document.querySelectorAll(".work-card")];
      const links = cards.map((c) => [...c.querySelectorAll("a[href]")].map((a) => a.textContent.trim()));
      const rows = new Map();
      for (const card of cards) {
        const row = Math.round(card.getBoundingClientRect().top);
        const picture = Math.round(card.firstElementChild.getBoundingClientRect().height);
        rows.set(row, [...(rows.get(row) ?? []), picture]);
      }
      return {
        count: cards.length,
        named: links.every((l) => l.length === 1 && /^(Read|See) the /.test(l[0])),
        links: links.map((l) => l.join(" | ")),
        // 1px of slack: a bordered frame rounds a pixel off a 16:9 one.
        uneven: [...rows.values()].filter((h) => Math.max(...h) - Math.min(...h) > 1),
      };
    });
    check(r.count === 4 && r.named, `landing ${width}x${height}: 4 work cards, each one specific link (${r.links.join("; ")})`);
    check(r.uneven.length === 0, `landing ${width}x${height}: cards side by side have pictures of one height (${JSON.stringify(r.uneven)})`);
    await page.close();
  }

  // ── a work card's screenshot: loads and pans on hover ──────────────────
  {
    const page = await open("/", { width: 1920, height: 1080 });
    await (await page.$(DRIFTPILOT_CARD)).hover();
    const panned = await becomes(
      page,
      (sel) => new DOMMatrix(getComputedStyle(document.querySelector(sel)).transform).m42 < -20,
      DRIFTPILOT_PAGE,
      3000,
    );
    const state = await page.evaluate((sel) => ({
      hover: matchMedia("(hover: hover)").matches,
      y: Math.round(new DOMMatrix(getComputedStyle(document.querySelector(sel)).transform).m42),
    }), DRIFTPILOT_PAGE);
    check(panned, `hovering a work card pans its screenshot (hover media ${state.hover}, moved ${state.y}px)`);
    const loaded = await becomes(
      page,
      (sel) => {
        const img = document.querySelector(sel);
        return img?.getAttribute("src") && img.complete && img.naturalWidth > 0 && getComputedStyle(img).visibility === "visible";
      },
      DRIFTPILOT_PAGE,
    );
    check(loaded, "hovering a work card fetches its whole-page preview and shows it once it arrives");
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
  // breakpoint (64rem = 1280px there) still stacks the cards. The layout
  // comes from the lg: utilities, the pan from globals.css and the loader
  // from PreviewLoader; all three have to agree on where "stacked" ends.
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
      const shots = await page.evaluate(() => ({
        windows: [...document.querySelectorAll("img.work-shot-window")].filter((i) => i.offsetParent !== null).length,
        recording: document.querySelector(".work-card video") !== null,
      }));
      check(
        shots.windows === 2 && shots.recording,
        `stacked overview (${at}) shows both work screenshots and the recording (${shots.windows} windows, recording ${shots.recording})`,
      );
    }

    // Bring the first shot up the screen and see whether its page loads and pans.
    await page.evaluate(() => {
      const frame = document.querySelector("figure.work-shot-frame");
      window.scrollTo(0, window.scrollY + frame.getBoundingClientRect().top - 300);
    });
    const state = () =>
      page.evaluate(() => {
        const img = document.querySelector("figure.work-shot-frame img.work-shot-image");
        const top = document.querySelector("figure.work-shot-frame img.work-shot-window");
        return {
          loaded: Boolean(img.getAttribute("src")) && img.complete && img.naturalWidth > 0,
          y: Math.round(new DOMMatrix(getComputedStyle(img).transform).m42),
          window: top.complete && top.naturalWidth > 0,
          hidden: getComputedStyle(img).visibility === "hidden",
        };
      });
    if (!reduced && !saveData) {
      const panned = await becomes(page, () => {
        const img = document.querySelector("figure.work-shot-frame img.work-shot-image");
        return (
          img.complete && img.naturalWidth > 0 && getComputedStyle(img).visibility === "visible" &&
          new DOMMatrix(getComputedStyle(img).transform).m42 < -20
        );
      });
      const s = await state();
      check(panned, `stacked (${at}): scrolling a card loads its page and pans it (loaded ${s.loaded}, moved ${s.y}px)`);
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
  // Every page carries its rail number in its hero, and each page's close
  // offers the next page in rail order, so a reader following "Next" walks
  // the rail exactly.
  {
    const PATH = [
      "/autotrader", "/work/tadvantage", "/work/mygarage", "/work/luxury-tax",
      "/work/driftpilot", "/work/riflessi", "/history", "/standard", "/roadmap",
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

    // ── a page's end on a phone ─────────────────────────────────────────
    // The close's last row (All work, email, Résumé) is the end of the
    // page: no more air beneath it than the rule leaves above it. The
    // desktop bottom padding once applied here too, 64px of blank page a
    // phone could scroll into past the Résumé button.
    //
    // Measured in whichever element scrolls, chosen the way scrollTo() does.
    // Reading the document alone, a <main> that took the scroll on a phone
    // made `below` thousands of pixels negative, and the check passed with
    // any amount of blank space inside <main>; so negative fails too.
    for (const href of PATH) {
      const p = await open(href, { width: 390, height: 844 });
      const r = await p.evaluate(() => {
        const row = document.querySelector("main footer .sheet")?.lastElementChild;
        if (!row) return null;
        const main = document.querySelector("main");
        const el = main && main.scrollHeight > main.clientHeight ? main : document.scrollingElement;
        el.scrollTo(0, el.scrollHeight);
        // The row's bottom in the scroller's own content coordinates.
        const origin = el === document.scrollingElement ? 0 : el.getBoundingClientRect().top;
        return {
          scroller: el.tagName.toLowerCase(),
          below: Math.round(el.scrollHeight - (row.getBoundingClientRect().bottom - origin + el.scrollTop)),
          above: Math.round(parseFloat(getComputedStyle(row).paddingTop)),
        };
      });
      check(
        r !== null && r.below >= 0 && r.below <= r.above,
        `${href} at 390px ends under its last row (${r?.below}px below it, ${r?.above}px above, in <${r?.scroller}>)`,
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

  // Reduced motion is followed live, as the work cards' loader follows it.
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

  // ── reduced motion: hovering a card neither pans nor fetches ──────────
  {
    const page = await open("/", { width: 1920, height: 1080, reduced: true });
    await (await page.$(DRIFTPILOT_CARD)).hover();
    await new Promise((r) => setTimeout(r, 1200));
    const after = await page.evaluate((sel) => ({
      moved: new DOMMatrix(getComputedStyle(document.querySelector(sel)).transform).m42,
      hover: matchMedia("(hover: hover)").matches,
      pages: [...document.querySelectorAll("img.work-shot-image")].filter((i) => i.getAttribute("src")).length,
    }), DRIFTPILOT_PAGE);
    // Only meaningful with hover available — otherwise "no pan" proves nothing.
    check(
      after.hover && after.moved === 0 && after.pages === 0,
      `reduced motion: hovering a work card neither pans nor fetches (hover media ${after.hover}, moved ${after.moved}px, ${after.pages} loaded)`,
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
  // /roadmap: every fix link in the gaps chapter ("Fix:" on an open gap,
  // "Closed … by" on a closed one) lands on a roadmap item on the page, so a
  // gap can never point at nothing.
  {
    const page = await open("/roadmap", { width: 1440, height: 900 });
    const links = await page.evaluate(() =>
      [...document.querySelectorAll("a[data-fix]")].map((a) => {
        const id = decodeURIComponent((a.getAttribute("href") ?? "").slice(1));
        return { id, ok: Boolean(document.getElementById(id)) };
      }),
    );
    const broken = links.filter((l) => !l.ok).map((l) => l.id);
    check(
      links.length > 0 && broken.length === 0,
      `every open gap's fix link lands on a roadmap item (${links.length} links${broken.length ? `, broken: ${broken.join(", ")}` : ""})`,
    );
    await page.close();
  }
  // /gaps became /roadmap on 2026-09-28. Old links must keep working, and
  // permanently, so search engines carry the URL over.
  {
    const res = await fetch(`${ORIGIN}/gaps`, { redirect: "manual" });
    const to = res.headers.get("location") ?? "";
    check(
      res.status === 308 && new URL(to, ORIGIN).pathname === "/roadmap",
      `/gaps redirects permanently to /roadmap (${res.status} → ${to || "no location"})`,
    );
  }
  // Lighthouse CI must measure the pages themselves. A URL that redirects
  // times the hop, not the page, and a renamed route leaves the gate timing
  // a redirect without anyone noticing (it happened to /gaps).
  {
    const { readFileSync } = await import("node:fs");
    const paths = ["lighthouserc.json", "lighthouserc.mobile.json"].flatMap((file) =>
      JSON.parse(readFileSync(file, "utf8")).ci.collect.url.map((u) => new URL(u).pathname),
    );
    const moved = [];
    for (const path of paths) {
      const res = await fetch(`${ORIGIN}${path}`, { redirect: "manual" });
      if (res.status !== 200) moved.push(`${path} ${res.status}`);
    }
    check(
      moved.length === 0,
      `every Lighthouse URL answers 200 without a redirect (${paths.length} URLs${moved.length ? `; ${moved.join(", ")}` : ""})`,
    );
  }
  // /roadmap's hero counts only horizons the page shows. The list leaves an
  // empty horizon out, so a count of 0 would name a section that isn't there.
  {
    const page = await open("/roadmap", { width: 1440, height: 900 });
    const orphans = await page.evaluate(() => {
      const sections = new Set(
        [...document.querySelectorAll("#the-roadmap h3")].map((h) => h.textContent.trim()),
      );
      return [...document.querySelectorAll("article dl dt")]
        .map((dt) => dt.textContent.trim())
        .filter((label) => !sections.has(label));
    });
    check(
      orphans.length === 0,
      `every horizon /roadmap's hero counts has a section on the page${orphans.length ? ` (missing: ${orphans.join(", ")})` : ""}`,
    );
    await page.close();
  }
  // /roadmap: a closed gap reads as closed before anything else. Its closed
  // date comes first in reading order (a screen reader, reader mode and a
  // copy-paste all drop the strike-through), its text is struck, and its
  // evidence is the pull requests that closed it. No open gap is struck.
  {
    const page = await open("/roadmap", { width: 1440, height: 900 });
    const { closed, wrong } = await page.evaluate(() => {
      const wrong = [];
      let closed = 0;
      for (const li of document.querySelectorAll("#gaps li")) {
        const struck = li.querySelector("s");
        const name = li.querySelector("p")?.textContent?.trim() ?? "?";
        const status = [...li.querySelectorAll("span")].find((el) => /^Closed\b/.test(el.textContent.trim()));
        if (!struck) {
          if (status) wrong.push(`${name}: says Closed but isn't struck`);
          continue;
        }
        closed += 1;
        if (!status) wrong.push(`${name}: struck with no closed date`);
        else if (!(status.compareDocumentPosition(struck) & Node.DOCUMENT_POSITION_FOLLOWING)) {
          wrong.push(`${name}: closed date comes after the struck text`);
        }
        const links = [...li.querySelectorAll("a")].map((a) => a.href);
        if (links.length === 0 || !links.every((href) => /\/pull\/\d+$/.test(href))) {
          wrong.push(`${name}: evidence isn't pull requests (${links.join(" ")})`);
        }
      }
      return { closed, wrong };
    });
    check(
      closed > 0 && wrong.length === 0,
      `every closed gap leads with its date, is struck, and cites pull requests (${closed} closed${wrong.length ? `; ${wrong.join("; ")}` : ""})`,
    );
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
