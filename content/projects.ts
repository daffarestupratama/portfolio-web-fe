/**
 * Project list + detail accessors. Card-shape mapping reuses lib/mappers'
 * `mapProject`; the richer detail shape is assembled here (kept out of
 * lib/mappers to avoid a mappers <-> content import cycle).
 */

import { cache } from "react";
import type { BlocksContent } from "@strapi/blocks-react-renderer";
import { strapiFind, strapiFindOneOptional } from "@/lib/strapi";
import {
  PROJECT_SLUGS_QUERY,
  PROJECTS_LIST_QUERY,
  PROJECTS_PAGE_QUERY,
  PROJECTS_SITEMAP_QUERY,
  projectDetailQuery,
} from "@/lib/queries";
import { mapArticle, mapGallery, mapImage, mapProject } from "@/lib/mappers";
import type { StrapiProject, StrapiProjectDetail, StrapiProjectsPage } from "@/lib/types";
import { mapSeo, toSitemapEntries, type Seo, type SitemapEntry, type StrapiSitemapRow } from "@/content/site";
import type { Article, GalleryImage, MappedImage, Project } from "@/content/home";

export interface ProjectDetail extends Project {
  projectStatus: string;
  problem: string | null;
  approach: BlocksContent | null;
  result: BlocksContent | null;
  coverImage: MappedImage | null;
  gallery: GalleryImage[];
  relatedArticles: Article[];
  seo: Seo;
}

/** A Strapi `blocks` value is a non-empty array of nodes; empty/absent -> null. */
function asBlocks(value: unknown): BlocksContent | null {
  return Array.isArray(value) && value.length > 0 ? (value as BlocksContent) : null;
}

function mapProjectDetail(p: StrapiProjectDetail): ProjectDetail {
  return {
    ...mapProject(p),
    projectStatus: p.projectStatus,
    problem: p.problem || null,
    approach: asBlocks(p.approach),
    result: asBlocks(p.result),
    coverImage: mapImage(p.coverImage, `${p.title} cover`),
    gallery: mapGallery(p.gallery),
    relatedArticles: (p.relatedArticles ?? []).map(mapArticle),
    seo: mapSeo(p.seo),
  };
}

export async function getAllProjects(): Promise<Project[]> {
  const projects = await strapiFind<StrapiProject>("projects", PROJECTS_LIST_QUERY);
  return projects.map(mapProject);
}

/** The projects-page single type. Blank text fields are null so the page uses its own copy. */
export interface ProjectsPage {
  title: string | null;
  subtitle: string | null;
  /** Related project documentIds in relation order: the curated head of the /projects list. */
  orderedIds: string[];
  seo: Seo;
}

/** Null when projects-page is missing, unpublished or not public. Cached because metadata and the page both read it. */
export const getProjectsPage = cache(async (): Promise<ProjectsPage | null> => {
  const raw = await strapiFindOneOptional<StrapiProjectsPage>("projects-page", PROJECTS_PAGE_QUERY);
  if (!raw) return null;
  return {
    title: raw.title?.trim() || null,
    subtitle: raw.subtitle?.trim() || null,
    orderedIds: (raw.projects ?? []).map((p) => p.documentId).filter(Boolean),
    seo: mapSeo(raw.seo),
  };
});

/**
 * Curated projects first, in `orderedIds` order, then every other project in the order `all`
 * arrives (getAllProjects sorts newest year first, then title A to Z). Unknown or repeated ids are
 * ignored and no project is ever left out.
 */
export function orderProjects(all: Project[], orderedIds: string[]): Project[] {
  const byId = new Map(all.map((p) => [p.id, p]));
  const head: Project[] = [];
  const seen = new Set<string>();
  for (const id of orderedIds) {
    const project = byId.get(id);
    if (!project || seen.has(id)) continue;
    seen.add(id);
    head.push(project);
  }
  return [...head, ...all.filter((p) => !seen.has(p.id))];
}

export async function getProjectBySlug(slug: string): Promise<ProjectDetail | null> {
  const matches = await strapiFind<StrapiProjectDetail>("projects", projectDetailQuery(slug));
  return matches[0] ? mapProjectDetail(matches[0]) : null;
}

export async function getProjectSlugs(): Promise<string[]> {
  const projects = await strapiFind<{ slug: string }>("projects", PROJECT_SLUGS_QUERY);
  return projects.map((p) => p.slug).filter(Boolean);
}

export async function getProjectSitemapEntries(): Promise<SitemapEntry[]> {
  return toSitemapEntries(await strapiFind<StrapiSitemapRow>("projects", PROJECTS_SITEMAP_QUERY));
}
