import type { Metadata } from "next";
import { getAllCertifications } from "@/content/certifications";
import { getSiteSettings } from "@/content/site";
import { buildPageMetadata } from "@/lib/seo";
import { BreadcrumbJsonLd, CertificationsJsonLd } from "@/components/seo/json-ld";
import { CertificationsList } from "@/components/certifications/certifications-list";

// Matches /projects and /articles. NOT 60 — a short window here would reopen the
// Cloudflare 1102 CPU problem the current values exist to prevent.
export const revalidate = 3600;

const CERTIFICATIONS_DESCRIPTION =
  "A record of completed courses, workshops, and programmes, each listed with its issuer, date, and a verifiable credential where one exists.";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  return buildPageMetadata({
    path: "/certifications",
    title: "Certifications",
    description: CERTIFICATIONS_DESCRIPTION,
    defaultSeo: site.defaultSeo,
  });
}

export default async function CertificationsPage() {
  const certifications = await getAllCertifications();

  return (
    <main className="relative z-[3] mx-auto w-full max-w-[880px] px-[22px] pt-28 pb-16 sm:pt-32">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "" },
          { name: "Certifications", path: "/certifications" },
        ]}
      />
      {certifications.length > 0 && <CertificationsJsonLd items={certifications} />}

      <header className="mb-8">
        <h1 className="font-bold" style={{ fontSize: "clamp(30px,4vw,46px)", letterSpacing: "-0.03em" }}>
          Certifications
        </h1>
        <p className="mt-3 max-w-[52ch] text-[15px]" style={{ lineHeight: 1.6, color: "var(--ink-dim)" }}>
          A record of completed courses, workshops, and programmes, each listed with its issuer, date, and a
          verifiable credential where one exists.
        </p>
      </header>

      {certifications.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--ink-faint)" }}>
          No certifications published yet.
        </p>
      ) : (
        <CertificationsList certifications={certifications} />
      )}
    </main>
  );
}
