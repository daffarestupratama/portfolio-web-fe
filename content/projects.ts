/**
 * Project list + detail accessors. Card-shape mapping reuses lib/mappers'
 * `mapProject`; the richer detail shape is assembled here (kept out of
 * lib/mappers to avoid a mappers <-> content import cycle).
 */

import type { BlocksContent } from "@strapi/blocks-react-renderer";
import { strapiFind } from "@/lib/strapi";
import { PROJECT_SLUGS_QUERY, PROJECTS_LIST_QUERY, PROJECTS_SITEMAP_QUERY, projectDetailQuery } from "@/lib/queries";
import { mapArticle, mapGallery, mapImage, mapProject } from "@/lib/mappers";
import type { StrapiProject, StrapiProjectDetail } from "@/lib/types";
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
