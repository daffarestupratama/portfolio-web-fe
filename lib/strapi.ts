import type { StrapiCollectionResponse, StrapiSingleResponse } from "./types";

const STRAPI_URL = (process.env.NEXT_PUBLIC_STRAPI_URL ?? "https://cms.daffa.me").replace(/\/+$/, "");

async function strapiFetch<T>(path: string, query: string | undefined, revalidate: number): Promise<T> {
  const url = `${STRAPI_URL}/api${path}${query ? `?${query}` : ""}`;
  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok) {
    throw new Error(`Strapi request failed: ${res.status} ${res.statusText} — ${url}`);
  }
  return res.json() as Promise<T>;
}

/** Fetch a single-type entry (e.g. `home-page`) or one document by uid. */
export async function strapiFindOne<T>(uid: string, query?: string, revalidate = 60): Promise<T> {
  const json = await strapiFetch<StrapiSingleResponse<T>>(`/${uid}`, query, revalidate);
  return json.data;
}

/** Fetch a collection-type listing (e.g. `tour-packages`). */
export async function strapiFind<T>(uid: string, query?: string, revalidate = 60): Promise<T[]> {
  const json = await strapiFetch<StrapiCollectionResponse<T>>(`/${uid}`, query, revalidate);
  return json.data;
}
