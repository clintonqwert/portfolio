import Image from "next/image";

import { SectionHeading } from "@/components/ui/section";
import {
  CONTACT,
  CONTACT_HREF,
  LEDE,
  LOCATION,
  NAME,
  PORTRAIT,
  RESUME,
} from "@/lib/content/profile";
import type { Stat } from "@/types/content";

/**
 * The opening fold. Portrait sits beside the statement rather than above it:
 * the reader is here for evidence, and a full-bleed face would delay it.
 */
export function Masthead({ stats }: { stats: Stat[] }) {
  return (
    <div className="px-6 pb-0 pt-[clamp(2.5rem,5vw,4.5rem)] sm:px-10 lg:px-14">
      <div className="max-w-[1080px]">
        <div className="grid items-start gap-[clamp(2rem,4vw,3.5rem)] lg:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-accent">
              {LOCATION}
            </p>

            <SectionHeading
              as="h1"
              className="mt-5 max-w-[14ch] text-[clamp(2.6rem,6vw,4.4rem)] leading-[1.02] tracking-[-0.03em]"
            >
              {NAME}
            </SectionHeading>

            <p className="mt-5 max-w-[48ch] text-[clamp(1.02rem,1.6vw,1.2rem)] font-medium leading-[1.45] text-ink">
              {LEDE}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={RESUME.href}
                download
                className="inline-flex items-center gap-2 bg-ink px-4 py-2.5 font-mono text-[0.72rem] uppercase tracking-[0.08em] text-canvas no-underline transition-colors duration-200 hover:bg-accent"
              >
                Résumé
                <span aria-hidden="true">↓</span>
              </a>
              <a
                href={CONTACT_HREF.email}
                className="inline-flex items-center px-4 py-2.5 font-mono text-[0.72rem] uppercase tracking-[0.08em] text-ink no-underline shadow-[inset_0_0_0_1px_var(--color-rule)] transition-colors duration-200 hover:text-accent hover:shadow-[inset_0_0_0_1px_var(--color-accent)]"
              >
                {CONTACT.email}
              </a>
            </div>
          </div>

          {/*
            4:5 frame. Fixed aspect so the placeholder and a real photograph
            occupy identical space — swapping one for the other shifts nothing.
          */}
          <figure className="panel relative aspect-[4/5] w-full max-w-[280px] overflow-hidden lg:mt-2">
            <Image
              src={PORTRAIT.src}
              alt={PORTRAIT.alt}
              fill
              priority
              sizes="(max-width: 1024px) 280px, 280px"
              className="object-cover"
            />
            {PORTRAIT.isPlaceholder ? (
              <figcaption className="absolute inset-x-0 bottom-0 bg-ink/85 px-3 py-1.5 text-center font-mono text-[0.58rem] uppercase tracking-[0.1em] text-canvas">
                Placeholder
              </figcaption>
            ) : null}
          </figure>
        </div>

        {/* Measured strip. Data, not a hero-metric flourish. */}
        <dl className="mt-[clamp(2.5rem,5vw,4rem)] grid grid-cols-2 border-t border-rule sm:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={cnCell(i, stats.length)}
            >
              <dd className="font-mono text-[clamp(1.5rem,2.4vw,1.9rem)] font-medium leading-none tabular-nums tracking-[-0.03em] text-ink">
                {stat.value}
              </dd>
              <dt className="mt-2.5 font-mono text-[0.66rem] uppercase leading-[1.55] tracking-[0.08em] text-faint">
                {stat.label}
                {stat.detail ? (
                  <>
                    <br />
                    {stat.detail}
                  </>
                ) : null}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

/**
 * Cell rules: right border except at the end of each row, bottom border on the
 * first row when the grid wraps to two columns.
 */
function cnCell(i: number, total: number) {
  const base = "py-6 pr-6 border-line";
  const isLastInTwoCol = i % 2 === 1;
  const isLastInFourCol = i === total - 1;
  return [
    base,
    isLastInTwoCol ? "border-r-0" : "border-r",
    isLastInFourCol ? "sm:border-r-0" : "sm:border-r",
    i < 2 ? "border-b sm:border-b-0" : "",
  ].join(" ");
}
