import type { Metadata } from "next";
import { getAllTours, getTourLanding } from "@/content/tours";
import { getSiteSettings } from "@/content/site";
import { buildPageMetadata } from "@/lib/seo";
import { StrapiBlocks } from "@/components/blocks/strapi-blocks";
import { StrapiImage } from "@/components/ui/strapi-image";
import { PageHeader } from "@/components/ui/page-header";
import { TourCard } from "@/components/cards/tour-card";
import { InfoList } from "@/components/tours/info-list";
import { CtaLink } from "@/components/ui/cta-link";
import { ArrowRightIcon } from "@/components/ui/icons";

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const [landing, site] = await Promise.all([getTourLanding(), getSiteSettings()]);
  return buildPageMetadata({
    path: "/tours",
    seo: landing.seo,
    title: landing.title,
    description: landing.subtitle,
    defaultSeo: site.defaultSeo,
    absoluteTitle: true,
  });
}

export default async function ToursPage() {
  const [landing, allTours] = await Promise.all([getTourLanding(), getAllTours()]);

  const bySlug = new Map(allTours.map((t) => [t.slug, t]));
  const featured = landing.featuredSlugs.map((s) => bySlug.get(s)).filter((t): t is NonNullable<typeof t> => Boolean(t));
  const featuredSet = new Set(landing.featuredSlugs);
  const rest = allTours.filter((t) => !featuredSet.has(t.slug));
  const hasFeatured = featured.length > 0;

  return (
    <main className="relative z-[3] nm-root">
      <PageHeader title={landing.title} subtitle={landing.subtitle ?? undefined} />

      {/* Not in Portfolio 2a: built from its recipes (cover well, raised cards, accent button). */}
      <div className="tr">
        {landing.heroImage && (
          <div className="tr-hero-well">
            <div className="tr-hero">
              <StrapiImage
                src={landing.heroImage.url}
                alt={landing.heroImage.alt || landing.title}
                fill
                sizes="(max-width: 1180px) 100vw, 1160px"
                priority
                style={{ objectFit: "cover" }}
                fallback={null}
              />
            </div>
          </div>
        )}

        {landing.intro && (
          <div className="tr-intro">
            <StrapiBlocks content={landing.intro} variant="intro" />
          </div>
        )}

        {landing.primaryCta && (
          <div className="tr-cta-row">
            <CtaLink href={landing.primaryCta.url} className="nm-btn-accent tr-btn">
              {landing.primaryCta.label}
              <ArrowRightIcon />
            </CtaLink>
            {landing.primaryCta.description && <span className="tr-cta-note">{landing.primaryCta.description}</span>}
          </div>
        )}

        {landing.whyChooseMe.length > 0 && (
          <section className="tr-why">
            <InfoList title="Why tour with me" items={landing.whyChooseMe} />
          </section>
        )}

        {hasFeatured && (
          <section className="sv-sec">
            <h2 className="sv-h2">Featured tours</h2>
            <div className="tr-grid">
              {featured.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          </section>
        )}

        {rest.length > 0 && (
          <section className="sv-sec">
            <h2 className="sv-h2">{hasFeatured ? "More walking tours" : "Walking tours"}</h2>
            <div className="tr-grid">
              {rest.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          </section>
        )}

        {allTours.length === 0 && <p className="tr-none">No tours published yet.</p>}
      </div>
    </main>
  );
}
