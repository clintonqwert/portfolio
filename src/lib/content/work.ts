import "server-only";

import type { CaseStudy } from "@/types/content";

/**
 * Case studies. Every figure is verifiable against the repository named in
 * `repoUrl`, or against the live URL. See profile.ts for the wording rules.
 */
const CASE_STUDIES: readonly CaseStudy[] = [
  {
    slug: "driftpilot",
    // Carries the wide cell: it is the only study with an enforced budget to
    // show, so it has the most that rewards the extra room.
    feature: true,
    name: "DriftPilot",
    headline: "A performance budget that blocks the merge",
    summary:
      "A quality bar moved out of the review conversation and into the pipeline, where it cannot be forgotten or argued with under deadline.",
    period: "Jun – Jul 2026",
    liveUrl: "driftpilot.ca",
    repoUrl: "github.com/clintonqwert/driftpilot-site",
    role: "Sole engineer",
    stack: ["Next.js 16", "React 19", "TypeScript", "Tailwind v4", "Zod 4"],
    stats: [
      { value: "37", label: "Prerendered routes", detail: "no runtime database" },
      { value: "3", label: "Defects caught", detail: "by the gate, pre-release" },
      { value: "237 kB", label: "Script weight", detail: "against a 260 kB ceiling" },
      { value: "21", label: "Reviewed pull requests", detail: "88 commits" },
    ],
    assertions: {
      caption: "lighthouserc.json — asserted on every pull request",
      rows: [
        { name: "Performance", threshold: "≥ 95", state: "passing" },
        { name: "Accessibility", threshold: "≥ 98", state: "passing" },
        { name: "SEO", threshold: "≥ 95", state: "passing" },
        { name: "Best practices", threshold: "≥ 90", state: "passing" },
        { name: "Largest contentful paint", threshold: "< 1500 ms", state: "passing" },
        { name: "Cumulative layout shift", threshold: "< 0.05", state: "passing" },
        { name: "Total blocking time", threshold: "< 150 ms", state: "passing" },
        { name: "Script weight", threshold: "< 260 kB", state: "237 kB", measured: true },
      ],
    },
    related: [
      { label: "How AI is allowed to touch this work", href: "/standard" },
      { label: "Riflessi — proving the gate travels", href: "/work/riflessi" },
    ],
    passages: [
      {
        paragraphs: [
          "Most teams treat performance as a discipline problem: everyone agrees the site should be fast, and it degrades anyway, one convenient dependency at a time. I moved the standard out of the review conversation and into the pipeline, where it cannot be forgotten or argued with under deadline.",
          "Every pull request against driftpilot.ca runs Lighthouse CI three times against a production build and asserts the median. A failure is a red check, not a comment.",
        ],
        diagram: ["Pull request", "Production build", "Lighthouse × 3, median asserted", "Merge blocked on failure"],
      },
      {
        heading: "What the gate caught",
        paragraphs: [
          "The gate earns its keep by catching what review misses. It stopped a WebGL shader path that hit 39 seconds of total blocking time on software renderers, a footer contrast pair below WCAG minimum, and a third-party scheduling embed that quietly blew the script budget.",
          "One budget was re-baselined during the project: the original 110 kB script ceiling was fiction against a framework-plus-shader reality measured at 237 kB, so I moved the number deliberately and wrote down why. Measurement can justify moving a threshold. Silently deleting a failing assertion to get a green check cannot — that distinction is the whole value of having the gate.",
        ],
      },
      {
        heading: "The rest of the build",
        paragraphs: [
          "37 statically prerendered routes with no runtime database. Content sits behind typed async accessors, so a headless CMS can replace the source without editing a page or a component.",
          "The lead pipeline runs Zod-validated Server Actions through honeypot and time-to-submit spam gates into a retrying webhook client that replays 5xx and 429 and treats 4xx as permanently failed — verified end to end on the live site. 88 commits across 21 reviewed pull requests.",
        ],
      },
    ],
  },
  {
    slug: "riflessi",
    name: "Riflessi Auto Care",
    headline: "Proving the foundation was actually reusable",
    summary:
      "Any architecture claims reusability. The only honest test is building the second thing — and then reporting what actually had to change.",
    period: "Jul – Aug 2026",
    liveUrl: "riflessiautocare.vercel.app",
    repoUrl: "github.com/clintonqwert/riflessiautocare",
    role: "Sole engineer · self-directed",
    stack: ["Next.js", "React Three Fiber", "glTF-Transform", "meshoptimizer"],
    related: [{ label: "DriftPilot — the foundation this reused", href: "/work/driftpilot" }],
    stats: [
      { value: "5 weeks", label: "Empty repo to live", detail: "79 source files" },
      { value: "89%", label: "Hero asset reduction", detail: "19.07 MB → 2.05 MB" },
      { value: "205k → 96k", label: "Tyre mesh vertices", detail: "after decimation" },
      { value: "11", label: "Reviewed pull requests", detail: "" },
    ],
    passages: [
      {
        paragraphs: [
          "Any architecture claims reusability. The only honest test is building the second thing. Riflessi Auto Care went from empty repository to live in five weeks by swapping design-token values and rewriting content against fixed type contracts — every component survived untouched. That is the evidence the first project’s abstractions were load-bearing rather than decorative.",
          "The honest version matters too: the parts that did need new code were the motion layer and the 3D stage, which were new capability rather than re-theming. A reuse claim that omits what did not reuse is not worth making.",
        ],
      },
      {
        heading: "The 19 MB hero",
        paragraphs: [
          "The hard problem was the hero: a licensed 3D vehicle model that weighed 19.07 MB, on a site holding a sub-1.5-second budget.",
          "The detail worth telling is why the obvious approach failed. The asset named every single node identically, so node-name matching found nothing — all the semantic meaning lived in the material names. So I deleted hidden geometry by material instead, then profiled and found the tyres alone were 63% of the model, decimated them from 205k to 96k vertices, stripped all seven textures because paint is applied at runtime, then welded, deduplicated, quantized and meshopt-compressed. The result was 2.05 MB, an 89% reduction, with a content-hashed filename so a one-year immutable cache header is actually safe.",
        ],
      },
      {
        heading: "Gating the import, not the render",
        paragraphs: [
          "The 3D scene is gated at the dynamic import rather than the render, so a device that cannot run it never downloads the chunk at all — viewport, CPU core count, device memory and a WebGL2 probe decide, and prefers-reduced-motion overrides every other signal. Gating the render would have been easier and would have shipped the payload anyway.",
          "The image pipeline blurs licence plates and strips all EXIF before publish. That is not a nice-to-have: the shop is run from home and the site deliberately withholds the address, which camera GPS metadata would have published on the first photo upload. Privacy belonged in the build step, not in a checklist someone remembers.",
        ],
      },
    ],
  },
  {
    slug: "tadvantage",
    name: "Tadvantage",
    headline: "Six years on a dealer platform, and the parts I put my name on",
    summary:
      "The platform behind dealer websites \u2014 built at Convertus, carried through the acquisition into AutoSync. Top all-time contributor across six and a half years.",
    period: "6.5 years \u00b7 Convertus \u2192 AutoTrader",
    liveUrl: "autosyncmotors.com",
    // Proprietary — Convertus / AutoTrader internal platform.
    repoUrl: null,
    role: "Full-stack engineer",
    stack: [
      "PHP",
      "WordPress Multisite",
      "Vue.js",
      "Node.js",
      "MySQL",
      "Redis Cluster",
      "WP-CLI",
      "PHPUnit",
    ],
    related: [
      { label: "myGarage \u2014 the feature that tested the data model", href: "/work/mygarage" },
      { label: "Luxury tax \u2014 a chapter of this platform", href: "/work/luxury-tax" },
    ],
    stats: [
      { value: "1,682", label: "Commits \u2014 #1 of 100+ engineers" },
      { value: "358", label: "Merged pull requests" },
    ],
    // The only unverifiable figures on this site, and the note that says so.
    // A private repository cannot be clicked through; pretending otherwise
    // would undo the credibility the rest of the page is built on.
    note: "Counted from the repository\u2019s own history \u2014 private, so this is the one thing here you cannot click through and check.",
    passages: [
      {
        heading: "What it is",
        paragraphs: [
          "Tadvantage is the WordPress multisite platform behind Convertus dealer websites \u2014 Project Achilles on the inside, which is the name anyone who worked on it will recognise. It carries ten OEM and dealer-group themes and thirty-five-plus custom plugins covering inventory, showroom, pricing, SEO, integrations and analytics, with Vue on the interactive surfaces and PHP underneath. Convertus is part of Trader Corporation, the company behind AutoTrader.ca.",
        ],
      },
      {
        heading: "Where I sat in it",
        paragraphs: [
          "I was the top all-time contributor: 1,682 commits and 358 merged pull requests on a codebase with more than a hundred engineers in its history. 253 tickets, 177 release commits, 39 hotfixes. That count starts in January 2019 rather than at my start date, because my first couple of months went in under a colleague\u2019s pull requests. I owned production releases from v3 through v12.7 and merged the French translations for most of them.",
          "Those figures come from the repository\u2019s own history. It is private, so unlike everything else on this site you cannot click through and check it \u2014 I can walk you through it on a call.",
        ],
      },
      {
        heading: "Pricing, which is where the risk is",
        paragraphs: [
          "A price appears in more places than anyone expects: four search-result card versions, the vehicle detail page, the quick view, the inventory carousel, and a calculator with cash, finance and lease tabs. If any one of them disagrees with another, the customer stops trusting the number and the dealer carries the compliance risk. I built Canada\u2019s federal luxury tax through all of them, behind a feature flag so it could go out dealer by dealer.",
        ],
      },
      {
        heading: "Performance",
        paragraphs: [
          "I created the object-caching repository and put the platform on Object Cache Pro against shared Redis clusters \u2014 key prefixes, global groups, prefetching, connection timeouts \u2014 load-tested on a dedicated environment before it went near production. Later I rolled page caching out to the whole fleet with WP-CLI, excluding the inventory and showroom routes that can never be served stale, wired into the deploy scripts so every new site got it automatically.",
        ],
      },
      {
        heading: "Integrations",
        paragraphs: [
          "CARFAX v3 with Auth0 token generation. Ford Model E inventory and OEM window stickers. Motocommerce build-and-price with deep links carrying colour and trim. Honda, Lincoln and Jeep showroom mapping. Hyundai Roadster. Dealer data feeds to Shift Digital and CarGurus over SFTP.",
        ],
      },
      {
        heading: "The unglamorous half",
        paragraphs: [
          "I built the SEO foundation \u2014 inventory sitemaps in English and French, Product and Breadcrumb schema with VIN as the identifier, canonical handling across the detail page, the search page and the print view \u2014 and maintained a fork of Yoast carrying inventory sitemap support through three major versions. I also built the Bill S-211 compliance pages that publish themselves to every dealer site in both languages, because a legal requirement nobody configures by hand is a legal requirement that actually gets met.",
        ],
      },
      {
        heading: "What I would do differently",
        paragraphs: [
          "Inventory changes were polled; webhooks would have been more accurate and less wasteful. Some jQuery stayed for legacy integration rather than being migrated \u2014 it shipped faster and left debt, and both are true.",
          "Above all I would instrument it from day one. Save, remove and compare events were never measured, which is why this case study carries no adoption figures: the data to make that argument was not collected. That is the real cost of shipping a feature before deciding how you will know whether it worked.",
        ],
      },
    ],
  },
  {
    slug: "mygarage",
    name: "myGarage",
    headline: "A saved-vehicle list that has to survive the vehicle changing under it",
    summary:
      "Saved vehicles, viewed history and price-drop alerts, stored so a shopper\u2019s list stays valid across dealer sites even after the vehicle sells.",
    period: "2019 \u00b7 Convertus \u2014 Tadvantage platform",
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
    related: [{ label: "Tadvantage \u2014 the platform this shipped on", href: "/work/tadvantage" }],
    passages: [
      {
        heading: "The constraint",
        paragraphs: [
          "A shopper saves a handful of vehicles, comes back a week later, and expects the list to still make sense \u2014 even though the inventory underneath it has not stood still. Vehicles sell. Prices change. A saved list that stores a snapshot of the vehicle is wrong within days.",
        ],
      },
      {
        heading: "A reference, not a copy",
        paragraphs: [
          "myGarage stores an advertisement ID against a user, not the vehicle\u2019s own details. A price alert holds the price at the moment the alert was set alongside the current one, so the comparison stays live rather than being baked in at save time. Sold or withdrawn stock is handled the same way a normal browse session would handle it, because nothing about the record depended on the vehicle still existing.",
        ],
      },
      {
        heading: "Why it lives outside any one dealer site",
        paragraphs: [
          "Tadvantage runs one WordPress multisite per dealer, but a shopper\u2019s garage has to survive them moving between dealer sites on the same platform. So the garage tables \u2014 saved vehicles, viewed history, price alerts, and a user record keyed to the platform\u2019s VMS identity \u2014 live in their own AWS RDS database, reached through a singleton connection, rather than in any one dealer site\u2019s own WordPress tables. That is the one decision that makes the rest of the feature possible: without it, a garage would be trapped on whichever site the shopper first landed on.",
        ],
        diagram: ["Dealer site A", "Shared AWS RDS \u2014 garage database", "Dealer site B"],
      },
      {
        heading: "Closing the loop: price alerts",
        paragraphs: [
          "A Node.js service reads the alerts table, compares the stored price against current pricing from the platform\u2019s vehicle-management service, and sends a bilingual HTML email when a watched vehicle drops \u2014 with unsubscribe handling and monitoring on failure. Front end in Vue inside Tadvantage, back end in Node, one database between them, because the alternative was two sources of truth for the same price. Co-built with a colleague.",
        ],
        diagram: ["garage.alerts_vehicle", "Node price-check service", "Bilingual email + unsubscribe"],
      },
      {
        heading: "What I would do differently",
        paragraphs: [
          "Save, remove and viewed events were never instrumented, so this case study cannot tell you how many shoppers used it \u2014 the same gap Tadvantage\u2019s main case study names. The mechanism is sound; the adoption evidence was never collected, and I would collect it now before shipping a feature like this again.",
        ],
      },
    ],
  },
  {
    slug: "luxury-tax",
    name: "Luxury tax",
    headline: "A tax that had to be right in eleven places at once",
    summary:
      "Canada\u2019s luxury tax, built through every surface a price appears on, behind a flag so it could go dealer by dealer.",
    period: "Dec 2024 \u2013 Jan 2025",
    liveUrl: null,
    repoUrl: null,
    role: "Full-stack engineer",
    stack: ["PHP", "WordPress", "Vue.js", "Optimizely", "WP-CLI", "PHPUnit", "Jest"],
    related: [{ label: "Tadvantage \u2014 the platform this shipped on", href: "/work/tadvantage" }],
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
          "Canada\u2019s Select Luxury Items Tax applies above a price threshold, and a dealer site has to show it consistently everywhere a price or a payment appears. That is four search-result card versions, the vehicle detail page, the quick view, the inventory carousel, the calculator\u2019s cash, finance and lease tabs, and GM Digital Retailing. Any one of them disagreeing with another is a customer who stops believing the number and a dealer carrying compliance risk. An older \u201cdisable luxury tax\u201d toggle made the existing behaviour harder to reason about than the tax itself.",
        ],
      },
      {
        heading: "What I built",
        paragraphs: [
          "Central configuration for the tax rules with a WP-CLI manager, so settings could be changed across the network rather than site by site. Tax-aware pricing through every card version, the detail pages, the carousel and the calculator. French throughout. Unit tests over the configuration, the utilities and the card rendering.",
        ],
      },
      {
        heading: "Rolling it out",
        paragraphs: [
          "I replaced the old toggle with an Optimizely-targeted flag so it could go live for specific dealers rather than the whole fleet at once. It shipped in the 11.8 release, and four edge cases surfaced in the week after: price breakdowns that did not sum to the final price, a lease display on one card version, a finance payment that disagreed between card and calculator, and the tax missing from the calculator\u2019s total cash price. All four went out as patch releases that same week.",
        ],
      },
      {
        heading: "What that week taught me",
        paragraphs: [
          "Shipping behind a flag is not the same as shipping carefully. The flag limited who saw the bugs; it did not stop me writing them. What found them was production traffic hitting combinations the tests did not have \u2014 which is an argument for shipping to a small group early, not for testing less.",
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
