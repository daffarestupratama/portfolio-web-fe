/**
 * Per-page populate query strings. Hand-written literals rather than a `qs`-built
 * object — Strapi's populate parser is picky (verified live): mixing a bare
 * `populate[x]=*` with bracket-nested populate in the same query 400s, and
 * wildcarding a *media* field's own relations (`populate[x][populate][coverImage]=*`)
 * also 400s — media fields need `=true`, not `=*`.
 */

export const HOME_PAGE_QUERY =
  "populate[heroCtaPrimary]=*" +
  "&populate[heroCtaSecondary]=*" +
  "&populate[featuredProjects][populate][coverImage]=true" +
  "&populate[featuredProjects][populate][technologies][populate][logo]=true" +
  "&populate[featuredArticles][populate][coverImage]=true" +
  "&populate[seo][populate][ogImage]=true";

/** Every published experience, for the homepage and /about. Unpublishing one hides it. */
export const EXPERIENCES_QUERY =
  "populate[logo]=true" +
  "&populate[gallery][populate][image]=true" +
  "&pagination[pageSize]=100";

export const FEATURED_TOUR_PACKAGES_QUERY =
  "filters[isFeatured][$eq]=true" +
  "&populate[coverImage]=true" +
  "&populate[route]=true" +
  "&populate[priceOption]=*";

/**
 * Certifications list. `certificateImage` is deliberately reduced to its url: the file is a
 * ~155KB PDF, and a URL string in the payload downloads nothing until the viewer mounts it —
 * so the list stays light (measured +1.5KB across 30 entries) without needing a second
 * round trip when someone opens one. Sorting is done in the mapper, not here, because it is
 * a three-key comparator with null handling that Strapi's `sort` can't express.
 */
export const CERTIFICATIONS_QUERY =
  "populate[issuerLogo][fields][0]=url" +
  "&populate[issuerLogo][fields][1]=width" +
  "&populate[issuerLogo][fields][2]=height" +
  "&populate[issuerLogo][fields][3]=alternativeText" +
  "&populate[skills][fields][0]=name" +
  "&populate[certificateImage][fields][0]=url" +
  "&pagination[pageSize]=100";

export const SITE_SETTING_QUERY =
  "populate[defaultSeo][populate][ogImage]=true" +
  "&populate[contactLinks]=*" +
  // Byline avatar + the site-wide contact CTA copy. Added to the EXISTING query rather than
  // fetched separately: site-setting is already loaded once per render, so this costs no
  // extra request (see the byline in app/articles/[slug]/page.tsx).
  "&populate[authorAvatar]=true" +
  "&populate[contactCta]=true";

export const PROJECTS_LIST_QUERY =
  "populate[coverImage]=true" +
  "&populate[technologies][populate][logo]=true" +
  // Newest year first, then title A–Z; slug (unique) settles identical titles, so the order
  // never falls back to database order.
  "&sort[0]=year:desc&sort[1]=title:asc&sort[2]=slug:asc&pagination[pageSize]=100";

export function projectDetailQuery(slug: string): string {
  return (
    `filters[slug][$eq]=${encodeURIComponent(slug)}` +
    "&populate[coverImage]=true" +
    "&populate[technologies][populate][logo]=true" +
    "&populate[gallery][populate][image]=true" +
    "&populate[relatedArticles][populate][coverImage]=true" +
    "&populate[seo][populate][ogImage]=true"
  );
}

export const ARTICLES_LIST_QUERY = "populate[coverImage]=true&sort[0]=publishedDate:desc&pagination[pageSize]=100";

export function articleDetailQuery(slug: string): string {
  return (
    `filters[slug][$eq]=${encodeURIComponent(slug)}` +
    "&populate[coverImage]=true" +
    "&populate[relatedProjects][populate][coverImage]=true" +
    "&populate[seo][populate][ogImage]=true"
  );
}

export const TOUR_LANDING_QUERY =
  "populate[heroImage]=true" +
  "&populate[primaryCta]=*" +
  "&populate[featuredTours][populate][coverImage]=true" +
  "&populate[seo][populate][ogImage]=true";

export const TOURS_LIST_QUERY =
  "populate[coverImage]=true&populate[route]=true&populate[priceOption]=*&pagination[pageSize]=100";

export function tourDetailQuery(slug: string): string {
  return (
    `filters[slug][$eq]=${encodeURIComponent(slug)}` +
    "&populate[coverImage]=true" +
    "&populate[gallery][populate][image]=true" +
    "&populate[route][populate][image]=true" +
    "&populate[priceOption]=*" +
    "&populate[bookingContact]=*" +
    "&populate[seo][populate][ogImage]=true"
  );
}

export const ABOUT_PAGE_QUERY =
  "populate[profileImage]=true" +
  "&populate[skills][populate][logo]=true" +
  "&populate[seo][populate][ogImage]=true";

/**
 * Visible guestbook messages: pinned first, then newest.
 *
 * `moderationStatus` is the single source of truth for visibility. Sorted on `createdAt`, which
 * Strapi stamps on every row, rather than a hand-written submission time that older rows lack.
 */
export const GUESTBOOK_MESSAGES_QUERY =
  "filters[moderationStatus][$eq]=visible" +
  "&sort[0]=isPinned:desc" +
  "&sort[1]=createdAt:desc" +
  "&pagination[pageSize]=100";

export const SERVICE_PAGE_QUERY =
  "populate[heroImageDesktop]=true" +
  "&populate[heroImageLaptop]=true" +
  "&populate[heroImageMobile]=true" +
  "&populate[features]=true" +
  "&populate[process]=true" +
  "&populate[faqs]=true" +
  "&populate[featuredProjects][populate][coverImage]=true" +
  "&populate[featuredProjects][populate][technologies][populate][logo]=true" +
  "&populate[seo][populate][ogImage]=true";

export const SERVICE_PACKAGES_QUERY = "pagination[pageSize]=100&sort[0]=order:asc";
export const SERVICE_ADDONS_QUERY = "pagination[pageSize]=100&sort[0]=order:asc";

/** Lightweight slug-only listings for generateStaticParams. */
export const PROJECT_SLUGS_QUERY = "fields[0]=slug&pagination[pageSize]=100";
export const ARTICLE_SLUGS_QUERY = "fields[0]=slug&pagination[pageSize]=100";
export const TOUR_SLUGS_QUERY = "fields[0]=slug&pagination[pageSize]=100";

/** Published terminal commands for /mkdir (phase 2 CMS commands). Unpublishing one hides it. */
export const TERMINAL_COMMANDS_QUERY = "sort[0]=order:asc&pagination[pageSize]=100";

/** Sitemap listings: slug + updatedAt (for lastModified) + seo.noIndex (to exclude). */
const SITEMAP_FIELDS = "fields[0]=slug&fields[1]=updatedAt&populate[seo][fields][0]=noIndex&pagination[pageSize]=100";
export const PROJECTS_SITEMAP_QUERY = SITEMAP_FIELDS;
export const ARTICLES_SITEMAP_QUERY = SITEMAP_FIELDS;
export const TOURS_SITEMAP_QUERY = SITEMAP_FIELDS;
