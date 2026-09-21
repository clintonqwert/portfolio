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

/**
 * Short restatements of facts already published in the passages below, for the
 * dashboard tile. Same claims, fewer words — not new material.
 */
export const AUTOTRADER_POINTS = [
  "Custom in-house OOP PHP, not Laravel or Symfony",
  "Redis Object Cache Pro against AWS-hosted Redis",
  "Technical SEO where inventory discoverability is the product",
  "Mentored through code review and pair programming",
];

export async function getAutoTraderPassages(): Promise<Passage[]> {
  return [
    {
      heading: "The platform",
      paragraphs: [
        "Five years of this was AutoSync \u2014 the platform thousands of Canadian dealerships run their inventory on. A large codebase I did not design, shared with other engineers, with Vue on the front end and Node.js, PHP, MySQL and REST APIs behind it. The PHP layer was a custom object-oriented architecture built in-house rather than on Laravel or Symfony, which meant the load-bearing questions were about our own architecture rather than about a framework\u2019s conventions.",
      ],
    },
    {
      heading: "The caching work",
      paragraphs: [
        "The work I would point at first is the caching. I implemented and tuned Redis Object Cache Pro against AWS-hosted Redis. Caching is usually sold as a speed improvement, and it was one \u2014 but the result that actually mattered was stability. After rollout, network-level downtime dropped to near zero. The platform stopped falling over, which is a different and better outcome than pages loading faster.",
      ],
    },
    {
      heading: "What I cannot tell you",
      paragraphs: [
        "I want to be precise about what I can and cannot tell you there. I did not own the dashboards and I did not keep the figures when I left, so I have no percentage to quote and I am not going to invent one. What I can describe exactly is the failure mode before and its absence afterwards. On a page that ends with a table of my own unfixed gaps, a number I cannot source is worth less than a mechanism I can explain.",
      ],
    },
    {
      heading: "The rest of the five years",
      paragraphs: [
        "The rest of the five years: technical SEO on a marketplace where dealer inventory discoverability is the product rather than a marketing concern, and mentoring engineers through code review and pair programming. That last part is worth naming given the year I have spent as the only engineer on my own projects \u2014 the review habits on this page came from somewhere.",
      ],
    },
    {
      heading: "How the work was run",
      paragraphs: [
        "Five years of this was team work, not solo work. Agile delivery, code review on every change, and pair programming when something was load-bearing enough to be worth two people\u2019s time. I reviewed other engineers\u2019 work and had mine reviewed, on a codebase I did not design and could not unilaterally change. That is a different discipline from the studio year, and the more common one.",
      ],
    },
    {
      heading: "What I would do differently",
      paragraphs: [
        "I would have kept my own record. I can describe the caching work precisely and I cannot quantify it, because the dashboards belonged to the platform team and I took no figures with me. The mechanism survives; the evidence did not. Every project on this site since has a measurement written into it before the feature ships, and that habit started with not being able to answer this question.",
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
      heading: "Why it is written down",
      paragraphs: [
        "Two projects sharing conventions by memory is a coincidence waiting to drift. I wrote the conventions down as a cross-project engineering standard \u2014 stack defaults, the performance budget, testing priorities, and a ranked source-of-truth hierarchy that ends: when a document and the code disagree, the code is right and the document is a bug.",
      ],
    },
    {
      heading: "What is deliberately absent",
      paragraphs: [
        "It includes a section listing what is deliberately absent, because unrecorded omissions get re-litigated every quarter by whoever arrives next. Adding one requires a written operating need. \u201cIt would be convenient\u201d is explicitly not a need.",
      ],
      list: [
        { term: "No CMS", detail: "Content lives in typed accessors." },
        { term: "No client-state library", detail: "Server components hold the state." },
        { term: "No component library", detail: "The design system is the tokens." },
      ],
    },
    {
      heading: "How AI is allowed to touch the work",
      paragraphs: [
        "The same standard defines how I use AI on delivery work: five specialist roles under a separation of powers written into the role contracts, reporting findings on a P0/P1/P2 severity taxonomy for a human to decide on.",
      ],
      list: [
        { term: "Builder", detail: "May write files." },
        { term: "Reviewer", detail: "Report-only." },
        { term: "Tester", detail: "Report-only." },
        { term: "Auditor", detail: "Report-only." },
        { term: "Content strategist", detail: "Report-only." },
      ],
    },
    {
      heading: "Where the restriction actually lives",
      paragraphs: [
        "The restriction lives in each role\u2019s instructions, not in tool permissions. No role declares `allowed-tools`, so nothing in the tooling enforces it \u2014 worth saying precisely, because the difference is exactly the kind of thing this page is about.",
      ],
    },
    {
      heading: "The tester\u2019s protocol",
      paragraphs: [
        "The tester\u2019s protocol puts it plainly: the pull request description is a claim, the diff is ground truth, and disagreement between them is itself a finding.",
      ],
    },
  ];
}
