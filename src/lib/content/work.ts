import "server-only";

import type { CaseStudy } from "@/types/content";

/**
 * Case studies. Every figure is verifiable against the repository named in
 * `repoUrl`, or against the live URL. See profile.ts for the wording rules.
 */
const CASE_STUDIES: readonly CaseStudy[] = [
  {
    slug: "driftpilot",
    name: "DriftPilot",
    headline: "A performance budget that blocks the merge",
    summary:
      "A quality bar moved out of the review conversation and into the pipeline, where it cannot be forgotten or argued with under deadline.",
    period: "Jun – Jul 2026",
    liveUrl: "driftpilot.ca",
    repoUrl: "github.com/clintonqwert/driftpilot-site",
    role: "Sole engineer",
    stack: ["Next.js 16", "React 19", "TypeScript", "Tailwind v4", "Zod 4"],
    stats: [
      { value: "37", label: "Prerendered routes", detail: "no runtime database" },
      { value: "3", label: "Defects caught", detail: "by the gate, pre-release" },
      { value: "237 kB", label: "Script weight", detail: "against a 260 kB ceiling" },
      { value: "21", label: "Reviewed pull requests", detail: "88 commits" },
    ],
    assertions: {
      caption: "lighthouserc.json — asserted on every pull request",
      rows: [
        { name: "Performance", threshold: "≥ 95", state: "passing" },
        { name: "Accessibility", threshold: "≥ 98", state: "passing" },
        { name: "SEO", threshold: "≥ 95", state: "passing" },
        { name: "Best practices", threshold: "≥ 90", state: "passing" },
        { name: "Largest contentful paint", threshold: "< 1500 ms", state: "passing" },
        { name: "Cumulative layout shift", threshold: "< 0.05", state: "passing" },
        { name: "Total blocking time", threshold: "< 150 ms", state: "passing" },
        { name: "Script weight", threshold: "< 260 kB", state: "237 kB", measured: true },
      ],
    },
    passages: [
      {
        paragraphs: [
          "Most teams treat performance as a discipline problem: everyone agrees the site should be fast, and it degrades anyway, one convenient dependency at a time. I moved the standard out of the review conversation and into the pipeline, where it cannot be forgotten or argued with under deadline.",
          "Every pull request against driftpilot.ca runs Lighthouse CI three times against a production build and asserts the median. A failure is a red check, not a comment.",
        ],
      },
      {
        heading: "What the gate caught",
        paragraphs: [
          "The gate earns its keep by catching what review misses. It stopped a WebGL shader path that hit 39 seconds of total blocking time on software renderers, a footer contrast pair below WCAG minimum, and a third-party scheduling embed that quietly blew the script budget.",
          "One budget was re-baselined during the project: the original 110 kB script ceiling was fiction against a framework-plus-shader reality measured at 237 kB, so I moved the number deliberately and wrote down why. Measurement can justify moving a threshold. Silently deleting a failing assertion to get a green check cannot — that distinction is the whole value of having the gate.",
        ],
      },
      {
        heading: "The rest of the build",
        paragraphs: [
          "37 statically prerendered routes with no runtime database. Content sits behind typed async accessors, so a headless CMS can replace the source without editing a page or a component.",
          "The lead pipeline runs Zod-validated Server Actions through honeypot and time-to-submit spam gates into a retrying webhook client that replays 5xx and 429 and treats 4xx as permanently failed — verified end to end on the live site. 88 commits across 21 reviewed pull requests.",
        ],
      },
    ],
  },
  {
    slug: "riflessi",
    name: "Riflessi Auto Care",
    headline: "Proving the foundation was actually reusable",
    summary:
      "Any architecture claims reusability. The only honest test is building the second thing — and then reporting what actually had to change.",
    period: "Jul – Aug 2026",
    liveUrl: "riflessiautocare.vercel.app",
    repoUrl: "github.com/clintonqwert/riflessiautocare",
    role: "Sole engineer · self-directed",
    stack: ["Next.js", "React Three Fiber", "glTF-Transform", "meshoptimizer"],
    stats: [
      { value: "5 weeks", label: "Empty repo to live", detail: "79 source files" },
      { value: "89%", label: "Hero asset reduction", detail: "19.07 MB → 2.05 MB" },
      { value: "205k → 96k", label: "Tyre mesh vertices", detail: "after decimation" },
      { value: "11", label: "Reviewed pull requests", detail: "" },
    ],
    passages: [
      {
        paragraphs: [
          "Any architecture claims reusability. The only honest test is building the second thing. Riflessi Auto Care went from empty repository to live in five weeks by swapping design-token values and rewriting content against fixed type contracts — every component survived untouched. That is the evidence the first project's abstractions were load-bearing rather than decorative.",
          "The honest version matters too: the parts that did need new code were the motion layer and the 3D stage, which were new capability rather than re-theming. A reuse claim that omits what did not reuse is not worth making.",
        ],
      },
      {
        heading: "The 19 MB hero",
        paragraphs: [
          "The hard problem was the hero: a licensed 3D vehicle model that weighed 19.07 MB, on a site holding a sub-1.5-second budget.",
          "The detail worth telling is why the obvious approach failed. The asset named every single node identically, so node-name matching found nothing — all the semantic meaning lived in the material names. So I deleted hidden geometry by material instead, then profiled and found the tyres alone were 63% of the model, decimated them from 205k to 96k vertices, stripped all seven textures because paint is applied at runtime, then welded, deduplicated, quantized and meshopt-compressed. The result was 2.05 MB, an 89% reduction, with a content-hashed filename so a one-year immutable cache header is actually safe.",
        ],
      },
      {
        heading: "Gating the import, not the render",
        paragraphs: [
          "The 3D scene is gated at the dynamic import rather than the render, so a device that cannot run it never downloads the chunk at all — viewport, CPU core count, device memory and a WebGL2 probe decide, and prefers-reduced-motion overrides every other signal. Gating the render would have been easier and would have shipped the payload anyway.",
          "The image pipeline blurs licence plates and strips all EXIF before publish. That is not a nice-to-have: the shop is run from home and the site deliberately withholds the address, which camera GPS metadata would have published on the first photo upload. Privacy belonged in the build step, not in a checklist someone remembers.",
        ],
      },
    ],
  },
] as const;

export async function getCaseStudies(): Promise<CaseStudy[]> {
  return [...CASE_STUDIES];
}

export async function getCaseStudy(slug: string): Promise<CaseStudy | null> {
  return CASE_STUDIES.find((study) => study.slug === slug) ?? null;
}

export async function getCaseStudySlugs(): Promise<string[]> {
  return CASE_STUDIES.map((study) => study.slug);
}
