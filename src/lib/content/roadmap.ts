import "server-only";

import type {
  DirectionStage,
  Horizon,
  OpenGap,
  RoadmapGroup,
  RoadmapItem,
  Source,
  UpNext,
} from "@/types/content";

/**
 * The roadmap: where the studio is heading, what shipped, what's in progress,
 * what comes next.
 *
 * Every item carries its sources: a pull request, a file in a public
 * repository, or a live page. Each was checked against main and the live
 * sites on 2026-09-28. Horizons follow one rule each:
 *  - shipped: merged to main or live on the site. At most three, newest
 *    first (getRoadmap enforces both); prune anything past ~60 days.
 *  - now: an open pull request. When it merges, move it to shipped and drop
 *    the gap it closes.
 *  - next: on a repository's roadmap with a priority, and not started.
 *  - later: waiting on a named condition.
 * Nothing sits in "now" without a pull request to point at.
 */

const DRIFTPILOT = "https://github.com/clintonqwert/driftpilot-site";
const RIFLESSI = "https://github.com/clintonqwert/riflessiautocare";

const RIFLESSI_ROADMAP = (item: number): Source => ({
  label: `Riflessi roadmap, item ${item}`,
  href: `${RIFLESSI}/blob/main/ai-context/05-roadmap.md#engineering-protection`,
});
const DRIFTPILOT_BACKLOG = (item: string): Source => ({
  label: `DriftPilot backlog, ${item}`,
  href: `${DRIFTPILOT}/blob/main/docs/maintenance/ROADMAP.md#9-prioritized-maintenance-backlog`,
});
// www: the bare driftpilot.ca answers with a 308 to it.
const DRIVE: Source = { label: "driftpilot.ca/automotive", href: "https://www.driftpilot.ca/automotive" };

export const ROADMAP_LEDE =
  "My studio’s plan across its two live sites. Each item links to the pull request, repository file or live page behind it.";

const DIRECTION: DirectionStage[] = [
  {
    name: "Framework",
    project: "DriftPilot",
    summary: "I built the studio site so theme, content and fonts swap out for the next client.",
    done: true,
    statusLabel: "Built · Jun – Jul 2026",
    source: { label: "DriftPilot’s charter", href: `${DRIFTPILOT}/blob/main/ai-context/00-charter.md` },
  },
  {
    name: "Proof",
    project: "Riflessi",
    summary: "The second site reused that foundation and reached a full first build in five weeks.",
    done: true,
    // "Built", not "Done": Riflessi's own launch gate (real pricing, its own
    // photography) is still open in its roadmap.
    statusLabel: "Built · Jul – Sep 2026",
    source: { label: "The Riflessi case study", href: "/work/riflessi" },
  },
  {
    name: "Drive",
    project: "Dealer platform",
    // driftpilot.ca's own words for the plan, and nothing more.
    summary: "Driftpilot Drive: inventory sync and display, lead capture and CRM routing in one platform.",
    done: false,
    statusLabel: "Planned, not started",
    source: DRIVE,
  },
];

const HORIZONS: readonly { horizon: Horizon; title: string; meaning: string }[] = [
  { horizon: "shipped", title: "Shipped", meaning: "Merged to main or live on the site, newest first." },
  { horizon: "now", title: "In progress", meaning: "In an open pull request you can read." },
  {
    horizon: "next",
    title: "Next",
    meaning: "I haven’t started these. Each sits on its repository’s roadmap with a priority.",
  },
  { horizon: "later", title: "Later", meaning: "Each waits on the condition in its line." },
];

