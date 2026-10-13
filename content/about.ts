/** About-page accessor: body blocks and skills grouped by category. The page's experiences
 *  come from getExperiences (content/experiences.ts), shared with the homepage. */

import { cache } from "react";
import type { BlocksContent } from "@strapi/blocks-react-renderer";
import { strapiFindOne } from "@/lib/strapi";
import { ABOUT_PAGE_QUERY } from "@/lib/queries";
import { mapImage, titleCase } from "@/lib/mappers";
import type { StrapiAboutPage, StrapiSkill } from "@/lib/types";
import { mapSeo, type Seo } from "@/content/site";
import type { MappedImage } from "@/content/home";

export interface Skill {
  name: string;
  level: string;
  description: string | null;
  /** Technology logo when the skill has one — those render as logo tiles instead of chips. */
  logo: MappedImage | null;
}

export interface SkillGroup {
  category: string;
  label: string;
  skills: Skill[];
}

export interface AboutPage {
  title: string;
  subtitle: string | null;
  profileImage: MappedImage | null;
  body: BlocksContent | null;
  skillGroups: SkillGroup[];
  seo: Seo;
}

function asBlocks(value: unknown): BlocksContent | null {
  return Array.isArray(value) && value.length > 0 ? (value as BlocksContent) : null;
}

function groupSkills(skills: StrapiSkill[]): SkillGroup[] {
  const groups = new Map<string, Skill[]>();
  const sorted = skills.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  for (const s of sorted) {
    const arr = groups.get(s.category) ?? [];
    arr.push({
      name: s.name,
      level: s.level,
      description: s.description || null,
      logo: mapImage(s.logo, s.name),
    });
    groups.set(s.category, arr);
  }
  return Array.from(groups.entries()).map(([category, list]) => ({ category, label: titleCase(category), skills: list }));
}

export const getAboutPage = cache(async (): Promise<AboutPage> => {
  const raw = await strapiFindOne<StrapiAboutPage>("about-page", ABOUT_PAGE_QUERY);
  return {
    title: raw.title || "About",
    subtitle: raw.subtitle,
    profileImage: mapImage(raw.profileImage, raw.title || "Profile photo"),
    body: asBlocks(raw.body),
    skillGroups: groupSkills(raw.skills ?? []),
    seo: mapSeo(raw.seo),
  };
});
