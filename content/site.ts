/**
 * Global site-setting accessor (nav/footer/contact/default SEO). Fetched once
 * per render via React cache(). This step consumes it for SEO metadata and the
 * contact CTA; nav/footer will migrate onto it in a later step.
 */

import { cache } from "react";
import { strapiFindOne } from "@/lib/strapi";
import { SITE_SETTING_QUERY } from "@/lib/queries";
import type { StrapiContactLink, StrapiSeo, StrapiSiteSetting } from "@/lib/types";

export interface Seo {
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  noIndex: boolean;
  ogImageUrl: string | null;
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
  return {
    metaTitle: seo?.metaTitle ?? null,
    metaDescription: seo?.metaDescription ?? null,
    canonicalUrl: seo?.canonicalUrl ?? null,
    noIndex: seo?.noIndex ?? false,
    ogImageUrl: seo?.ogImage?.url ?? null,
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
