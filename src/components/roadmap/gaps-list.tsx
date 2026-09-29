import { Fragment } from "react";

import { StatusMark } from "@/components/shared/status-mark";
import { formatDay } from "@/lib/dates";
import type { GapView, Source } from "@/types/content";

const LINK =
  "py-2 underline decoration-1 underline-offset-[3px] hover:text-ink hover:decoration-2";

/** Links separated by middots: in-page fixes, or a closed gap's pull requests. */
function Links({ links, fix }: { links: readonly Source[]; fix?: boolean }) {
  return links.map((link, i) => (
    <Fragment key={link.href}>
      {i > 0 ? " · " : null}
      <a href={link.href} className={LINK} {...(fix && { "data-fix": "" })}>
        {link.label}
      </a>
    </Fragment>
  ));
}

/**
 * The gaps, kept small: the name, what it costs, and what fixes it. An open
 * gap links to its fix on this page; the fix is written once, on the item.
 *
 * A closed gap stays, struck through, and its closed date comes first in
 * reading order: screen readers mostly don't announce `<s>`, and reader mode
 * and a copy-paste drop it, so every reading starts with "Closed <date>"
 * before the old words.
 */
export function GapsList({ gaps }: { gaps: GapView[] }) {
  return (
    <ul className="border-t border-rule">
      {gaps.map((gap) => (
        <li
          key={gap.gap}
          className="border-b border-line py-4 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:gap-x-8"
        >
          <div className="min-w-0">
            {gap.state === "closed" ? (
              <StatusMark filled label={`Closed ${formatDay(gap.closedOn)}`} className="mb-1 text-faint" />
            ) : null}
            <p className={`font-mono text-sm ${gap.state === "closed" ? "text-faint" : "text-signal"}`}>
              {gap.state === "closed" ? <s className="decoration-1">{gap.gap}</s> : gap.gap}
            </p>
          </div>
          <div className="min-w-0">
            <p className="mt-1 text-base leading-relaxed text-muted md:mt-0">
              {gap.state === "closed" ? <s className="decoration-1">{gap.consequence}</s> : gap.consequence}
            </p>
            <p className="mt-1 text-sm text-muted">
              {gap.state === "closed" ? (
                <>
                  Closed by <Links links={gap.closedBy} />
                </>
              ) : gap.state === "open" ? (
                <>
                  Fix:{" "}
                  <Links fix links={gap.fixes.map((f) => ({ label: f.title, href: `#${f.id}` }))} />
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
