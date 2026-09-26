import Link from "next/link";

import { ScrollCue } from "@/components/layout/scroll-cue";
import { cn } from "@/lib/utils";

/** One cell of the title block. */
export interface Spec {
  label: string;
  value: string;
  /** Makes the value a link — a live site, a repository. */
  href?: string;
}

/**
 * The first viewport of every page off the deck.
 *
 * Answers three things before any scrolling: what this is (kicker and
 * headline), the argument it makes (lede), and how to check it (the title
 * block — period, role, and the live site and source to verify against). The
 * kicker carries the same ink index chip the deck tile did, so the page reads
 * as that tile opened up rather than as somewhere new.
 *
 * `media` takes the right-hand half from xl up; below that it drops under the
 * text. Without it the headline gets the width instead.
 */
export function PageHero({
  trail,
  index,
  kicker,
  title,
  lede,
  specs,
  media,
  next,
  cueLabel,
}: {
  /** Breadcrumb above the kicker. The last entry is this page. */
  trail: { label: string; href?: string }[];
  /** The rail's index for this page, e.g. "02". */
  index?: string;
  kicker: string;
  title: string;
  lede?: string;
  specs: Spec[];
  media?: React.ReactNode;
  /** Id of the first section below the hero. The scroll cue links to it. */
  next: string;
  cueLabel: string;
}) {
  return (
    <section id="top" aria-labelledby="page-title" className="hero">
      {/* The bottom padding is the scroll cue's room when the hero exactly
          fits its viewport. Below lg the hero almost always runs past the
          fold anyway, so it needs far less. */}
      <div className="sheet flex flex-1 flex-col pb-16 pt-6 lg:pb-32 lg:pt-8">
        <nav aria-label="Breadcrumb" className="enter">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 label text-faint">
            {trail.map((crumb, i) => {
              const last = i === trail.length - 1;
              return (
                <li key={crumb.label} className="flex items-center gap-2">
                  {crumb.href && !last ? (
                    <Link
                      href={crumb.href}
                      className="py-1.5 text-ink no-underline underline-offset-[3px] hover:underline"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current={last ? "page" : undefined} className="py-1.5">
                      {crumb.label}
                    </span>
                  )}
                  {!last ? <span aria-hidden="true">/</span> : null}
                </li>
              );
            })}
          </ol>
        </nav>

        {/* my-auto centres the argument in whatever height the viewport
            leaves, so a tall window gets air above and below rather than a
            headline pinned to the top and a gap at the bottom. */}
        <div
          className={cn(
            "my-auto grid gap-x-12 gap-y-10 pt-10 lg:pt-12",
            media ? "xl:grid-cols-12 xl:items-center" : "",
          )}
        >
          <div className={media ? "xl:col-span-6" : "max-w-[64rem]"}>
            <p
              className="enter flex items-center gap-2.5 label text-ink"
              style={{ "--i": 1 } as React.CSSProperties}
            >
              {index ? (
                <span className="chip meta px-1.5 py-0.5 leading-none">{index}</span>
              ) : null}
              <span className="display tracking-[0.08em]">{kicker}</span>
            </p>

            {/* One span per word, so each can rise a beat after the last
                (.hero-word). The heading is named from the plain title, so
                assistive tech reads the sentence, not a list of words. */}
            <h1
              id="page-title"
              aria-label={title}
              className={cn(
                "hero-title mt-5 text-ink",
                media
                  ? "text-[clamp(2rem,3.4vw,3.4rem)]"
                  : "max-w-[24ch] text-[clamp(2.25rem,4.4vw,4.25rem)]",
              )}
            >
              {title.split(" ").map((word, i, words) => (
                <span key={i}>
                  <span
                    aria-hidden="true"
                    className="hero-word"
                    style={{ "--w": i } as React.CSSProperties}
                  >
                    {word}
                  </span>
                  {i < words.length - 1 ? " " : null}
                </span>
              ))}
            </h1>

            {lede ? (
              <p
                className="enter mt-6 max-w-[56ch] text-lg leading-relaxed text-muted lg:text-xl lg:leading-relaxed"
                style={{ "--i": 2 } as React.CSSProperties}
              >
                {lede}
              </p>
            ) : null}
          </div>

          {media ? <div className="xl:col-span-6">{media}</div> : null}

          {specs.length > 0 ? (
            <dl
              className={cn("titleblock enter", media ? "xl:col-span-12" : "")}
              style={{ "--i": 3 } as React.CSSProperties}
            >
              {specs.map((spec) => (
                <div key={spec.label}>
                  <dt className="label text-faint">{spec.label}</dt>
                  <dd className="mt-1.5 text-sm leading-snug text-ink [overflow-wrap:break-word]">
                    {spec.href ? (
                      <a
                        href={spec.href}
                        className="underline decoration-1 underline-offset-[3px] hover:decoration-2"
                      >
                        <Breakable text={spec.value} />
                        <span aria-hidden="true"> ↗</span>
                      </a>
                    ) : (
                      spec.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </div>

      <ScrollCue target={next} label={cueLabel} />
    </section>
  );
}

/**
 * A URL that may wrap only after a slash or a dot, so a narrow cell breaks
 * "riflessiautocare." + "vercel.app" rather than "riflessiautocare.vercel.a"
 * + "pp".
 */
function Breakable({ text }: { text: string }) {
  const parts = text.split(/(?<=[/.])/);
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 ? <wbr /> : null}
        </span>
      ))}
    </>
  );
}
