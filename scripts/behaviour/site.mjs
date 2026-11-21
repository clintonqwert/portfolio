/** Every route: the brand icons, unique ids and visible focus inside ink blocks, the /gaps redirect, and the Lighthouse URLs answering 200. */
import { check, open, ORIGIN, ROUTES } from "./harness.mjs";

export async function run() {
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
}
