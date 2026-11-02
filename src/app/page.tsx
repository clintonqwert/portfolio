import Link from "next/link";

import { ContactBlock } from "@/components/home/contact-block";
import { LandingHero } from "@/components/home/landing-hero";
import { PreviewLoader } from "@/components/home/preview-loader";
import { WorkCard } from "@/components/home/work-card";
import { ChapterBar } from "@/components/layout/chapter-bar";
import { MobileProfile } from "@/components/layout/mobile-profile";
import { DirectionList } from "@/components/roadmap/direction-list";
import { Chapter, type ChapterRef } from "@/components/shared/chapter";
import { JsonLd } from "@/components/shared/json-ld";
import { TrackRecord } from "@/components/shared/track-record";
import { WORK_PREVIEWS } from "@/lib/content/assets";
import {
  ROADMAP_TEASER,
  getFeaturedWork,
  getLandingPrinciples,
  getProofPoints,
} from "@/lib/content/landing";
import { getSkillMarquee, getTrackRecord } from "@/lib/content/practice";
import {
  AVAILABILITY,
  CONTACT,
  CONTACT_HREF,
  FACTS,
  HEADLINE,
  LEDE,
  PROOF_LINE,
  RESUME,
} from "@/lib/content/profile";
import { getDirection, getGaps } from "@/lib/content/roadmap";
import { buildPersonJsonLd } from "@/lib/seo";

/**
 * The landing page (v2, 2026-10-31): a document that scrolls, in the order a
 * hiring reader asks their questions. Who is this and can I check it (the
 * hero and its proof), what have they built (the work), how do they work,
 * where have they been, what's unfinished, and how do I reach them.
 *
 * It replaced the one-screen deck. Everything the deck showed is still one
 * click away on the page that owns it; the secondary figures moved there.
 */
export default async function HomePage() {
  const [points, work, principles, roles, direction, gaps, skills] = await Promise.all([
    getProofPoints(),
    getFeaturedWork(),
    getLandingPrinciples(),
    getTrackRecord(),
    getDirection(),
    getGaps(),
    getSkillMarquee(),
  ]);
  // What's still missing: the gaps not yet closed. Their fixes link to items
  // on /roadmap, so here they are named and costed, and the chapter's link
  // leads to the fixes (PRODUCT.md principle 4: the gaps are load-bearing).
  const unfixed = gaps.filter((gap) => gap.state !== "closed");

  const chapters: ChapterRef[] = [
    { id: "work", number: "01", title: "Selected work" },
    { id: "how-i-work", number: "02", title: "How I work" },
    { id: "experience", number: "03", title: "Experience" },
    { id: "next", number: "04", title: ROADMAP_TEASER.heading },
    { id: "contact", number: "05", title: "Start a conversation" },
  ];
  const [workRef, practiceRef, experienceRef, nextRef, contactRef] = chapters as [
    ChapterRef,
    ChapterRef,
    ChapterRef,
    ChapterRef,
    ChapterRef,
  ];

  return (
    <article>
      <JsonLd data={buildPersonJsonLd()} />
      {/* Phones only: the rail's portrait, role and contacts, which the slim
          mobile bar has no room for. */}
      <MobileProfile />
      <ChapterBar kicker="Overview" chapters={chapters} />

      <LandingHero
        headline={HEADLINE}
        lede={LEDE}
        proofLine={PROOF_LINE}
        points={points}
        skills={skills}
        resume={RESUME}
        workId={workRef.id}
      />

      <Chapter
        {...workRef}
        wide={
          <div className="grid gap-6 md:grid-cols-2">
            {/* Loads each card's whole page on intent; watches this grid. */}
            <PreviewLoader />
            {work.map((item) => (
              <WorkCard
                key={item.href}
                work={item}
                preview={item.preview ? WORK_PREVIEWS[item.preview] : undefined}
              />
            ))}
          </div>
        }
      >
        {null}
      </Chapter>

      <Chapter {...practiceRef}>
        <ul className="grid border-t border-rule sm:grid-cols-2 sm:gap-x-10">
          {principles.map((principle, i) => (
            <li
              key={principle.title}
              className="rise border-b border-line py-5"
              style={{ "--i": i % 2 } as React.CSSProperties}
            >
              <h3 className="display-tight text-xl leading-snug text-ink">{principle.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-muted">{principle.body}</p>
            </li>
          ))}
        </ul>
      </Chapter>

      <Chapter {...experienceRef}>
        <TrackRecord roles={roles} compact />
        <TextLink href="/history">See the full history</TextLink>
      </Chapter>

      <Chapter {...nextRef}>
        <p className="max-w-[60ch] text-lg leading-relaxed text-muted">{ROADMAP_TEASER.text}</p>
        <div className="mt-8">
          <DirectionList stages={direction} />
        </div>
        {unfixed.length > 0 ? (
          <>
            <p className="mt-12 label text-faint">Gaps and improvements</p>
            <ul className="mt-3 border-t border-rule">
              {unfixed.map((gap) => (
                <li
                  key={gap.gap}
                  className="border-b border-line py-4 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:gap-x-8"
                >
                  <p className="font-mono text-sm text-signal">{gap.gap}</p>
                  <p className="mt-1 text-base leading-relaxed text-muted md:mt-0">{gap.consequence}</p>
                </li>
              ))}
            </ul>
          </>
        ) : null}
        <TextLink href="/roadmap">See the roadmap</TextLink>
      </Chapter>

      <Chapter {...contactRef} tone="ink">
        <ContactBlock
          availability={AVAILABILITY}
          facts={FACTS.slice(1)}
          email={{ href: CONTACT_HREF.email, label: "Email Clinton" }}
          resume={RESUME}
          links={[
            { label: "LinkedIn", href: CONTACT_HREF.linkedin },
            { label: "GitHub", href: CONTACT_HREF.github },
            { label: CONTACT.studio, href: CONTACT_HREF.studio },
          ]}
        />
      </Chapter>
    </article>
  );
}

/** A chapter's way onward, to the page that holds the rest. */
function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group mt-8 inline-flex items-center gap-2 py-1 font-mono text-sm text-ink no-underline transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-quart)] hover:text-accent"
    >
      {children}
      <span
        aria-hidden="true"
        className="inline-block transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out-quart)] group-hover:translate-x-0.5"
      >
        →
      </span>
    </Link>
  );
}
