import { titleCase } from "@/lib/mappers";

export interface ProjectTypeMeta {
  label: string;
}

/** Every `project.projectType` enum value, including ones the CMS may not offer yet. Title Case,
 *  with acronyms kept upper-case. */
const PROJECT_TYPE_META: Record<string, ProjectTypeMeta> = {
  erp: { label: "ERP" },
  operations: { label: "Operations & Supply Chain" },
  data_analytics: { label: "Data Analytics" },
  dashboard: { label: "Dashboards & BI" },
  data_visualization: { label: "Data Visualization" },
  data_science: { label: "Data Science" },
  machine_learning: { label: "Machine Learning" },
  research: { label: "Research" },
  case_study: { label: "Case Study" },
  finance: { label: "Finance" },
  gis: { label: "GIS" },
  web: { label: "Web" },
  infrastructure: { label: "IT Infrastructure" },
  social_work: { label: "Social Work" },
  other: { label: "Other" },
};

/** Display order for project types (the /projects filter chips). */
export const PROJECT_TYPE_ORDER: readonly string[] = [
  "erp",
  "operations",
  "data_analytics",
  "dashboard",
  "data_visualization",
  "data_science",
  "machine_learning",
  "research",
  "case_study",
  "finance",
  "gis",
  "web",
  "infrastructure",
  "social_work",
  "other",
];

/** Sorts by PROJECT_TYPE_ORDER; unknown values go last, keeping their incoming order
 *  (Array.prototype.sort is stable). */
export function byProjectTypeOrder(a: string, b: string): number {
  const rank = (t: string) => {
    const i = PROJECT_TYPE_ORDER.indexOf(t);
    return i < 0 ? PROJECT_TYPE_ORDER.length : i;
  };
  return rank(a) - rank(b);
}

/** projectType is a free-form Strapi enum: fall back to a title-cased label for any value
 *  outside the known set. */
export function projectTypeMeta(type: string): ProjectTypeMeta {
  return PROJECT_TYPE_META[type] ?? { label: titleCase(type) };
}
