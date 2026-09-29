import type { OpenGap } from "@/types/content";

const LINK =
  "py-2 underline decoration-1 underline-offset-[3px] hover:text-ink hover:decoration-2";

/**
 * The gaps, kept small: the name, what it costs, and the roadmap item that
 * closes it. The fix is written once, on the item, and linked here.
 */
export function GapsList({ gaps, titles }: { gaps: OpenGap[]; titles: Record<string, string> }) {
  return (
    <ul className="border-t border-rule">
      {gaps.map((gap) => (
        <li
          key={gap.gap}
          className="border-b border-line py-4 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:gap-x-8"
        >
          <p className="min-w-0 font-mono text-sm text-signal">{gap.gap}</p>
          <div className="min-w-0">
            <p className="mt-1 text-base leading-relaxed text-muted md:mt-0">{gap.consequence}</p>
            <p className="mt-1 text-sm text-muted">
              {gap.closedBy !== undefined ? (
                <>
                  Closed by{" "}
                  <a href={`#${gap.closedBy}`} data-closed-by="" className={LINK}>
                    {titles[gap.closedBy] ?? gap.closedBy}
                  </a>
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
