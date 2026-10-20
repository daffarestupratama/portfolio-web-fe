import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTourBySlug, getTourSlugs } from "@/content/tours";
import { getSiteSettings } from "@/content/site";
import { buildPageMetadata, mappedImageToOg, notFoundMetadata } from "@/lib/seo";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { StrapiBlocks } from "@/components/blocks/strapi-blocks";
import { CoverImage } from "@/components/ui/cover-image";
import { Gallery } from "@/components/ui/gallery";
import { TourRoute } from "@/components/tours/tour-route";
import { InfoList } from "@/components/tours/info-list";
import { CtaLink } from "@/components/ui/cta-link";
import { ArrowRightIcon, ClockIcon, ExternalLinkIcon, MapPinIcon } from "@/components/ui/icons";
import { PageTop } from "@/components/layout/page-top";

export const revalidate = 86400;

export async function generateStaticParams() {
  const slugs = await getTourSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const [tour, site] = await Promise.all([getTourBySlug(slug), getSiteSettings()]);
  if (!tour) return notFoundMetadata();
  return buildPageMetadata({
    path: `/tours/${slug}`,
    seo: tour.seo,
    title: tour.title,
    description: tour.shortDescription,
    image: mappedImageToOg(tour.coverImage),
    defaultSeo: site.defaultSeo,
    absoluteTitle: true,
  });
}

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

  // Not in Portfolio 2a: the project page's header, cover well and section recipes.
  return (
    <>
      <PageTop />
      <main className="relative z-[3]">
        <BreadcrumbJsonLd
          items={[
            { name: "Home", path: "" },
            { name: "Tours", path: "/tours" },
            { name: tour.title, path: `/tours/${slug}` },
          ]}
        />
        <header className="pj-head">
          <Link href="/tours" className="nm-back mono">
            <ArrowRightIcon width={13} height={13} style={{ transform: "rotate(180deg)" }} />
            All tours
          </Link>

          <h1 className="pj-title tr-title">{tour.title}</h1>
          {tour.shortDescription && <p className="pj-summary">{tour.shortDescription}</p>}

          {(tour.duration || tour.meetingPoint) && (
            <div className="tc-chips tr-meta">
              {tour.duration && (
                <span className="tc-chip mono">
                  <ClockIcon />
                  {tour.duration}
                </span>
              )}
              {tour.meetingPoint && (
                <span className="tc-chip mono">
                  <MapPinIcon />
                  {tour.meetingPoint}
                </span>
              )}
            </div>
          )}
        </header>

        <section className="pj-body">
          <div className="pj-cover-well">
            <div className="pj-cover">
              <CoverImage
                image={tour.coverImage}
                variant="tour"
                label={`${tour.title} cover`}
                className="absolute inset-0 h-full w-full"
                sizes="(max-width: 900px) 100vw, 860px"
                priority
              />
            </div>
          </div>

          <div className="pj-sections">
            {tour.description && (
              <section>
                <h2 className="pj-h2">About this tour</h2>
                <StrapiBlocks content={tour.description} variant="project" />
              </section>
            )}

            {tour.route.length > 0 && (
              <section>
                <h2 className="pj-h2 pj-h2-lg">Route</h2>
                <TourRoute stops={tour.route} />
              </section>
            )}

            {goodToKnow.length > 0 && (
              <section>
                <h2 className="pj-h2 pj-h2-lg">Good to know</h2>
                <div className="tr-know">
                  {goodToKnow.map((s) => (
                    <InfoList key={s.title} title={s.title} items={s.items} tone={s.tone} />
                  ))}
                </div>
              </section>
            )}

            {tour.priceOptions.length > 0 && (
              <section>
                <h2 className="pj-h2 pj-h2-lg">Pricing</h2>
                <div className="tr-prices">
                  {tour.priceOptions.map((option, i) => (
                    <div key={i} className="tr-price">
                      <div className="min-w-0">
                        <div className="tr-price-title">{option.title}</div>
                        {option.description && <p className="tr-price-desc">{option.description}</p>}
                      </div>
                      <div className="tr-price-amount">{option.price}</div>
                    </div>
                  ))}
                </div>
                {tour.availabilityNote && <p className="tr-note">{tour.availabilityNote}</p>}
              </section>
            )}

            {tour.bookingContact.length > 0 && (
              <section>
                <h2 className="pj-h2 pj-h2-lg">Book this tour</h2>
                <div className="tr-book">
                  {tour.bookingContact.map((link, i) => (
                    <CtaLink key={i} href={link.url} className={`${i === 0 ? "nm-btn-accent" : "nm-btn"} tr-btn`}>
                      {link.label}
                      <ExternalLinkIcon />
                    </CtaLink>
                  ))}
                </div>
              </section>
            )}

            {tour.gallery.length > 0 && (
              <section>
                <h2 className="pj-h2 pj-h2-lg">Gallery</h2>
                <Gallery images={tour.gallery} variant="masonry" />
              </section>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
