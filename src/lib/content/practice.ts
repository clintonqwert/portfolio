import "server-only";

import type { Gap, Principle, Role, StackGroup } from "@/types/content";

/** Shared between /history and its dashboard tile, so the two never drift. */
export const HISTORY_LEDE =
  "Where I’ve worked since 2016, the tools I’ve used, and the principles I hold my work to.";

/** How I work — the six principles in the practice grid. */
export async function getPrinciples(): Promise<Principle[]> {
  return [
    {
      title: "Budgets, not intentions",
      body: "A quality bar written in a doc slips over time. One that fails the build stays put.",
    },
    {
      title: "Contracts over implementations",
      body: "Typed accessors and domain contracts, so I can replace what’s behind them without a rewrite.",
    },
    {
      title: "Guardrails before refactors",
      body: "I sort every module first: never rewrite, extract for reuse, stable with sign-off, or safe to improve.",
    },
    {
      title: "Decisions with consequences",
      body: "Decision records that say what a choice costs, as well as why I made it.",
    },
    {
      title: "Privacy in the pipeline",
      body: "If a mistake could leak something, the build should stop it before a reviewer has to catch it.",
    },
    {
      title: "Gaps in writing",
      body: "I write down known weaknesses and what they cost, before anyone asks.",
    },
  ];
}

/**
 * Unfixed weaknesses, published deliberately: a gap you have named is a plan,
 * and a gap you have hidden is a liability. Each carries its status, set by
 * the owner (2026-09-25): in development now, or on the roadmap.
 *
 * Provenance differs, and /gaps' lede is worded to stay true of every row. The
 * first three are recorded in the repositories with their consequences
 * attached. "No CMS yet" joined on 2026-09-25 from the owner's roadmap: what
 * backs it is ProjectOS recording the CMS as absent by decision and DriftPilot
 * keeping an inactive adapter behind its typed accessors so the contract
 * exists before the need does — not a gap entry in a repository yet.
 */
export async function getGaps(): Promise<Gap[]> {
  return [
    {
      gap: "No test runner",
      consequence:
        "Neither project has automated test coverage. The lead-capture path, the only one that brings in revenue, has no regression tests.",
      fix: "Test the revenue path first: the Zod schema, the spam gates, and the webhook client’s retry, backoff and timeout behaviour.",
      status: "roadmap",
    },
    {
      gap: "No error monitoring",
      consequence:
        "On DriftPilot, if the webhook fails twice the visitor still sees a thank-you page, and only the failure is logged, not the lead. Riflessi tells the visitor and logs the full lead, but neither site stores it anywhere durable.",
      fix: "Port Riflessi’s failure handling to DriftPilot, then give both a fallback email and alerting, so a failed lead is kept and someone hears about it.",
      status: "in-development",
    },
    {
      gap: "No perf gate on the second site",
      consequence:
        "Riflessi ships without the Lighthouse budget that guards DriftPilot, so regressions can reach the live site unnoticed.",
      fix: "Port DriftPilot’s config into its CI. I deferred it for launch and wrote down the cost; the port is under way now.",
      status: "in-development",
    },
    {
      gap: "No CMS yet",
      consequence:
        "Content lives in typed accessors in the repository, so a copy change ships as a pull request and a deploy.",
      fix: "Switch on the CMS adapter DriftPilot already keeps behind those accessors. The contract is already there, so only the content source changes.",
      status: "roadmap",
    },
  ];
}

