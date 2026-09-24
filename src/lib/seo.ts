import type { Metadata } from "next";

import { CONTACT_HREF, LEDE, NAME, ROLE_TITLE } from "@/lib/content/profile";

export const SITE_NAME = `${NAME} — ${ROLE_TITLE}`;
export const SITE_DESCRIPTION = LEDE;

const SITE_URL_FALLBACK = "https://clintonramonida.ca";

if (!process.env.NEXT_PUBLIC_SITE_URL && process.env.NODE_ENV === "production") {
  // Canonical URLs and JSON-LD silently become wrong rather than absent when the
  // origin is missing, so fail the build instead of shipping bad metadata.
  throw new Error(
    "NEXT_PUBLIC_SITE_URL is required in production — set it in Vercel environment variables before deploying.",
  );
}

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? SITE_URL_FALLBACK
).replace(/\/$/, "");

interface BuildMetadataInput {
  /** Full page title. */
  title: string;
  description: string;
  /** Route path starting with "/", no trailing slash. */
  path: string;
}

/**
 * Canonical metadata builder used by every route.
 * Canonical URLs are absolute and carry no trailing slash.
 */
export function buildMetadata({
  title,
  description,
  path,
}: BuildMetadataInput): Metadata {
  const url = path === "/" ? SITE_URL : `${SITE_URL}${path}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url,
      locale: "en_CA",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/**
 * Person schema for the home route. Kept minimal and factual — every field maps
 * to something published on the page.
 */
export function buildPersonJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: NAME,
    jobTitle: ROLE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    email: CONTACT_HREF.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Vancouver",
      addressRegion: "BC",
      addressCountry: "CA",
    },
    sameAs: [CONTACT_HREF.linkedin, CONTACT_HREF.github, CONTACT_HREF.studio],
  };
}

/** Breadcrumb for a case study route. */
export function buildCaseStudyJsonLd(input: {
  name: string;
  summary: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.name,
    description: input.summary,
    url: `${SITE_URL}${input.path}`,
    author: { "@type": "Person", name: NAME, url: SITE_URL },
  };
}
