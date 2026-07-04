import type { Metadata } from "next";
import { Hero } from "@/components/hero/hero";
import { Experiences } from "@/components/sections/experiences";
import { Projects } from "@/components/sections/projects";
import { Tours } from "@/components/sections/tours";
import { Writing } from "@/components/sections/writing";
import { ContactCTA } from "@/components/sections/contact-cta";
import { HomeJsonLd } from "@/components/seo/json-ld";
import {
  getFeaturedArticles,
  getFeaturedExperiences,
  getFeaturedProjects,
  getFeaturedTours,
  getHomePage,
  getHomePageSeo,
} from "@/content/home";
import { getSiteSettings, type Seo } from "@/content/site";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const [homeSeo, site] = await Promise.all([getHomePageSeo(), getSiteSettings()]);
  const fallback = site.defaultSeo;
  const merged: Seo = {
    metaTitle: homeSeo.metaTitle || fallback.metaTitle,
    metaDescription: homeSeo.metaDescription || fallback.metaDescription,
    canonicalUrl: homeSeo.canonicalUrl || fallback.canonicalUrl,
    noIndex: homeSeo.noIndex,
    ogImageUrl: homeSeo.ogImageUrl || fallback.ogImageUrl,
  };
  return buildMetadata(merged, { absoluteTitle: true });
}

export default async function Home() {
  const [home, experiences, projects, tours, articles, site] = await Promise.all([
    getHomePage(),
    getFeaturedExperiences(),
    getFeaturedProjects(),
    getFeaturedTours(),
    getFeaturedArticles(),
    getSiteSettings(),
  ]);

  const sameAs = site.contactLinks.map((l) => l.url).filter((url) => /^https?:\/\//.test(url));

  return (
    <>
      <HomeJsonLd fullName={home.fullName} siteName={site.siteName || home.fullName} sameAs={sameAs} />
      <Hero home={home} />
      <Experiences experiences={experiences} />
      <Projects projects={projects} />
      <Tours tours={tours} />
      <Writing articles={articles} />
      <ContactCTA email={site.email} whatsappUrl={site.whatsappUrl} />
    </>
  );
}
