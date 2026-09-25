import { cn } from "@/lib/utils";

/** What the chapter bar needs to know about each chapter on the page. */
export interface ChapterRef {
  id: string;
  number: string;
  title: string;
}

/**
 * One numbered chapter of a secondary page.
 *
 * The number is a real position — chapters are read in order, and the chapter
 * bar counts them — and it sits in the same ink chip the deck's tile heads
 * use, so it reads as this system's numbering rather than decoration.
 *
 * `tone="ink"` inverts the chapter into a solid block — the `.chip` surface,
 * which this design reserves for what must be stopped on, used once per page
 * at most. Inside it every line of text is `canvas` on `ink`, a pair the
 * contrast gate already checks in both themes — hierarchy comes from size and
 * case there, not from a lighter grey that would need a pair of its own. Being
 * a chip is also what turns the focus ring to paper inside it.
 */
export function Chapter({
  id,
  number,
  title,
  children,
  wide,
  tone = "canvas",
}: {
  id: string;
  number: string;
  title: string;
  /** The argument, in the right-hand column. */
  children: React.ReactNode;
  /** A row across the whole sheet under both columns — a diagram, figures. */
  wide?: React.ReactNode;
  tone?: "canvas" | "ink";
}) {
  const ink = tone === "ink";
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn(
        // Clears the 44px chapter bar when a link lands here. Desktop only:
        // the bar is, and on a phone the document's scroll-padding already
        // clears the sticky top bar — both at once left a 47px dead gap.
        "lg:scroll-mt-14",
        ink ? "chip" : "",
      )}
    >
      <div className="sheet">
        <div className={cn("chapter", ink ? "" : "border-t border-line")}>
          <div className="chapter-body">
            <header className="chapter-head">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "meta px-1.5 py-0.5 leading-none",
                    ink ? "bg-canvas text-ink" : "chip",
                  )}
                >
                  {number}
                </span>
                <span aria-hidden="true" className="chapter-rule" />
              </div>
              <h2
                id={`${id}-title`}
                className={cn(
                  "display-tight mt-5 max-w-[16ch] text-[clamp(1.6rem,2.6vw,2.4rem)] leading-[1.08]",
                  ink ? "text-canvas" : "text-ink",
                )}
              >
                {title}
              </h2>
            </header>

            <div className="min-w-0">{children}</div>
          </div>

          {wide ? <div className="chapter-wide min-w-0">{wide}</div> : null}
        </div>
      </div>
    </section>
  );
}
