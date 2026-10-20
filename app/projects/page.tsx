import type { Metadata } from "next";
import { getAllProjects } from "@/content/projects";
import { getSiteSettings } from "@/content/site";
import { buildPageMetadata } from "@/lib/seo";
import { ProjectsFilter } from "@/components/projects/projects-filter";
import { PageHeader } from "@/components/ui/page-header";
import { PageTop } from "@/components/layout/page-top";

export const revalidate = 3600;

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
    <>
      <PageTop />
      <main>
        <PageHeader
          title="Projects"
          subtitle="Selected data, machine-learning, and mapping work — each with the problem it tackled, the approach, and the result."
        />
        {projects.length === 0 ? (
          <div className="pg-body">
            <p className="pg-empty">No projects published yet.</p>
          </div>
        ) : (
          <ProjectsFilter projects={projects} />
        )}
      </main>
    </>
  );
}