const ITEMS: RoadmapItem[] = [
  {
    id: "riflessi-lead-delivery",
    title: "Formspree delivers Riflessi’s bookings and questions",
    project: "Riflessi",
    horizon: "shipped",
    shippedOn: "2026-09-29",
    detail:
      "A contact form sits below the booking form. A booking sent with JavaScript off arrives flagged as unverified, where the site used to discard it as spam. Tests in CI cover delivery, the flag and the timing gate.",
    sources: [
      { label: "riflessiautocare #15", href: `${RIFLESSI}/pull/15` },
      { label: "#19", href: `${RIFLESSI}/pull/19` },
    ],
  },
  {
    id: "riflessi-domain",
    title: "Riflessi on its own domain",
    project: "Riflessi",
    horizon: "shipped",
    // The go-live date, as Riflessi's launch gate records it; #18 (merged
    // 29 Sep) is where that record landed.
    shippedOn: "2026-09-28",
    detail: "riflessiautocare.ca serves the site, and its canonical links point there.",
    sources: [
      { label: "riflessiautocare.ca", href: "https://riflessiautocare.ca" },
      { label: "#18", href: `${RIFLESSI}/pull/18` },
    ],
  },
  {
    id: "driftpilot-lead-delivery",
    title: "Failed leads reach the visitor and Slack",
    project: "DriftPilot",
    horizon: "shipped",
    shippedOn: "2026-09-28",
    detail:
      "The form tries the CRM up to three times in ten seconds. If delivery still fails, the visitor gets a pre-filled email link and Slack gets the whole lead. Tests for that path run in CI.",
    sources: [{ label: "driftpilot-site #54", href: `${DRIFTPILOT}/pull/54` }],
  },
  {
    id: "riflessi-lead-tests",
    title: "Tests for Riflessi’s retries, timeout, honeypot and validation",
    project: "Riflessi",
    horizon: "next",
    detail:
      "Its suites cover how a lead is shaped for Formspree, the unverified flag, the timing gate, the free-text limits, and giving up at once on a rejected lead. Nothing yet tests the retries on a server error, the timeout, the honeypot or the other field rules.",
    sources: [RIFLESSI_ROADMAP(1)],
  },
  {
    id: "riflessi-lighthouse",
    title: "A Lighthouse budget in Riflessi’s CI",
    project: "Riflessi",
    horizon: "next",
    detail: "I’ll port DriftPilot’s budgets, so a slow change turns the pull request red.",
    sources: [RIFLESSI_ROADMAP(2)],
  },
  {
    id: "lead-alerts-and-monitoring",
    title: "A failed-booking alert, then error monitoring for both sites",
    project: "Both",
    horizon: "next",
    detail:
      "A failed Riflessi booking will post to Slack, as DriftPilot’s leads do. Error monitoring with alerting for both sites comes after.",
    sources: [RIFLESSI_ROADMAP(4), DRIFTPILOT_BACKLOG("P0-3")],
  },
  {
    id: "driftpilot-og-images",
    title: "Per-route share images on DriftPilot",
    project: "DriftPilot",
    horizon: "next",
    detail: "One global Open Graph image serves every route.",
    sources: [DRIFTPILOT_BACKLOG("P1-2")],
  },
  {
    id: "driftpilot-lighthouse-coverage",
    title: "Lighthouse on DriftPilot’s /process and /automotive",
    project: "DriftPilot",
    horizon: "next",
    detail: "The gate checks three pages: the home page, /pricing and /contact.",
    sources: [DRIFTPILOT_BACKLOG("P1-5")],
  },
  {
    id: "scoped-csp",
    title: "A scoped Content-Security-Policy on both sites",
    project: "Both",
    horizon: "next",
    detail: "Neither site sends one. Riflessi’s has to allow its 3D stage and analytics scripts.",
    sources: [
      RIFLESSI_ROADMAP(3),
      { label: "DriftPilot roadmap", href: `${DRIFTPILOT}/blob/main/ai-context/05-roadmap.md` },
    ],
  },
  {
    id: "cms-adapter",
    title: "Switch on the CMS adapter",
    project: "Both",
    horizon: "later",
    detail:
      "DriftPilot keeps an inactive adapter behind its typed accessors. Both sites leave the CMS off until editing them needs one.",
    sources: [
      { label: "DriftPilot roadmap", href: `${DRIFTPILOT}/blob/main/ai-context/05-roadmap.md#deferred-intentionally` },
      { label: "Riflessi roadmap", href: `${RIFLESSI}/blob/main/ai-context/05-roadmap.md#deferred-intentionally` },
    ],
  },
  {
    id: "driftpilot-drive",
    title: "Driftpilot Drive",
    project: "Drive",
    horizon: "later",
    detail: "I haven’t started it. The framework comes first.",
    sources: [DRIVE],
  },
];

