import "server-only";

import type {
  DirectionStage,
  Horizon,
  OpenGap,
  RoadmapGroup,
  RoadmapItem,
  Source,
} from "@/types/content";

/**
 * The roadmap: where the studio is heading, what shipped, what's in progress,
 * what comes next.
 *
 * Every item carries its sources: a pull request, a file in a public
 * repository, or a live page. Each was checked against main and the live
 * sites on 2026-09-28. Horizons follow one rule each:
 *  - shipped: merged to main. Keep at most three, newest first, and prune
 *    anything past ~60 days.
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
  { horizon: "shipped", title: "Shipped", meaning: "Merged to main, newest first." },
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
    id: "riflessi-formspree",
    title: "Formspree delivers bookings and questions",
    project: "Riflessi",
    horizon: "shipped",
    shippedOn: "2026-09-28",
    detail:
      "A contact form sits below the booking form, and tests in CI cover delivery and the spam timing gate.",
    sources: [
      { label: "riflessiautocare #15", href: `${RIFLESSI}/pull/15` },
      { label: "#14", href: `${RIFLESSI}/pull/14` },
    ],
  },
  {
    id: "riflessi-domain",
    title: "Riflessi on its own domain",
    project: "Riflessi",
    horizon: "shipped",
    shippedOn: "2026-09-28",
    detail: "riflessiautocare.ca serves the site, and its canonical links point there.",
    sources: [{ label: "riflessiautocare.ca", href: "https://riflessiautocare.ca" }],
  },
  {
    id: "riflessi-nojs-leads",
    title: "Keep leads sent without JavaScript",
    project: "Riflessi",
    horizon: "now",
    detail:
      "A booking sent with JavaScript off carries no timing stamp, so the site discards it as spam. The fix delivers it flagged as unverified, and adds tests for the free-text limits.",
    sources: [{ label: "riflessiautocare #19", href: `${RIFLESSI}/pull/19` }],
  },
  {
    id: "riflessi-lead-tests",
    title: "Tests for Riflessi’s retries, timeout, honeypot and validation",
    project: "Riflessi",
    horizon: "next",
    detail:
      "Its suites cover how a lead is shaped for Formspree, the timing gate, and giving up at once on a rejected lead. Nothing yet tests the retries on a server error, the timeout, the honeypot or field validation.",
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
    gap: "Leads sent without JavaScript are dropped",
    consequence:
      "On Riflessi, a booking sent with JavaScript off counts as spam: the visitor sees a thank-you and the lead reaches only the log.",
    closedBy: "riflessi-nojs-leads",
  },
  {
    gap: "Thin tests on the second site",
    consequence:
      "Riflessi’s retries on server errors, timeout, honeypot and field validation have no tests, so a change could stop bookings arriving and CI wouldn’t notice.",
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
    // Riflessi ai-context/08-decisions.md, 2026-09-28: the owner checks the
    // spam tab weekly rather than paying for the plan with "Relaxed" filtering.
    gap: "Formspree can drop a real lead as spam",
    consequence: "On Riflessi the visitor sees success, no email goes out, and Formspree’s API can’t tell the site.",
    mitigation: "I check Formspree’s spam tab weekly until there’s a track record.",
  },
];

export async function getDirection(): Promise<DirectionStage[]> {
  return DIRECTION;
}

export async function getRoadmap(): Promise<RoadmapGroup[]> {
  return HORIZONS.map((h) => ({ ...h, items: ITEMS.filter((item) => item.horizon === h.horizon) }));
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
