import type { MetadataRoute } from "next";

import { getCaseStudySlugs } from "@/lib/content/work";
import { SITE_URL } from "@/lib/seo";

/** Every view is its own route, so every view is indexable and linkable. */
const VIEWS = ["/autotrader", "/gaps", "/standard", "/history"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getCaseStudySlugs();
  const lastModified = new Date();

  return [
    { url: SITE_URL, lastModified, changeFrequency: "monthly", priority: 1 },
    ...slugs.map((slug) => ({
      url: `${SITE_URL}/work/${slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...VIEWS.map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
