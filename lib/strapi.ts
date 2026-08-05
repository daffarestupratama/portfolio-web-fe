import type { StrapiCollectionResponse, StrapiSingleResponse } from "./types";

const STRAPI_URL = (process.env.NEXT_PUBLIC_STRAPI_URL ?? "https://cms.daffa.me").replace(/\/+$/, "");

/**
 * No `next: { revalidate }` here on purpose — each route's `export const revalidate` is the
 * single source of truth for freshness.
 *
 * Next takes the MINIMUM of the segment config and every fetch's revalidate, so a
 * fetch-level 60 silently pinned all routes to 60s no matter what the segment declared
 * (which is what kept re-rendering the site into Cloudflare's 10ms CPU limit). Setting a
 * *longer* fetch revalidate is equally wrong: an ISR regeneration would then be served
 * stale data from the fetch cache. With no fetch cache entry, every render fetches fresh
 * data, and renders only happen on the route's ISR schedule.
 */
async function strapiFetch<T>(path: string, query: string | undefined): Promise<T> {
  const url = `${STRAPI_URL}/api${path}${query ? `?${query}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Strapi request failed: ${res.status} ${res.statusText} — ${url}`);
  }
  return res.json() as Promise<T>;
}

/** Fetch a single-type entry (e.g. `home-page`) or one document by uid. */
export async function strapiFindOne<T>(uid: string, query?: string): Promise<T> {
  const json = await strapiFetch<StrapiSingleResponse<T>>(`/${uid}`, query);
  return json.data;
}

/** Fetch a collection-type listing (e.g. `tour-packages`). */
export async function strapiFind<T>(uid: string, query?: string): Promise<T[]> {
  const json = await strapiFetch<StrapiCollectionResponse<T>>(`/${uid}`, query);
  return json.data;
}
