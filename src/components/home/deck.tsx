import { SkillMarquee } from "@/components/home/skill-marquee";
import { Figure, Tile, TileShot } from "@/components/home/tile";
import { AUTOTRADER_POINTS } from "@/lib/content/experience";
import { FACTS, HEADLINE, LEDE } from "@/lib/content/profile";
import type { ImageSlot } from "@/lib/content/assets";
import type { CaseStudy, Gap, Stat } from "@/types/content";

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
  stats,
  studies,
  gaps,
  skills,
  autoTraderLede,
  workImages,
  autoSyncImage,
}: {
  stats: Stat[];
  studies: CaseStudy[];
  gaps: Gap[];
  skills: string[];
  autoTraderLede: string;
  /** Case-study screenshots, keyed by slug. */
  workImages: Record<string, ImageSlot>;
  /** AutoSync screenshot for the AutoTrader tile. */
  autoSyncImage: ImageSlot;
}) {
  return (
    <div className="flex flex-col gap-2 p-2 lg:h-full">
      {/* ── headline ─────────────────────────────────────────────────── */}
      <header className="panel shrink-0 px-[16px] py-[12px]">
        <h1 className="display-tight max-w-[38ch] text-[clamp(1.35rem,2.5vw,2rem)] leading-[1.1] text-ink">
          {HEADLINE}
        </h1>
        <p className="mt-[4px] max-w-[70ch] text-[0.88rem] leading-snug text-muted">{LEDE}</p>

        {/*
          The headline earns the attention; this line converts it. A reader
          could previously not answer seniority, location, arrangement or work
          authorisation from anywhere above the fold.
        */}
        <ul className="mt-[8px] flex flex-wrap items-center gap-x-[12px] gap-y-[2px] font-mono text-[0.68rem] text-faint">
          {FACTS.map((fact, i) => (
            <li
              key={fact}
              // The arrangement line is the longest and the least decisive of
              // the four. Below 1280 the strip wraps to three lines without it
              // gone, and the deck pays for every one of them.
              className={`items-center gap-[12px] ${
                i === 2 ? "hidden min-[1280px]:flex" : "flex"
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

      <SkillMarquee skills={skills} />

      {/* ── main ─────────────────────────────────────────────────────── */}
      <div className="deck lg:[grid-template-rows:repeat(8,minmax(0,1fr))]">
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
                ? "grid min-h-0 flex-1 gap-x-[16px] lg:grid-cols-2"
                : "flex min-h-0 flex-1 flex-col"
            }
          >
            <div className="min-h-0">
              <p className="overflow-hidden text-[0.86rem] leading-snug text-muted">
                {study.summary}
              </p>
              <ul className="mt-[12px] flex flex-wrap gap-x-[12px] gap-y-[2px] font-mono text-[0.64rem] text-faint">
                {study.stack.map((tech) => (
                  <li key={tech}>{tech}</li>
                ))}
              </ul>

              {/*
                The work, shown rather than only linked. Breakpoints come from
                measuring free space per cell, not from taste: at 1440 only the
                feature cell has room (137px), and the two narrow cells do not
                get one until 1680 (163px and 143px). Below those widths the
                tile is already full and an image would clip real content.
              */}
              {workImages[study.slug] ? (
                <TileShot
                  image={workImages[study.slug]!}
                  className={
                    study.feature
                      ? "mt-[12px] hidden [--shot-h:104px] min-[1440px]:block min-[1680px]:[--shot-h:132px]"
                      : "mt-[12px] hidden [--shot-h:104px] min-[1680px]:block"
                  }
                />
              ) : null}
            </div>

            {study.assertions ? (
              <dl
                className={`space-y-[4px] font-mono text-[0.68rem] ${
                  study.feature
                    ? // The rule is vertical only once the interior is two columns.
                      // Stacked, the assertions ran straight into the stack list
                      // with nothing between them.
                      "mt-[12px] border-t border-line pt-[12px] lg:mt-0 lg:border-l lg:border-t-0 lg:pl-[16px] lg:pt-0"
                    : "mt-auto border-t border-line pt-[12px]"
                }`}
              >
                {study.assertions.rows
                  .slice(0, study.feature ? 8 : 4)
                  .map((row) => (
                    <div
                      key={row.name}
                      className="flex items-baseline justify-between gap-[12px]"
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
                  <div className="grid grid-cols-2 gap-[12px] border-t border-line pt-[12px]">
                    {study.stats.slice(0, 4).map((stat) => (
                      <Figure key={stat.label} stat={stat} size="sm" />
                    ))}
                  </div>
                ) : null}
                {study.note ? (
                  <p className="mt-[12px] border-t border-line pt-[12px] font-mono text-[0.66rem] leading-snug text-faint">
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
          <p className="line-clamp-3 shrink-0 text-[0.88rem] leading-snug text-muted min-[1280px]:line-clamp-4 min-[1680px]:line-clamp-5">
            {autoTraderLede}
          </p>
          <ul className="mt-[12px] hidden flex-wrap gap-x-[12px] gap-y-[2px] font-mono text-[0.64rem] text-faint min-[1280px]:flex">
            {["Vue", "Node.js", "PHP", "MySQL", "Redis", "AWS"].map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
          <ul className="mt-[12px] space-y-[4px] border-t border-line pt-[12px] text-[0.78rem] leading-snug text-muted">
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
                className={`gap-[8px] ${i < 2 ? "flex" : "hidden min-[1440px]:flex"}`}
              >
                <span aria-hidden="true" className="mt-[7px] size-[3px] shrink-0 rounded-full bg-accent" />
                {point}
              </li>
            ))}
          </ul>
          {/* autosyncmotors.com — the public demo of the platform these five
              years were spent on. Gated like the others: this cell has 32px
              spare at 1440 and 127px at 1680, so it only appears at the width
              that can actually hold it. */}
          <TileShot
            image={autoSyncImage}
            className="mt-[12px] hidden [--shot-h:88px] min-[1680px]:block"
          />

          <div className="mt-auto flex gap-[16px] border-t border-line pt-[12px]">
            <Figure stat={{ value: "5 yrs", label: "Jan 2020 – Jun 2025" }} size="sm" />
            <Figure stat={{ value: "~0", label: "Downtime after rollout" }} size="sm" />
          </div>
        </Tile>

        {/* The page's argument, so it gets the sunk surface and the widest cell. */}
        <Tile
          label="Open gaps"
          index="05"
          href="/gaps"
          cta="All three"
          className="bg-sunk min-[1024px]:col-start-5 min-[1024px]:col-end-10 min-[1024px]:row-start-5 min-[1024px]:row-end-9 min-[1440px]:col-end-13 min-[1440px]:row-end-7"
        >
          {/*
            Gap, consequence, fix — the same three parts the table on /gaps
            carries, so the tile is a summary of that page rather than a
            different claim. The consequences wrap rather than truncate: they
            were clamped to one line with `truncate` while a third of the tile
            sat empty below them, which quietly did the one thing PRODUCT.md
            says this tile must never do.
          */}
          <ul className="grid flex-1 grid-cols-1 gap-x-[21px] gap-y-[4px] overflow-hidden min-[1440px]:grid-cols-3 min-[1440px]:gap-y-[8px]">
            {gaps.map((gap) => (
              <li key={gap.gap} className="flex items-baseline gap-2.5">
                <span
                  aria-hidden="true"
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-signal"
                />
                <span className="min-w-0">
                  <span className="font-mono text-[0.72rem] text-signal">{gap.gap}</span>
                  {/* The strip is half the height it was, so the consequence
                      clamps until there is room for all of it. */}
                  <span className="line-clamp-2 block text-[0.78rem] leading-tight text-muted min-[1440px]:line-clamp-3 min-[1440px]:leading-snug min-[1680px]:line-clamp-none">
                    {gap.consequence}
                  </span>
                  <span className="mt-[2px] hidden text-[0.74rem] leading-snug text-faint min-[1680px]:block">
                    {/* Labelled, because an unlabelled third line reads as more
                        consequence rather than as the plan. */}
                    <span className="font-mono text-[0.68rem] uppercase tracking-[0.08em] text-accent">
                      Fix{" "}
                    </span>
                    {gap.fix}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Tile>

        <Tile
          label="Measured"
          href="/history"
          cta="History"
          className="min-[1024px]:col-start-10 min-[1024px]:col-end-13 min-[1024px]:row-start-5 min-[1024px]:row-end-9 min-[1440px]:col-start-5 min-[1440px]:row-start-7"
        >
          {/* Four across, not 2x2: this tile is now a wide half-height strip,
              so the figures run along it rather than stacking into a shape the
              cell no longer has. */}
          <div className="grid flex-1 grid-cols-2 content-center gap-x-[16px] gap-y-[12px] min-[1440px]:grid-cols-4">
            {stats.map((stat) => (
              <Figure key={stat.label} stat={stat} size="sm" />
            ))}
          </div>
        </Tile>

      </div>
    </div>
  );
}
