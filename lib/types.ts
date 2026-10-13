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
  description?: string | null;
}

export interface StrapiSeo {
  id: number;
  metaTitle: string | null;
  metaDescription: string | null;
  noIndex: boolean | null;
  ogImage: StrapiMedia | null;
}

export interface StrapiContactLink {
  id: number;
  label: string;
  url: string;
  linkType: string;
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
  description: string | null;
  locationText: string | null;
  mapUrl: string | null;
  order: number | null;
  image: StrapiMedia | null;
}

export interface StrapiGalleryImage {
  id: number;
  alt: string | null;
  caption: string | null;
  image: StrapiMedia | null;
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
  /** manyToMany → skill. */
  technologies?: StrapiSkill[];
  projectType: string;
  year: number;
  githubUrl: string;
  liveDemoUrl: string;
  // No `isFeatured`: the homepage uses the home-page `featuredProjects` relation as the
  // source of truth, and the Strapi field is being removed.
}

/** Extra fields only present when the detail query populates them. */
export interface StrapiProjectDetail extends StrapiProject {
  problem: string | null;
  approach: unknown;
  result: unknown;
  projectStatus: string;
  gallery: StrapiGalleryImage[];
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
  updatedAt: string;
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

/** Extra fields only present when the detail query populates them. */
export interface StrapiTourPackageDetail extends StrapiTourPackage {
  description: unknown;
  suitableFor: unknown;
  notSuitableFor: unknown;
  whatToPrepare: unknown;
  included: unknown;
  excluded: unknown;
  gallery: StrapiGalleryImage[];
  bookingContact: StrapiContactLink[];
  seo: StrapiSeo | null;
}

export interface StrapiTourGuideLanding {
  id: number;
  documentId: string;
  title: string | null;
  subtitle: string | null;
  intro: unknown;
  whyChooseMe: unknown;
  heroImage: StrapiMedia | null;
  primaryCta: StrapiCta | null;
  featuredTours: StrapiTourPackage[];
  seo: StrapiSeo | null;
}

export type StrapiCertificationKind = "course" | "workshop" | "event" | "bootcamp" | "organization";

export interface StrapiCertification {
  id: number;
  documentId: string;
  title: string;
  issuer: string;
  issuerLogo: StrapiMedia | null;
  issueDate: string;
  credentialId: string | null;
  credentialUrl: string | null;
  /** A PDF in practice (verified live), NOT an image — the list query reduces it to its url. */
  certificateImage: { url: string } | null;
  description: string | null;
  kind: string;
  skills: { name: string }[] | null;
  isFeatured: boolean;
  order: number | null;
}

export interface StrapiSkill {
  id: number;
  documentId: string;
  name: string;
  category: string;
  level: string;
  description: string | null;
  order: number | null;
  /** Technology logo (images only). Absent for non-technology skills (e.g. languages). */
  logo?: StrapiMedia | null;
}

export interface StrapiAboutPage {
  id: number;
  documentId: string;
  title: string | null;
  subtitle: string | null;
  body: unknown;
  profileImage: StrapiMedia | null;
  skills: StrapiSkill[];
  seo: StrapiSeo | null;
}

export interface StrapiHomePage {
  id: number;
  documentId: string;
  fullName: string;
  headline: string;
  subheadline: string;
  heroCtaPrimary: StrapiCta | null;
  heroCtaSecondary: StrapiCta | null;
  featuredProjects: StrapiProject[];
  featuredArticles: StrapiArticle[];
  seo: StrapiSeo | null;
}

export interface StrapiSiteSetting {
  id: number;
  documentId: string;
  siteName: string | null;
  footerText: string | null;
  /** Transitional: superseded by the email / whatsapp rows of `contactLinks` and read only as a
   *  fallback. Both are being removed from the schema, after which they arrive undefined. */
  email?: string | null;
  whatsappUrl?: string | null;
  contactLinks: StrapiContactLink[];
  defaultSeo: StrapiSeo | null;
  authorAvatar: StrapiMedia | null;
  /** shared.contact-cta component — site-wide contact card copy. */
  contactCta: { heading: string | null; text: string | null } | null;
}

export interface StrapiServiceFeature {
  id: number;
  title: string;
  description: string;
}

export interface StrapiServiceProcess {
  id: number;
  title: string;
  description: string;
}

export interface StrapiServiceFaq {
  id: number;
  question: string;
  answer: string;
}

export interface StrapiServicePage {
  id: number;
  documentId: string;
  title: string | null;
  subtitle: string | null;
  intro: unknown;
  features: StrapiServiceFeature[];
  process: StrapiServiceProcess[];
  faqs: StrapiServiceFaq[];
  ctaHeading: string | null;
  ctaText: string | null;
  /** Screens for the device-mockup hero. Any of them may be empty. */
  heroImageDesktop?: StrapiMedia | null;
  heroImageLaptop?: StrapiMedia | null;
  heroImageMobile?: StrapiMedia | null;
  featuredProjects: StrapiProject[];
  seo: StrapiSeo | null;
}

export interface StrapiServicePackage {
  id: number;
  documentId: string;
  name: string;
  tagline: string | null;
  kind: string;
  billing: string;
  startingPrice: number | null;
  priceQualifier: string;
  currency: string;
  includes: unknown;
  timeline: string | null;
  revisions: string | null;
  suitableFor: string | null;
  isPopular: boolean | null;
  order: number | null;
}

export interface StrapiServiceAddon {
  id: number;
  documentId: string;
  name: string;
  category: string;
  priceText: string | null;
  unit: string | null;
  description: string | null;
  isPopular: boolean | null;
  order: number | null;
}

export interface StrapiTerminalCommand {
  id: number;
  documentId: string;
  name: string | null;
  aliases: unknown;
  summary: string | null;
  manText: string | null;
  output: string | null;
  outputType: string | null;
  linkUrl: string | null;
  category: string | null;
  order: number | null;
}

export interface StrapiGuestbookMessage {
  id: number;
  documentId: string;
  message: string;
  displayName: string | null;
  isPinned: boolean | null;
  category: string | null;
  reply: string | null;
  moderationStatus: string;
  createdAt: string;
}
