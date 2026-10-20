import type { Metadata } from "next";
import { getServicePage, getServicePackages, getServiceAddons } from "@/content/services";
import { getSiteSettings } from "@/content/site";
import { buildPageMetadata } from "@/lib/seo";
import { waLink } from "@/lib/whatsapp";
import { StrapiBlocks } from "@/components/blocks/strapi-blocks";
import { ContactCTA } from "@/components/sections/contact-cta";
import { ProjectCard } from "@/components/cards/project-card";
import { MailIcon, WhatsappIcon } from "@/components/ui/icons";
import { FeaturesGrid } from "@/components/services/features-grid";
import { PackageCard } from "@/components/services/package-card";
import { AddonsSection } from "@/components/services/addons-section";
import { ProcessList } from "@/components/services/process-list";
import { FaqAccordion } from "@/components/services/faq-accordion";
import { DeviceShowcase } from "@/components/services/device-showcase";
import { ServicesJsonLd } from "@/components/seo/services-json-ld";
import { PageTop } from "@/components/layout/page-top";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const [page, site] = await Promise.all([getServicePage(), getSiteSettings()]);
  return buildPageMetadata({
    path: "/services",
    seo: page.seo,
    title: page.title,
    description: page.subtitle,
    defaultSeo: site.defaultSeo,
    absoluteTitle: true,
  });
}

/** 2a's services section heading (h2 + optional 15px standfirst). */
function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <>
      <h2 className="sv-h2">{title}</h2>
      {subtitle && <p className="sv-sub">{subtitle}</p>}
    </>
  );
}

export default async function ServicesPage() {
  const [page, packages, addons, site] = await Promise.all([
    getServicePage(),
    getServicePackages(),
    getServiceAddons(),
    getSiteSettings(),
  ]);

  // Both resolved in getSiteSettings (contactLinks rows, then the shared fallback).
  const { whatsappUrl, email } = site;
  const heroWa = waLink(whatsappUrl, "Halo Daffa, saya ingin konsultasi soal pembuatan website.");
  const allPackages = [...packages.packages, ...packages.bundles, ...packages.maintenance];

  const packageSection = (title: string, subtitle: string, list: typeof packages.packages) =>
    list.length > 0 && (
      <section className="sv-sec">
        <SectionHeading title={title} subtitle={subtitle} />
        <div className="sv-pk-grid">
          {list.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} whatsappUrl={whatsappUrl} />
          ))}
        </div>
      </section>
    );

  return (
    <>
      <PageTop />
      <main className="relative z-[3]">
        {/* 1. Hero: text left, device mockups right (the stage omits itself entirely when none
            of the three screens is uploaded). */}
        <header className="sv-hero">
          <div className="sv-hero-grid">
            <div className="sv-hero-text">
              <h1 className="sv-title">{page.title}</h1>
              {page.subtitle && <p className="sv-lede">{page.subtitle}</p>}
              {page.intro && (
                <div className="sv-intro">
                  <StrapiBlocks content={page.intro} variant="intro" />
                </div>
              )}
              <div className="sv-hero-ctas">
                <a href={heroWa} target="_blank" rel="noopener noreferrer" className="nm-btn-accent sv-hero-btn">
                  <WhatsappIcon width={17} height={17} />
                  Konsultasi gratis
                </a>
                <a href={`mailto:${email}`} className="nm-btn sv-hero-btn">
                  <MailIcon width={18} height={18} />
                  Email
                </a>
              </div>
            </div>

            <DeviceShowcase
              desktop={page.heroImageDesktop}
              laptop={page.heroImageLaptop}
              mobile={page.heroImageMobile}
            />
          </div>
        </header>

        <div className="sv-body">
          {/* 2. Features */}
          {page.features.length > 0 && (
            <section className="sv-sec sv-sec-first">
              <SectionHeading title="Kenapa memilih saya" />
              <FeaturesGrid features={page.features} />
            </section>
          )}

          {/* 3. Portfolio: directly after the features section, before the packages (2a's order). */}
          {page.featuredProjects.length > 0 && (
            <section className="sv-sec">
              <SectionHeading title="Portofolio" subtitle="Beberapa proyek yang pernah saya kerjakan." />
              {/* 2a's services portfolio grid: every tile 2x1, no "Details" (see bento.ts). */}
              <div className="bento sv-bento" data-layout="services">
                {page.featuredProjects.map((project, i) => (
                  <ProjectCard key={project.id} project={project} index={i} layout="services" />
                ))}
              </div>
            </section>
          )}

          {/* 4. Base packages, 5. Bundles */}
          {packageSection("Paket Dasar", "Pilihan paket untuk memulai kehadiran digital Anda, dari satu halaman hingga sistem custom.", packages.packages)}
          {packageSection("Bundling Hemat", "Paket lengkap yang menggabungkan beberapa layanan sekaligus, lebih hemat dibanding memesan terpisah.", packages.bundles)}

          {/* 6. Add-ons */}
          {addons.length > 0 && (
            <section className="sv-sec">
              <SectionHeading title="Add-on Populer" subtitle="Tambahkan fitur sesuai kebutuhan. Semua add-on bisa dikombinasikan dengan paket mana pun." />
              <AddonsSection groups={addons} />
            </section>
          )}

          {/* 7. Maintenance */}
          {packageSection("Maintenance", "Perawatan rutin agar website Anda tetap aman, cepat, dan up to date.", packages.maintenance)}

          {/* 8. Process */}
          {page.process.length > 0 && (
            <section className="sv-sec">
              <SectionHeading title="Proses Kerja" subtitle="Alur pengerjaan yang jelas dari awal diskusi hingga website Anda go-live." />
              <ProcessList steps={page.process} />
            </section>
          )}

          {/* 9. FAQ */}
          {page.faqs.length > 0 && (
            <section className="sv-sec sv-faq">
              <SectionHeading title="Pertanyaan yang Sering Diajukan" />
              <FaqAccordion faqs={page.faqs} />
            </section>
          )}
        </div>

        {/* 10. Contact CTA */}
        <ContactCTA
          email={site.email}
          whatsappUrl={site.whatsappUrl}
          heading={page.ctaHeading}
          description={page.ctaText}
          variant="services"
        />

        <ServicesJsonLd packages={allPackages} faqs={page.faqs} providerName={site.siteName || "Daffa Ilham Restupratama"} />
      </main>
    </>
  );
}