const GAPS: OpenGap[] = [
  {
    gap: "Thin tests on the second site",
    consequence:
      "Riflessi’s retries on a server error, its timeout and its honeypot have no tests, and its validation tests stop at the free-text limits. A change there could stop bookings arriving and CI wouldn’t notice.",
    closedBy: "riflessi-lead-tests",
  },
  {
    gap: "No error monitoring",
    consequence:
      "Neither site alerts anyone when something fails at runtime, except DriftPilot’s failed leads, which post to Slack. A failed Riflessi booking survives only in a short-lived log, unless the visitor sends the pre-filled email.",
    closedBy: "lead-alerts-and-monitoring",
  },
  {
    gap: "No perf gate on the second site",
    consequence:
      "Riflessi ships without the Lighthouse budget that guards DriftPilot, so regressions can reach the live site unnoticed.",
    closedBy: "riflessi-lighthouse",
  },
  {
    gap: "No CMS yet",
    consequence: "Content lives in typed accessors, so a copy change ships as a pull request and a deploy.",
    closedBy: "cms-adapter",
  },
  {
    // Both sites post leads to Formspree (driftpilot-site 08-decisions.md
    // calls it "the live webhook"; riflessiautocare 08-decisions.md,
    // 2026-09-28). Only Riflessi's log records a mitigation: the owner checks
    // the spam tab weekly rather than paying for "Relaxed" filtering.
    gap: "Formspree can drop a real lead as spam",
    consequence:
      "Both sites deliver leads through Formspree. When its filter marks a real lead as spam, the visitor still sees success, no email goes out, and the site can’t tell.",
    mitigation: "For Riflessi, I check Formspree’s spam tab weekly until there’s a track record.",
  },
];

export async function getDirection(): Promise<DirectionStage[]> {
  return DIRECTION;
}

/**
 * The horizon rules, held here so the page, its list and the home tile all
 * read one answer:
 *  - a shipped date needs the pull request that merged it;
 *  - shipped keeps at most three items, newest first;
 *  - a horizon with no items is left out, so nothing counts or heads an
 *    empty section.
 * The build stops on the first two.
 */
export async function getRoadmap(): Promise<RoadmapGroup[]> {
  for (const item of ITEMS) {
    if (item.shippedOn !== undefined && !item.sources.some((s) => /\/pull\/\d+$/.test(s.href))) {
      throw new Error(`Roadmap item "${item.id}" shows a shipped date but cites no pull request`);
    }
  }
  const shipped = ITEMS.filter((item) => item.horizon === "shipped");
  if (shipped.length > 3) {
    throw new Error(`Shipped keeps at most three items; it has ${shipped.length}. Prune the oldest.`);
  }
  const dated = shipped.filter((item) => item.shippedOn !== undefined);
  for (let i = 1; i < dated.length; i++) {
    const [above, below] = [dated[i - 1]!, dated[i]!];
    if (above.shippedOn! < below.shippedOn!) {
      throw new Error(
        `Shipped runs newest first: "${above.id}" (${above.shippedOn}) sits above "${below.id}" (${below.shippedOn})`,
      );
    }
  }
  return HORIZONS.map((h) => ({ ...h, items: ITEMS.filter((item) => item.horizon === h.horizon) })).filter(
    (group) => group.items.length > 0,
  );
}

/**
 * The home tile's fourth cell: work with an open pull request when there is
 * some, since that is what is moving; otherwise the first of what's next.
 */
export async function getUpNext(): Promise<UpNext> {
  const groups = await getRoadmap();
  const now = groups.find((g) => g.horizon === "now");
  if (now) return { heading: now.title, status: "Open pull request", filled: true, items: now.items };
  const next = groups.find((g) => g.horizon === "next");
  return { heading: next?.title ?? "Next", status: "Not started", filled: false, items: next?.items ?? [] };
}

/**
 * The gaps, checked against the roadmap. A gap closed by an item that isn't
 * on the page would render a link to nothing, so the build stops instead.
 */
export async function getOpenGaps(): Promise<OpenGap[]> {
  const ids = ITEMS.map((item) => item.id);
  const repeated = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (repeated.length > 0) {
    throw new Error(`Roadmap item ids must be unique; repeated: ${repeated.join(", ")}`);
  }
  for (const gap of GAPS) {
    if (gap.closedBy !== undefined && !ids.includes(gap.closedBy)) {
      throw new Error(`Gap "${gap.gap}" is closed by "${gap.closedBy}", which is not a roadmap item`);
    }
  }
  return GAPS;
}
