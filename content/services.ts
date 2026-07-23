/**
 * /services data accessors — the freelance web-dev page consumes three Strapi
 * content types: the `service-page` single type (hero/features/process/faqs/CTA +
 * featured projects) and the `service-package` / `service-addon` collections.
 * CMS text is run through `fixMojibake` (some rows are double-encoded); card-shape
 * project mapping reuses lib/mappers' `mapProject`.
 */

import { cache } from "react";
import type { BlocksContent } from "@strapi/blocks-react-renderer";
import { strapiFind, strapiFindOne } from "@/lib/strapi";
import { SERVICE_ADDONS_QUERY, SERVICE_PACKAGES_QUERY, SERVICE_PAGE_QUERY } from "@/lib/queries";
import { fixMojibake, fixMojibakeBlocks, formatCurrency, mapProject, titleCase, toStringArray } from "@/lib/mappers";
import type { StrapiServiceAddon, StrapiServicePackage, StrapiServicePage } from "@/lib/types";
import { mapSeo, type Seo } from "@/content/site";
import type { Project } from "@/content/home";

export interface ServiceFeature {
  title: string;
  description: string;
}

export interface ServiceProcessStep {
  order: number;
  title: string;
  description: string;
}

export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface ServicePage {
  title: string;
  subtitle: string | null;
  intro: BlocksContent | null;
  features: ServiceFeature[];
  process: ServiceProcessStep[];
  faqs: ServiceFaq[];
  ctaHeading: string | null;
  ctaText: string | null;
  featuredProjects: Project[];
  seo: Seo;
}

export interface ServicePackage {
  id: string;
  name: string;
  tagline: string | null;
  kind: string;
  billing: string;
  /** Formatted display price, with a "mulai " prefix when priceQualifier is starts_from. */
  priceLabel: string;
  /** "/bulan" | "/tahun" | "" — appended after the price for recurring billing. */
  billingSuffix: string;
  includes: string[];
  timeline: string | null;
  revisions: string | null;
  suitableFor: string | null;
  isPopular: boolean;
  /** Raw numeric price + currency, carried through for the JSON-LD Offers. */
  price: number | null;
  currency: string;
}

export interface ServicePackages {
  packages: ServicePackage[];
  bundles: ServicePackage[];
  maintenance: ServicePackage[];
}

export interface ServiceAddon {
  name: string;
  priceText: string | null;
  unit: string | null;
  description: string | null;
  isPopular: boolean;
}

export interface ServiceAddonGroup {
  category: string;
  label: string;
  items: ServiceAddon[];
}

/** Apply fixMojibake, preserving null. */
function fix(value: string | null | undefined): string | null {
  return value ? fixMojibake(value) : null;
}

function asBlocks(value: unknown): BlocksContent | null {
  return Array.isArray(value) && value.length > 0 ? (value as BlocksContent) : null;
}

function billingSuffix(billing: string): string {
  if (billing === "monthly") return "/bulan";
  if (billing === "yearly") return "/tahun";
  return "";
}

function priceLabel(p: StrapiServicePackage): string {
  if (p.startingPrice == null) return "Hubungi kami";
  const formatted = formatCurrency(p.startingPrice, p.currency);
  return p.priceQualifier === "starts_from" ? `mulai ${formatted}` : formatted;
}

function mapPackage(p: StrapiServicePackage): ServicePackage {
  return {
    id: p.documentId,
    name: p.name,
    tagline: fix(p.tagline),
    kind: p.kind,
    billing: p.billing,
    priceLabel: priceLabel(p),
    billingSuffix: billingSuffix(p.billing),
    includes: toStringArray(p.includes).map(fixMojibake),
    timeline: fix(p.timeline),
    revisions: fix(p.revisions),
    suitableFor: fix(p.suitableFor),
    isPopular: p.isPopular ?? false,
    price: p.startingPrice,
    currency: p.currency || "IDR",
  };
}

// Display order + readable Indonesian labels for the add-on category groups.
const CATEGORY_ORDER = [
  "pages_content",
  "data_features",
  "system",
  "transaction",
  "marketing",
  "infrastructure",
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  pages_content: "Halaman & Konten",
  data_features: "Data & Fitur",
  system: "Sistem & Otomasi",
  transaction: "Transaksi & Pembayaran",
  marketing: "Marketing & SEO",
  infrastructure: "Infrastruktur & Hosting",
};

export const getServicePage = cache(async (): Promise<ServicePage> => {
  const raw = await strapiFindOne<StrapiServicePage>("service-page", SERVICE_PAGE_QUERY);
  return {
    title: fix(raw.title) || "Jasa Pembuatan Website",
    subtitle: fix(raw.subtitle),
    intro: asBlocks(fixMojibakeBlocks(raw.intro)),
    features: (raw.features ?? []).map((f) => ({
      title: fixMojibake(f.title),
      description: fixMojibake(f.description),
    })),
    process: (raw.process ?? [])
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((s, i) => ({
        order: s.order ?? i + 1,
        title: fixMojibake(s.title),
        description: fixMojibake(s.description),
      })),
    faqs: (raw.faqs ?? []).map((q) => ({
      question: fixMojibake(q.question),
      answer: fixMojibake(q.answer),
    })),
    ctaHeading: fix(raw.ctaHeading),
    ctaText: fix(raw.ctaText),
    featuredProjects: (raw.featuredProjects ?? []).map(mapProject),
    seo: mapSeo(raw.seo),
  };
});

export const getServicePackages = cache(async (): Promise<ServicePackages> => {
  const raw = await strapiFind<StrapiServicePackage>("service-packages", SERVICE_PACKAGES_QUERY);
  const active = raw
    .filter((p) => p.isActive !== false)
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map(mapPackage);
  return {
    packages: active.filter((p) => p.kind === "package"),
    bundles: active.filter((p) => p.kind === "bundle"),
    maintenance: active.filter((p) => p.kind === "maintenance"),
  };
});

export const getServiceAddons = cache(async (): Promise<ServiceAddonGroup[]> => {
  const raw = await strapiFind<StrapiServiceAddon>("service-addons", SERVICE_ADDONS_QUERY);

  // Group by category, preserving the query's order:asc within each group.
  const byCategory = new Map<string, ServiceAddon[]>();
  for (const a of raw) {
    const list = byCategory.get(a.category) ?? [];
    list.push({
      name: a.name,
      priceText: a.priceText,
      unit: a.unit,
      description: a.description,
      isPopular: a.isPopular ?? false,
    });
    byCategory.set(a.category, list);
  }

  // Known categories first (CATEGORY_ORDER), then any unexpected extras.
  const ordered = [...CATEGORY_ORDER, ...[...byCategory.keys()].filter((c) => !CATEGORY_ORDER.includes(c as never))];
  return ordered.flatMap((category) => {
    const items = byCategory.get(category);
    if (!items || items.length === 0) return [];
    return [{ category, label: CATEGORY_LABELS[category] ?? titleCase(category), items }];
  });
});
