/**
 * Temporary local sample data for the homepage, matching the export's literal
 * copy. Shaped close to the brief's §5 Strapi fields so step 3 only has to
 * swap each accessor's body for a `fetch` call — same pattern as content/mkdir.ts.
 */

export type ContactIcon = "linkedin" | "github" | "instagram" | "email";

export interface ContactLink {
  icon: ContactIcon;
  label: string;
  url: string;
}

export interface Cta {
  label: string;
  url: string;
}

export interface HeroStat {
  label: string;
  value: string;
}

export interface HomePage {
  eyebrow: string;
  fullName: string;
  headline: string;
  subheadline: string;
  heroCtaPrimary: Cta;
  heroCtaSecondary: Cta;
  contactLinks: ContactLink[];
  /** TODO(step 3): no clear home in brief §5 home-page schema — hardcoded until a field exists. */
  heroStats: HeroStat[];
}

export type ExperienceCategory = "professional" | "education" | "org";

export interface Experience {
  id: string;
  category: ExperienceCategory;
  organization: string;
  /** Hand-picked short badge label (not derivable from `organization` — e.g. "SQL" for an
   *  Analytics Bootcamp entry). Not in brief §5's `experience` schema; step 3 will need either
   *  a real Strapi field or a fallback derived from `organization`. */
  initials: string;
  role: string;
  dateRange: string;
  description: string;
}

export type ProjectType = "data-science" | "dashboard" | "gis";

export interface Project {
  id: string;
  slug: string;
  title: string;
  summary: string;
  year: string;
  projectType: ProjectType;
  techStack: string[];
  githubUrl?: string;
  dashboardUrl?: string;
  liveDemoUrl?: string;
}

export interface TourPackage {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  price: string;
  route: string;
  duration: string;
  groupSize: string;
}

export type ArticleLanguage = "en" | "id" | "de";

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  language: ArticleLanguage;
  publishedDate: string;
  readTime: string;
}

const homePage: HomePage = {
  eyebrow: "Information systems · data & GIS · tour guide",
  fullName: "Daffa Ilham Restupratama",
  headline: "Yes it's me,",
  subheadline:
    "A data-focused Information Systems student building dashboards, models and maps — who also guides curious travellers on city walking tours.",
  heroCtaPrimary: { label: "Resume", url: "#" },
  heroCtaSecondary: { label: "About me", url: "/about" },
  contactLinks: [
    { icon: "linkedin", label: "LinkedIn", url: "#" },
    { icon: "github", label: "GitHub", url: "#" },
    { icon: "instagram", label: "Instagram", url: "#" },
    { icon: "email", label: "Email", url: "#" },
  ],
  heroStats: [
    { label: "Models", value: "12" },
    { label: "Dashboards", value: "8" },
    { label: "Tours led", value: "40+" },
  ],
};

const experiences: Experience[] = [
  {
    id: "prof-1",
    category: "professional",
    organization: "Pemkot Analytics Unit",
    initials: "BI",
    role: "Data Analyst Intern",
    dateRange: "'24–'25",
    description:
      "Built Power BI dashboards tracking city service KPIs and automated weekly reporting pipelines in Python.",
  },
  {
    id: "prof-2",
    category: "professional",
    organization: "Lab Sistem Informasi",
    initials: "DS",
    role: "Research Assistant — Data Science",
    dateRange: "'23–now",
    description: "Trained demand-forecasting models and prototyped a GIS layer for campus mobility studies.",
  },
  {
    id: "prof-3",
    category: "professional",
    organization: "Freelance Data & GIS",
    initials: "FT",
    role: "Independent Consultant",
    dateRange: "'22–now",
    description:
      "Delivered survey analytics, interactive maps and notebook reports for small businesses and NGOs.",
  },
  {
    id: "prof-4",
    category: "professional",
    organization: "Local Walking Tours",
    initials: "WT",
    role: "City & Heritage Tour Guide",
    dateRange: "'21–now",
    description:
      "Designed and led 40+ small-group heritage walks, blending local history with food and architecture stops.",
  },
  {
    id: "edu-1",
    category: "education",
    organization: "Universitas — Information Systems",
    initials: "IS",
    role: "B.Sc. Information Systems",
    dateRange: "'21–'25",
    description:
      "Focus on data analytics, BI and geographic information systems. Coursework in statistics, databases and visualization.",
  },
  {
    id: "edu-2",
    category: "education",
    organization: "Bangkit / Data Academy",
    initials: "DA",
    role: "Data Science Pathway",
    dateRange: "'23",
    description: "Completed an applied machine-learning track with a capstone forecasting project and notebook portfolio.",
  },
  {
    id: "edu-3",
    category: "education",
    organization: "GIS Certification",
    initials: "GIS",
    role: "Spatial Analysis (QGIS)",
    dateRange: "'22",
    description: "Hands-on training in spatial joins, choropleth mapping and routing analysis for urban datasets.",
  },
  {
    id: "edu-4",
    category: "education",
    organization: "Analytics Bootcamp",
    initials: "SQL",
    role: "SQL & Dashboarding",
    dateRange: "'22",
    description: "Intensive on warehouse modelling, advanced SQL and building decision-ready dashboards.",
  },
  {
    id: "org-1",
    category: "org",
    organization: "Himpunan Mahasiswa SI",
    initials: "HM",
    role: "Head of Data & Research",
    dateRange: "'23–'24",
    description: "Led member surveys, built the org dashboard and mentored juniors on analytics tooling.",
  },
  {
    id: "org-2",
    category: "org",
    organization: "Campus Tech Events",
    initials: "EV",
    role: "Workshop Facilitator",
    dateRange: "'23",
    description: "Facilitated beginner data-viz sessions for 100+ students across two semesters.",
  },
  {
    id: "org-3",
    category: "org",
    organization: "Tourism Student Society",
    initials: "GT",
    role: "Guide Programme Lead",
    dateRange: "'22–'23",
    description: "Coordinated volunteer city tours and trained new guides on storytelling and route planning.",
  },
  {
    id: "org-4",
    category: "org",
    organization: "Open Data Community",
    initials: "VO",
    role: "Volunteer Contributor",
    dateRange: "'22–now",
    description: "Cleaned and published open civic datasets, and ran intro workshops on mapping with QGIS.",
  },
];

