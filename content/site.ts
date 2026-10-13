/**
 * Global site-setting accessor: default SEO, the footer, the article byline, and every contact
 * surface. Fetched once per render via React cache().
 */

import { cache } from "react";
import { strapiFindOne } from "@/lib/strapi";
import { strapiImageUrl } from "@/lib/image";
import { mapImage } from "@/lib/mappers";
import { CONTACT_FALLBACK, stripMailto, withHttps } from "@/lib/contact";
import { SITE_SETTING_QUERY } from "@/lib/queries";
import type { MappedImage } from "@/content/home";
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
  noIndex: boolean;
  ogImage: OgImage | null;
}

export interface SiteContactLink {
  /** site-setting.contactLinks `linkType` enum: email, whatsapp, linkedin, github, … */
  linkType: string;
  label: string;
  url: string;
}

export interface SiteSettings {
  siteName: string | null;
  /** The footer tagline. Null when blank, so the footer falls back to its own copy. */
  footerText: string | null;
  /** Resolved address, never empty: the `email` row, then the old field, then the fallback. */
  email: string;
  /** Resolved wa.me URL, never empty: the `whatsapp` row, then the old field, then the fallback. */
  whatsappUrl: string;
  /** The single source of contact links, in CMS order. */
  contactLinks: SiteContactLink[];
  defaultSeo: Seo;
  /** Byline photo for the article author. Null → the monogram fallback is used. */
  authorAvatar: MappedImage | null;
  /** Site-wide contact card copy. Null fields fall back to ContactCTA's own defaults. */
  contactCta: { heading: string | null; text: string | null };
}

export function mapSeo(seo: StrapiSeo | null): Seo {
  const og = seo?.ogImage;
  return {
    metaTitle: seo?.metaTitle ?? null,
    metaDescription: seo?.metaDescription ?? null,
    noIndex: seo?.noIndex ?? false,
    ogImage: og?.url
      ? { url: strapiImageUrl(og.url), width: og.width, height: og.height, alt: og.alternativeText }
      : null,
  };
}

function mapContactLinks(links: StrapiContactLink[]): SiteContactLink[] {
  return links
    .filter((l) => l.linkType && l.url?.trim())
    .map((l) => ({ linkType: l.linkType, label: l.label, url: l.url.trim() }));
}

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const raw = await strapiFindOne<StrapiSiteSetting>("site-setting", SITE_SETTING_QUERY);
  const contactLinks = mapContactLinks(raw.contactLinks ?? []);
  const row = (linkType: string) => contactLinks.find((l) => l.linkType === linkType)?.url;
  // The rows win; `raw.email` / `raw.whatsappUrl` are read only while those fields still exist.
  const emailRow = row("email");
  const whatsappRow = row("whatsapp");
  return {
    siteName: raw.siteName,
    footerText: raw.footerText?.trim() || null,
    email: (emailRow && stripMailto(emailRow)) || raw.email?.trim() || CONTACT_FALLBACK.email,
    whatsappUrl: (whatsappRow && withHttps(whatsappRow)) || raw.whatsappUrl?.trim() || CONTACT_FALLBACK.whatsappUrl,
    contactLinks,
    defaultSeo: mapSeo(raw.defaultSeo),
    authorAvatar: mapImage(raw.authorAvatar, "Author"),
    contactCta: {
      // Normalised to null when blank so an empty CMS field falls through to ContactCTA's
      // hardcoded copy — an empty string would otherwise render an empty heading.
      heading: raw.contactCta?.heading?.trim() || null,
      text: raw.contactCta?.text?.trim() || null,
    },
  };
});
