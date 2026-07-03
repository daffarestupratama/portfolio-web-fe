/**
 * Homepage data accessors. Bodies fetch live data from Strapi (lib/strapi.ts +
 * lib/mappers.ts) and map it into the shapes below — the shapes themselves are
 * the contract every homepage component was built against in step 2, so none
 * of them needed to change when this file stopped returning sample data.
 */

import { cache } from "react";
import { strapiFind, strapiFindOne } from "@/lib/strapi";
import { FEATURED_TOUR_PACKAGES_QUERY, HOME_PAGE_QUERY } from "@/lib/queries";
import { mapArticle, mapContactLinks, mapCta, mapExperience, mapProject, mapTourPackage } from "@/lib/mappers";
import type { StrapiHomePage, StrapiTourPackage } from "@/lib/types";

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

export interface HeroStat {
  label: string;
  value: string;
}

export interface HomePage {
  eyebrow: string;
  fullName: string;
  headline: string;
  subheadline: string;
  heroCtaPrimary: Cta;
  heroCtaSecondary: Cta;
  contactLinks: ContactLink[];
  /** No Strapi field for this — hardcoded until home-page grows one. */
  heroStats: HeroStat[];
}

export type ExperienceCategory = "professional" | "education" | "org";

export interface Experience {
  id: string;
  category: ExperienceCategory;
  organization: string;
  /** Derived from `organization` (lib/mappers.ts) — no source field on Strapi's experience type. */
  initials: string;
  role: string;
  dateRange: string;
  description: string;
}

/**
 * Widened from a closed 3-value union (its step-2 sample-data shape) to `string`:
 * live projectType values already include ones outside that set (e.g.
 * "machine_learning"), so a closed union would just be incorrect typing.
 */
export type ProjectType = string;

export interface Project {
  id: string;
  slug: string;
  title: string;
  summary: string;
  year: string;
  projectType: ProjectType;
  techStack: string[];
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
}

/** All four home-page-derived accessors read the same endpoint — cache() collapses
 *  them to a single network round trip per render. */
const getHomePageRaw = cache(() => strapiFindOne<StrapiHomePage>("home-page", HOME_PAGE_QUERY));

export async function getHomePage(): Promise<HomePage> {
  const raw = await getHomePageRaw();
  return {
    eyebrow: "Information systems · data & GIS · tour guide", // TODO: no Strapi field for this
    fullName: raw.fullName,
    headline: raw.headline,
    subheadline: raw.subheadline,
    heroCtaPrimary: mapCta(raw.heroCtaPrimary, { label: "Resume", url: "#" }),
    heroCtaSecondary: mapCta(raw.heroCtaSecondary, { label: "About me", url: "/about" }),
    contactLinks: mapContactLinks(raw.contactLinks),
    heroStats: [
      // TODO: no Strapi field for this — hardcoded until home-page grows one.
      { label: "Models", value: "12" },
      { label: "Dashboards", value: "8" },
      { label: "Tours led", value: "40+" },
    ],
  };
}

export async function getFeaturedExperiences(): Promise<Record<ExperienceCategory, Experience[]>> {
  const raw = await getHomePageRaw();
  const experiences = raw.featuredExperiences.map(mapExperience);
  return {
    professional: experiences.filter((e) => e.category === "professional"),
    education: experiences.filter((e) => e.category === "education"),
    org: experiences.filter((e) => e.category === "org"),
  };
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const raw = await getHomePageRaw();
  return raw.featuredProjects.map(mapProject);
}

export async function getFeaturedTours(): Promise<TourPackage[]> {
  const tours = await strapiFind<StrapiTourPackage>("tour-packages", FEATURED_TOUR_PACKAGES_QUERY);
  return tours.map(mapTourPackage);
}

export async function getFeaturedArticles(): Promise<Article[]> {
  const raw = await getHomePageRaw();
  return raw.featuredArticles.map(mapArticle);
}
