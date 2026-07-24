import type { Metadata } from "next";
import { getAllProjects } from "@/content/projects";
import { getSiteSettings } from "@/content/site";
import { buildPageMetadata } from "@/lib/seo";
import { ProjectsFilter } from "@/components/projects/projects-filter";

export const revalidate = 60;

const PROJECTS_DESCRIPTION =
  "Data science, machine learning, dashboards, and GIS projects by Daffa Ilham Restupratama — problem framing, approach, and results.";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  return buildPageMetadata({
    path: "/projects",
    title: "Projects",
    description: PROJECTS_DESCRIPTION,
    defaultSeo: site.defaultSeo,
  });
}

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return (
    <main className="relative z-[3] mx-auto w-full max-w-[1180px] px-[22px] pt-28 pb-16 sm:pt-32">
      <header className="mb-8">
        <h1 className="font-bold" style={{ fontSize: "clamp(30px,4vw,46px)", letterSpacing: "-0.03em" }}>
          Projects
        </h1>
        <p className="mt-3 max-w-[52ch] text-[15px]" style={{ lineHeight: 1.6, color: "var(--ink-dim)" }}>
          Selected data, machine-learning, and mapping work — each with the problem it tackled, the approach, and the
          result.
        </p>
      </header>

      {projects.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--ink-faint)" }}>
          No projects published yet.
        </p>
      ) : (
        <ProjectsFilter projects={projects} />
      )}
    </main>
  );
}
