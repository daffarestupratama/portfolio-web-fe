import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { getProjectSitemapEntries } from "@/content/projects";
import { getArticleSitemapEntries } from "@/content/articles";
import { getTourSitemapEntries } from "@/content/tours";
import type { SitemapEntry } from "@/content/site";

export const revalidate = 60;

// Real, indexable top-level routes. /mkdir is intentionally excluded while its page
// is still deferred (it 404s); it will be added when the page ships.
const STATIC_ROUTES = ["", "/projects", "/articles", "/tours", "/about", "/services", "/guestbook"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [projects, articles, tours] = await Promise.all([
    getProjectSitemapEntries(),
    getArticleSitemapEntries(),
    getTourSitemapEntries(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  // Detail routes: exclude noindex entries, and use each entry's updatedAt as lastModified.
  const detailEntries: MetadataRoute.Sitemap = [
    ...toUrls("/projects", projects),
    ...toUrls("/articles", articles),
    ...toUrls("/tours", tours),
  ];

  return [...staticEntries, ...detailEntries];
}

function toUrls(base: string, entries: SitemapEntry[]): MetadataRoute.Sitemap {
  return entries
    .filter((entry) => !entry.noIndex)
    .map((entry) => ({
      url: `${SITE_URL}${base}/${entry.slug}`,
      lastModified: entry.updatedAt ? new Date(entry.updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    }));
}
