/** A case study's screen recording, and focus on the control over it. */
import { becomes, check, open, scrollTo } from "./harness.mjs";

export async function run() {
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
}
