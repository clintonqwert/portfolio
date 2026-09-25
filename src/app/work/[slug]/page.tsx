import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DetailView } from "@/components/layout/detail-view";
import { JsonLd } from "@/components/shared/json-ld";
import { Passages } from "@/components/shared/passages";
import { WORK_IMAGES } from "@/lib/content/assets";
import { Figure } from "@/components/home/tile";
import { getCaseStudy, getCaseStudySlugs } from "@/lib/content/work";
import { buildCaseStudyJsonLd, buildMetadata } from "@/lib/seo";

/** Every case study is known at build time, so every route prerenders. */
export async function generateStaticParams() {
  const slugs = await getCaseStudySlugs();
  return slugs.map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = await getCaseStudy(slug);
  if (!study) return {};

  return buildMetadata({
    title: `${study.name} — ${study.headline}`,
    description: study.summary,
    path: `/work/${study.slug}`,
  });
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = await getCaseStudy(slug);
  if (!study) notFound();

  const image = WORK_IMAGES[study.slug];

  const links = [
    study.liveUrl ? { href: `https://${study.liveUrl}`, label: study.liveUrl } : null,
    study.repoUrl ? { href: `https://${study.repoUrl}`, label: "Source" } : null,
  ].filter((l): l is { href: string; label: string } => l !== null);

  return (
    <>
      <JsonLd
        data={buildCaseStudyJsonLd({
          name: study.name,
          summary: study.summary,
          path: `/work/${study.slug}`,
        })}
      />

      <DetailView
        eyebrow={study.name}
        title={study.headline}
        lede={study.summary}
        meta={[
          { label: "Period", value: study.period },
          { label: "Role", value: study.role },
        ]}
        links={links}
        aside={
          <div className="flex-1 overflow-y-auto p-3">
            {/* The work, shown rather than only linked. Placeholder until the
                real capture lands — see src/lib/content/assets.ts. */}
            {image ? (
              <figure className="mb-4">
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={640}
                  height={400}
                  className="w-full rounded-md bg-sunk object-cover shadow-[inset_0_0_0_1px_var(--color-line)]"
                />
                {image.isPlaceholder ? (
                  <figcaption className="mt-1 meta text-faint">
                    Screenshot pending
                  </figcaption>
                ) : null}
              </figure>
            ) : null}

            {study.stats.length > 0 ? (
              <p className="label text-accent">
                Measured
              </p>
            ) : null}
            <div className="mt-3 space-y-3">
              {study.stats.map((stat) => (
                <Figure key={stat.label} stat={stat} size="sm" />
              ))}
            </div>

            <p className="mt-4 label text-accent">
              Stack
            </p>
            <ul className="mt-2 space-y-0.5 meta text-2xs text-muted">
              {study.stack.map((tech) => (
                <li key={tech}>{tech}</li>
              ))}
            </ul>

            {study.assertions ? (
              <>
                <p className="mt-4 label text-accent">
                  Asserted on every PR
                </p>
                <dl className="mt-2 space-y-1 font-mono text-2xs">
                  {study.assertions.rows.map((row) => (
                    <div key={row.name} className="flex justify-between gap-3">
                      <dt className="min-w-0 truncate text-muted">{row.name}</dt>
                      <dd className={row.measured ? "text-signal" : "text-pass"}>
                        {row.threshold}
                      </dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : null}

            {study.related && study.related.length > 0 ? (
              <>
                <p className="mt-4 label text-accent">Related</p>
                <ul className="mt-2 space-y-1.5 text-sm leading-snug">
                  {study.related.map((r) => (
                    <li key={r.href}>
                      <Link
                        href={r.href}
                        className="text-accent underline decoration-1 underline-offset-[3px]"
                      >
                        {r.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        }
      >
        <Passages passages={study.passages} />
      </DetailView>
    </>
  );
}
