import "server-only";

import { RIFLESSI_SCROLL_VIDEO } from "@/lib/content/assets";
import {
  PROJECT_OS_LEDE,
  PROJECT_OS_TILE_LEDE,
  getProjectOsRoles,
} from "@/lib/content/experience";
import { getPrinciples } from "@/lib/content/practice";
import { getCaseStudy } from "@/lib/content/work";
import type { CaseStudy, FeaturedWork, Principle, ProofPoint } from "@/types/content";

/**
 * The landing page's own words. Every line is in profile/portfolio-v2-brief.md
 * with its source, and was approved there before it shipped (2026-10-31).
 *
 * Wherever a fact already has an owner (a case study's summary, its stats, the
 * Project OS lines), it is read from there rather than restated, so the landing
 * cannot drift from the page that proves it.
 */

async function study(slug: string): Promise<CaseStudy> {
  const found = await getCaseStudy(slug);
  if (!found) throw new Error(`landing: no case study "${slug}"`);
  return found;
}

/** Four claims, one per capability, each linking to the page that owns it. */
export async function getProofPoints(): Promise<ProofPoint[]> {
  const [tadvantage, driftpilot, riflessi] = await Promise.all([
    study("tadvantage"),
    study("driftpilot"),
    study("riflessi"),
  ]);
  const [commits, pulls] = tadvantage.stats;
  if (!commits || !pulls) throw new Error("landing: Tadvantage needs its two figures");
  const live = [driftpilot, riflessi].map((s) => {
    if (!s.liveUrl) throw new Error(`landing: ${s.slug} needs its live URL`);
    return { label: s.liveUrl, href: `https://${s.liveUrl}` };
  });

  return [
    {
      // Both sites, each a click away: the claim is two of them, and linking
      // one case study proved only half of it (review of #32, P2-4).
      label: "Product delivery",
      claim: "Two live sites shipped solo since 2026.",
      sources: live,
    },
    {
      // The page's one key figure. Lowercased into the sentence: the stat's
      // label is "Commits, the most of 100+ contributors".
      label: "Platform scale",
      figure: commits.value,
      claim: `commits and ${pulls.value} merged pull requests, the most of 100+ contributors.`,
      // The same caveat the Tadvantage study carries: these are the one
      // set of figures here a reader cannot click through and check.
      note: "Counted from a private repository",
      href: "/work/tadvantage",
    },
    {
      label: "Reliability",
      claim:
        "Ended three years of object-cache churn, with no reverts from its March 2022 launch to May 2025.",
      href: "/autotrader",
    },
    {
      label: "AI-assisted engineering",
      claim: PROJECT_OS_TILE_LEDE,
      href: "/standard",
    },
  ];
}

/** The four featured projects, named by the capability each one proves. */
export async function getFeaturedWork(): Promise<FeaturedWork[]> {
  const [driftpilot, riflessi, roles] = await Promise.all([
    study("driftpilot"),
    study("riflessi"),
    getProjectOsRoles(),
  ]);

  return [
    {
      name: "AutoTrader.ca — AutoSync",
      capability: "Platform engineering on a national SaaS platform",
      text: "Six and a half years on the platform behind dealer websites across Canada. I was release master on several of its releases, built its SEO subsystem and ended three years of object-cache churn.",
      stack: ["Vue.js", "Node.js", "PHP", "MySQL", "Redis", "AWS"],
      href: "/autotrader",
      cta: "Read the AutoTrader case study",
      preview: "autotrader",
    },
    {
      name: driftpilot.name,
      capability: "Independent full-stack product delivery",
      text: driftpilot.summary,
      stack: driftpilot.stack,
      href: `/work/${driftpilot.slug}`,
      cta: "Read the DriftPilot case study",
      preview: driftpilot.slug,
    },
    {
      name: riflessi.name,
      capability: "Performance on a 3D-heavy site, self-directed",
      text: riflessi.summary,
      stack: riflessi.stack,
      href: `/work/${riflessi.slug}`,
      cta: "Read the Riflessi case study",
      // The case study's scroll recording, not a still: the camera moving
      // around the car as the page scrolls is the work (owner, 2026-10-31).
      video: RIFLESSI_SCROLL_VIDEO,
    },
    {
      // The guardrails sentence in the brief joins this once that repository
      // is public, so a reader can check it in one click.
      name: "AI delivery workflow",
      capability: "AI-assisted engineering with guardrails",
      text: PROJECT_OS_LEDE,
      stack: ["Claude Code", "Codex", "Gemini CLI"],
      href: "/standard",
      cta: "See the AI workflow",
      roles,
    },
  ];
}

/** The four of /history's principles the landing shows, in this order. */
const LANDING_PRINCIPLES = [
  "Budgets, not intentions",
  "Contracts over implementations",
  "Gaps in writing",
  "Review before anything lands",
];

export async function getLandingPrinciples(): Promise<Principle[]> {
  const all = await getPrinciples();
  return LANDING_PRINCIPLES.map((title) => {
    const found = all.find((p) => p.title === title);
    if (!found) throw new Error(`landing: no principle "${title}"`);
    return found;
  });
}

export const ROADMAP_TEASER = {
  heading: "What’s next, and what’s still missing",
  text: "My studio’s plan across its two live sites, and the weaknesses I haven’t fixed yet. Each links to the pull request or file behind it.",
} as const;
