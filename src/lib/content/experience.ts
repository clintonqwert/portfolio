import "server-only";

import { AUTOSYNC_INVENTORY_IMAGE } from "@/lib/content/assets";
import { REPO_HREF } from "@/lib/content/profile";
import type { Passage, Stat } from "@/types/content";

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
  "Five years at AutoTrader.ca, after I came over from Convertus with the platform in 2020. The work I’d point you to first is the caching, and the win was stability more than speed.";

export const PROJECT_OS_LEDE =
  "I designed a five-role AI workflow and deliver my work through it. One writes code, the other four only report, and I make the decisions.";

/**
 * The AutoTrader tile's two figures, here rather than in the component so the
 * tile and the Outcome row below cannot drift apart. The second is the exact
 * claim the repository supports — none after rollout — not the before-count,
 * which came from a keyword search of the history and was never checked line
 * by line (review of #12, P1-2).
 */
export const AUTOTRADER_FIGURES: Stat[] = [
  { value: "5 yrs", label: "Jan 2020 \u2013 Jun 2025" },
  { value: "0", label: "Cache reverts & removals, 3 yrs on" },
];

/**
 * Short restatements of facts already published in the passages below, for the
 * dashboard tile. Same claims, fewer words — not new material.
 *
 * Four, and the tile renders four. A fifth was added and then sliced off when
 * the skills strip took the height it needed, which left an entry in this file
 * that shipped nowhere. The claim it made — Agile delivery on a shared codebase
 * — is in the "The rest of the five years" passage below, which is where it reads
 * properly anyway.
 *
 * Each must fit one line at 1680 and 1920, about 70 characters. From 1680 the
 * tile's screenshot window takes the height the points leave, and the deck's
 * four windows must match; check:behaviour names any point that wraps.
 */
export const AUTOTRADER_POINTS = [
  "Custom in-house OOP PHP, no Laravel or Symfony",
  "Object Cache Pro: ended 3 years of cache churn",
  "Technical SEO, where getting inventory found is the product",
  "Built the luxury tax; worked on Ford Model E and CARFAX v3",
];

