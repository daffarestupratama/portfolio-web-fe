/**
 * Strapi v5 REST response shapes — flat (no `attributes` wrapper), fetched by
 * `documentId`. Only the fields the homepage actually reads are typed here;
 * blocks/json fields stay `unknown` since Strapi doesn't enforce their shape.
 */

export interface StrapiSingleResponse<T> {
  data: T;
  meta: Record<string, unknown>;
}

export interface StrapiCollectionResponse<T> {
  data: T[];
  meta: { pagination?: { page: number; pageSize: number; pageCount: number; total: number } };
}

export interface StrapiMediaFormat {
  url: string;
  width: number;
  height: number;
}

export interface StrapiMedia {
  id: number;
  documentId: string;
  url: string;
  alternativeText: string | null;
  width: number | null;
  height: number | null;
  formats: Partial<Record<"thumbnail" | "small" | "medium" | "large", StrapiMediaFormat>> | null;
}

export interface StrapiCta {
  id: number;
  label: string;
  url: string;
  style: string;
  description?: string | null;
}

export interface StrapiSeo {
  id: number;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  noIndex: boolean | null;
  ogImage: StrapiMedia | null;
}

export interface StrapiContactLink {
  id: number;
  label: string;
  url: string;
  linkType: string;
  icon: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface StrapiPriceOption {
  id: number;
  title: string;
  price: number;
  currency: string;
  description?: string | null;
}

export interface StrapiRouteStop {
  id: number;
  title: string;
  locationText: string | null;
  mapUrl: string | null;
  order: number | null;
}

export interface StrapiGalleryImage {
  id: number;
  alt: string | null;
  caption: string | null;
  order: number | null;
  image: StrapiMedia | null;
}

export interface StrapiNotebookResource {
  id: number;
  title: string;
  kind: string;
  url: string | null;
  embedUrl: string | null;
  description: string | null;
  order: number | null;
  file: StrapiMedia | null;
}

export interface StrapiExperience {
  id: number;
  documentId: string;
  title: string;
  organization: string;
  location: string | null;
  experienceType: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean | null;
  description: string;
  sortOrder: number | null;
  isFeatured: boolean;
  gallery: StrapiGalleryImage[];
  logo?: StrapiMedia | null;
}

export interface StrapiProject {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  summary: string;
  coverImage: StrapiMedia | null;
  techStack: unknown;
  projectType: string;
  year: number;
  githubUrl: string;
  liveDemoUrl: string;
  dashboardUrl: string;
  isFeatured: boolean;
}

/** Extra fields only present when the detail query populates them. */
export interface StrapiProjectDetail extends StrapiProject {
  problem: string | null;
  approach: unknown;
  result: unknown;
  projectStatus: string;
  gallery: StrapiGalleryImage[];
  notebookResources: StrapiNotebookResource[];
  relatedArticles: StrapiArticle[];
  seo: StrapiSeo | null;
}

export interface StrapiArticle {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: StrapiMedia | null;
  category: string;
  tags: unknown;
  language?: string | null;
  isFeatured: boolean;
  publishedDate: string;
  body: unknown;
}

export interface StrapiArticleDetail extends StrapiArticle {
  relatedProjects: StrapiProject[];
  seo: StrapiSeo | null;
}

export interface StrapiTourPackage {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  shortDescription: string;
  coverImage: StrapiMedia | null;
  route: StrapiRouteStop[] | null;
  duration: string;
  meetingPoint: string | null;
  priceOption: StrapiPriceOption[] | null;
  availabilityNote: string | null;
  isFeatured: boolean;
}

export interface StrapiHomePage {
  id: number;
  documentId: string;
  fullName: string;
  headline: string;
  subheadline: string;
  heroCtaPrimary: StrapiCta | null;
  heroCtaSecondary: StrapiCta | null;
  contactLinks: StrapiContactLink[];
  featuredExperiences: StrapiExperience[];
  featuredProjects: StrapiProject[];
  featuredArticles: StrapiArticle[];
  seo: StrapiSeo | null;
}

export interface StrapiSiteSetting {
  id: number;
  documentId: string;
  siteName: string | null;
  footerText: string | null;
  copyrightText: string | null;
  email: string | null;
  whatsappUrl: string | null;
  contactLinks: StrapiContactLink[];
  defaultSeo: StrapiSeo | null;
}
