import { SkillMarquee } from "@/components/home/skill-marquee";
import { Figure, Tile } from "@/components/home/tile";
import { AUTOTRADER_POINTS } from "@/lib/content/experience";
import { HEADLINE, LEDE } from "@/lib/content/profile";
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
}: {
  stats: Stat[];
  studies: CaseStudy[];
  gaps: Gap[];
  skills: string[];
  autoTraderLede: string;
}) {
  return (
    <div className="flex flex-col gap-2 p-2 lg:h-full">
      {/* ── headline ─────────────────────────────────────────────────── */}
      <header className="panel shrink-0 px-[16px] py-[12px]">
        <h1 className="max-w-[26ch] font-display text-[clamp(1.35rem,2.5vw,2rem)] font-bold leading-[1.12] tracking-[-0.025em] text-ink">
          {HEADLINE}
        </h1>
        <p className="mt-[4px] max-w-[70ch] text-[0.88rem] leading-snug text-muted">{LEDE}</p>
      </header>

      <SkillMarquee skills={skills} />

      {/* ── main ─────────────────────────────────────────────────────── */}
      <div className="deck lg:[grid-template-rows:repeat(8,minmax(0,1fr))]">
      {studies.map((study, i) => (
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
            ) : study.stats.length > 0 ? (
              <div className="mt-auto grid grid-cols-2 gap-[12px] border-t border-line pt-[12px]">
                {study.stats.slice(0, 4).map((stat) => (
                  <Figure key={stat.label} stat={stat} size="sm" />
                ))}
              </div>
            ) : (
              <p className="mt-auto border-t border-line pt-[12px] font-mono text-[0.66rem] leading-snug text-faint">
                No adoption figures — the events were never instrumented. The
                case is the architecture.
              </p>
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
          <p className="min-h-0 overflow-hidden text-[0.88rem] leading-snug text-muted">
            {autoTraderLede}
          </p>
          <ul className="mt-[12px] flex flex-wrap gap-x-[12px] gap-y-[2px] font-mono text-[0.64rem] text-faint">
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
                className={`gap-[8px] ${i < 2 ? "flex" : "hidden min-[1280px]:flex"}`}
              >
                <span aria-hidden="true" className="mt-[7px] size-[3px] shrink-0 rounded-full bg-accent" />
                {point}
              </li>
            ))}
          </ul>
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
          className="bg-sunk lg:col-start-5 lg:col-end-10 lg:row-start-5 lg:row-end-9"
        >
          {/*
            Gap, consequence, fix — the same three parts the table on /gaps
            carries, so the tile is a summary of that page rather than a
            different claim. The consequences wrap rather than truncate: they
            were clamped to one line with `truncate` while a third of the tile
            sat empty below them, which quietly did the one thing PRODUCT.md
            says this tile must never do.
          */}
          <ul className="flex flex-1 flex-col justify-between overflow-hidden">
            {gaps.map((gap) => (
              <li key={gap.gap} className="flex items-baseline gap-2.5">
                <span
                  aria-hidden="true"
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-signal"
                />
                <span className="min-w-0">
                  <span className="font-mono text-[0.72rem] text-signal">{gap.gap}</span>
                  <span className="block text-[0.78rem] leading-snug text-muted">
                    {gap.consequence}
                  </span>
                  <span className="mt-[2px] block text-[0.74rem] leading-snug text-faint">
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
          className="lg:col-start-10 lg:col-end-13 lg:row-start-5 lg:row-end-9"
        >
          <div className="grid flex-1 grid-cols-2 content-center gap-x-[12px] gap-y-[12px]">
            {stats.map((stat) => (
              <Figure key={stat.label} stat={stat} size="sm" />
            ))}
          </div>
        </Tile>

      </div>
    </div>
  );
}
