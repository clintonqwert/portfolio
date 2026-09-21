import "server-only";

import type { Passage, Stat } from "@/types/content";

/**
 * Published facts about Clinton Jay Ramonida — the single source of truth for
 * anything this site claims.
 *
 * No-invention rule: if a fact is not in this file, no page publishes it. Every
 * figure here is checkable against a repository or a live URL. Several claims
 * were deliberately removed during the 2026-09 rewrite because the repositories
 * did not support them; they must not return. See README.md.
 *
 * Wording rules that are easy to get wrong:
 *  - The two sites are "live", never "production". They are public deploys
 *    without operational usage. "Production" stays correct for AutoSync and
 *    Convertus, which were real production systems.
 *  - Riflessi was self-directed and unpaid. Never "client", never "contract".
 *  - The AI delivery roles are report-only because their role contracts say so.
 *    No role declares `allowed-tools`, so nothing in tooling enforces it. Never
 *    claim the restriction is enforced by tool permissions.
 */

export const NAME = "Clinton Jay Ramonida";
export const LOCATION = "Vancouver, British Columbia";
export const ROLE_TITLE = "Senior Full-Stack Software Engineer";

/**
 * Availability. Shown in the rail on every route — a reviewer should not have
 * to hunt for whether you are open to work.
 */
export const AVAILABILITY = "Open to senior & staff roles";

export const CONTACT = {
  email: "clintonramonida25@gmail.com",
  linkedin: "linkedin.com/in/clintonramonida",
  github: "github.com/clintonqwert",
  studio: "driftpilot.ca",
} as const;

/** Absolute URLs for the contact identifiers above. */
export const CONTACT_HREF = {
  email: `mailto:${CONTACT.email}`,
  linkedin: "https://www.linkedin.com/in/clintonramonida/",
  github: "https://github.com/clintonqwert",
  studio: "https://driftpilot.ca",
} as const;

/**
 * Downloadable résumé. This is the *public* copy: built from profile/resume.html
 * with `?phone=off`, so it carries email and LinkedIn but not the mobile number.
 * Rebuild it with:
 *   cd profile && ./build-resume.sh          # master copies, phone included
 *   then print ?v=fullstack&phone=off to public/clinton-jay-ramonida-resume.pdf
 */
export const RESUME = {
  href: "/clinton-jay-ramonida-resume.pdf",
  pages: 2,
  size: "89 kB",
} as const;

/**
 * Portrait.
 *
 * TO REPLACE: drop your photo at `public/portrait.jpg` and change `src` below to
 * "/portrait.jpg". Shoot or crop to 4:5 portrait; 1200×1500 or larger. The frame
 * renders it at up to 420px wide, so anything above 840px wide is wasted bytes.
 */
export const PORTRAIT = {
  src: "/portrait-placeholder.svg",
  alt: "Clinton Jay Ramonida",
  isPlaceholder: true,
} as const;

/** The statement above the fold. Shorter and harder than the résumé summary. */
export const HEADLINE =
  "I make the quality bar something the pipeline enforces, not something the team remembers.";

export const LEDE =
  "Senior full-stack engineer — nine years of production web systems, five of them on automotive SaaS at national scale.";

/** The four figures in the masthead strip. */
export async function getHeadlineStats(): Promise<Stat[]> {
  return [
    // Labels are kept to two short lines so the strip's baselines stay level.
    { value: "9", label: "Years shipping", detail: "production web" },
    { value: "2", label: "Live sites", detail: "shipped solo" },
    { value: "32", label: "Reviewed PRs", detail: "on own codebases" },
    { value: "≥95", label: "Lighthouse perf", detail: "asserted on merge" },
  ];
}

/** The opening position statement. */
export async function getPositionPassages(): Promise<Passage[]> {
  return [
    {
      paragraphs: [
        "I spent five years at AutoTrader.ca building production features on AutoSync — the automotive SaaS platform serving thousands of Canadian dealerships — across Vue, Node.js, PHP and MySQL, with Redis caching and AWS infrastructure underneath.",
        "Since 2026 I have designed and shipped two live sites end to end, under a performance budget that runs in CI and blocks my own merges when it fails. The second site reused the first's architecture and shipped in five weeks, because the content layer sits behind typed accessors that can be replaced without touching a page or a component.",
        "I write architecture guardrails and decision records, and I keep the known gaps in the same document as the wins. The gaps are further down this page.",
      ],
    },
  ];
}
