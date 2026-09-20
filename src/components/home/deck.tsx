import Image from "next/image";
import Link from "next/link";

import { Figure, Tile } from "@/components/home/tile";
import {
  CONTACT,
  CONTACT_HREF,
  LEDE,
  LOCATION,
  NAME,
  PORTRAIT,
  RESUME,
} from "@/lib/content/profile";
import type { CaseStudy, Gap, Stat } from "@/types/content";

/**
 * The dashboard.
 *
 * At >=1024px this is a 12x9 grid filling exactly one viewport — the body sets
 * overflow-hidden, so nothing here may grow. Below that the tiles stack in
 * source order and the page scrolls, which is the only honest option on a phone.
 */
export function Deck({
  stats,
  studies,
  gaps,
  autoTraderLede,
  standardLede,
}: {
  stats: Stat[];
  studies: CaseStudy[];
  gaps: Gap[];
  autoTraderLede: string;
  standardLede: string;
}) {
  const [first, second] = studies;

  return (
    <div
      className="deck [--deck-pad:12px] p-3 lg:[grid-template-rows:repeat(9,minmax(0,1fr))]"
    >
      {/* ── identity ─────────────────────────────────────────────────── */}
      <section className="tile lg:col-start-1 lg:col-end-5 lg:row-start-1 lg:row-end-6">
        <div className="flex min-h-0 flex-1 gap-4 p-5">
          <figure className="relative hidden aspect-[4/5] w-[38%] shrink-0 overflow-hidden bg-sunk sm:block">
            <Image
              src={PORTRAIT.src}
              alt={PORTRAIT.alt}
              fill
              priority
              sizes="200px"
              className="object-cover"
            />
            {PORTRAIT.isPlaceholder ? (
              <figcaption className="absolute inset-x-0 bottom-0 bg-ink/85 py-1 text-center font-mono text-[0.5rem] uppercase tracking-[0.1em] text-canvas">
                Placeholder
              </figcaption>
            ) : null}
          </figure>

          <div className="flex min-w-0 flex-1 flex-col">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-accent">
              {LOCATION}
            </p>
            <h1 className="mt-2 font-display text-[clamp(1.5rem,2.6vw,2.2rem)] font-bold leading-[1.05] tracking-[-0.028em] text-ink">
              {NAME}
            </h1>
            <p className="mt-3 min-h-0 overflow-hidden text-[0.88rem] leading-snug text-muted">
              {LEDE}
            </p>

            <div className="mt-auto flex flex-wrap gap-2 pt-4">
              <a
                href={RESUME.href}
                download
                className="inline-flex items-center gap-1.5 bg-ink px-3 py-2 font-mono text-[0.64rem] uppercase tracking-[0.07em] text-canvas no-underline transition-colors duration-200 hover:bg-accent"
              >
                Résumé ↓
              </a>
              <a
                href={CONTACT_HREF.email}
                className="inline-flex items-center px-3 py-2 font-mono text-[0.64rem] uppercase tracking-[0.07em] text-ink no-underline shadow-[inset_0_0_0_1px_var(--color-rule)] transition-colors duration-200 hover:text-accent hover:shadow-[inset_0_0_0_1px_var(--color-accent)]"
              >
                Email
              </a>
            </div>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[0.66rem]">
              {(
                [
                  [CONTACT_HREF.linkedin, CONTACT.linkedin],
                  [CONTACT_HREF.github, CONTACT.github],
                  [CONTACT_HREF.studio, CONTACT.studio],
                ] as const
              ).map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  className="truncate text-accent underline decoration-1 underline-offset-[3px]"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── measured ─────────────────────────────────────────────────── */}
      <Tile label="Measured" className="lg:col-start-5 lg:col-end-9 lg:row-start-1 lg:row-end-4">
        <div className="grid flex-1 grid-cols-2 content-center gap-x-4 gap-y-5">
          {stats.map((stat) => (
            <Figure key={stat.label} stat={stat} />
          ))}
        </div>
        <Link
          href="/history"
          className="mt-3 shrink-0 border-t border-line pt-3 font-mono text-[0.64rem] text-accent no-underline"
        >
          Track record &amp; tools →
        </Link>
      </Tile>

      {/* ── work ─────────────────────────────────────────────────────── */}
      {first ? (
        <Tile
          label={first.name}
          index="01"
          href={`/work/${first.slug}`}
          cta="Case study"
          className="lg:col-start-9 lg:col-end-13 lg:row-start-1 lg:row-end-6"
        >
          <p className="min-h-0 overflow-hidden text-[0.88rem] leading-snug text-muted">
            {first.summary}
          </p>
          <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[0.64rem] text-faint">
            {first.stack.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
          <div className="mt-auto flex gap-6 border-t border-line pt-4">
            {first.stats.slice(0, 3).map((stat) => (
              <Figure key={stat.label} stat={stat} size="sm" />
            ))}
          </div>
        </Tile>
      ) : null}

      {second ? (
        <Tile
          label={second.name}
          index="02"
          href={`/work/${second.slug}`}
          cta="Case study"
          className="lg:col-start-5 lg:col-end-9 lg:row-start-4 lg:row-end-7"
        >
          <p className="min-h-0 overflow-hidden text-[0.88rem] leading-snug text-muted">
            {second.summary}
          </p>
          <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[0.64rem] text-faint">
            {second.stack.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
          <div className="mt-auto flex gap-6 border-t border-line pt-4">
            {second.stats.slice(0, 2).map((stat) => (
              <Figure key={stat.label} stat={stat} size="sm" />
            ))}
          </div>
        </Tile>
      ) : null}

      {/* ── autotrader ───────────────────────────────────────────────── */}
      <Tile
        label="AutoTrader.ca — AutoSync"
        index="03"
        href="/autotrader"
        cta="Read"
        className="lg:col-start-9 lg:col-end-13 lg:row-start-6 lg:row-end-10"
      >
        <p className="min-h-0 overflow-hidden text-[0.88rem] leading-snug text-muted">
          {autoTraderLede}
        </p>
        <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[0.64rem] text-faint">
          {["Vue", "Node.js", "PHP", "MySQL", "Redis", "AWS"].map((tech) => (
            <li key={tech}>{tech}</li>
          ))}
        </ul>
        <div className="mt-auto flex gap-6 border-t border-line pt-4">
          <Figure stat={{ value: "5 yrs", label: "Jan 2020 – Jun 2025" }} size="sm" />
          <Figure stat={{ value: "~0", label: "Downtime after rollout" }} size="sm" />
        </div>
      </Tile>

      {/* ── open gaps: the page's argument, so it gets the sunk surface ─ */}
      <Tile
        label="Open gaps"
        index="04"
        href="/gaps"
        cta="All three"
        className="bg-sunk lg:col-start-1 lg:col-end-5 lg:row-start-6 lg:row-end-10"
      >
        <ul className="tile-scroll flex-1 space-y-2.5">
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

      {/* ── standard ─────────────────────────────────────────────────── */}
      <Tile
        label="Project OS"
        index="05"
        href="/standard"
        cta="Read"
        className="lg:col-start-5 lg:col-end-9 lg:row-start-7 lg:row-end-10"
      >
        <p className="min-h-0 overflow-hidden text-[0.85rem] leading-snug text-muted">
          {standardLede}
        </p>
      </Tile>

    </div>
  );
}
