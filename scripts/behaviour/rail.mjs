/**
 * The rail fits its window without scrolling from 768px tall.
 *
 * It keeps overflow-y-auto (AGENTS.md: the rail must never hide its own
 * content), so check:overflow accepts a rail that scrolls; this is what
 * notices when it starts to. When it was made to fit (2026-10-31) it had
 * about 3px to spare at 768, so a longer role, availability line or nav
 * label would bring the scrollbar back unseen (review of #32, P1-3). Below
 * 760px tall it may scroll: that is the safety net, not a defect.
 */
import { check, open } from "./harness.mjs";

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
}
