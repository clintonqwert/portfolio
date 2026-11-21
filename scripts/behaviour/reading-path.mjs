/** The reading path: the rail's order, every hero's number, every page's "next", and where a page ends on a phone. */
import { check, open } from "./harness.mjs";

export async function run() {
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
}
