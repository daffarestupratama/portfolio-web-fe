import type { Metadata } from "next";
import { Hero } from "@/components/hero/hero";
import { Experiences } from "@/components/sections/experiences";
import { getFeaturedCertifications } from "@/content/certifications";
import { Projects } from "@/components/sections/projects";
import { Tours } from "@/components/sections/tours";
import { Writing } from "@/components/sections/writing";
import { ContactCTA } from "@/components/sections/contact-cta";
import { HomeJsonLd } from "@/components/seo/json-ld";
import {
  getFeaturedArticles,
  getFeaturedProjects,
  getFeaturedTours,
  getHomePage,
  getHomePageSeo,
} from "@/content/home";
import { getExperiences } from "@/content/experiences";
import { getSiteSettings } from "@/content/site";
import { mapHeroLinks } from "@/lib/mappers";
import { PROFILE_LINK_TYPES } from "@/lib/contact";
import { buildPageMetadata } from "@/lib/seo";
import { FEATURES } from "@/lib/features";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const [homeSeo, site] = await Promise.all([getHomePageSeo(), getSiteSettings()]);
  return buildPageMetadata({ path: "", seo: homeSeo, defaultSeo: site.defaultSeo, absoluteTitle: true });
}

export default async function Home() {
  const [home, experiences, projects, tours, articles, site, certifications] = await Promise.all([
    getHomePage(),
    getExperiences(),
    getFeaturedProjects(),
    FEATURES.tours ? getFeaturedTours() : Promise.resolve([]),
    getFeaturedArticles(),
    getSiteSettings(),
    getFeaturedCertifications(),
  ]);

  // Profiles only: a mailto: or wa.me link is a way to reach the person, not who they are.
  const sameAs = site.contactLinks
    .filter((l) => PROFILE_LINK_TYPES.has(l.linkType) && /^https?:\/\//.test(l.url))
    .map((l) => l.url);

  return (
    <>
      <HomeJsonLd fullName={home.fullName} siteName={site.siteName || home.fullName} sameAs={sameAs} />
      <Hero home={home} links={mapHeroLinks(site.contactLinks, site.email)} />
      <Experiences experiences={experiences} certifications={certifications} />
      <Projects projects={projects} />
      {FEATURES.tours && <Tours tours={tours} />}
      <Writing articles={articles} />
      {/* Copy from site-setting.contactCta; ContactCTA falls back to its own defaults when
          a field is blank. `site` is already loaded here, so this costs no extra request. */}
      <ContactCTA
        email={site.email}
        whatsappUrl={site.whatsappUrl}
        heading={site.contactCta.heading}
        description={site.contactCta.text}
      />
    </>
  );
}
