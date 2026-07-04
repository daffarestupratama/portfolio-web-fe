import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Known static top-level routes. Dynamic detail routes (/projects/[slug], etc.)
// join once those pages ship in a later step.
const ROUTES = ["", "/projects", "/articles", "/tours", "/about", "/mkdir", "/guestbook"];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
