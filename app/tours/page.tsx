import type { Metadata } from "next";
import { getAllTours, getTourLanding } from "@/content/tours";
import { getSiteSettings } from "@/content/site";
import { buildPageMetadata } from "@/lib/seo";
import { StrapiBlocks } from "@/components/blocks/strapi-blocks";
import { CoverImage } from "@/components/ui/cover-image";
import { TourCard } from "@/components/cards/tour-card";
import { InfoList } from "@/components/tours/info-list";
import { ArrowRightIcon } from "@/components/ui/icons";

export const revalidate = 60;

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
    <main className="relative z-[3] mx-auto w-full max-w-[1180px] px-[22px] pt-28 pb-16 sm:pt-32">
      <header className="max-w-[720px]">
        <h1 className="font-bold" style={{ fontSize: "clamp(30px,4.5vw,50px)", lineHeight: 1.05, letterSpacing: "-0.03em" }}>
          {landing.title}
        </h1>
        {landing.subtitle && (
          <p className="mt-4 text-[16px]" style={{ lineHeight: 1.62, color: "var(--ink-dim)" }}>
            {landing.subtitle}
          </p>
        )}
      </header>

      {landing.heroImage && (
        <CoverImage
          image={landing.heroImage}
          variant="tour"
          label={landing.title}
          className="mt-7 aspect-[21/9] w-full"
          sizes="(max-width: 1180px) 100vw, 1180px"
          priority
        />
      )}

      {landing.intro && (
        <div className="mt-7 max-w-[760px]">
          <StrapiBlocks content={landing.intro} />
        </div>
      )}

      {landing.primaryCta && (
        <div className="mt-7 flex flex-wrap items-center gap-4">
          <a
            href={landing.primaryCta.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gradient gap-2 px-[21px] py-3 text-[14.5px]"
          >
            {landing.primaryCta.label}
            <ArrowRightIcon />
          </a>
          {landing.primaryCta.description && (
            <span className="max-w-[36ch] text-[13px]" style={{ color: "var(--ink-faint)" }}>
              {landing.primaryCta.description}
            </span>
          )}
        </div>
      )}

      {landing.whyChooseMe.length > 0 && (
        <section
          className="glass-card mt-10 p-6 sm:p-8"
          style={{ borderRadius: 22 }}
        >
          <div className="relative z-[2]">
            <InfoList title="Why tour with me" items={landing.whyChooseMe} />
          </div>
        </section>
      )}

      {hasFeatured && (
        <section className="mt-12">
          <h2 className="mb-[22px] font-bold" style={{ fontSize: "clamp(24px,3vw,34px)", letterSpacing: "-0.03em" }}>
            Featured tours
          </h2>
          <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2">
            {featured.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        </section>
      )}

      {rest.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-[22px] font-bold" style={{ fontSize: "clamp(24px,3vw,34px)", letterSpacing: "-0.03em" }}>
            {hasFeatured ? "More walking tours" : "Walking tours"}
          </h2>
          <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2">
            {rest.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        </section>
      )}

      {allTours.length === 0 && (
        <p className="mt-10 text-sm" style={{ color: "var(--ink-faint)" }}>
          No tours published yet.
        </p>
      )}
    </main>
  );
}
