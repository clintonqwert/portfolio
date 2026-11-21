/** /roadmap: fix links that land, horizons the hero counts, and closed gaps that read as closed. */
import { check, open } from "./harness.mjs";

export async function run() {
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
}
