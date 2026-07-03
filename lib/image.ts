/** Builds an absolute media URL from a Strapi `url` field, which may be relative. */
export function strapiImageUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const base = (process.env.NEXT_PUBLIC_STRAPI_URL ?? "https://cms.daffa.me").replace(/\/+$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

/**
 * Cloudflare-safe next/image loader: Strapi's default upload provider has no
 * on-the-fly resize API (only fixed formats baked in at upload time), and the
 * deploy target (Cloudflare Workers via @opennextjs/cloudflare) can't rely on
 * Vercel's default optimizer — so this just passes the absolute URL through.
 */
export default function strapiImageLoader({ src }: ImageLoaderProps): string {
  return src;
}
