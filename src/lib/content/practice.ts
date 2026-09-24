import "server-only";

import type { Gap, Principle, Role, StackGroup } from "@/types/content";

/** How I work — the six principles in the practice grid. */
export async function getPrinciples(): Promise<Principle[]> {
  return [
    {
      title: "Budgets, not intentions",
      body: "A quality bar that lives in a document decays. One that fails the build holds.",
    },
    {
      title: "Contracts over implementations",
      body: "Typed accessors and domain contracts, so the thing behind them can be replaced without a rewrite.",
    },
    {
      title: "Guardrails before refactors",
      body: "Every module classified: never rewrite, extract for reuse, stable with sign-off, safe to improve.",
    },
    {
      title: "Decisions with consequences",
      body: "Decision records that state the cost of the choice, not only the reasoning for it.",
    },
    {
      title: "Privacy in the pipeline",
      body: "If a mistake would leak something, the build should prevent it rather than a reviewer catching it.",
    },
    {
      title: "Gaps in writing",
      body: "Known weaknesses documented with their consequences, before anyone asks about them.",
    },
  ];
}

/**
 * Unfixed weaknesses, published deliberately.
 *
 * These are recorded in the repositories with their consequences attached. They
 * are on this site for the same reason they are in the repos: a gap you have
 * named is a plan, and a gap you have hidden is a liability.
 */
export async function getGaps(): Promise<Gap[]> {
  return [
    {
      gap: "No test runner",
      consequence:
        "Zero automated coverage in either project. The lead-capture path — the only revenue path — has no regression tests.",
      fix: "Test the revenue path first: Zod schema, spam gates, and the webhook client’s retry, backoff and timeout behaviour.",
    },
    {
      gap: "No error monitoring",
      consequence:
        "On total webhook failure a lead survives only as a log line, while the visitor still sees a thank-you page. Silent loss.",
      fix: "Fallback email queue on total failure, plus alerting. Open TODO in the webhook client since day one.",
    },
    {
      gap: "No perf gate on the second site",
      consequence:
        "Riflessi ships without the Lighthouse budget that protects DriftPilot, so regressions reach the live site undetected.",
      fix: "Port the existing config into its CI. Deliberately deferred for launch, recorded with its consequence.",
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
        "Product engineering studio. AI stack research through the first half of 2026, then two live Next.js sites designed and shipped end to end under a performance budget enforced in CI.",
    },
    {
      // Named rather than left as a silent gap: on a page that publishes its
      // own weaknesses, an unexplained year is the loudest thing on it.
      period: "Jun 2025 – Jan 2026",
      title: "Family leave",
      org: "Planned break",
      summary: "A deliberate pause between roles. Returned to full-time engineering in January 2026.",
    },
    {
      period: "Jan 2020 – Jun 2025",
      title: "Senior Software Engineer, Full-Stack",
      org: "AutoTrader.ca — AutoSync",
      summary:
        "Production features on a national automotive SaaS platform. Implemented and tuned Redis Object Cache Pro against AWS-hosted Redis; network-level downtime dropped to near zero after rollout.",
    },
    {
      period: "Nov 2018 – Jan 2020",
      title: "Full-Stack Senior Development Specialist",
      org: "Convertus (acq. AutoTrader.ca)",
      summary:
        "WordPress multisite serving enterprise automotive clients, extended with custom object-oriented PHP. Authored the Tadvantage platform’s SEO subsystem — Vehicle and AutoDealer structured data, custom inventory sitemaps, canonical and meta handling — and co-built myGarage with its price-alert service. The platform carried through the acquisition to serve AutoSync dealer sites.",
    },
    {
      period: "Jan 2018 – Nov 2018",
      title: "Programming Teaching Assistant",
      org: "VFS School of Creative Technologies",
      summary:
        "Coached students through debugging, code review and engineering practice. Rebuilt the internal grading platform in Vue.js and MySQL, replacing the instructor workflow.",
    },
    {
      period: "Oct 2016 – Aug 2018",
      title: "Junior Full-Stack Developer",
      org: "VFS School of Creative Technologies",
      summary:
        "Responsive web applications and internal database-driven platforms in AngularJS, React, Python, PHP and MySQL.",
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
        "Node.js, Express, REST APIs, React Server Actions, WordPress Multisite and WP-CLI, MySQL, PostgreSQL, MongoDB, Redis Cluster, Zod validation",
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

