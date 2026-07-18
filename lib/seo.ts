import type { Metadata } from "next";
import type { Seo } from "@/content/site";
import { strapiImageUrl } from "./image";

/** Canonical site origin — also used by sitemap/robots. Matches site-setting.defaultSeo.canonicalUrl. */
export const SITE_URL = "https://daffa.me";
export const JOB_TITLE = "Information Systems Student";

export const FALLBACK_TITLE = "Daffa Ilham Restupratama — Information Systems, Data & Technology Portfolio";
export const FALLBACK_DESCRIPTION =
  "Portfolio of Daffa Ilham Restupratama, an Information Systems student at Universitas Indonesia focusing on data science, technology, business, and city-based tour experiences.";

interface BuildMetadataOptions {
  /** Absolute title bypasses the root layout's `%s · siteName` template (used by the homepage). */
  absoluteTitle?: boolean;
}

/** Per-field merge of an entry's SEO over the site default (empty fields fall back). */
export function mergeSeo(primary: Seo, fallback: Seo): Seo {
  return {
    metaTitle: primary.metaTitle || fallback.metaTitle,
    metaDescription: primary.metaDescription || fallback.metaDescription,
    canonicalUrl: primary.canonicalUrl || fallback.canonicalUrl,
    noIndex: primary.noIndex,
    ogImageUrl: primary.ogImageUrl || fallback.ogImageUrl,
  };
}

/** Maps a Strapi `seo` component (+ fallbacks) into a Next.js Metadata object.
 *  Shared by the root layout default and each page's generateMetadata. */
export function buildMetadata(seo: Seo | null, options: BuildMetadataOptions = {}): Metadata {
  const title = seo?.metaTitle || FALLBACK_TITLE;
  const description = seo?.metaDescription || FALLBACK_DESCRIPTION;
  const canonical = seo?.canonicalUrl || SITE_URL;
  const ogImages = seo?.ogImageUrl ? [{ url: strapiImageUrl(seo.ogImageUrl) }] : undefined;

  return {
    title: options.absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical },
    // Only set robots when explicitly hiding a page. Leaving it unset for normal
    // pages keeps them indexable (the default) AND lets Next's own noindex on
    // notFound() streamed responses take effect instead of being overridden by a
    // forced index,follow — so unknown slugs are excluded from search.
    robots: seo?.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      siteName: "Daffa Ilham Restupratama",
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages?.map((i) => i.url),
    },
  };
}
