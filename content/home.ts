/**
 * Homepage data accessors. Bodies fetch live data from Strapi (lib/strapi.ts +
 * lib/mappers.ts) and map it into the shapes below — the shapes themselves are
 * the contract every homepage component was built against in step 2, so none
 * of them needed to change when this file stopped returning sample data.
 */

import { cache } from "react";
import { strapiFind, strapiFindOne } from "@/lib/strapi";
import { FEATURED_TOUR_PACKAGES_QUERY, HOME_PAGE_QUERY } from "@/lib/queries";
import {
  bucketExperiences,
  mapArticle,
  mapContactLinks,
  mapCta,
  mapExperience,
  mapProject,
  mapTourPackage,
} from "@/lib/mappers";
import type { StrapiHomePage, StrapiTourPackage } from "@/lib/types";
import { mapSeo, type Seo } from "@/content/site";

export type ContactIcon = "linkedin" | "github" | "instagram" | "email";

export interface ContactLink {
  icon: ContactIcon;
  label: string;
  url: string;
}

export interface Cta {
  label: string;
  url: string;
}

export interface HomePage {
  /** Hero tagline pill text. No Strapi field for this — hardcoded. */
  eyebrow: string;
  fullName: string;
  headline: string;
  subheadline: string;
  heroCtaPrimary: Cta;
  heroCtaSecondary: Cta;
  contactLinks: ContactLink[];
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
  /** Legacy plain-text stack — the fallback when `technologies` is empty. */
  techStack: string[];
  technologies: Technology[];
  coverImage: MappedImage | null;
  githubUrl?: string;
  dashboardUrl?: string;
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
  /** Highlights the article in the /articles list. (The homepage uses the
   *  home-page `featuredArticles` relation instead, not this flag.) */
  isFeatured: boolean;
}

/** All four home-page-derived accessors read the same endpoint — cache() collapses
 *  them to a single network round trip per render. */
const getHomePageRaw = cache(() => strapiFindOne<StrapiHomePage>("home-page", HOME_PAGE_QUERY));

export async function getHomePage(): Promise<HomePage> {
  const raw = await getHomePageRaw();
  return {
    eyebrow: "Data · Business · Finance · Maps · Technology",
    fullName: raw.fullName,
    headline: raw.headline,
    subheadline: raw.subheadline,
    heroCtaPrimary: mapCta(raw.heroCtaPrimary, { label: "Resume", url: "#" }),
    heroCtaSecondary: mapCta(raw.heroCtaSecondary, { label: "About me", url: "/about" }),
    contactLinks: mapContactLinks(raw.contactLinks),
  };
}

export async function getFeaturedExperiences(): Promise<Record<ExperienceCategory, Experience[]>> {
  const raw = await getHomePageRaw();
  return bucketExperiences(raw.featuredExperiences.map(mapExperience));
}

/** How many of the home-page `featuredProjects` relation the homepage grid renders.
 *  The relation itself is the source of truth for *which* projects and their order —
 *  this only caps the count. Raise it if the bento grid should show more. */
export const HOME_FEATURED_PROJECTS_LIMIT = 4;

export async function getFeaturedProjects(): Promise<Project[]> {
  const raw = await getHomePageRaw();
  return raw.featuredProjects.map(mapProject).slice(0, HOME_FEATURED_PROJECTS_LIMIT);
}

export async function getFeaturedTours(): Promise<TourPackage[]> {
  const tours = await strapiFind<StrapiTourPackage>("tour-packages", FEATURED_TOUR_PACKAGES_QUERY);
  return tours.map(mapTourPackage);
}

export async function getFeaturedArticles(): Promise<Article[]> {
  const raw = await getHomePageRaw();
  return raw.featuredArticles.map(mapArticle);
}

/** Homepage SEO component (falls back to site-setting.defaultSeo at the call site). */
export async function getHomePageSeo(): Promise<Seo> {
  const raw = await getHomePageRaw();
  return mapSeo(raw.seo);
}
