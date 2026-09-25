import "server-only";

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
 * Square, because the rail frame is square — a 4:5 crop would only be cropped
 * back to this. Shipped at 640px for a frame that renders at most 203px (the
 * .portrait steps in globals.css top out there), which is ample at any device
 * pixel ratio; the 2048px original is kept out of the repo, in
 * profile/portrait-original.webp, since a public repository carries every
 * byte of it forever.
 *
 * WebP over JPEG at the same 640px and visual quality: 17kB against 55kB.
 *
 * TO REPLACE: overwrite public/portrait.webp and keep it square.
 */
export const PORTRAIT = {
  src: "/portrait.webp",
  alt: "Clinton Jay Ramonida",
} as const;

/**
 * The four facts a recruiter screens on, in the order they screen for them.
 *
 * These were previously unanswerable from the page: seniority sought, location,
 * working arrangement and work authorisation existed only as a ten-pixel line in
 * the rail, or not at all. Authorisation is last but present — it is the fastest
 * disqualifier on a screening call and this is a clean pass, so it should never
 * be a question anyone has to ask.
 */
export const FACTS = [
  "Senior & staff roles",
  "Vancouver, BC",
  "Hybrid preferred, remote or on-site welcome",
  "Canadian citizen — no sponsorship required",
] as const;

/** The statement above the fold. Shorter and harder than the résumé summary. */
export const HEADLINE =
  "I make the quality bar something the pipeline enforces, not something the team remembers.";

export const LEDE =
  "Senior full-stack engineer — nine years of production web systems, five of them on automotive SaaS at national scale.";

/*
  A four-stat masthead summary and a standalone position statement used to
  live here (getHeadlineStats, getPositionPassages). Both were retired
  2026-09: every figure they carried is more specific somewhere else on the
  page already — "9 years shipping" is the lede's "nine years", "2 live
  sites" is the two case-study tiles that are already on the dashboard with
  their own live URLs, "32 reviewed PRs" is the sum of DriftPilot's 21 and
  Riflessi's 11 shown individually on their own tiles, and ">=95 Lighthouse"
  is already an assertion row on DriftPilot's tile. Code that ships a
  restatement of facts shown better elsewhere is exactly the kind of thing
  this site's own gaps table calls out in other people's projects.
*/
