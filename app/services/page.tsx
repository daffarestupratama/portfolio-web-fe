import type { Metadata } from "next";
import { getServicePage, getServicePackages, getServiceAddons } from "@/content/services";
import { getSiteSettings } from "@/content/site";
import { buildPageMetadata } from "@/lib/seo";
import { waLink } from "@/lib/whatsapp";
import { StrapiBlocks } from "@/components/blocks/strapi-blocks";
import { ContactCTA } from "@/components/sections/contact-cta";
import { ProjectCard } from "@/components/cards/project-card";
import { BENTO_GRID_CLASS } from "@/components/cards/bento";
import { MailIcon, WhatsappIcon } from "@/components/ui/icons";
import { FeaturesGrid } from "@/components/services/features-grid";
import { PackageCard } from "@/components/services/package-card";
import { AddonsSection } from "@/components/services/addons-section";
import { ProcessList } from "@/components/services/process-list";
import { FaqAccordion } from "@/components/services/faq-accordion";
import { DeviceShowcase } from "@/components/services/device-showcase";
import { ServicesJsonLd } from "@/components/seo/services-json-ld";

export const revalidate = 3600;

const FALLBACK_WHATSAPP_URL = "https://wa.me/6288233300541";
const FALLBACK_EMAIL = "contact@daffa.me";

export async function generateMetadata(): Promise<Metadata> {
  const [page, site] = await Promise.all([getServicePage(), getSiteSettings()]);
  // Canonical self-derives from the "/services" route. The CMS entry's canonicalUrl
  // is a same-origin "…/service" (singular) typo, which resolveCanonical ignores.
  return buildPageMetadata({
    path: "/services",
    seo: page.seo,
    title: page.title,
    description: page.subtitle,
    defaultSeo: site.defaultSeo,
    absoluteTitle: true,
  });
}

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-bold" style={{ fontSize: "clamp(22px,3vw,30px)", letterSpacing: "-0.02em" }}>
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 max-w-[62ch] text-[14.5px]" style={{ lineHeight: 1.6, color: "var(--ink-dim)" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default async function ServicesPage() {
  const [page, packages, addons, site] = await Promise.all([
    getServicePage(),
    getServicePackages(),
    getServiceAddons(),
    getSiteSettings(),
  ]);

  const whatsappUrl = site.whatsappUrl || FALLBACK_WHATSAPP_URL;
  const email = site.email || FALLBACK_EMAIL;
  const heroWa = waLink(whatsappUrl, "Halo Daffa, saya ingin konsultasi soal pembuatan website.");
  const allPackages = [...packages.packages, ...packages.bundles, ...packages.maintenance];

  return (
    <main className="relative z-[3] pt-28 pb-8 sm:pt-32">
      <div className="mx-auto w-full max-w-[1180px] px-[22px]">
        {/* 1. Hero — text left, device mockups right (the visual omits itself entirely
            when none of the three screens are uploaded). */}
        {/* The device column needs a DEFINITE track width: with `auto`, the stage's
            width:100% resolves against an indefinite size and — since every device is
            absolutely positioned and contributes no intrinsic width — collapses to zero. */}
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_480px]">
          <header className="max-w-[760px]">
          <h1 className="font-bold" style={{ fontSize: "clamp(30px,4.8vw,50px)", lineHeight: 1.05, letterSpacing: "-0.03em" }}>
            {page.title}
          </h1>
          {page.subtitle && (
            <p className="mt-4 text-[16px]" style={{ lineHeight: 1.6, color: "var(--ink-dim)" }}>
              {page.subtitle}
            </p>
          )}
          {page.intro && (
            <div className="mt-5 max-w-[65ch]">
              <StrapiBlocks content={page.intro} />
            </div>
          )}
          <div className="mt-7 flex flex-wrap items-center gap-[11px]">
            <a
              href={heroWa}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gradient gap-[9px] px-[21px] py-3 text-[14.5px]"
            >
              <WhatsappIcon />
              Konsultasi gratis
            </a>
            <a href={`mailto:${email}`} className="glass-pill gap-[9px] px-[21px] py-3 text-[14.5px] font-semibold">
              <MailIcon />
              Email
            </a>
          </div>
          </header>

          <DeviceShowcase
            desktop={page.heroImageDesktop}
            laptop={page.heroImageLaptop}
            mobile={page.heroImageMobile}
          />
        </div>

        {/* 2. Features */}
        {page.features.length > 0 && (
          <section className="mt-16">
            <SectionHeading title="Kenapa memilih saya" />
            <FeaturesGrid features={page.features} />
          </section>
        )}

        {/* 3. Portfolio — sits directly after the features section, before the packages. */}
        {page.featuredProjects.length > 0 && (
          <section className="mt-16">
            <SectionHeading title="Portofolio" subtitle="Beberapa proyek yang pernah saya kerjakan." />
            {/* The shared bento class, not a lookalike: `.bento` is also what opts the
                cards into the `.bento .pcard` rule that releases their aspect ratio at lg,
                so the row/col spans drive the height. Without it the spans would fight a
                fixed 16/10 ratio. */}
            <div className={BENTO_GRID_CLASS}>
              {page.featuredProjects.map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* 4. Base packages */}
        {packages.packages.length > 0 && (
          <section className="mt-16">
            <SectionHeading title="Paket Dasar" subtitle="Pilihan paket untuk memulai kehadiran digital Anda, dari satu halaman hingga sistem custom." />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {packages.packages.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} whatsappUrl={whatsappUrl} />
              ))}
            </div>
          </section>
        )}

        {/* 5. Bundles */}
        {packages.bundles.length > 0 && (
          <section className="mt-16">
            <SectionHeading title="Bundling Hemat" subtitle="Paket lengkap yang menggabungkan beberapa layanan sekaligus, lebih hemat dibanding memesan terpisah." />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {packages.bundles.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} whatsappUrl={whatsappUrl} />
              ))}
            </div>
          </section>
        )}

        {/* 6. Add-ons */}
        {addons.length > 0 && (
          <section className="mt-16">
            <SectionHeading title="Add-on Populer" subtitle="Tambahkan fitur sesuai kebutuhan. Semua add-on bisa dikombinasikan dengan paket mana pun." />
            <AddonsSection groups={addons} />
          </section>
        )}

        {/* 7. Maintenance */}
        {packages.maintenance.length > 0 && (
          <section className="mt-16">
            <SectionHeading title="Maintenance" subtitle="Perawatan rutin agar website Anda tetap aman, cepat, dan up to date." />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {packages.maintenance.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} whatsappUrl={whatsappUrl} />
              ))}
            </div>
          </section>
        )}

        {/* 8. Process */}
        {page.process.length > 0 && (
          <section className="mt-16">
            <SectionHeading title="Proses Kerja" subtitle="Alur pengerjaan yang jelas dari awal diskusi hingga website Anda go-live." />
            <ProcessList steps={page.process} />
          </section>
        )}

        {/* 9. FAQ */}
        {page.faqs.length > 0 && (
          <section className="mt-16">
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
      />

      <ServicesJsonLd packages={allPackages} faqs={page.faqs} providerName={site.siteName || "Daffa Ilham Restupratama"} />
    </main>
  );
}
