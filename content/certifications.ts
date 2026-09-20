/** Certifications accessor. One list query serves both /certifications and the
 *  Certifications tab in the Experiences section. */

import { cache } from "react";
import { strapiFind } from "@/lib/strapi";
import { CERTIFICATIONS_QUERY } from "@/lib/queries";
import { strapiImageUrl } from "@/lib/image";
import { titleCase } from "@/lib/mappers";
import type { MappedImage } from "@/content/home";
import type { StrapiCertification } from "@/lib/types";

export interface Certification {
  id: string;
  slug: string;
  title: string;
  issuer: string;
  issuerLogo: MappedImage | null;
  /** Formatted for display, e.g. "Sep 2026". */
  issueDate: string;
  /** Raw ISO, kept for sorting and the JSON-LD `dateCreated`. */
  issueDateIso: string;
  credentialId: string | null;
  credentialUrl: string | null;
  /** PDF (or image) URL, present only when the entry has one. */
  certificateUrl: string | null;
  certificateMime: string | null;
  description: string | null;
  kind: string;
  kindLabel: string;
  skills: string[];
  isFeatured: boolean;
  order: number | null;
}

function formatIssueDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function clean(value: string | null | undefined): string | null {
  const t = value?.trim();
  return t ? t : null;
}

function mapCertification(c: StrapiCertification): Certification {
  return {
    id: c.documentId,
    slug: c.slug,
    title: c.title,
    issuer: c.issuer,
    issuerLogo: c.issuerLogo?.url
      ? {
          url: strapiImageUrl(c.issuerLogo.url),
          alt: c.issuerLogo.alternativeText || `${c.issuer} logo`,
          width: c.issuerLogo.width ?? 512,
          height: c.issuerLogo.height ?? 512,
        }
      : null,
    issueDate: formatIssueDate(c.issueDate),
    issueDateIso: c.issueDate,
    credentialId: clean(c.credentialId),
    credentialUrl: clean(c.credentialUrl),
    certificateUrl: c.certificateImage?.url ? strapiImageUrl(c.certificateImage.url) : null,
    certificateMime: c.certificateImage?.mime ?? null,
    description: clean(c.description),
    kind: c.kind,
    kindLabel: titleCase(c.kind),
    skills: (c.skills ?? []).map((s) => s.name).filter(Boolean),
    isFeatured: Boolean(c.isFeatured),
    order: c.order,
  };
}

/**
 * Featured first, then `order` ascending, then newest `issueDate`.
 * Null `order` sorts last rather than as 0, so an unordered entry never jumps the queue
 * ahead of one that was deliberately numbered.
 */
export function byCertification(a: Certification, b: Certification): number {
  if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
  const ao = a.order ?? Number.MAX_SAFE_INTEGER;
  const bo = b.order ?? Number.MAX_SAFE_INTEGER;
  if (ao !== bo) return ao - bo;
  return b.issueDateIso.localeCompare(a.issueDateIso);
}

/** cache() so the homepage/about page pay one request even if this is read twice per render. */
export const getAllCertifications = cache(async (): Promise<Certification[]> => {
  const rows = await strapiFind<StrapiCertification>("certifications", CERTIFICATIONS_QUERY);
  return rows.map(mapCertification).sort(byCertification);
});

/**
 * Featured only, uncapped, for the Experiences tab. The source list is already sorted by
 * byCertification, and filtering preserves relative order, so within an all-featured subset
 * this is exactly `order` ascending (nulls last) with newer `issueDate` breaking ties.
 */
export async function getFeaturedCertifications(): Promise<Certification[]> {
  return (await getAllCertifications()).filter((c) => c.isFeatured);
}
