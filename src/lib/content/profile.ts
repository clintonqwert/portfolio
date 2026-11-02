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
/** One line in the rail, and the location fact under the hero. */
export const LOCATION_SHORT = "Vancouver, BC";
/**
 * The role as it was done. At AutoTrader.ca the title was Software Engineer
 * (Full Stack-Product), then Senior Software Engineer, and the work was
 * product engineering, so this stands as a claim (owner, 2026-11-02, on
 * review finding P1-1 of #32). It is the site's title and the structured
 * data's `jobTitle`; the résumé keeps "Senior Full-Stack Software Engineer".
 * The exact titles held, with their dates, are on /history.
 */
export const ROLE_TITLE = "Senior Full-Stack Product Engineer";

/**
 * The roles sought, said once. The rail's availability line and the first
 * screening fact below both read it, so a change is one edit, not two.
 * Lowercase here: the fact capitalises its first letter, which is safe for
 * "AI" and "FDE" where lowercasing would not be.
 */
const ROLES_SOUGHT = "senior full-stack, product, AI-enabled & FDE roles";

/**
 * Availability. Shown in the rail on every route — a reviewer should not have
 * to hunt for whether you are open to work.
 */
export const AVAILABILITY = `Open to ${ROLES_SOUGHT}`;

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
  github: `https://${CONTACT.github}`,
  studio: "https://driftpilot.ca",
} as const;

/**
 * The two public repositories, under CONTACT.github. Every link into either
 * one is built from these, and the handle itself is written once (CONTACT),
 * so renaming a repository or the account is one edit, not one per file.
 */
export const REPO = {
  driftpilot: `${CONTACT.github}/driftpilot-site`,
  riflessi: `${CONTACT.github}/riflessiautocare`,
} as const;

/**
 * Absolute URLs for the repositories above, prefixed the way CONTACT_HREF.github
 * is, so each repository's name is written once too.
 */
export const REPO_HREF = {
  driftpilot: `https://${REPO.driftpilot}`,
  riflessi: `https://${REPO.riflessi}`,
} as const;

/**
 * Downloadable résumé. This is the *public* copy: built from
 * profile/resume-fullstack.md with `?phone=off`, so it carries email and
 * LinkedIn but not the mobile number. Rebuild it with:
 *   cd profile && PUBLIC=1 ./build-resumes.sh fullstack
 * which also checks the phone is absent and that `size` below matches the file.
 */
export const RESUME = {
  href: "/clinton-jay-ramonida-resume.pdf",
  pages: 2,
  size: "81 kB",
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
  `${ROLES_SOUGHT.charAt(0).toUpperCase()}${ROLES_SOUGHT.slice(1)}`,
  LOCATION_SHORT,
  "Hybrid preferred, remote or on-site welcome",
  "Canadian citizen, no sponsorship needed",
] as const;

/**
 * The landing hero, in reading order: who this is, what they do, and the
 * proof. v2 (owner, 2026-10-31) leads with the capability and puts the
 * automotive platform in the proof, as the evidence of scale rather than the
 * identity. Every line is in profile/portfolio-v2-brief.md with its source.
 */
export const HEADLINE = "Senior full-stack product engineer.";

export const LEDE =
  "I build web products end to end, from the interface and its APIs to the deploy and the performance budget.";

/** "Most recently" would be wrong: DriftPilot is the most recent work. */
export const PROOF_LINE =
  "Since 2026 I’ve shipped two live sites on my own. Before that, six and a half years on the dealer platform that became AutoSync at AutoTrader.ca.";

/**
 * For search results and link previews: the headline's facts with the whole
 * career around them, since a snippet has room for one sentence and no page.
 */
export const DESCRIPTION =
  "Senior full-stack product engineer with nine years of production web systems. Since 2026 I’ve shipped two live sites on my own, after six and a half years on a national automotive SaaS platform.";

/*
  A four-stat masthead summary and a standalone position statement used to
  live here (getHeadlineStats, getPositionPassages). Both were retired
  2026-09 because they restated figures the deck's tiles showed more specifically,
  and a second copy of a figure is one more place for it to drift. v2's proof
  strip (landing.ts) brings four claims back on the owner's decision, under
  one rule: each restates a fact its case study owns and links to it, so
  there is still one place it can be checked.
*/
