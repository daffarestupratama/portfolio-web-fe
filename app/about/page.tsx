import type { Metadata } from "next";
import { getAboutPage } from "@/content/about";
import { getSiteSettings } from "@/content/site";
import { buildMetadata, mergeSeo } from "@/lib/seo";
import { StrapiBlocks } from "@/components/blocks/strapi-blocks";
import { CoverImage } from "@/components/ui/cover-image";
import { SkillsSection } from "@/components/about/skills-section";
import { Experiences } from "@/components/sections/experiences";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const [about, site] = await Promise.all([getAboutPage(), getSiteSettings()]);
  return buildMetadata(mergeSeo(about.seo, site.defaultSeo), { absoluteTitle: true });
}

export default async function AboutPage() {
  const about = await getAboutPage();

  return (
    <main className="relative z-[3] pt-28 pb-16 sm:pt-32">
      <div className="mx-auto w-full max-w-[820px] px-[22px]">
        <header>
          <h1 className="font-bold" style={{ fontSize: "clamp(30px,4.5vw,50px)", lineHeight: 1.05, letterSpacing: "-0.03em" }}>
            {about.title}
          </h1>
          {about.subtitle && (
            <p className="mt-4 text-[16px]" style={{ lineHeight: 1.62, color: "var(--ink-dim)" }}>
              {about.subtitle}
            </p>
          )}
        </header>

        {about.profileImage && (
          <CoverImage
            image={about.profileImage}
            variant="article"
            label={about.title}
            className="mt-7 aspect-[16/9] w-full"
            sizes="(max-width: 860px) 100vw, 820px"
            priority
          />
        )}

        {about.body && (
          <div className="mt-8">
            <StrapiBlocks content={about.body} />
          </div>
        )}

        <SkillsSection groups={about.skillGroups} />
      </div>

      <Experiences experiences={about.experiences} />
    </main>
  );
}
