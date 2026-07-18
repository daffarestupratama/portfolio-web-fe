/**
 * Tour landing + list + detail accessors. Card-shape mapping reuses lib/mappers'
 * `mapTourPackage`; the richer landing/detail shapes are assembled here.
 */

import { cache } from "react";
import type { BlocksContent } from "@strapi/blocks-react-renderer";
import { strapiFind, strapiFindOne } from "@/lib/strapi";
import { TOUR_LANDING_QUERY, TOUR_SLUGS_QUERY, TOURS_LIST_QUERY, tourDetailQuery } from "@/lib/queries";
import { formatCurrency, mapGallery, mapImage, mapTourPackage, toStringArray } from "@/lib/mappers";
import type {
  StrapiContactLink,
  StrapiPriceOption,
  StrapiRouteStop,
  StrapiTourGuideLanding,
  StrapiTourPackage,
  StrapiTourPackageDetail,
} from "@/lib/types";
import { mapSeo, type Seo } from "@/content/site";
import type { GalleryImage, MappedImage, TourPackage } from "@/content/home";

export interface ContactLinkOut {
  label: string;
  url: string;
  icon: string;
  linkType: string;
  isPrimary: boolean;
}

export interface TourLanding {
  title: string;
  subtitle: string | null;
  intro: BlocksContent | null;
  whyChooseMe: string[];
  heroImage: MappedImage | null;
  primaryCta: { label: string; url: string; description: string | null } | null;
  contactLinks: ContactLinkOut[];
  featuredSlugs: string[];
  seo: Seo;
}

export interface PriceOption {
  title: string;
  price: string;
  description: string | null;
}

export interface RouteStop {
  title: string;
  description: string | null;
  locationText: string | null;
  mapUrl: string | null;
  image: MappedImage | null;
}

export interface TourDetail {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  coverImage: MappedImage | null;
  description: BlocksContent | null;
  duration: string;
  meetingPoint: string | null;
  availabilityNote: string | null;
  suitableFor: string[];
  notSuitableFor: string[];
  whatToPrepare: string[];
  included: string[];
  excluded: string[];
  route: RouteStop[];
  priceOptions: PriceOption[];
  bookingContact: ContactLinkOut[];
  gallery: GalleryImage[];
  seo: Seo;
}

function asBlocks(value: unknown): BlocksContent | null {
  return Array.isArray(value) && value.length > 0 ? (value as BlocksContent) : null;
}

function mapContactLinkOut(c: StrapiContactLink): ContactLinkOut {
  return { label: c.label, url: c.url, icon: c.icon, linkType: c.linkType, isPrimary: c.isPrimary };
}

function mapPriceOption(o: StrapiPriceOption): PriceOption {
  return { title: o.title, price: formatCurrency(o.price, o.currency), description: o.description || null };
}

function mapRouteStop(r: StrapiRouteStop): RouteStop {
  return {
    title: r.title,
    description: r.description || null,
    locationText: r.locationText,
    mapUrl: r.mapUrl,
    image: mapImage(r.image, r.title),
  };
}

export const getTourLanding = cache(async (): Promise<TourLanding> => {
  const raw = await strapiFindOne<StrapiTourGuideLanding>("tour-guide-landing-page", TOUR_LANDING_QUERY);
  return {
    title: raw.title || "Walking Tours",
    subtitle: raw.subtitle,
    intro: asBlocks(raw.intro),
    whyChooseMe: toStringArray(raw.whyChooseMe),
    heroImage: mapImage(raw.heroImage, raw.title || "Walking tours"),
    primaryCta: raw.primaryCta
      ? { label: raw.primaryCta.label, url: raw.primaryCta.url, description: raw.primaryCta.description ?? null }
      : null,
    contactLinks: (raw.contactLinks ?? []).map(mapContactLinkOut),
    featuredSlugs: (raw.featuredTours ?? []).map((t) => t.slug).filter(Boolean),
    seo: mapSeo(raw.seo),
  };
});

export async function getAllTours(): Promise<TourPackage[]> {
  const tours = await strapiFind<StrapiTourPackage>("tour-packages", TOURS_LIST_QUERY);
  return tours.map(mapTourPackage);
}

export async function getTourBySlug(slug: string): Promise<TourDetail | null> {
  const matches = await strapiFind<StrapiTourPackageDetail>("tour-packages", tourDetailQuery(slug));
  const t = matches[0];
  if (!t) return null;
  return {
    id: t.documentId,
    slug: t.slug,
    title: t.title,
    shortDescription: t.shortDescription,
    coverImage: mapImage(t.coverImage, `${t.title} cover`),
    description: asBlocks(t.description),
    duration: t.duration,
    meetingPoint: t.meetingPoint,
    availabilityNote: t.availabilityNote,
    suitableFor: toStringArray(t.suitableFor),
    notSuitableFor: toStringArray(t.notSuitableFor),
    whatToPrepare: toStringArray(t.whatToPrepare),
    included: toStringArray(t.included),
    excluded: toStringArray(t.excluded),
    route: (t.route ?? [])
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map(mapRouteStop),
    priceOptions: (t.priceOption ?? []).map(mapPriceOption),
    bookingContact: (t.bookingContact ?? []).map(mapContactLinkOut),
    gallery: mapGallery(t.gallery),
    seo: mapSeo(t.seo),
  };
}

export async function getTourSlugs(): Promise<string[]> {
  const tours = await strapiFind<{ slug: string }>("tour-packages", TOUR_SLUGS_QUERY);
  return tours.map((t) => t.slug).filter(Boolean);
}
