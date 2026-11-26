/**
 * The rail fits its window without scrolling from 768px tall.
 *
 * It keeps overflow-y-auto (AGENTS.md: the rail must never hide its own
 * content), so check:overflow accepts a rail that scrolls; this is what
 * notices when it starts to. When it was made to fit (2026-10-31) it had
 * about 3px to spare at 768, so a longer role, availability line or nav
 * label would bring the scrollbar back unseen (review of #32, P1-3). Below
 * 760px tall it may scroll: that is the safety net, not a defect.
 *
 * It also says where you are. On every route the rail marks one page, with
 * the number that page's hero carries, and its rows hold still from page to
 * page: the current link's first letter once grew 2px, and every row under
 * it moved on each click. On a phone the bar's strip shows the current pill
 * clear of its faded ends; it used to load scrolled to its start, with the
 * current page off-screen on most routes.
 */
import { ROUTES, becomes, check, open } from "./harness.mjs";

export async function run() {
  for (const [width, height] of [[1366, 768], [1440, 790], [1512, 860], [1440, 900], [1920, 1080]]) {
    const page = await open("/", { width, height });
    const over = await page.evaluate(() => {
      const rail = document.querySelector(".rail");
      return rail ? rail.scrollHeight - rail.clientHeight : null;
    });
    check(
      over !== null && over <= 0,
      `rail ${width}x${height} fits without scrolling (${over === null ? "no rail" : over > 0 ? `${over}px over` : "fits"})`,
    );
    await page.close();
  }

  // ── where you are, on a desktop ──────────────────────────────────────────
  const heights = new Set();
  for (const path of ROUTES) {
    const page = await open(path, { width: 1440, height: 900 });
    const r = await page.evaluate(() => {
      const marked = [...document.querySelectorAll('.rail [aria-current="page"]')];
      return {
        count: marked.length,
        rail: marked[0]?.querySelector(".chip")?.textContent.trim() ?? null,
        hero: document.querySelector("#top .chip")?.textContent.trim() ?? null,
        rows: document.querySelector('.rail nav[aria-label="Sections"] > ul')?.getBoundingClientRect().height,
      };
    });
    heights.add(r.rows);
    // The overview's hero has no number chip; every other page's does.
    const numbered = path === "/" ? r.rail !== null : r.rail !== null && r.rail === r.hero;
    check(
      r.count === 1 && numbered,
      `${path}: the rail marks ${r.count} page(s), numbered ${r.rail}${path === "/" ? "" : ` (hero ${r.hero})`}`,
    );
    await page.close();
  }
  check(heights.size === 1, `the rail's rows hold still from page to page (${[...heights].join(", ")}px)`);

  // ── where you are, on a phone ────────────────────────────────────────────
  // Waited for rather than read at once: the strip is centred after
  // hydration, which can land after the load event.
  for (const path of ROUTES) {
    const page = await open(path, { width: 375, height: 800 });
    const inView = () => {
      const strip = document.querySelector("header .strip");
      const pill = strip?.querySelector('[aria-current="page"]');
      if (!strip || !pill) return false;
      const s = strip.getBoundingClientRect();
      const p = pill.getBoundingClientRect();
      // Clear of the 16px fades at either end (1px for rounding).
      return p.left - s.left >= 15 && s.right - p.right >= 15;
    };
    const ok = await becomes(page, inView);
    const at = await page.evaluate(() => {
      const strip = document.querySelector("header .strip");
      const pill = strip?.querySelector('[aria-current="page"]');
      return pill ? Math.round(pill.getBoundingClientRect().left - strip.getBoundingClientRect().left) : null;
    });
    check(ok, `${path} at 375px shows its own pill in the bar (${at === null ? "none marked" : `${at}px in`})`);
    await page.close();
  }
}
