import type { Metadata } from "next";
import type { MappedImage } from "@/content/home";
import type { OgImage, Seo } from "@/content/site";

/** Canonical site origin — the single source of truth for every self-referencing
 *  URL (canonicals, OG urls, JSON-LD @id, sitemap, robots). */
export const SITE_URL = "https://daffarestupratama.com";
export const JOB_TITLE = "Information Systems Graduate";
export const SITE_NAME = "Daffa Ilham Restupratama";

export const FALLBACK_TITLE = "Daffa Ilham Restupratama — Information Systems, Data & Technology Portfolio";
export const FALLBACK_DESCRIPTION =
  "Portfolio of Daffa Ilham Restupratama, an Information Systems graduate at Universitas Indonesia focusing on data science, technology, business, and management.";

/** A MappedImage (already an absolute URL + intrinsic size) as an OG image. */
export function mappedImageToOg(image: MappedImage | null | undefined): OgImage | null {
  return image ? { url: image.url, width: image.width, height: image.height, alt: image.alt || null } : null;
}

/** "/" or "" → origin; "/projects" → origin + "/projects". */
function normalizePath(path: string): string {
  if (!path || path === "/") return "";
  return path.startsWith("/") ? path : `/${path}`;
}

/** The page's own canonical, derived from its route. */
function canonicalFor(path: string): string {
  return `${SITE_URL}${normalizePath(path)}`;
}

/** Explicit-noindex metadata for a missing entry (detail generateMetadata) or the
 *  404 boundary — so unknown slugs stay out of the index without relying solely on
 *  Next's streamed-notFound() injection. */
export function notFoundMetadata(): Metadata {
  return { title: "Page not found", robots: { index: false, follow: false } };
}

interface ArticleMeta {
  publishedTime?: string | null;
  modifiedTime?: string | null;
  authors?: string[];
}

interface PageMetaInput {
  /** Route path: "" for home, "/projects", "/projects/{slug}", … */
  path: string;
  /** The entry's own `seo` component (highest priority), when the page has one. */
  seo?: Seo | null;
  /** The entry's own title/description/image — the middle of the fallback chain. */
  title?: string | null;
  description?: string | null;
  image?: OgImage | null;
  /** site-setting.defaultSeo — the site-wide fallback. */
  defaultSeo: Seo;
  /** Bypass the root layout's `%s · siteName` template (detail/landing pages). */
  absoluteTitle?: boolean;
  ogType?: "website" | "article";
  article?: ArticleMeta;
}

/** The one metadata builder every page calls. Resolves the full fallback chain
 *  (entry.seo → entry's own field → site default → hardcoded), the route-derived
 *  canonical, and complete Open Graph + Twitter tags. */
export function buildPageMetadata(input: PageMetaInput): Metadata {
  const { path, seo, defaultSeo, absoluteTitle, ogType = "website", article } = input;

  const title = seo?.metaTitle || input.title || defaultSeo.metaTitle || FALLBACK_TITLE;
  const description =
    seo?.metaDescription || input.description || defaultSeo.metaDescription || FALLBACK_DESCRIPTION;
  const ogImage = seo?.ogImage || input.image || defaultSeo.ogImage || null;
  const noIndex = seo?.noIndex ?? false;
  const canonical = canonicalFor(path);

  const ogImages = ogImage
    ? [
        {
          url: ogImage.url,
          ...(ogImage.width ? { width: ogImage.width } : {}),
          ...(ogImage.height ? { height: ogImage.height } : {}),
          ...(ogImage.alt ? { alt: ogImage.alt } : {}),
        },
      ]
    : undefined;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical },
    // Only set robots when explicitly hiding a page. Leaving it unset for normal
    // pages keeps them indexable AND lets Next's own noindex on notFound() streamed
    // responses take effect instead of being overridden by a forced index,follow.
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: ogType,
      url: canonical,
      title,
      description,
      siteName: SITE_NAME,
      images: ogImages,
      ...(ogType === "article" && article
        ? {
            publishedTime: article.publishedTime ?? undefined,
            modifiedTime: article.modifiedTime ?? undefined,
            authors: article.authors,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages?.map((i) => i.url),
    },
  };
}
