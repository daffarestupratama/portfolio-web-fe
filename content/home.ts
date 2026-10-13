/**
 * Homepage data accessors. Bodies fetch live data from Strapi (lib/strapi.ts +
 * lib/mappers.ts) and map it into the shapes below — the shapes themselves are
 * the contract every homepage component was built against in step 2, so none
 * of them needed to change when this file stopped returning sample data.
 */

import { cache } from "react";
import { strapiFind, strapiFindOne } from "@/lib/strapi";
import { FEATURED_TOUR_PACKAGES_QUERY, HOME_PAGE_QUERY } from "@/lib/queries";
import { mapArticle, mapCta, mapProject, mapTourPackage } from "@/lib/mappers";
import type { StrapiHomePage, StrapiTourPackage } from "@/lib/types";
import { mapSeo, type Seo } from "@/content/site";

/** The four contact links in the hero's social row (site-setting.contactLinks `linkType`s). */
export type HeroLinkType = "linkedin" | "github" | "instagram" | "email";

export interface HeroLink {
  linkType: HeroLinkType;
  label: string;
  url: string;
}

export interface Cta {
  label: string;
  url: string;
}

export interface HomePage {
  fullName: string;
  headline: string;
  subheadline: string;
  heroCtaPrimary: Cta;
  heroCtaSecondary: Cta;
}

/** A resolved image (absolute URL + intrinsic size) for next/image. */
export interface MappedImage {
  url: string;
  alt: string;
  width: number;
  height: number;
}

export interface GalleryImage extends MappedImage {
  caption: string | null;
}

export type ExperienceCategory = "education" | "organization" | "others";

export interface Experience {
  id: string;
  category: ExperienceCategory;
  organization: string;
  /** Derived from `organization` (lib/mappers.ts) — no source field on Strapi's experience type. */
  initials: string;
  role: string;
  dateRange: string;
  description: string;
  /** Free-text place ("Depok, Indonesia"); shown in the expanded card. Null when blank. */
  location: string | null;
  /** Raw dates carried through for newest-first sorting (see byNewestExperience). */
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  gallery: GalleryImage[];
  /** Uploaded org logo when present; the item falls back to the initials box when null. */
  logo: MappedImage | null;
}

/**
 * Widened from a closed 3-value union (its step-2 sample-data shape) to `string`:
 * live projectType values already include ones outside that set (e.g.
 * "machine_learning"), so a closed union would just be incorrect typing.
 */
export type ProjectType = string;

/** A technology (a `skill` row reached through project.technologies) rendered as a logo tile. */
export interface Technology {
  id: string;
  name: string;
  /** Null for skills without a logo — the tile degrades to a text chip. */
  logo: MappedImage | null;
  category: string;
  level: string;
  order: number | null;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  summary: string;
  year: string;
  projectType: ProjectType;
  technologies: Technology[];
  coverImage: MappedImage | null;
  githubUrl?: string;
  liveDemoUrl?: string;
}

export interface TourPackage {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  price: string;
  route: string;
  duration: string;
  groupSize: string;
  coverImage: MappedImage | null;
}

export type ArticleLanguage = "en" | "id" | "de";

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  language: ArticleLanguage;
  publishedDate: string;
  readTime: string;
  tags: string[];
  coverImage: MappedImage | null;
  /** Pins the article to the top of any list it appears in, and highlights the row. */
  isFeatured: boolean;
}

/** Featured articles float to the top of a list, everything else keeps its place.
 *  `sort` is stable (guaranteed since ES2019), so the incoming newest-first order survives
 *  inside each group. Returns a new array; the input is untouched. */
export function featuredFirst(articles: Article[]): Article[] {
  return [...articles].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
}

/** All home-page-derived accessors read the same endpoint — cache() collapses them to a
 *  single network round trip per render. */
const getHomePageRaw = cache(() => strapiFindOne<StrapiHomePage>("home-page", HOME_PAGE_QUERY));

export async function getHomePage(): Promise<HomePage> {
  const raw = await getHomePageRaw();
  return {
    fullName: raw.fullName,
    headline: raw.headline,
    subheadline: raw.subheadline,
    heroCtaPrimary: mapCta(raw.heroCtaPrimary, { label: "Resume", url: "#" }),
    heroCtaSecondary: mapCta(raw.heroCtaSecondary, { label: "About me", url: "/about" }),
  };
}

/** Every project in the home-page `featuredProjects` relation, in its CMS order, uncapped. */
export async function getFeaturedProjects(): Promise<Project[]> {
  const raw = await getHomePageRaw();
  return raw.featuredProjects.map(mapProject);
}

export async function getFeaturedTours(): Promise<TourPackage[]> {
  const tours = await strapiFind<StrapiTourPackage>("tour-packages", FEATURED_TOUR_PACKAGES_QUERY);
  return tours.map(mapTourPackage);
}

/** Every article in the home-page `featuredArticles` relation, in its CMS order, uncapped. The
 *  editor's order is final here: unlike /articles, pinned articles are not floated up. */
export async function getFeaturedArticles(): Promise<Article[]> {
  const raw = await getHomePageRaw();
  return raw.featuredArticles.map(mapArticle);
}

/** Homepage SEO component (falls back to site-setting.defaultSeo at the call site). */
export async function getHomePageSeo(): Promise<Seo> {
  const raw = await getHomePageRaw();
  return mapSeo(raw.seo);
}
