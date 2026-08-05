import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { FEATURES } from "@/lib/features";
import { getProjectSitemapEntries } from "@/content/projects";
import { getArticleSitemapEntries } from "@/content/articles";
import { getTourSitemapEntries } from "@/content/tours";
import type { SitemapEntry } from "@/content/site";

export const revalidate = 86400;

// Genuinely static top-level routes (no single child entry drives their freshness).
const STATIC_ROUTES = ["", "/about", "/services", "/guestbook", "/mkdir"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [projects, articles, tours] = await Promise.all([
    getProjectSitemapEntries(),
    getArticleSitemapEntries(),
    // Tours are hidden while FEATURES.tours is off — omit them from the sitemap
    // (routes still resolve, they're just not advertised).
    FEATURES.tours ? getTourSitemapEntries() : Promise.resolve<SitemapEntry[]>([]),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  // List routes: lastModified = the most recent child updatedAt, so a rebuild alone
  // doesn't churn their timestamp (only real content changes do).
  const listRoutes = [
    { path: "/projects", entries: projects },
    { path: "/articles", entries: articles },
    ...(FEATURES.tours ? [{ path: "/tours", entries: tours }] : []),
  ];
  const listEntries: MetadataRoute.Sitemap = listRoutes.map(({ path, entries }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: mostRecent(entries) ?? now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Detail routes: exclude noindex entries, and use each entry's updatedAt as lastModified.
  const detailEntries: MetadataRoute.Sitemap = [
    ...toUrls("/projects", projects),
    ...toUrls("/articles", articles),
    ...(FEATURES.tours ? toUrls("/tours", tours) : []),
  ];

  return [...staticEntries, ...listEntries, ...detailEntries];
}

/** Most recent updatedAt across a collection's entries (indexable ones), or null. */
function mostRecent(entries: SitemapEntry[]): Date | null {
  const times = entries
    .filter((e) => !e.noIndex && e.updatedAt)
    .map((e) => new Date(e.updatedAt).getTime())
    .filter((t) => !Number.isNaN(t));
  return times.length ? new Date(Math.max(...times)) : null;
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
