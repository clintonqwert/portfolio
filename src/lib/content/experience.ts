import "server-only";

import type { Passage } from "@/types/content";

/**
 * AutoTrader.ca — five years, and the largest single block of experience on
 * this site. It gets a full section rather than a line in the track record
 * because eight months of studio work should not outweigh five years.
 *
 * There are no metrics for this work and none are invented. The measurement
 * caveat in the third passage is deliberate: on a page that publishes its own
 * unfixed gaps, a number that cannot be sourced is worth less than a mechanism
 * that can be explained.
 */
export const AUTOTRADER_RAIL = {
  org: "AutoTrader.ca — AutoSync",
  period: "Jan 2020 – Jun 2025",
  duration: "5 years",
  stack: ["Vue · Node.js", "PHP · MySQL", "Redis · AWS"],
} as const;

/** One-line summaries for the dashboard tiles. */
export const AUTOTRADER_LEDE =
  "Five years on the platform thousands of Canadian dealerships run their inventory on. The work I would point at first is the caching — and the outcome that mattered was stability, not speed.";

export const PROJECT_OS_LEDE =
  "The cross-project standard both sites are built against, including how five specialist AI roles are allowed to touch the work.";

export async function getAutoTraderPassages(): Promise<Passage[]> {
  return [
    {
      paragraphs: [
        "Five years of this was AutoSync — the platform thousands of Canadian dealerships run their inventory on. A large codebase I did not design, shared with other engineers, with Vue on the front end and Node.js, PHP, MySQL and REST APIs behind it. The PHP layer was a custom object-oriented architecture built in-house rather than on Laravel or Symfony, which meant the load-bearing questions were about our own architecture rather than about a framework's conventions.",
        "The work I would point at first is the caching. I implemented and tuned Redis Object Cache Pro against AWS-hosted Redis. Caching is usually sold as a speed improvement, and it was one — but the result that actually mattered was stability. After rollout, network-level downtime dropped to near zero. The platform stopped falling over, which is a different and better outcome than pages loading faster.",
        "I want to be precise about what I can and cannot tell you there. I did not own the dashboards and I did not keep the figures when I left, so I have no percentage to quote and I am not going to invent one. What I can describe exactly is the failure mode before and its absence afterwards. On a page that ends with a table of my own unfixed gaps, a number I cannot source is worth less than a mechanism I can explain.",
        "The rest of the five years: technical SEO on a marketplace where dealer inventory discoverability is the product rather than a marketing concern, and mentoring engineers through code review and pair programming. That last part is worth naming given the year I have spent as the only engineer on my own projects — the review habits on this page came from somewhere.",
      ],
    },
  ];
}

/**
 * Project OS — the cross-project standard both sites are built against.
 *
 * Note the enforcement wording. The five roles are report-only because their
 * role contracts say so, not because tool permissions block them: no role
 * declares `allowed-tools`. Stating that precisely is the point of the section.
 */
export const PROJECT_OS_RAIL = {
  name: "Project OS",
  documents: "44 documents",
  lines: "1,920 lines",
  roles: "5 agent roles",
} as const;

export async function getProjectOsPassages(): Promise<Passage[]> {
  return [
    {
      paragraphs: [
        "Two projects sharing conventions by memory is a coincidence waiting to drift. I wrote the conventions down as a cross-project engineering standard — stack defaults, the performance budget, testing priorities, and a ranked source-of-truth hierarchy that ends: when a document and the code disagree, the code is right and the document is a bug.",
        "It includes a section listing what is deliberately absent — no CMS, no client-state library, no component library — because unrecorded omissions get re-litigated every quarter by whoever arrives next. Adding one requires a written operating need. “It would be convenient” is explicitly not a need.",
        "The same standard defines how I use AI on delivery work. Five specialist roles — builder, reviewer, tester, auditor, content strategist — under a separation of powers written into the role contracts: only the builder may write files, and the other four are report-only, reporting findings on a P0/P1/P2 severity taxonomy for a human to decide on. The restriction lives in each role's instructions rather than in tool permissions — worth saying precisely, because the difference is exactly the kind of thing this page is about.",
        "The tester's protocol puts it plainly: the pull request description is a claim, the diff is ground truth, and disagreement between them is itself a finding.",
      ],
    },
  ];
}
