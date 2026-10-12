import { titleCase } from "@/lib/mappers";

export interface ProjectTypeMeta {
  label: string;
}

const PROJECT_TYPE_META: Record<string, ProjectTypeMeta> = {
  "data-science": { label: "Data science" },
  dashboard: { label: "Dashboard" },
  gis: { label: "GIS" },
};

/** projectType is a free-form Strapi enum: fall back to a title-cased label for any value
 *  outside the known set. */
export function projectTypeMeta(type: string): ProjectTypeMeta {
  return PROJECT_TYPE_META[type] ?? { label: titleCase(type) };
}
