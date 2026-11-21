/** The landing page: its first screen, the work cards, their pan on hover and on a phone's scroll, and reduced motion. */
import { becomes, check, DRIFTPILOT_CARD, DRIFTPILOT_PAGE, open } from "./harness.mjs";

export async function run() {
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
}
