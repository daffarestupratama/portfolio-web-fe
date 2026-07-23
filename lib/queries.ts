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
  "&populate[contactLinks]=*" +
  "&populate[featuredExperiences][populate][gallery][populate][image]=true" +
  "&populate[featuredExperiences][populate][logo]=true" +
  "&populate[featuredProjects][populate][coverImage]=true" +
  "&populate[featuredArticles][populate][coverImage]=true" +
  "&populate[seo][populate][ogImage]=true";
// featuredSkills deliberately omitted — no skills UI on the ported homepage design.

export const FEATURED_TOUR_PACKAGES_QUERY =
  "filters[isFeatured][$eq]=true" +
  "&populate[coverImage]=true" +
  "&populate[route]=true" +
  "&populate[priceOption]=*";

export const SITE_SETTING_QUERY =
  "populate[defaultSeo][populate][ogImage]=true" + "&populate[contactLinks]=*";

export const PROJECTS_LIST_QUERY = "populate[coverImage]=true&sort[0]=year:desc&pagination[pageSize]=100";

export function projectDetailQuery(slug: string): string {
  return (
    `filters[slug][$eq]=${encodeURIComponent(slug)}` +
    "&populate[coverImage]=true" +
    "&populate[gallery][populate][image]=true" +
    "&populate[notebookResources][populate][file]=true" +
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
  "&populate[contactLinks]=*" +
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
  "&populate[contactLinks]=*" +
  "&populate[skills]=true" +
  "&populate[experiences][populate][gallery][populate][image]=true" +
  "&populate[experiences][populate][logo]=true" +
  "&populate[seo][populate][ogImage]=true";

/** Visible, approved guestbook messages: pinned first, then newest.
 *  createdAt is the reliable tiebreaker since admin-added rows can have submittedAt=null. */
export const GUESTBOOK_MESSAGES_QUERY =
  "filters[moderationStatus][$eq]=visible" +
  "&filters[isVisible][$eq]=true" +
  "&sort[0]=isPinned:desc" +
  "&sort[1]=submittedAt:desc" +
  "&sort[2]=createdAt:desc" +
  "&pagination[pageSize]=100";

export const SERVICE_PAGE_QUERY =
  "populate[features]=true" +
  "&populate[process]=true" +
  "&populate[faqs]=true" +
  "&populate[featuredProjects][populate][coverImage]=true" +
  "&populate[seo][populate][ogImage]=true";

export const SERVICE_PACKAGES_QUERY = "pagination[pageSize]=100&sort[0]=order:asc";
export const SERVICE_ADDONS_QUERY = "pagination[pageSize]=100&sort[0]=order:asc";

/** Lightweight slug-only listings for generateStaticParams / sitemap. */
export const PROJECT_SLUGS_QUERY = "fields[0]=slug&pagination[pageSize]=100";
export const ARTICLE_SLUGS_QUERY = "fields[0]=slug&pagination[pageSize]=100";
export const TOUR_SLUGS_QUERY = "fields[0]=slug&pagination[pageSize]=100";
