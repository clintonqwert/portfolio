import { Fragment } from "react";

import { StatusMark } from "@/components/shared/status-mark";
import { formatDay } from "@/lib/dates";
import type { GapView } from "@/types/content";

const LINK =
  "py-2 underline decoration-1 underline-offset-[3px] hover:text-ink hover:decoration-2";

/** The roadmap items that close a gap, as in-page links. */
function Fixes({ fixes }: { fixes: GapView["fixes"] }) {
  return fixes.map((fix, i) => (
    <Fragment key={fix.id}>
      {i > 0 ? " · " : null}
      <a href={`#${fix.id}`} data-closed-by="" className={LINK}>
        {fix.title}
      </a>
    </Fragment>
  ));
}

/**
 * The gaps, kept small: the name, what it costs, and the roadmap items that
 * close it. The fix is written once, on the item, and linked here.
 *
 * A closed gap stays, struck through, so a reader sees what got fixed as
 * well as what's left. `<s>` marks the text as no longer accurate; screen
 * readers mostly don't announce it, so the visible "Closed <date>" line
 * carries the state in words.
 */
export function GapsList({ gaps }: { gaps: GapView[] }) {
  return (
    <ul className="border-t border-rule">
      {gaps.map((gap) => (
        <li
          key={gap.gap}
          className="border-b border-line py-4 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:gap-x-8"
        >
          <p className={`min-w-0 font-mono text-sm ${gap.closed ? "text-faint" : "text-signal"}`}>
            {gap.closed ? <s className="decoration-1">{gap.gap}</s> : gap.gap}
          </p>
          <div className="min-w-0">
            <p className="mt-1 text-base leading-relaxed text-muted md:mt-0">
              {gap.closed ? <s className="decoration-1">{gap.consequence}</s> : gap.consequence}
            </p>
            <p className="mt-1 text-sm text-muted">
              {gap.closed ? (
                <>
                  <StatusMark
                    filled
                    label={gap.closedOn ? `Closed ${formatDay(gap.closedOn)}` : "Closed"}
                    className="mr-1.5 text-faint"
                  />
                  by <Fixes fixes={gap.fixes} />
                </>
              ) : gap.fixes.length > 0 ? (
                <>
                  Fix: <Fixes fixes={gap.fixes} />
                </>
              ) : (
                <>Meanwhile: {gap.mitigation}</>
              )}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
