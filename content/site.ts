/**
 * Global site-setting accessor (nav/footer/contact/default SEO). Fetched once
 * per render via React cache(). This step consumes it for SEO metadata and the
 * contact CTA; nav/footer will migrate onto it in a later step.
 */

import { cache } from "react";
import { strapiFindOne } from "@/lib/strapi";
import { strapiImageUrl } from "@/lib/image";
import { SITE_SETTING_QUERY } from "@/lib/queries";
import type { StrapiContactLink, StrapiSeo, StrapiSiteSetting } from "@/lib/types";

export interface OgImage {
  url: string;
  width: number | null;
  height: number | null;
  alt: string | null;
}

/** A collection entry reduced to what the sitemap needs. */
export interface SitemapEntry {
  slug: string;
  /** ISO timestamp used as `lastModified`. */
  updatedAt: string;
  noIndex: boolean;
}

/** Raw Strapi row for the sitemap listings (slug + updatedAt + seo.noIndex). */
export interface StrapiSitemapRow {
  slug: string;
  updatedAt: string;
  seo: { noIndex: boolean | null } | null;
}

/** Map raw sitemap rows → SitemapEntry (drops slugless rows; noIndex defaults false). */
export function toSitemapEntries(rows: StrapiSitemapRow[]): SitemapEntry[] {
  return rows
    .filter((r) => r.slug)
    .map((r) => ({ slug: r.slug, updatedAt: r.updatedAt, noIndex: r.seo?.noIndex ?? false }));
}

export interface Seo {
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  noIndex: boolean;
  ogImage: OgImage | null;
}

export interface SiteContactLink {
  label: string;
  url: string;
  icon: string;
}

export interface SiteSettings {
  siteName: string | null;
  footerText: string | null;
  copyrightText: string | null;
  email: string | null;
  whatsappUrl: string | null;
  contactLinks: SiteContactLink[];
  defaultSeo: Seo;
}

export function mapSeo(seo: StrapiSeo | null): Seo {
  const og = seo?.ogImage;
  return {
    metaTitle: seo?.metaTitle ?? null,
    metaDescription: seo?.metaDescription ?? null,
    canonicalUrl: seo?.canonicalUrl ?? null,
    noIndex: seo?.noIndex ?? false,
    ogImage: og?.url
      ? { url: strapiImageUrl(og.url), width: og.width, height: og.height, alt: og.alternativeText }
      : null,
  };
}

function mapContactLinks(links: StrapiContactLink[]): SiteContactLink[] {
  return links.map((l) => ({ label: l.label, url: l.url, icon: l.icon }));
}

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const raw = await strapiFindOne<StrapiSiteSetting>("site-setting", SITE_SETTING_QUERY);
  return {
    siteName: raw.siteName,
    footerText: raw.footerText,
    copyrightText: raw.copyrightText,
    email: raw.email,
    whatsappUrl: raw.whatsappUrl,
    contactLinks: mapContactLinks(raw.contactLinks ?? []),
    defaultSeo: mapSeo(raw.defaultSeo),
  };
});
