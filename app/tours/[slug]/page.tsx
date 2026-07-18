import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTourBySlug, getTourSlugs } from "@/content/tours";
import { getSiteSettings } from "@/content/site";
import { buildMetadata, mergeSeo } from "@/lib/seo";
import { StrapiBlocks } from "@/components/blocks/strapi-blocks";
import { CoverImage } from "@/components/ui/cover-image";
import { Gallery } from "@/components/ui/gallery";
import { TourRoute } from "@/components/tours/tour-route";
import { InfoList } from "@/components/tours/info-list";
import { ArrowRightIcon, ClockIcon, ExternalLinkIcon, MapPinIcon } from "@/components/ui/icons";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getTourSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const [tour, site] = await Promise.all([getTourBySlug(slug), getSiteSettings()]);
  if (!tour) return {};
  return buildMetadata(mergeSeo(tour.seo, site.defaultSeo), { absoluteTitle: true });
}

const sectionHeading = "mt-10 mb-3 text-[22px] font-bold";
const headingStyle = { letterSpacing: "-0.02em" } as const;

export default async function TourDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);
  if (!tour) notFound();

  const goodToKnow = [
    { title: "Suitable for", items: tour.suitableFor, tone: "accent" as const },
    { title: "Not suitable for", items: tour.notSuitableFor, tone: "muted" as const },
    { title: "What to prepare", items: tour.whatToPrepare, tone: "accent" as const },
    { title: "Included", items: tour.included, tone: "accent" as const },
    { title: "Not included", items: tour.excluded, tone: "muted" as const },
  ].filter((s) => s.items.length > 0);

  return (
    <main className="relative z-[3] mx-auto w-full max-w-[860px] px-[22px] pt-28 pb-16 sm:pt-32">
      <Link
        href="/tours"
        className="mono inline-flex items-center gap-1.5 text-[12.5px] transition-colors hover:text-(--accent-ink)"
        style={{ color: "var(--ink-dim)" }}
      >
        <ArrowRightIcon width={13} height={13} style={{ transform: "rotate(180deg)" }} />
        All tours
      </Link>

      <h1 className="mt-5 font-bold" style={{ fontSize: "clamp(28px,4vw,44px)", lineHeight: 1.1, letterSpacing: "-0.03em" }}>
        {tour.title}
      </h1>
      {tour.shortDescription && (
        <p className="mt-4 text-[16px]" style={{ lineHeight: 1.6, color: "var(--ink-dim)" }}>
          {tour.shortDescription}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-[7px]">
        {tour.duration && (
          <span className="chip rounded-full px-2.5 py-1.5 text-xs">
            <ClockIcon />
            {tour.duration}
          </span>
        )}
        {tour.meetingPoint && (
          <span className="chip rounded-full px-2.5 py-1.5 text-xs">
            <MapPinIcon />
            {tour.meetingPoint}
          </span>
        )}
      </div>

      <CoverImage
        image={tour.coverImage}
        variant="tour"
        label={`${tour.title} cover`}
        className="mt-6 aspect-[16/9] w-full"
        sizes="(max-width: 900px) 100vw, 860px"
        priority
      />

      {tour.description && (
        <section>
          <h2 className={sectionHeading} style={headingStyle}>
            About this tour
          </h2>
          <StrapiBlocks content={tour.description} />
        </section>
      )}

      {tour.route.length > 0 && (
        <section>
          <h2 className={sectionHeading} style={headingStyle}>
            Route
          </h2>
          <TourRoute stops={tour.route} />
        </section>
      )}

      {goodToKnow.length > 0 && (
        <section>
          <h2 className={sectionHeading} style={headingStyle}>
            Good to know
          </h2>
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
            {goodToKnow.map((s) => (
              <InfoList key={s.title} title={s.title} items={s.items} tone={s.tone} />
            ))}
          </div>
        </section>
      )}

      {tour.priceOptions.length > 0 && (
        <section>
          <h2 className={sectionHeading} style={headingStyle}>
            Pricing
          </h2>
          <div className="flex flex-col gap-3">
            {tour.priceOptions.map((option, i) => (
              <div key={i} className="glass-card flex flex-wrap items-baseline justify-between gap-3 p-4" style={{ borderRadius: 16 }}>
                <div className="relative z-[2] min-w-0">
                  <div className="text-[15px] font-semibold">{option.title}</div>
                  {option.description && (
                    <p className="mt-1 text-[13px]" style={{ lineHeight: 1.5, color: "var(--ink-dim)" }}>
                      {option.description}
                    </p>
                  )}
                </div>
                <div className="relative z-[2] text-[18px] font-bold" style={{ color: "var(--accent-ink)", letterSpacing: "-0.02em" }}>
                  {option.price}
                </div>
              </div>
            ))}
          </div>
          {tour.availabilityNote && (
            <p className="mt-3 text-[13px]" style={{ color: "var(--ink-faint)" }}>
              {tour.availabilityNote}
            </p>
          )}
        </section>
      )}

      {tour.bookingContact.length > 0 && (
        <section>
          <h2 className={sectionHeading} style={headingStyle}>
            Book this tour
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {tour.bookingContact.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  i === 0
                    ? "btn-gradient gap-2 px-[21px] py-3 text-[14.5px]"
                    : "glass-pill gap-2 px-[21px] py-3 text-[14.5px] font-semibold"
                }
              >
                {link.label}
                <ExternalLinkIcon />
              </a>
            ))}
          </div>
        </section>
      )}

      {tour.gallery.length > 0 && (
        <section>
          <h2 className={sectionHeading} style={headingStyle}>
            Gallery
          </h2>
          <Gallery images={tour.gallery} />
        </section>
      )}
    </main>
  );
}
