/** A secondary page's chrome: the scroll cue and chapter bar at desktop and on a phone, and reduced motion stopping every loop and reveal. */
import { becomes, check, open, scrollTo, STUDY } from "./harness.mjs";

export async function run() {
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
}
