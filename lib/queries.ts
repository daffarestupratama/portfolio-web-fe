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
  "&populate[featuredExperiences][populate]=*" +
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
