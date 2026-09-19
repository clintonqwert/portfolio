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

export const LEDE =
  "Senior full-stack engineer — nine years of production web systems, five of them on automotive SaaS at national scale.";

/** The four figures in the masthead strip. */
export async function getHeadlineStats(): Promise<Stat[]> {
  return [
    { value: "9", label: "Years shipping", detail: "production web" },
    { value: "2", label: "Live sites", detail: "designed & shipped solo" },
    { value: "32", label: "Reviewed pull requests", detail: "on own codebases" },
    { value: "≥95", label: "Lighthouse perf, asserted", detail: "on every merge" },
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
