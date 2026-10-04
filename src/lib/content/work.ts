import "server-only";

import {
  RIFLESSI_SCROLL_VIDEO,
  SCORES_IMAGE,
  TADVANTAGE_FEATURES_IMAGE,
  TADVANTAGE_SEO_IMAGE,
} from "@/lib/content/assets";
import { REPO, REPO_HREF } from "@/lib/content/profile";
import type { CaseStudy } from "@/types/content";

/**
 * Case studies. Every figure is verifiable against the repository named in
 * `repoUrl`, or against the live URL. See profile.ts for the wording rules.
 */
const CASE_STUDIES: readonly CaseStudy[] = [
  {
    slug: "driftpilot",
    name: "DriftPilot",
    headline: "A performance budget on every pull request",
    summary:
      "I built the studio’s site alone, from its services and pricing pages to two lead funnels, and put a performance budget on every pull request. Every one merged since has passed it.",
    period: "Jun – Jul 2026",
    liveUrl: "driftpilot.ca",
    repoUrl: REPO.driftpilot,
    role: "Sole engineer",
    stack: ["Next.js 16", "React 19", "TypeScript", "Tailwind v4", "Zod 4"],
    stats: [
      { value: "37", label: "Prerendered routes", detail: "no runtime database" },
      { value: "3", label: "Defects caught", detail: "by the gate, missed in review" },
      { value: "237 kB", label: "Script weight", detail: "against a 260 kB ceiling" },
      { value: "27", label: "Merged pull requests", detail: "73 commits" },
    ],
    assertions: {
      caption: "lighthouserc.json: budgets asserted on every pull request",
      // The public run behind the Result column: every assertion passed on
      // main's CI run for cc3b829 (PR #54, 2026-09-28). The figure below is an
      // earlier local re-run of 14f649f; #54 changed only the forms. Dated,
      // not "last", so the label stays true when main moves on.
      evidence: {
        label: "CI run on main, 28 Sep 2026 (cc3b829): every budget passing. Open the run",
        href: `${REPO_HREF.driftpilot}/actions/runs/36467786880`,
      },
      rows: [
        { name: "Performance", threshold: "≥ 95", state: "passing" },
        { name: "Accessibility", threshold: "≥ 98", state: "passing" },
        { name: "SEO", threshold: "≥ 95", state: "passing" },
        { name: "Best practices", threshold: "≥ 90", state: "passing" },
        { name: "Largest contentful paint", threshold: "< 1500 ms", state: "passing" },
        { name: "Cumulative layout shift", threshold: "< 0.05", state: "passing" },
        { name: "Total blocking time", threshold: "< 150 ms", state: "passing" },
        { name: "Script weight", threshold: "< 260 kB", state: "237 kB on PR #18", measured: true },
      ],
    },
    related: [
      { label: "How I use AI on this work", href: "/standard" },
      { label: "Riflessi: proving the foundation travels", href: "/work/riflessi" },
    ],
    passages: [
      {
        paragraphs: [
          "Everyone agrees a site should be fast, and it still gets slower, one handy dependency at a time. Reminding people in review doesn’t fix that, so I made the pipeline check it.",
          "Every pull request on driftpilot.ca runs Lighthouse CI three times against a production build and checks the median run against the budget. A failure turns the pull request red. GitHub doesn’t stop a merge on red, but every pull request merged since the check went in has passed it.",
        ],
        diagram: ["Pull request", "Production build", "Lighthouse × 3, median run asserted", "Red check on failure"],
      },
      {
        heading: "What the gate caught",
        paragraphs: [
          "The gate caught three things review missed: a WebGL shader path that hit 39 seconds of total blocking time on software renderers, a footer colour pair below the WCAG contrast minimum, and a third-party scheduling embed that pushed the script weight over budget without anyone noticing.",
          "I did move one budget. The original 110 kB script ceiling was never realistic once the framework and the shader measured 237 kB together, so I raised it to 260 kB on purpose and wrote down why. That’s the line I hold: a measurement can justify moving a threshold, but deleting a failing check to get a green build can’t.",
        ],
        figure: {
          image: SCORES_IMAGE,
          // Measured, and said how: a local re-run of the repository's own
          // gate, not a CI report and not a mock-up (see SCORES_IMAGE).
          caption:
            "I re-ran the gate on 26 Sep 2026 on my own machine, not a CI runner: the repository’s own lighthouserc.json against a production build of main, desktop preset. Shown is the homepage’s median of three runs (LCP 663 ms, TBT 0 ms, CLS 0). Every run on all three gated routes passed every budget.",
        },
      },
      {
        heading: "The rest of the build",
        paragraphs: [
          "The site is 37 statically prerendered routes with no runtime database. Content sits behind typed async accessors, so a headless CMS could take over as the source without touching a page or component.",
          // The stats and `period` cover the Jun – Jul build: 27 merged PRs,
          // the last #53 on 30 Jul. The September fix is PR #54, merged
          // 2026-09-28, and the prose names its month so the period can stay
          // on the build. "Three attempts within ten seconds" is MAX_ATTEMPTS
          // and DELIVERY_DEADLINE_MS in the site's src/lib/crm.ts; re-read
          // both before repeating the numbers. The Slack alert is live because
          // SLACK_ALERT_WEBHOOK_URL is set in production.
          "Leads go through Zod-validated Server Actions, then honeypot and time-to-submit spam checks, then a CRM webhook. The original build came in over 73 commits across 27 merged pull requests, and in it the webhook got one retry: if both attempts failed, the visitor still saw the thank-you page and the lead was lost. I fixed that in September. The webhook now gets up to three attempts within ten seconds. If a lead still fails, the visitor sees the failure with an email link that has their answers filled in, and the site makes one best-effort post of the lead to my Slack alerts channel. The site’s first tests cover that path and run in CI.",
        ],
      },
    ],
  },
  {
    slug: "riflessi",
    name: "Riflessi Auto Care",
    shortName: "Riflessi",
    headline: "Proving the foundation was reusable",
    summary:
      "A second business on DriftPilot’s foundation, built in five weeks: I cut its 19 MB 3D hero to 2 MB and kept the home shop’s address out of every photo.",
    period: "Jul – Sep 2026",
    liveUrl: "riflessiautocare.ca",
    repoUrl: REPO.riflessi,
    role: "Sole engineer · self-directed",
    stack: ["Next.js 16", "React Three Fiber", "GSAP ScrollTrigger", "Lenis", "glTF-Transform", "meshoptimizer"],
    related: [{ label: "DriftPilot: the foundation this reused", href: "/work/driftpilot" }],
    stats: [
      { value: "5 weeks", label: "First commit to first full build", detail: "7 Jul – 11 Aug 2026" },
      { value: "89%", label: "Hero asset reduction", detail: "19.07 MB → 2.05 MB" },
      { value: "205k → 96k", label: "Tyre mesh vertices", detail: "after decimation" },
      { value: "11", label: "Pull requests in that build", detail: "" },
    ],
    passages: [
      {
        paragraphs: [
          "Riflessi Auto Care took five weeks from its first commit to a full first build. I swapped the design-token values, rewrote the content against the same fixed type contracts, and adapted the components to the new brand, while the content layer, tokens and lead pipeline carried over. That’s how I know DriftPilot’s abstractions were doing real work.",
          "Two parts did need new code, the motion layer and the 3D stage, because they were things DriftPilot never had.",
        ],
      },
      {
        // Every fact here is in the repository: seven acts and their pose
        // fields in lib/content/cinema.ts, the scroll driver and its lazy
        // imports in components/cinema/useScrollStory.ts, the render loop's
        // frameloop switch in PaintStage.tsx.
        heading: "Why a 3D model at all",
        paragraphs: [
          "A detailer sells a finish, and you judge a finish from more than one angle. So the homepage is a scroll-driven sequence in seven acts. Each act pairs its copy with a camera pose and a material state: where the camera sits and what it points at, how bright the key light is, and how far the paint has come from freshly corrected to a cured ceramic coat. As you scroll, the car moves between them. A photo can’t do that, and it’s the reason the site has a 3D model at all. It’s also most of what makes the site feel premium.",
          "GSAP ScrollTrigger tracks the progress and Lenis smooths the scroll. Both load in the same lazy chunk as the scene, so a visitor on the static fallback never downloads either one. Lenis only runs while the sequence is on the page, so every other route keeps native scrolling, and the render loop stops as soon as the sequence scrolls out of view.",
        ],
        figure: {
          video: RIFLESSI_SCROLL_VIDEO,
          caption:
            "The live homepage, scrolled from the first act to the last. Each act brings a new camera angle, and the light and paint finish change with it. Recorded 26 Sep 2026 in Chrome and played back at twice the scroll speed.",
        },
      },
      {
        heading: "The 19 MB hero",
        paragraphs: [
          "The hardest part was the hero: a licensed 3D vehicle model that weighed 19.07 MB, on a site aiming to load in under 1.5 seconds.",
          "The obvious fix didn’t work. Every node in the asset had the same name, so matching on node names found nothing; the meaning lived in the material names. So I deleted hidden geometry by material instead. Profiling showed the tyres alone were 63% of the model, so I decimated them from 205k to 96k vertices. I stripped all seven textures, because the paint is applied at runtime, then welded, deduplicated, quantized and meshopt-compressed what was left. It came out at 2.05 MB, an 89% reduction, with a content-hashed filename so a one-year immutable cache header is safe.",
        ],
      },
      {
        heading: "Gating at the import",
        paragraphs: [
          "I gate the 3D scene at the dynamic import, so a device that can’t run it never downloads the chunk. Viewport size, CPU core count, device memory and a WebGL probe decide, and prefers-reduced-motion overrides all of them. Gating the render would have been easier, but it would still have shipped the payload.",
        ],
      },
      {
        heading: "Keeping the shop’s address private",
        paragraphs: [
          "A preparation script strips every photo’s metadata, GPS included, and blurs any licence plate I’ve marked before the photo goes on the site. The shop runs from home and the site keeps the address private on purpose, so the GPS data in the first uploaded photo would have given it away. The script also lists every photo nobody has checked for plates yet, so a missed one shows up before it ships.",
        ],
      },
    ],
  },
  {
    slug: "tadvantage",
    // Carries the widest study cell, beside AutoTrader.ca's: six and a half
    // years on the platform is the longest and largest body of work here, and
    // the automotive experience is what the roles this site is for hire on.
    // Owner's decision, 2026-09-26. It was DriftPilot's, for its budget table.
    feature: true,
    name: "Tadvantage",
    headline: "Six and a half years on a dealer platform, and the parts I put my name on",
    summary:
      "The platform behind dealer websites, from Convertus through the acquisition into AutoSync. Over six and a half years I owned its releases from v3 to v12.7, built its SEO subsystem and co-built myGarage.",
    period: "6.5 years \u00b7 Convertus \u2192 AutoTrader",
    // The platform's own product site. autosyncmotors.com, the public demo
    // dealer site, is shown on /autotrader and /work/mygarage instead.
    liveUrl: "tadvantage.ca",
    // Proprietary — Convertus / AutoTrader internal platform.
    repoUrl: null,
    role: "Full-stack engineer",
    stack: [
      "PHP",
      "WordPress Multisite",
      "Vue.js",
      "Node.js",
      "MySQL",
      "Redis",
      "WP-CLI",
      "PHPUnit",
    ],
    related: [
      { label: "myGarage: the feature that tested the data model", href: "/work/mygarage" },
      { label: "Luxury tax: a chapter of this platform", href: "/work/luxury-tax" },
    ],
    // Each restates a passage below: releases ("My part in it"), luxury
    // tax ("Pricing"), caching ("Performance"), SEO ("The unglamorous half"),
    // IQ Badging. Ordered by weight; the deck shows as many as fit.
    highlights: [
      "Owned production releases, v3 through v12.7",
      "Canada’s luxury tax on every price, rolled out dealer by dealer",
      "Ended three years of object-cache churn; page caching fleet-wide",
      "The SEO foundation: bilingual inventory sitemaps, VIN-keyed schema",
      "IQ Badging: one Vue component, on every vehicle card",
    ],
    // The deck gives a feature cell's label three lines (deck.tsx). This one
    // needs all three at 1440; at 1280 they stop at "the most of 100+…".
    stats: [
      { value: "1,682", label: "Commits, the most of 100+ contributors" },
      { value: "358", label: "Merged pull requests" },
    ],
    // The only unverifiable figures on this site, and the note that says so.
    // A private repository cannot be clicked through; pretending otherwise
    // would undo the credibility the rest of the page is built on.
    note: "Counted from the private repository’s history, so you can’t click through and check. I’m happy to walk you through it.",
    passages: [
      {
        heading: "What it is",
        paragraphs: [
          "Tadvantage is the WordPress multisite platform behind Convertus dealer websites. It has ten OEM and dealer-group themes and more than thirty-five custom plugins for inventory, showroom, pricing, SEO, integrations and analytics, with Vue on the interactive parts and PHP underneath. Convertus is part of Trader Corporation, the company behind AutoTrader.ca.",
        ],
      },
      {
        heading: "My part in it",
        paragraphs: [
          "Of the more than a hundred engineers in the codebase’s history, I was the top contributor of all time: 1,682 commits and 358 merged pull requests. Along the way: 253 tickets, 177 release commits and 39 hotfixes. The count starts in January 2019, not my start date, because my first couple of months went in under a colleague’s pull requests. I owned production releases from v3 through v12.7 and merged the French translations for most of them.",
        ],
      },
      {
        heading: "Pricing, where the risk is",
        paragraphs: [
          "A price shows up in more places than you’d expect: four versions of the search-result card, the vehicle detail page, the quick view, the inventory carousel, and a calculator with cash, finance and lease tabs. If any two disagree, the shopper stops trusting the number and the dealer carries the compliance risk. I built Canada’s federal luxury tax into all of them, behind a feature flag so we could roll it out dealer by dealer.",
        ],
      },
      {
        // From the owner's own account of the work. What IQ Badging is comes
        // from the product site's public feature list, shown in the figure.
        heading: "IQ Badging, one component on every card",
        paragraphs: [
          "AutoTrader.ca IQ Badging marks a vehicle as a Good Price or Great Price against the market, in search results and on the vehicle detail page. I integrated the newly available AutoTrader data behind it, then built the badge once as a Vue component. The same badge, from the same data, shows on every vehicle card the platform draws, wherever it appears on the site and whatever component it sits in. I also added WordPress options to configure it.",
        ],
        figure: {
          image: TADVANTAGE_FEATURES_IMAGE,
          // The figures in the grid are the product site's marketing, not
          // this site's claims — the caption says whose they are.
          caption:
            "IQ Badging and My Garage, among the features the product site sells its website packages on, in its own words and numbers. My Garage is the feature in the myGarage case study.",
        },
      },
      {
        heading: "Performance",
        paragraphs: [
          "I created the object-caching repository and moved the platform to Object Cache Pro, with a dedicated Redis host in production and shared clusters in dev and staging. I proved it out on a separate test network before it shipped. It ended three years of the cache being added and reverted, and nobody reverted it in the three years after; the AutoTrader.ca page tells that story in full. Later I rolled page caching out to the whole fleet with WP-CLI. It skips the inventory and showroom routes, which can never be served stale, and it’s wired into the deploy scripts so every new site gets it without anyone setting it up.",
        ],
      },
      {
        heading: "Integrations",
        paragraphs: ["The partner integrations I worked on:"],
        list: [
          { term: "CARFAX v3", detail: "Auth0 token generation" },
          { term: "Ford", detail: "Model E inventory and OEM window stickers" },
          { term: "Motocommerce", detail: "Build-and-price, with deep links that carry colour and trim" },
          { term: "Honda, Lincoln, Jeep", detail: "Showroom mapping" },
          { term: "Hyundai", detail: "Roadster" },
          { term: "Shift Digital, CarGurus", detail: "Dealer data feeds over SFTP" },
        ],
      },
      {
        heading: "The unglamorous half",
        paragraphs: [
          "I built the SEO foundation: inventory sitemaps in English and French, Product and Breadcrumb schema with the VIN as the identifier, and canonical handling across the detail page, the search page and the print view. I also maintained a fork of Yoast that carried inventory sitemap support through three major versions. And I built the Bill S-211 compliance pages, which publish themselves to every dealer site in both languages, so no one has to remember to set them up.",
        ],
        figure: {
          image: TADVANTAGE_SEO_IMAGE,
          caption: "How the product site sells SEO to dealers.",
        },
      },
      {
        heading: "What I’d do differently",
        paragraphs: [
          "The platform polled for inventory changes; webhooks would have been more accurate and less wasteful. Some jQuery stayed in for legacy integrations instead of being migrated. That shipped faster, and it left debt behind.",
          "Most of all, I’d instrument it from day one. Nobody measured save, remove and compare events, so this case study has no adoption figures; the data was never collected. Next time I’d decide how we’ll know a feature worked before we ship it.",
        ],
      },
    ],
  },
  {
    slug: "mygarage",
    name: "myGarage",
    headline: "A saved-vehicle list that has to survive the vehicle changing under it",
    summary:
      "Saved vehicles, viewing history and price-drop alerts, stored so a shopper’s list still makes sense across dealer sites, even after a vehicle sells.",
    period: "2019 · Convertus, on the Tadvantage platform",
    liveUrl: null,
    repoUrl: null,
    role: "Full-stack engineer",
    stack: ["PHP", "MySQL", "AWS RDS", "Node.js", "Vue.js"],
    /*
      Kept off the dashboard for the same reason Luxury tax is: the deck's
      three case-study cells are already assigned. In the rail it is nested
      under the "AutoTrader.ca" heading alongside Tadvantage and Luxury tax
      (see navigation.ts) rather than sitting at the top level — a feature of
      Tadvantage, not a peer of it — and it links back to Tadvantage below.
    */
    onDeck: false,
    stats: [],
    related: [{ label: "Tadvantage: the platform this shipped on", href: "/work/tadvantage" }],
    passages: [
      {
        heading: "The constraint",
        paragraphs: [
          "A shopper saves a handful of vehicles, comes back a week later, and expects the list to still make sense. Meanwhile the inventory has moved on: vehicles sell and prices change. A saved list that stores a snapshot of each vehicle is out of date within days.",
        ],
      },
      {
        heading: "A reference, not a copy",
        paragraphs: [
          "myGarage stores an advertisement ID against the user instead of the vehicle’s details. A price alert keeps the price from when the alert was set next to the current one, so the comparison stays live. When a vehicle sells or is withdrawn, the garage handles it the way a normal browsing session would, because nothing in the record depends on the vehicle still existing.",
        ],
      },
      {
        heading: "Why it lives outside any one dealer site",
        paragraphs: [
          "On Tadvantage each dealer has its own WordPress site, but a shopper’s garage has to follow them from one dealer site to another on the same platform. So the garage tables (saved vehicles, viewing history, price alerts, and a user record keyed to the platform’s VMS identity) live in their own AWS RDS database, reached through a singleton connection, instead of in any one dealer site’s WordPress tables. That one decision is what makes the rest of the feature possible. Without it, a garage would be stuck on whichever site the shopper landed on first.",
        ],
        diagram: ["Dealer site A", "Shared AWS RDS: garage database", "Dealer site B"],
      },
      {
        heading: "Closing the loop: price alerts",
        paragraphs: [
          "A Node.js service reads the alerts table, compares each stored price with the current price from the platform’s vehicle-management service, and sends a bilingual HTML email when a watched vehicle drops, with unsubscribe handling and monitoring for failures. The front end is Vue inside Tadvantage and the back end is Node, sharing one database so there’s only ever one source of truth for a price. I built this with a colleague.",
        ],
        diagram: ["garage.alerts_vehicle", "Node price-check service", "Bilingual email + unsubscribe"],
      },
      {
        heading: "What I’d do differently",
        paragraphs: [
          "Nobody instrumented save, remove and viewed events, so I can’t tell you how many shoppers used it. It’s the same gap I name in the Tadvantage case study. The design holds up, but the adoption data was never collected, and next time I’d set that up before shipping.",
        ],
      },
    ],
  },
  {
    slug: "luxury-tax",
    name: "Luxury tax",
    headline: "A tax that had to be right in eleven places at once",
    summary:
      "Canada’s luxury tax, built into every place a price appears, behind a flag so we could roll it out dealer by dealer.",
    period: "Dec 2024 \u2013 Jan 2025",
    liveUrl: null,
    repoUrl: null,
    role: "Full-stack engineer",
    stack: ["PHP", "WordPress", "Vue.js", "Optimizely", "WP-CLI", "PHPUnit", "Jest"],
    related: [{ label: "Tadvantage: the platform this shipped on", href: "/work/tadvantage" }],
    /*
      Kept off the dashboard. The deck is exactly one viewport tall and its
      three case-study cells are already assigned; a fourth would either
      collide with the third or shrink all of them. This study reaches readers
      through the rail and through the Tadvantage study it belongs to, which
      costs it nothing — it is a chapter of that platform, not a rival to it.
    */
    onDeck: false,
    stats: [],
    passages: [
      {
        heading: "The problem",
        paragraphs: [
          "Canada’s Select Luxury Items Tax applies above a price threshold, and a dealer site has to show it the same way everywhere a price or payment appears. On Tadvantage that meant four versions of the search-result card, the vehicle detail page, the quick view, the inventory carousel, the calculator’s cash, finance and lease tabs, and GM Digital Retailing. If any two disagree, the shopper stops believing the number and the dealer carries the compliance risk. On top of that, an older “disable luxury tax” toggle made the existing behaviour harder to reason about than the tax itself.",
        ],
      },
      {
        heading: "What I built",
        paragraphs: [
          "I built central configuration for the tax rules with a WP-CLI manager, so settings could change across the whole network in one go instead of site by site. Pricing became tax-aware on every card version, the detail pages, the carousel and the calculator, with French throughout. Unit tests cover the configuration, the utilities and the card rendering.",
        ],
      },
      {
        heading: "Rolling it out",
        paragraphs: [
          "I replaced the old toggle with an Optimizely-targeted flag, so it could go live for specific dealers instead of the whole fleet at once. It shipped in release 11.8, and four edge cases turned up the week after: price breakdowns that didn’t add up to the final price, a lease display on one card version, a finance payment that differed between the card and the calculator, and the tax missing from the calculator’s total cash price. All four fixes went out as patch releases that same week.",
        ],
      },
      {
        heading: "What that week taught me",
        paragraphs: [
          "A flag limits who sees the bugs. It didn’t stop me writing them. Production traffic found them, hitting combinations my tests didn’t cover, and that’s why I still like shipping to a small group early. It isn’t a reason to test less.",
        ],
      },
    ],
  },
] as const;

export async function getCaseStudies(): Promise<CaseStudy[]> {
  return [...CASE_STUDIES];
}

export async function getCaseStudy(slug: string): Promise<CaseStudy | null> {
  return CASE_STUDIES.find((study) => study.slug === slug) ?? null;
}

export async function getCaseStudySlugs(): Promise<string[]> {
  return CASE_STUDIES.map((study) => study.slug);
}
