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
 * The roles sought, said once. The rail's availability line and the first
 * screening fact below both read it, so a change is one edit, not two.
 * Lowercase here: the fact capitalises its first letter, which is safe for
 * "AI" and "FDE" where lowercasing would not be.
 */
const ROLES_SOUGHT = "senior full-stack, AI-enabled & FDE roles";

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
  size: "94 kB",
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
  "Vancouver, BC",
  "Hybrid preferred, remote or on-site welcome",
  "Canadian citizen, no sponsorship needed",
] as const;

/**
 * The statement above the fold: who this is and the experience behind it,
 * for a reader who gives the page thirty seconds. It used to be the position
 * line below, with the role in the lede; the owner swapped them on 2026-09-26
 * after an outside review — lead with the role and the automotive platform.
 */
export const HEADLINE =
  "Senior full-stack engineer. Six and a half years on a national automotive SaaS platform.";

/**
 * The position, under the headline. Shorter and harder than the résumé summary.
 *
 * One line at the lede's 70ch, and it has to stay one: at 1280x800 the deck has
 * no height to spare, and a second line pushed AutoTrader 10px past its cell
 * (2026-09-29). check:behaviour fails on a second line. The pipeline point it
 * replaced is DriftPilot's now: the tile's budget rows on the deck, and the
 * summary's "performance budget on every pull request" on its case study.
 */
export const LEDE =
  "Since 2026 I’ve shipped two live sites on my own, with a five-role AI workflow I designed.";

/**
 * For search results and link previews: the headline's facts with the whole
 * career around them, since a snippet has room for one sentence and no page.
 */
export const DESCRIPTION =
  "Senior full-stack engineer with nine years of production web systems, six and a half of them on a national automotive SaaS platform.";

/*
  A four-stat masthead summary and a standalone position statement used to
  live here (getHeadlineStats, getPositionPassages). Both were retired
  2026-09 because they restated figures the tiles show more specifically,
  and a second copy of a figure is one more place for it to drift. Don't
  bring a summary back; put the figure on the tile that owns it.
*/
