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
      <header className="panel shrink-0 px-[21px] py-[13px]">
        <h1 className="max-w-[26ch] font-display text-[clamp(1.35rem,2.5vw,2rem)] font-bold leading-[1.12] tracking-[-0.025em] text-ink">
          {HEADLINE}
        </h1>
        <p className="mt-[5px] max-w-[70ch] text-[0.88rem] leading-snug text-muted">{LEDE}</p>
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
                ? "grid min-h-0 flex-1 gap-x-[21px] lg:grid-cols-2"
                : "flex min-h-0 flex-1 flex-col"
            }
          >
            <div className="min-h-0">
              <p className="overflow-hidden text-[0.86rem] leading-snug text-muted">
                {study.summary}
              </p>
              <ul className="mt-[13px] flex flex-wrap gap-x-[13px] gap-y-[3px] font-mono text-[0.64rem] text-faint">
                {study.stack.map((tech) => (
                  <li key={tech}>{tech}</li>
                ))}
              </ul>
            </div>

            {study.assertions ? (
              <dl
                className={`space-y-[5px] font-mono text-[0.68rem] ${
                  study.feature
                    ? "lg:border-l lg:border-line lg:pl-[21px]"
                    : "mt-auto border-t border-line pt-[13px]"
                }`}
              >
                {study.assertions.rows
                  .slice(0, study.feature ? 8 : 4)
                  .map((row) => (
                    <div
                      key={row.name}
                      className="flex items-baseline justify-between gap-[13px]"
                    >
                      <dt className="min-w-0 truncate text-muted">{row.name}</dt>
                      <dd className={row.measured ? "shrink-0 text-signal" : "shrink-0 text-pass"}>
                        {row.threshold}
                      </dd>
                    </div>
                  ))}
              </dl>
            ) : study.stats.length > 0 ? (
              <div className="mt-auto grid grid-cols-2 gap-[13px] border-t border-line pt-[13px]">
                {study.stats.slice(0, 4).map((stat) => (
                  <Figure key={stat.label} stat={stat} size="sm" />
                ))}
              </div>
            ) : (
              <p className="mt-auto border-t border-line pt-[13px] font-mono text-[0.66rem] leading-snug text-faint">
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
          <ul className="mt-[13px] flex flex-wrap gap-x-[13px] gap-y-[3px] font-mono text-[0.64rem] text-faint">
            {["Vue", "Node.js", "PHP", "MySQL", "Redis", "AWS"].map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
          <ul className="mt-[13px] space-y-[5px] border-t border-line pt-[13px] text-[0.78rem] leading-snug text-muted">
            {AUTOTRADER_POINTS.map((point) => (
              <li key={point} className="flex gap-[8px]">
                <span aria-hidden="true" className="mt-[7px] size-[3px] shrink-0 rounded-full bg-accent" />
                {point}
              </li>
            ))}
          </ul>
          <div className="mt-auto flex gap-[21px] border-t border-line pt-[13px]">
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
          <ul className="flex-1 space-y-[8px] overflow-hidden">
            {gaps.map((gap) => (
              <li key={gap.gap} className="flex items-baseline gap-2.5">
                <span
                  aria-hidden="true"
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-signal"
                />
                <span className="min-w-0">
                  <span className="font-mono text-[0.72rem] text-signal">{gap.gap}</span>
                  <span className="block truncate text-[0.78rem] text-muted">
                    {gap.consequence}
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
          <div className="grid flex-1 grid-cols-2 content-center gap-x-[13px] gap-y-[13px]">
            {stats.map((stat) => (
              <Figure key={stat.label} stat={stat} size="sm" />
            ))}
          </div>
        </Tile>

      </div>
    </div>
  );
}
