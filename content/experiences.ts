/** Experiences accessor for the homepage and /about. Both show every published experience,
 *  read straight from the collection: unpublishing an entry is how it is hidden. */

import { cache } from "react";
import { strapiFind } from "@/lib/strapi";
import { EXPERIENCES_QUERY } from "@/lib/queries";
import { bucketExperiences, mapExperience } from "@/lib/mappers";
import type { StrapiExperience } from "@/lib/types";
import type { Experience, ExperienceCategory } from "@/content/home";

/** Bucketed into the Experiences tabs, each newest-first (see bucketExperiences). cache() so a
 *  page reading it twice in one render pays one request. */
export const getExperiences = cache(async (): Promise<Record<ExperienceCategory, Experience[]>> => {
  const rows = await strapiFind<StrapiExperience>("experiences", EXPERIENCES_QUERY);
  return bucketExperiences(rows.map(mapExperience));
});
