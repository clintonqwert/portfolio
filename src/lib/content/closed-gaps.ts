import "server-only";

import { REPO_HREF } from "@/lib/content/profile";
import type { ClosedGap } from "@/types/content";

/**
 * Fixed gaps, kept on /roadmap struck through under their closed date, so a
 * reader sees what got fixed as well as what's left.
 *
 * Each keeps its own evidence, the closing pull requests and date, rather
 * than pointing at roadmap items: Shipped holds three and gets pruned, and a
 * closed gap must outlive that. This list follows the same rule, set by the
 * owner (2026-09-29): at most three, newest first. getGaps() enforces both,
 * and requires every link here to be a pull request.
 *
 * The consequence is the cost as it was published. check:claims lets this
 * file, and only this file, quote the retired phrasings marked
 * quotableWhenClosed; the same words anywhere else fail the build.
 */
export const CLOSED_GAPS: ClosedGap[] = [
  {
    gap: "Leads sent without JavaScript are dropped",
    consequence:
      "On Riflessi, a booking sent with JavaScript off counts as spam: the visitor sees a thank-you and the lead reaches only the log.",
    closedOn: "2026-09-29",
    closedBy: [
      { label: "riflessiautocare #19", href: `${REPO_HREF.riflessi}/pull/19` },
    ],
  },
  {
    gap: "No test runner",
    consequence:
      "Neither project has automated test coverage. The lead-capture path, the only one that brings in revenue, has no regression tests.",
    closedOn: "2026-09-28",
    closedBy: [
      { label: "driftpilot-site #54", href: `${REPO_HREF.driftpilot}/pull/54` },
      { label: "riflessiautocare #14", href: `${REPO_HREF.riflessi}/pull/14` },
    ],
  },
];
