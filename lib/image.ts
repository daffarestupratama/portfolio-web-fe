/** Builds an absolute media URL from a Strapi `url` field, which may be relative. */
export function strapiImageUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const base = (process.env.NEXT_PUBLIC_STRAPI_URL ?? "https://cms.daffa.me").replace(/\/+$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
