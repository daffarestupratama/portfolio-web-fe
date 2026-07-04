import { titleCase } from "@/lib/mappers";

export interface ProjectTypeMeta {
  label: string;
  hue: string;
}

const PROJECT_TYPE_META: Record<string, ProjectTypeMeta> = {
  "data-science": { label: "Data science", hue: "var(--sky)" },
  dashboard: { label: "Dashboard", hue: "var(--teal)" },
  gis: { label: "GIS", hue: "var(--green)" },
};

/** projectType is a free-form Strapi enum — fall back to a title-cased label
 *  with a default sky badge for any value outside our known set. */
export function projectTypeMeta(type: string): ProjectTypeMeta {
  return PROJECT_TYPE_META[type] ?? { label: titleCase(type), hue: "var(--sky)" };
}

/** Inline style for a type badge given its hue (matches project-card's badge). */
export function badgeStyle(hue: string) {
  return {
    color: `color-mix(in srgb, ${hue} 52%, var(--ink))`,
    background: `color-mix(in srgb, ${hue} 15%, transparent)`,
    borderColor: `color-mix(in srgb, ${hue} 32%, transparent)`,
  };
}
