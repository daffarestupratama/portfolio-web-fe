/**
 * Article list + detail accessors. Card-shape mapping reuses lib/mappers'
 * `mapArticle`; the richer detail shape is assembled here.
 */

import type { BlocksContent } from "@strapi/blocks-react-renderer";
import { strapiFind } from "@/lib/strapi";
import { ARTICLE_SLUGS_QUERY, ARTICLES_LIST_QUERY, articleDetailQuery } from "@/lib/queries";
import { mapArticle, mapImage, mapProject, toStringArray } from "@/lib/mappers";
import type { StrapiArticle, StrapiArticleDetail } from "@/lib/types";
import { mapSeo, type Seo } from "@/content/site";
import type { Article, MappedImage, Project } from "@/content/home";

export interface ArticleDetail extends Article {
  body: BlocksContent | null;
  tags: string[];
  coverImage: MappedImage | null;
  relatedProjects: Project[];
  seo: Seo;
}

function asBlocks(value: unknown): BlocksContent | null {
  return Array.isArray(value) && value.length > 0 ? (value as BlocksContent) : null;
}

function mapArticleDetail(a: StrapiArticleDetail): ArticleDetail {
  return {
    ...mapArticle(a),
    body: asBlocks(a.body),
    tags: toStringArray(a.tags),
    coverImage: mapImage(a.coverImage, `${a.title} cover`),
    relatedProjects: (a.relatedProjects ?? []).map(mapProject),
    seo: mapSeo(a.seo),
  };
}

export async function getAllArticles(): Promise<Article[]> {
  const articles = await strapiFind<StrapiArticle>("articles", ARTICLES_LIST_QUERY);
  return articles.map(mapArticle);
}

export async function getArticleBySlug(slug: string): Promise<ArticleDetail | null> {
  const matches = await strapiFind<StrapiArticleDetail>("articles", articleDetailQuery(slug));
  return matches[0] ? mapArticleDetail(matches[0]) : null;
}

export async function getArticleSlugs(): Promise<string[]> {
  const articles = await strapiFind<{ slug: string }>("articles", ARTICLE_SLUGS_QUERY);
  return articles.map((a) => a.slug).filter(Boolean);
}