export async function getAutoTraderPassages(): Promise<Passage[]> {
  return [
    {
      heading: "The platform",
      paragraphs: [
        "AutoSync is the platform that runs inventory for Canadian dealerships nationwide. It was a large codebase I didn’t design, shared with other engineers: Vue on the front end, and Node.js, PHP, MySQL and REST APIs behind it. The PHP was our own object-oriented architecture, built in-house with no Laravel or Symfony, so the hard questions were about our own design, with no framework conventions to lean on.",
      ],
      figure: {
        image: AUTOSYNC_INVENTORY_IMAGE,
        caption: "The inventory listing on the platform’s public demo, the page shoppers search.",
      },
    },
    {
      heading: "The caching work",
      paragraphs: [
        "If you look at one thing from these five years, make it the caching. As I saw it, the platform stopped falling over, and that mattered more than any speed-up.",
      ],
      /*
        Problem, ownership, decision, trade-off, rollout, outcome: the shape a
        hiring manager reads a senior engineer's work in (an outside review,
        2026-09-26). Sourced from the platform repository's own history
        (docs/evidence-redis-convertus-2026-09-26.md, private), with nothing
        internal published: no ticket IDs, commit hashes, branch names or the
        plugin author's name.

        Two kinds of claim, kept apart. What the repository shows — the churn
        before, the configuration, the 33 of 36 commits, nothing reverted or
        removed after — is stated as fact, and like the commit counts it is
        private, so the Outcome row says so. Why the churn happened is the
        owner's own account and says so ("As I saw it"). The before-counts are
        no longer published: they came from a keyword search the evidence
        itself said to check before quoting, and were never checked line by
        line (review of #12, P1-2). "~0 downtime" is no longer claimed: nothing backs a
        downtime figure, so none is.
      */
      list: [
        {
          term: "Problem",
          detail:
            "For three years, the object cache kept getting added, removed, swapped for other plugins and reverted, with hotfixes after deploys to switch it back on. As I saw it, the churn was a reaction to downtime.",
        },
        {
          term: "My part",
          detail:
            "I backed out the approach that kept getting reverted, moved the platform to Redis Object Cache Pro and created its repository. I wrote 33 of the 36 commits to the platform’s Redis configuration, and later rolled page caching out across the fleet.",
        },
        {
          term: "Decision",
          detail:
            "A dedicated Redis host in production (I chose not to use a cluster there) and shared clusters in dev and staging. Per-site key prefixes, global groups and non-persistent groups let a fleet of sites share one cache, and I worked through the flush and prefetch settings with the plugin’s author.",
        },
        {
          term: "Trade-off",
          detail:
            "Page caching leaves out the inventory and showroom routes, because those pages can never be served stale.",
        },
        {
          term: "Rollout",
          detail:
            "I proved it out on a separate test network first, load-test configuration included. It went down once during cluster testing, which is why the testing ran separately. It shipped through the release scripts so every dealer site came up the same way, and went live in March 2022. Page caching followed later, rolled out to the whole fleet with WP-CLI and wired into the deploy scripts.",
        },
        {
          term: "Outcome",
          detail:
            "Nobody reverted or removed it in the three years after, right up until I left. Because it held, the team started building on it; a colleague later cached the CARFAX auth token in it. This comes from the private repository’s history, like the commit counts. It isn’t an uptime figure.",
        },
      ],
    },
    {
      heading: "What I can’t tell you",
      paragraphs: [
        "I can count what I wrote, because the repository counts it for me. What I can’t tell you is what the caching did to page speed or conversion. I didn’t own those dashboards, and I didn’t take the numbers with me when I left. So you won’t find a percentage here, and I won’t make one up. What I can describe is the failure mode before, and that it didn’t come back. I’d rather explain how something worked than quote a number I can’t back up.",
      ],
    },
    {
      heading: "The rest of the five years",
      paragraphs: [
        "Outside the caching, I worked on technical SEO for a marketplace where getting dealer inventory found is the product, not a marketing extra. I also built Canada’s luxury tax into every price a shopper sees, and worked on the Ford Model E and CARFAX v3 integrations. The Tadvantage case study has the detail.",
        "All of it was team work. We ran Agile, reviewed every change, and paired when something mattered enough to be worth two people’s time. I reviewed other engineers’ work and had mine reviewed, in a codebase I couldn’t change on my own say-so. That’s the more common way to work, and a different discipline from my studio year. I also mentored engineers through code review and pairing, which is where the review habits on this site come from.",
      ],
    },
    {
      heading: "What I’d do differently",
      paragraphs: [
        "I’d have kept my own record. Since then, every project on this site gets a measurement written in before a feature ships. That habit started with the one question this page can’t answer.",
      ],
    },
  ];
}

/**
 * Project OS — the cross-project standard both sites are built against.
 *
 * Its five delivery roles, each with whether its contract lets it write
 * files. Note the enforcement wording: the four report-only roles are
 * report-only because their role contracts say so, not because tool
 * permissions block them; no role declares `allowed-tools`. Stating that
 * precisely is the point of the section.
 *
 * The "How AI helps with the work" passage lists these, and the role and
 * writer counts are counted from them, so the figures can't disagree with
 * the list.
 */
const PROJECT_OS_ROLES = [
  { term: "Builder", writes: true },
  { term: "Reviewer", writes: false },
  { term: "Tester", writes: false },
  { term: "Auditor", writes: false },
  { term: "Content strategist", writes: false },
] as const;

/**
 * These counts feed /standard's hero (PROJECT_OS_RAIL) and the home tile
 * (PROJECT_OS_FIGURES). Documents and lines are entered here; roles and
 * writers are counted from PROJECT_OS_ROLES.
 *
 * The prose still says "five roles, one writes code" in words, so a change to
 * the role list contradicts each of these until they change with it:
 *  - PROJECT_OS_LEDE, which is also /standard's meta description;
 *  - PROJECT_OS_TILE_LEDE, directly above the figures on the home tile;
 *  - the "How AI helps with the work" passage's first paragraph;
 *  - LEDE in profile.ts, and the "AI & automation" skills line in practice.ts.
 * check:claims does not count, so the build will not catch a mismatch.
 */
