import { SkillMarquee } from "@/components/home/skill-marquee";
import { Figure, Tile, TileShot } from "@/components/home/tile";
import { DeckPointer } from "@/components/home/deck-pointer";
import { GapStatus } from "@/components/shared/gap-status";
import { AUTOTRADER_POINTS } from "@/lib/content/experience";
import { FACTS, HEADLINE, LEDE } from "@/lib/content/profile";
import type { CaseStudy, DeckPreview, Gap } from "@/types/content";

/** "All four", not "All 4": the tile's call to action reads as a phrase. */
const COUNT_WORDS = ["none", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];

/**
 * The dashboard.
 *
 * Three bands: headline, skills marquee, then a 12x8 tile grid. At >=1024px the
 * whole thing fills exactly one viewport — the body is overflow-hidden, so the
 * grid takes what the two bands above it leave and nothing here may grow.
 *
 * The identity block lives in the rail, not here, which is what frees the room
 * the headline and marquee need.
 */
export function Deck({
  studies,
  gaps,
  skills,
  autoTraderLede,
  previews,
  historyLede,
  historyRolesCount,
  historyPrinciplesCount,
}: {
  studies: CaseStudy[];
  gaps: Gap[];
  skills: string[];
  autoTraderLede: string;
  /**
   * Whole-page screenshots the tiles window onto and pan down on hover, keyed
   * by slug — AutoTrader, which has none, as "autotrader".
   */
  previews: Record<string, DeckPreview>;
  historyLede: string;
  historyRolesCount: number;
  historyPrinciplesCount: number;
}) {
  return (
    <div className="flex flex-col p-3 lg:h-full">
      {/* The tile cursor, and loading each tile's whole-page preview on
          intent. Watches this element. */}
      <DeckPointer />
      {/*
        One panel instead of three: the headline, the marquee and the grid
        used to be independent boxes with a gap-2 seam between each, which
        spent 2x that gap on separators before a single tile got any of it.
        Merged into one surface with internal dividers, that seam space goes
        to the tiles instead — the reference's generous tile spacing came
        from removing redundant chrome, not from a bigger padding number.
      */}
      {/*
        No `panel` class here, and no border of any kind: a hairline around
        the whole block read as a frame around a frame once the tiles inside
        already carry their own. Canvas and panel are the same token in both
        themes anyway (there's no "elevated surface" colour in this palette),
        so this group is a layout container only — the tiles floating on the
        canvas, gapped, are the whole drawing.

        No overflow-hidden here: at short viewports the deck switches to
        content-driven row heights and <main> takes over the scroll (see the
        "Short desktop windows" rule below) — clipping this box would hide
        that fallback instead of letting it work.
      */}
      <div className="flex min-h-0 flex-1 flex-col">
        {/* ── headline ───────────────────────────────────────────────── */}
        <header className="shrink-0 px-4 py-3">
          <h1 className="display-tight max-w-[38ch] text-[clamp(1.35rem,2.5vw,2rem)] leading-[1.1] text-ink">
            {HEADLINE}
          </h1>
          <p className="mt-1 max-w-[70ch] text-md leading-snug text-muted">{LEDE}</p>

          {/*
            The headline earns the attention; this line converts it. A reader
            could previously not answer seniority, location, arrangement or work
            authorisation from anywhere above the fold.
          */}
          <ul className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-0.5 meta text-2xs text-faint">
            {FACTS.map((fact, i) => (
              <li
                key={fact}
                // The arrangement line is the longest and the least decisive of
                // the four. Below 1280 the strip wraps to three lines without it
                // gone, and the deck pays for every one of them.
                className={`items-center gap-3 ${
                  i === 2 ? "hidden xl:flex" : "flex"
                }`}
              >
                {fact}
                {/* Separator by index: `last:` would match the span against its own
                    li, where it is always last, and hide every one of them. */}
                {i < FACTS.length - 1 ? (
                  <span aria-hidden="true" className="text-line">
                    ·
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </header>

        <div className="shrink-0 border-y border-line">
          <SkillMarquee skills={skills} />
        </div>

        {/* ── main ─────────────────────────────────────────────────────── */}
        <div className="deck min-h-0 flex-1 p-2 lg:[grid-template-rows:repeat(8,minmax(0,1fr))]">
      {studies.filter((s) => s.onDeck !== false).map((study, i) => (
        <Tile
          key={study.slug}
          label={study.name}
          index={`0${i + 1}`}
          href={`/work/${study.slug}`}
          cta="Case study"
          className={[
            // Variant cells: the feature study takes half the row with a
            // two-column interior; the other two split the remainder. Equal
            // cells would assert the three are equivalent, and they are not.
            study.feature
              ? "lg:col-start-1 lg:col-end-7"
              : i === 1
                ? "lg:col-start-7 lg:col-end-10"
                : "lg:col-start-10 lg:col-end-13",
            "lg:row-start-1 lg:row-end-5",
          ].join(" ")}
        >
          {/* The wide cell splits into summary and data; the narrow cells
              stack them. Same content, proportioned to the room. */}
          <div
            className={
              study.feature
                ? "grid min-h-0 flex-1 gap-x-4 lg:grid-cols-2"
                : "flex min-h-0 flex-1 flex-col"
            }
          >
            {/*
              overflow-hidden here is load-bearing, not decoration: min-h-0
              lets this box shrink below its content's natural size when the
              flex column is tight on room, but nothing clipped what spilled
              past the shrunk box — the sibling stats block below, positioned
              by mt-auto against the shrunk box rather than the overflowing
              text, rendered on top of it. Measured on Riflessi and
              Tadvantage at 1024px: the summary text alone ran 115px into a
              box the flex layout had already reduced well below that.

              line-clamp-2 is deliberately conservative rather than sized to
              the widest cell: at 1024px the narrow cells only have ~52px for
              this block, and a clamp that fits inside that shows its own
              ellipsis cleanly. A larger clamp still gets caught by
              overflow-hidden above, but the cut lands mid-line instead of at
              a sentence boundary, which reads as the exact collision this
              is fixing rather than a graceful truncation.
            */}
            <div className="flex min-h-0 flex-col overflow-hidden">
              {/* shrink-0: line-clamp sets overflow:hidden, which drops a
                  flex item's minimum height to zero — without this the
                  summary, not the screenshot, gave up the height and was
                  cut through mid-line. The shot is the only thing that may
                  shrink. */}
              <p className="line-clamp-2 shrink-0 text-md leading-snug text-muted">
                {study.summary}
              </p>
              {/*
                Hidden below `wide` on the narrow cells (Riflessi, Tadvantage):
                even a 2-line clamp on the summary left the check-overflow
                gate reporting 22-65px of this list silently clipped at
                1024-1280px, because overflow-hidden on the parent was
                swallowing it rather than the ellipsis showing it was
                shortened. The stack is still one click away on the case
                study itself; the feature cell has room to keep it always.
              */}
              <ul
                className={`mt-2 shrink-0 flex-wrap gap-x-3 gap-y-0.5 meta text-faint ${
                  study.feature ? "flex" : "hidden wide:flex"
                }`}
              >
                {study.stack.map((tech) => (
                  <li key={tech}>{tech}</li>
                ))}
              </ul>

              {/*
                The work, shown rather than only linked. The shot shrinks to
                whatever height its cell has left (see TileShot), so the gates
                below are about whether that is enough to be worth showing:
                at 1440 only the feature cell has room, and the two narrow
                cells not until 1680. Below those widths a shot would be a
                sliver.
              */}
              {previews[study.slug] ? (
                <TileShot
                  preview={previews[study.slug]!}
                  className={
                    study.feature
                      ? "mt-3 hidden wide:flex"
                      : "mt-2 hidden wider:flex"
                  }
                />
              ) : null}
            </div>

            {study.assertions ? (
              <dl
                className={`space-y-1 font-mono text-2xs ${
                  study.feature
                    ? // The rule is vertical only once the interior is two columns.
                      // Stacked, the assertions ran straight into the stack list
                      // with nothing between them.
                      "mt-3 border-t border-line pt-3 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0"
                    : "mt-auto border-t border-line pt-3"
                }`}
              >
                {study.assertions.rows
                  .slice(0, study.feature ? 8 : 4)
                  .map((row) => (
                    <div
                      key={row.name}
                      className="flex items-baseline justify-between gap-3"
                    >
                      <dt className="min-w-0 truncate text-muted">{row.name}</dt>
                      <dd className={row.measured ? "shrink-0 text-signal" : "shrink-0 text-pass"}>
                        {row.threshold}
                      </dd>
                    </div>
                  ))}
              </dl>
            ) : (
              // Stats and the caveat are no longer either/or. Tadvantage has
              // tenure worth quoting and no adoption figures, and showing only
              // the second let its longest engagement lead with a negative.
              <div className="mt-auto">
                {study.stats.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 border-t border-line pt-3">
                    {study.stats.slice(0, 4).map((stat) => (
                      <Figure key={stat.label} stat={stat} size="sm" />
                    ))}
                  </div>
                ) : null}
                {study.note ? (
                  <p className="mt-3 border-t border-line pt-3 font-mono text-3xs leading-snug text-faint">
                    {study.note}
                  </p>
                ) : null}
              </div>
            )}
          </div>
        </Tile>
      ))}

        <Tile
          label="AutoTrader.ca — AutoSync"
          index="04"
          href="/autotrader"
          cta="Read"
          className="lg:col-start-1 lg:col-end-5 lg:row-start-5 lg:row-end-9"
        >
          {/* Clamped below 1440, where this cell is ~250px wide and the lede
              runs to eleven lines. The ellipsis and the Read link together say
              there is more, which silent clipping did not. */}
          <p className="line-clamp-3 shrink-0 text-md leading-snug text-muted xl:line-clamp-4 wider:line-clamp-5">
            {autoTraderLede}
          </p>
          <ul className="mt-3 hidden flex-wrap gap-x-3 gap-y-0.5 meta text-faint xl:flex">
            {["Vue", "Node.js", "PHP", "MySQL", "Redis", "AWS"].map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
          <ul className="mt-2 space-y-1 border-t border-line pt-2 text-xs leading-snug text-muted">
            {/* At 1024 the cell is three lines shorter than the copy, and the
                deck may not scroll. The last two points drop out there rather
                than being clipped mid-sentence; all four are on /autotrader,
                which the tile links to. */}
            {AUTOTRADER_POINTS.map((point, i) => (
              <li
                key={point}
                // Measured per width: two points fit at 1024, all four at 1440.
                // No slice — the array is exactly what ships, so adding a fifth
                // point here shows up rather than silently disappearing.
                className={`gap-2 ${i < 2 ? "flex" : "hidden wide:flex"}`}
              >
                <span aria-hidden="true" // 7px is optical, not rhythm: it centres a 3px dot on the first
                  // line of 0.78rem text. Snapping it to the scale visibly
                  // drops the dot below the cap height.
                  className="mt-[7px] size-[3px] shrink-0 rounded-full bg-accent" />
                {point}
              </li>
            ))}
          </ul>
          {/* autosyncmotors.com — the public demo of the platform these five
              years were spent on. Gated like the others: this cell only has
              room for a window worth showing from 1680. */}
          {previews.autotrader ? (
            <TileShot
              preview={previews.autotrader}
              className="mt-3 hidden wider:flex"
            />
          ) : null}

          <div className="mt-auto flex gap-4 border-t border-line pt-3">
            <Figure stat={{ value: "5 yrs", label: "Jan 2020 – Jun 2025" }} size="sm" />
            <Figure stat={{ value: "~0", label: "Downtime after rollout" }} size="sm" />
          </div>
        </Tile>

        {/*
          History used to have no dashboard presence at all — reachable only
          by finding it last in the rail. It sits in the Open gaps' old spot,
          at roughly half AI Engineering's width alongside it, because a
          reader's own background belongs next to the work, not after it.
        */}
        <Tile
          label="History"
          index="05"
          href="/history"
          cta="Track record"
          className="lg:col-start-5 lg:col-end-8 lg:row-start-5 lg:row-end-7"
        >
          <p className="line-clamp-2 shrink-0 text-xs leading-none text-muted wide:line-clamp-3 wide:leading-snug">
            {historyLede}
          </p>
          <div className="mt-auto flex gap-3 border-t border-line pt-0">
            <Figure
              stat={{ value: String(historyRolesCount), label: "Chapters, 2016–present" }}
              size="sm"
            />
            <Figure
              stat={{ value: String(historyPrinciplesCount), label: "Practice principles" }}
              size="sm"
            />
          </div>
        </Tile>

        <Tile
          label="AI Engineering"
          index="06"
          href="/standard"
          cta="How it works"
          className="lg:col-start-8 lg:col-end-13 lg:row-start-5 lg:row-end-7"
        >
          {/*
            Unconditionally 4-across rather than gated behind `wide`: the tile
            is now 5 of 12 columns at every width this appears at (it used to
            be 3 of 12 below `wide`, too narrow for four side by side), and a
            2x2 stack needed more height than the row has since it was halved
            to make room for History alongside it.
          */}
          <div className="grid flex-1 grid-cols-4 content-center gap-x-3 gap-y-3">
            <Figure
              stat={{ value: "5", label: "Specialist AI roles" }}
              size="sm"
            />
            <Figure
              stat={{ value: "1", label: "May write files" }}
              size="sm"
            />
            <Figure
              stat={{ value: "44", label: "Documents in the standard" }}
              size="sm"
            />
            <Figure
              stat={{ value: "1,920", label: "Lines, cross-project" }}
              size="sm"
            />
          </div>
        </Tile>

        {/* The page's argument, so it gets the sunk surface and the full width
            of the row beneath History and AI Engineering. */}
        <Tile
          label="Open gaps"
          index="07"
          href="/gaps"
          cta={`All ${COUNT_WORDS[gaps.length] ?? gaps.length}`}
          className="bg-sunk lg:col-start-5 lg:col-end-13 lg:row-start-7 lg:row-end-9"
        >
          {/*
            Gap, status, consequence — the same parts the table on /gaps
            carries, so the tile is a summary of that page rather than a
            different claim. Four across at every desktop width: the tile is
            two short grid rows, and a 2×2 of name-plus-status needed nearly
            twice the height it has below 1680 (measured: +26 to +42px).

            Consequences join only where they fit with a visible ellipsis:
            two lines from `wide`, three from `wider`. Below `wide` the names
            and their status are what fit honestly — the full rows are one
            click away.
          */}
          <ul className="grid flex-1 grid-cols-2 content-start gap-x-5 gap-y-2.5 overflow-hidden lg:grid-cols-4">
            {gaps.map((gap) => (
              <li key={gap.gap} className="min-w-0">
                <span className="block font-mono text-2xs leading-snug text-signal">
                  {gap.gap}
                </span>
                <GapStatus status={gap.status} className="mt-1 text-faint" />
                <span className="mt-1 hidden text-xs leading-snug text-muted wide:line-clamp-2 wider:line-clamp-3">
                  {gap.consequence}
                </span>
              </li>
            ))}
          </ul>
        </Tile>

        </div>
      </div>
    </div>
  );
}