/** Roles before the studio year. AutoTrader has its own section. */
export async function getTrackRecord(): Promise<Role[]> {
  return [
    {
      period: "Jan 2026 – Present",
      title: "Founder & Senior Software Engineer",
      org: "DriftPilot",
      summary:
        "My product engineering studio. I spent the first half of 2026 researching AI stacks, then designed and shipped two live Next.js sites end to end, with a performance budget enforced in CI.",
    },
    {
      // Named rather than left as a silent gap: on a page that publishes its
      // own weaknesses, an unexplained year is the loudest thing on it.
      period: "Jun 2025 – Jan 2026",
      title: "Family leave",
      org: "Planned break",
      summary: "Time between roles. I came back to full-time engineering in January 2026.",
    },
    {
      // Titles as the owner held them (2026-09-26): Full Stack Development
      // Specialist (Intermediate) at Convertus, carried over to AutoTrader.ca
      // as Software Engineer (Full Stack-Product), promoted to Senior
      // Software Engineer in 2021. The promotion month is not recorded, so
      // the dates carry year precision rather than a guessed month.
      period: "2021 – Jun 2025",
      title: "Senior Software Engineer",
      org: "AutoTrader.ca — AutoSync",
      summary:
        "Built production features on a national automotive SaaS platform. I replaced three years of object-cache churn with Redis Object Cache Pro on a dedicated host, and nobody reverted it in the three years after.",
    },
    {
      period: "Jan 2020 – 2021",
      title: "Software Engineer (Full Stack-Product)",
      org: "AutoTrader.ca — AutoSync",
      summary:
        "I came over from Convertus with the platform in the acquisition and kept doing full-stack product work on it, until my promotion to Senior Software Engineer in 2021.",
    },
    {
      period: "Nov 2018 – Jan 2020",
      title: "Full Stack Development Specialist (Intermediate)",
      org: "Convertus (acq. AutoTrader.ca)",
      summary:
        "A WordPress multisite serving enterprise automotive clients, extended with custom object-oriented PHP. I wrote the Tadvantage platform’s SEO subsystem (Vehicle and AutoDealer structured data, custom inventory sitemaps, canonical and meta handling) and co-built myGarage with its price-alert service. The platform went on through the acquisition to serve AutoSync dealer sites.",
    },
    {
      period: "Jan 2018 – Nov 2018",
      title: "Programming Teaching Assistant",
      org: "VFS School of Creative Technologies",
      summary:
        "I coached students through debugging, code review and engineering practice, and rebuilt the internal grading platform in Vue.js and MySQL to replace the instructors’ workflow.",
    },
    {
      period: "Oct 2016 – Aug 2018",
      title: "Junior Full-Stack Developer",
      org: "VFS School of Creative Technologies",
      summary:
        "Built responsive web apps and internal database-driven platforms in AngularJS, React, Python, PHP and MySQL.",
    },
    {
      period: "2016 – 2017",
      title: "Education",
      org: "VFS, Programming for Games, Web & Mobile · Douglas College, Computer Science",
      summary: "Awarded Top User Interface Design, VFS School of Creative Technologies, 2017.",
    },
  ];
}

/**
 * Flat skill list for the marquee. Ordered by how much of the current work each
 * one carries, not alphabetically — the first dozen are what a reader skimming
 * a moving strip will actually catch.
 */
export async function getSkillMarquee(): Promise<string[]> {
  /*
    Technologies only. This list used to mix tools with practices — "decision
    records", "code review", "architecture guardrails" — which made the strip
    read as a word cloud rather than a stack. Those are practices and they are
    already stated as such on /history, where they can be explained rather than
    skimmed.

    Order is rough relevance, not alphabetical: the first few are what the
    current work is built on, and a strip that scrolls is read from wherever it
    happens to be, so the strongest names should not all sit together.
  */
  return [
    "TypeScript", "React", "Next.js", "Node.js", "Tailwind CSS", "Zod",
    "Vue.js", "PHP", "Python", "MySQL", "PostgreSQL", "MongoDB", "Redis",
    "WordPress", "AWS", "Vercel", "Docker", "Cloudflare", "GitHub Actions",
    "Jest", "Lighthouse", "Claude", "OpenAI",
  ];
}


/** Tools, grouped. Current and prior-role. */
export async function getStackGroups(): Promise<StackGroup[]> {
  return [
    { name: "Languages", items: "TypeScript, JavaScript, PHP, Python, SQL, Bash" },
    {
      name: "Frontend",
      items:
        "React 19, Next.js App Router and Server Components, Vue.js (Vuex, Vue Router), Tailwind CSS, design tokens, SCSS, Webpack, WCAG accessibility",
    },
    {
      name: "Backend",
      items:
        "Node.js, Express, REST APIs, React Server Actions, WordPress Multisite and WP-CLI, MySQL, PostgreSQL, MongoDB, Redis, Zod validation",
    },
    {
      name: "Performance",
      items:
        "Object Cache Pro, WP Rocket, object and page caching strategy, k6 load testing, New Relic, Core Web Vitals and performance budgets",
    },
    {
      name: "Cloud & DevOps",
      items:
        "AWS (CodeDeploy, S3), Vercel, Docker, Cloudflare, GitHub Actions, Bitbucket Pipelines, Jenkins, CI/CD",
    },
    {
      name: "Quality",
      items:
        "PHPUnit, Jest, SonarQube, Veracode, ESLint, PHPCS, Composer, code review",
    },
    {
      name: "Integrations",
      items:
        "CARFAX, Auth0, Optimizely, ChromeData, Slack API, SFTP, Nodemailer, SOAP and REST partner feeds",
    },
    {
      name: "AI & automation",
      items:
        "Claude and OpenAI APIs, structured outputs with schema validation, multi-agent review pipelines with role-scoped write access, AI-assisted development workflows, prompt engineering, n8n",
    },
    {
      name: "Practice",
      items:
        "Architecture guardrails, decision records, release ownership, technical SEO, EN/FR internationalization, Agile and Scrum, mentoring",
    },
  ];
}