const projects: Project[] = [
  {
    id: "proj-mobility",
    slug: "urban-mobility-forecaster",
    title: "Urban mobility forecaster",
    summary:
      "A demand-forecasting model for city transit ridership with an interactive Streamlit front-end and scenario controls.",
    year: "2025",
    projectType: "data-science",
    techStack: ["Python", "scikit-learn", "Pandas", "Streamlit"],
    githubUrl: "#",
    liveDemoUrl: "#",
  },
  {
    id: "proj-kpi",
    slug: "city-service-kpi-dashboard",
    title: "City service KPI dashboard",
    summary:
      "A live Power BI dashboard consolidating service-request data across districts with weekly automated refresh.",
    year: "2024",
    projectType: "dashboard",
    techStack: ["Power BI", "SQL", "DAX", "Azure"],
    githubUrl: "#",
    dashboardUrl: "#",
    liveDemoUrl: "#",
  },
  {
    id: "proj-atlas",
    slug: "heritage-walk-route-atlas",
    title: "Heritage walk route atlas",
    summary:
      "A QGIS-based spatial analysis mapping walkability and points of interest along historic city corridors.",
    year: "2024",
    projectType: "gis",
    techStack: ["QGIS", "PostGIS", "GeoPandas", "Leaflet"],
    githubUrl: "#",
    liveDemoUrl: "#",
  },
  {
    id: "proj-notebook",
    slug: "notebook-report-toolkit",
    title: "Notebook report toolkit",
    summary: "A reusable Jupyter template turning raw survey exports into clean, chart-rich analytical reports.",
    year: "2023",
    projectType: "data-science",
    techStack: ["Jupyter", "Plotly", "NumPy", "Papermill"],
    githubUrl: "#",
    liveDemoUrl: "#",
  },
];

const tours: TourPackage[] = [
  {
    id: "tour-oldtown",
    slug: "old-town-heritage-walk",
    title: "Old town heritage walk",
    shortDescription:
      "A relaxed loop through colonial-era streets, markets and hidden courtyards, with stories at every stop.",
    price: "Rp180k",
    route: "Old town · 8 stops",
    duration: "2.5 hrs",
    groupSize: "Small group · max 8",
  },
  {
    id: "tour-sunset",
    slug: "sunset-food-and-lanes",
    title: "Sunset food & lanes",
    shortDescription:
      "An evening crawl tasting street food classics between lantern-lit alleys and a riverside finish.",
    price: "Rp220k",
    route: "Riverside · 6 stops",
    duration: "3 hrs",
    groupSize: "Small group · max 6",
  },
];

const articles: Article[] = [
  {
    id: "art-forecast",
    slug: "forecasting-transit-demand-without-overfitting",
    title: "Forecasting transit demand without overfitting",
    excerpt: "Notes on feature selection, validation and keeping models honest on messy city data.",
    category: "Data",
    language: "en",
    publishedDate: "Jun 2026",
    readTime: "6 min read",
  },
  {
    id: "art-walkability",
    slug: "memetakan-walkability-dengan-qgis",
    title: "Memetakan walkability dengan QGIS",
    excerpt: "Panduan singkat membangun peta walkability kota dari data terbuka dan analisis spasial.",
    category: "GIS",
    language: "id",
    publishedDate: "May 2026",
    readTime: "8 min read",
  },
  {
    id: "art-guiding",
    slug: "was-eine-gute-stadtfuehrung-ausmacht",
    title: "Was eine gute Stadtführung ausmacht",
    excerpt: "Gedanken über Storytelling, Tempo und die kleinen Pausen, die eine Tour lebendig machen.",
    category: "Tours",
    language: "de",
    publishedDate: "Apr 2026",
    readTime: "5 min read",
  },
];

export async function getHomePage(): Promise<HomePage> {
  return homePage;
}

export async function getFeaturedExperiences(): Promise<Record<ExperienceCategory, Experience[]>> {
  return {
    professional: experiences.filter((e) => e.category === "professional"),
    education: experiences.filter((e) => e.category === "education"),
    org: experiences.filter((e) => e.category === "org"),
  };
}

export async function getFeaturedProjects(): Promise<Project[]> {
  return projects;
}

export async function getFeaturedTours(): Promise<TourPackage[]> {
  return tours;
}

export async function getFeaturedArticles(): Promise<Article[]> {
  return articles;
}
