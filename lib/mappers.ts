/**
 * Strapi raw-shape → UI-facing shape mappers (content/home.ts's exported types).
 * Isolated here so content/home.ts stays pure orchestration and each transform
 * is independently readable — several fields have no direct Strapi source and
 * need a deliberate fallback strategy, documented per function below.
 */

import type {
  StrapiArticle,
  StrapiContactLink,
  StrapiCta,
  StrapiExperience,
  StrapiGalleryImage,
  StrapiMedia,
  StrapiProject,
  StrapiTourPackage,
} from "./types";
import { strapiImageUrl } from "./image";
import type {
  Article,
  ArticleLanguage,
  ContactIcon,
  ContactLink,
  Cta,
  Experience,
  ExperienceCategory,
  GalleryImage,
  MappedImage,
  Project,
  TourPackage,
} from "@/content/home";

/** Title-cases a slug/enum-ish string ("machine_learning" -> "Machine Learning"). */
export function titleCase(value: string): string {
  return value.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Resolve a Strapi media object into an absolute-URL image with intrinsic size. */
export function mapImage(media: StrapiMedia | null | undefined, alt = ""): MappedImage | null {
  if (!media?.url) return null;
  return {
    url: strapiImageUrl(media.url),
    alt: media.alternativeText || alt,
    width: media.width ?? 1200,
    height: media.height ?? 675,
  };
}

/** Map a repeatable gallery-image component (sorted by `order`, null images dropped). */
export function mapGallery(items: StrapiGalleryImage[] | null | undefined): GalleryImage[] {
  return (items ?? [])
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .flatMap((item) => {
      const img = mapImage(item.image, item.alt ?? "");
      return img ? [{ ...img, alt: item.alt || img.alt, caption: item.caption }] : [];
    });
}

export function mapCta(cta: StrapiCta | null, fallback: Cta): Cta {
  return cta ? { label: cta.label, url: cta.url } : fallback;
}

const KNOWN_ICONS: ReadonlySet<string> = new Set(["linkedin", "github", "instagram", "email"]);

/** Strapi's `icon` field is free-form; drop anything outside our known 4 rather than
 *  let hero.tsx's unconditional `contactIcons[link.icon]` lookup crash on render. */
export function mapContactLinks(links: StrapiContactLink[]): ContactLink[] {
  return links
    .filter((l) => KNOWN_ICONS.has(l.icon))
    .map((l) => ({ icon: l.icon as ContactIcon, label: l.label, url: l.url }));
}

function twoDigitYear(iso: string): string {
  return `'${iso.slice(2, 4)}`;
}

/** `'24–'25` / `'23–now` / `'22` (same start/end year collapses to one). */
export function formatDateRange(startDate: string, endDate: string | null, isCurrent: boolean | null): string {
  if (isCurrent) return `${twoDigitYear(startDate)}–now`;
  if (!endDate) return twoDigitYear(startDate);
  return startDate.slice(2, 4) === endDate.slice(2, 4)
    ? twoDigitYear(startDate)
    : `${twoDigitYear(startDate)}–${twoDigitYear(endDate)}`;
}

const ORG_STOPWORDS = new Set(["of", "the", "and", "de", "van", "der", "el", "la", "untuk", "dan", "for", "di", "ke"]);

/** No `initials` field exists on experience — derive a short badge label from
 *  the organization name (first letters of up to 3 significant words). */
export function deriveInitials(organization: string): string {
  const rawTokens = organization
    .split(/[\s/,&-]+/)
    .map((t) => t.trim())
    .filter(Boolean);
  const significant = rawTokens.filter((t) => !ORG_STOPWORDS.has(t.toLowerCase()) && !/^\d+$/.test(t));
  const tokens = significant.length > 0 ? significant : rawTokens;
  const picked = tokens.slice(0, 3);
  if (picked.length === 0) return "—";
  if (picked.length === 1) return picked[0]!.slice(0, 2).toUpperCase();
  return picked.map((t) => t[0]!.toUpperCase()).join("");
}

const EXPERIENCE_CATEGORY_MAP: Record<string, ExperienceCategory> = {
  education: "education",
  organization: "organization",
};

/** Every experienceType outside education/organization (work, freelance, volunteer,
 *  project, certification, other, …) falls into the "others" bucket. */
export function mapExperienceCategory(experienceType: string): ExperienceCategory {
  return EXPERIENCE_CATEGORY_MAP[experienceType] ?? "others";
}

export function mapExperience(e: StrapiExperience): Experience {
  return {
    id: e.documentId,
    category: mapExperienceCategory(e.experienceType),
    organization: e.organization,
    initials: deriveInitials(e.organization),
    role: e.title,
    dateRange: formatDateRange(e.startDate, e.endDate, e.isCurrent),
    description: e.description,
    startDate: e.startDate,
    endDate: e.endDate,
    isCurrent: e.isCurrent ?? false,
    gallery: mapGallery(e.gallery),
    logo: mapImage(e.logo, e.organization),
  };
}

/** Newest-first: current roles first, then latest end date, then latest start date.
 *  ISO date strings (YYYY-MM-DD) compare lexically = chronologically. Reused by the
 *  homepage section and the future /about + experience list pages. */
export function byNewestExperience(a: Experience, b: Experience): number {
  if (a.isCurrent !== b.isCurrent) return a.isCurrent ? -1 : 1;
  const aEnd = a.endDate ?? a.startDate;
  const bEnd = b.endDate ?? b.startDate;
  if (aEnd !== bEnd) return aEnd < bEnd ? 1 : -1;
  if (a.startDate !== b.startDate) return a.startDate < b.startDate ? 1 : -1;
  return 0;
}

/** Bucket mapped experiences into the 3 tab categories, each sorted newest-first.
 *  Reused by the homepage (getFeaturedExperiences) and the /about page. */
export function bucketExperiences(experiences: Experience[]): Record<ExperienceCategory, Experience[]> {
  const bucket = (category: ExperienceCategory) =>
    experiences.filter((e) => e.category === category).sort(byNewestExperience);
  return { education: bucket("education"), organization: bucket("organization"), others: bucket("others") };
}

export function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

export function mapProject(p: StrapiProject): Project {
  return {
    id: p.documentId,
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    year: String(p.year),
    projectType: p.projectType,
    techStack: toStringArray(p.techStack),
    coverImage: mapImage(p.coverImage, `${p.title} cover`),
    githubUrl: p.githubUrl || undefined,
    dashboardUrl: p.dashboardUrl || undefined,
    liveDemoUrl: p.liveDemoUrl || undefined,
  };
}

function formatRouteSummary(tour: StrapiTourPackage): string {
  const stops = (tour.route ?? []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  if (stops.length > 0) {
    const first = stops[0]!;
    const label = first.locationText ?? first.title ?? tour.title;
    return `${label} · ${stops.length} stop${stops.length === 1 ? "" : "s"}`;
  }
  // Live data today: route is always empty — this is the branch that actually renders.
  return tour.meetingPoint ? `Starts at ${tour.meetingPoint}` : tour.duration;
}

/** Rp / currency formatting shared by the tour card ("from" price) and the
 *  tour-detail price-option list. */
export function formatCurrency(price: number, currency: string): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: currency || "IDR",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatPrice(tour: StrapiTourPackage): string {
  const options = tour.priceOption ?? [];
  if (options.length === 0) return "Contact for price";
  const cheapest = options.reduce((min, o) => (o.price < min.price ? o : min), options[0]!);
  return formatCurrency(cheapest.price, cheapest.currency);
}

/** No max-group-size field exists on tour-package — `availabilityNote` is booking-logistics
 *  prose, not a group-size figure, so forcing it into that slot would misrepresent the
 *  content. Resolves to "" (tour-card.tsx renders the sub-line conditionally). */
export function mapTourPackage(t: StrapiTourPackage): TourPackage {
  return {
    id: t.documentId,
    slug: t.slug,
    title: t.title,
    shortDescription: t.shortDescription,
    price: formatPrice(t),
    route: formatRouteSummary(t),
    duration: t.duration,
    groupSize: "",
    coverImage: mapImage(t.coverImage, `${t.title} cover`),
  };
}

interface BlockNode {
  text?: string;
  children?: BlockNode[];
}

function countWords(nodes: unknown): number {
  if (!Array.isArray(nodes)) return 0;
  return (nodes as BlockNode[]).reduce((sum, n) => {
    const own = typeof n?.text === "string" ? n.text.trim().split(/\s+/).filter(Boolean).length : 0;
    return sum + own + countWords(n?.children);
  }, 0);
}

/** No `readTime` field exists on article — estimate from the `body` blocks word count. */
function estimateReadTime(body: unknown): string {
  const words = countWords(body);
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

const KNOWN_LANGUAGES: ReadonlySet<string> = new Set(["en", "id", "de"]);

/** `language` currently 400s when queried on the live schema — this fallback is
 *  load-bearing today, not just defensive. */
function mapLanguage(language: string | null | undefined): ArticleLanguage {
  return language && KNOWN_LANGUAGES.has(language) ? (language as ArticleLanguage) : "en";
}

function formatPublishedDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function mapArticle(a: StrapiArticle): Article {
  return {
    id: a.documentId,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    category: titleCase(a.category),
    language: mapLanguage(a.language),
    publishedDate: formatPublishedDate(a.publishedDate),
    readTime: estimateReadTime(a.body),
    tags: toStringArray(a.tags),
    coverImage: mapImage(a.coverImage, `${a.title} cover`),
  };
}
