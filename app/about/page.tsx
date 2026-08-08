import type { Metadata } from "next";
import { getAboutPage } from "@/content/about";
import { getSiteSettings } from "@/content/site";
import { buildPageMetadata, mappedImageToOg } from "@/lib/seo";
import { StrapiBlocks } from "@/components/blocks/strapi-blocks";
import { CoverImage } from "@/components/ui/cover-image";
import { SkillsSection } from "@/components/about/skills-section";
import { Experiences } from "@/components/sections/experiences";

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
  const about = await getAboutPage();

  return (
    <main className="relative z-[3] pt-28 pb-16 sm:pt-32">
      {/* Top: square profile image on the left, all text on the right (stacks on mobile). */}
      <div className="mx-auto w-full max-w-[920px] px-[22px]">
        <div className="grid gap-8 md:grid-cols-[260px_minmax(0,1fr)] md:items-start">
          {about.profileImage && (
            // 2:3 matches the source photo (844×1264), so the whole portrait is shown
            // instead of a square crop that cut off the top of the head.
            <CoverImage
              image={about.profileImage}
              variant="article"
              label={about.title || "Profile photo"}
              className="mx-auto aspect-[2/3] w-full max-w-[260px]"
              sizes="(max-width: 768px) 260px, 260px"
              priority
            />
          )}

          <div className="min-w-0">
            <h1 className="font-bold" style={{ fontSize: "clamp(30px,4.5vw,48px)", lineHeight: 1.05, letterSpacing: "-0.03em" }}>
              {about.title}
            </h1>
            {about.subtitle && (
              <p className="mt-4 text-[16px]" style={{ lineHeight: 1.62, color: "var(--ink-dim)" }}>
                {about.subtitle}
              </p>
            )}
            {about.body && (
              <div className="mt-6">
                <StrapiBlocks content={about.body} />
              </div>
            )}
          </div>
        </div>
      </div>

      <Experiences experiences={about.experiences} />

      <div className="mx-auto w-full max-w-[820px] px-[22px]">
        <SkillsSection groups={about.skillGroups} />
      </div>
    </main>
  );
}
