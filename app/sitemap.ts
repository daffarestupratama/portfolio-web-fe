import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { getProjectSlugs } from "@/content/projects";
import { getArticleSlugs } from "@/content/articles";

export const revalidate = 60;

// Static top-level routes. Tours/about/mkdir/guestbook ship in later steps but
// are listed as known destinations already linked from the site.
const STATIC_ROUTES = ["", "/projects", "/articles", "/tours", "/about", "/mkdir", "/guestbook"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const [projectSlugs, articleSlugs] = await Promise.all([getProjectSlugs(), getArticleSlugs()]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const detailEntries: MetadataRoute.Sitemap = [
    ...projectSlugs.map((slug) => `/projects/${slug}`),
    ...articleSlugs.map((slug) => `/articles/${slug}`),
  ].map((path) => ({ url: `${SITE_URL}${path}`, lastModified, changeFrequency: "weekly", priority: 0.6 }));

  return [...staticEntries, ...detailEntries];
}