const PROJECT_OS_COUNTS = {
  roles: String(PROJECT_OS_ROLES.length),
  writers: String(PROJECT_OS_ROLES.filter((role) => role.writes).length),
  documents: "44",
  lines: "1,920",
} as const;

export const PROJECT_OS_RAIL = {
  name: "Project OS",
  documents: `${PROJECT_OS_COUNTS.documents} documents`,
  lines: `${PROJECT_OS_COUNTS.lines} lines`,
  roles: `${PROJECT_OS_COUNTS.roles} agent roles`,
  // One full cycle a reader can open: the reviewer's P1s, the owner's call on
  // recovery, the tester's retry-path bug, and the commits that fixed them.
  example: { label: "driftpilot-site #54", href: `${REPO_HREF.driftpilot}/pull/54` },
} as const;

/**
 * The home tile's four figures, from the same counts as /standard's hero.
 * Exactly four: the tile lays them out four across in a fixed-height row.
 */
export const PROJECT_OS_FIGURES: [Stat, Stat, Stat, Stat] = [
  { value: PROJECT_OS_COUNTS.roles, label: "Specialist AI roles" },
  { value: PROJECT_OS_COUNTS.writers, label: "May write files" },
  { value: PROJECT_OS_COUNTS.documents, label: "Documents in the standard" },
  { value: PROJECT_OS_COUNTS.lines, label: "Lines, cross-project" },
];

/**
 * The home tile's one line. Without it the tile was four numbers, and a reader
 * couldn't tell a workflow from a product; /standard says the rest.
 */
export const PROJECT_OS_TILE_LEDE = "One AI role writes code, four review it, and I decide what ships.";

export async function getProjectOsPassages(): Promise<Passage[]> {
  return [
    {
      heading: "Why I wrote it down",
      paragraphs: [
        "Two projects that share conventions by memory will drift apart. So I wrote the conventions down as one engineering standard for all my projects: stack defaults, the performance budget, testing priorities, and a ranked list of what counts as the source of truth. The last rule on that list: when a document and the code disagree, the code is right and the document is a bug.",
      ],
    },
    {
      heading: "How AI helps with the work",
      paragraphs: [
        "I designed the five-role AI workflow I deliver with, as part of the same standard. Each role works to a contract that spells out what it may do. One writes code; the other four report findings as P0, P1 or P2, and I decide what ships. It’s how I build software, this site included. It isn’t an AI feature that customers use.",
        "Those limits live in each role’s instructions, not in tool permissions. No role declares `allowed-tools`, so nothing in the tooling enforces them.",
        "The tester works from one rule: the pull request description is a claim, the diff is the truth, and any gap between the two is a finding.",
        "You can read one cycle in full on DriftPilot’s pull request #54: the reviewer flagged that a 200 from Formspree might not prove a lead arrived, the tester found a bug on the retry path, and I chose how a failed lead gets recovered.",
      ],
      list: PROJECT_OS_ROLES.map((role) => ({
        term: role.term,
        detail: role.writes ? "May write files." : "Report-only.",
      })),
    },
    {
      heading: "What’s left out on purpose",
      paragraphs: [
        "The standard also lists what the stack leaves out on purpose. If you don’t write those choices down, whoever joins next argues them all over again. Adding one back takes a written operating need, and “it would be convenient” doesn’t count.",
      ],
      list: [
        // The term is the standard's own ("No CMS", ProjectOS stack.md). The
        // roadmap is the owner's, stated as such, and lives on /roadmap — this
        // list is introduced as what the standard says, so it must not say
        // more than the standard does.
        {
          term: "No CMS",
          detail:
            "Content lives in typed accessors. Left out for now; a CMS is on my roadmap (see Roadmap).",
        },
        { term: "No client-state library", detail: "Server components hold the state." },
        { term: "No component library", detail: "The design system is the tokens." },
      ],
    },
  ];
}
