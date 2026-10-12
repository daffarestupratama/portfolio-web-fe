import type { Metadata } from "next";
import { getAllCertifications } from "@/content/certifications";
import { getSiteSettings } from "@/content/site";
import { buildPageMetadata } from "@/lib/seo";
import { BreadcrumbJsonLd, CertificationsJsonLd } from "@/components/seo/json-ld";
import { CertificationsList } from "@/components/certifications/certifications-list";
import { PageHeader } from "@/components/ui/page-header";

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
    <main className="relative z-[3]">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "" },
          { name: "Certifications", path: "/certifications" },
        ]}
      />
      {certifications.length > 0 && <CertificationsJsonLd items={certifications} />}

      <PageHeader title="Certifications" subtitle={CERTIFICATIONS_DESCRIPTION} narrow />

      <section className="ct">
        {certifications.length === 0 ? (
          <p className="ct-none">No certifications published yet.</p>
        ) : (
          <CertificationsList certifications={certifications} />
        )}
      </section>
    </main>
  );
}
