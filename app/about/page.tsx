import type { Metadata } from "next";
import { getAboutPage } from "@/content/about";
import { getSiteSettings } from "@/content/site";
import { buildPageMetadata, mappedImageToOg } from "@/lib/seo";
import { StrapiBlocks } from "@/components/blocks/strapi-blocks";
import { StrapiImage } from "@/components/ui/strapi-image";
import { SkillsSection } from "@/components/about/skills-section";
import { Experiences } from "@/components/sections/experiences";
import { getFeaturedCertifications } from "@/content/certifications";
import { getExperiences } from "@/content/experiences";
import { ContactCTA } from "@/components/sections/contact-cta";
import { PageTop } from "@/components/layout/page-top";

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const [about, site] = await Promise.all([getAboutPage(), getSiteSettings()]);
  return buildPageMetadata({
    path: "/about",
    seo: about.seo,
    title: about.title,
    description: about.subtitle,
    image: mappedImageToOg(about.profileImage),
    defaultSeo: site.defaultSeo,
    absoluteTitle: true,
  });
}

export default async function AboutPage() {
  const [about, site, certifications, experiences] = await Promise.all([
    getAboutPage(),
    getSiteSettings(),
    getFeaturedCertifications(),
    getExperiences(),
  ]);
  const photo = about.profileImage;

  return (
    <>
      <PageTop />
      <main className="relative z-[3]">
        {/* 2a: portrait left, text right from 900px; stacked and centred below. */}
        <header className="ab-head">
          <div className="ab-grid">
            {photo && (
              <div className="ab-photo">
                <div aria-hidden="true" className="ab-dish">
                  <div />
                </div>
                <div className="ab-frame">
                  <div className="ab-well">
                    {/* The image box takes the photo's own ratio (2a's 2/3 when unknown), so
                        `cover` shows the whole portrait and never crops it. */}
                    <div
                      className="ab-img"
                      style={{ aspectRatio: photo.width && photo.height ? `${photo.width} / ${photo.height}` : "2 / 3" }}
                    >
                      <StrapiImage
                        src={photo.url}
                        alt={photo.alt || about.title || "Profile photo"}
                        fill
                        sizes="280px"
                        priority
                        style={{ objectFit: "cover", objectPosition: "center top" }}
                        fallback={null}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="ab-text">
              <h1 className="ab-title">{about.title}</h1>
              {about.subtitle && <p className="ab-sub">{about.subtitle}</p>}
              {about.body && (
                <div className="ab-body">
                  <StrapiBlocks content={about.body} variant="about" />
                </div>
              )}
            </div>
          </div>
        </header>

        <Experiences experiences={experiences} certifications={certifications} />

        <SkillsSection groups={about.skillGroups} />

        {/* It renders `id="contact"` and this is the page's only instance, so the anchor stays
            unique. */}
        <ContactCTA
          email={site.email}
          whatsappUrl={site.whatsappUrl}
          heading={site.contactCta.heading}
          description={site.contactCta.text}
        />
      </main>
    </>
  );
}
