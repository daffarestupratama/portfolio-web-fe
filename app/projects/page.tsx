import type { Metadata } from "next";
import { getAllProjects, getProjectsPage, orderProjects } from "@/content/projects";
import { getSiteSettings } from "@/content/site";
import { buildPageMetadata } from "@/lib/seo";
import { ProjectsFilter } from "@/components/projects/projects-filter";
import { PageHeader } from "@/components/ui/page-header";
import { PageTop } from "@/components/layout/page-top";

export const revalidate = 3600;

const PROJECTS_DESCRIPTION =
  "Data science, machine learning, dashboards, and GIS projects by Daffa Ilham Restupratama — problem framing, approach, and results.";

/** Header copy used when projects-page is missing or its fields are blank. */
const FALLBACK_TITLE = "Projects";
const FALLBACK_SUBTITLE =
  "Selected data, machine-learning, and mapping work — each with the problem it tackled, the approach, and the result.";

export async function generateMetadata(): Promise<Metadata> {
  const [page, site] = await Promise.all([getProjectsPage(), getSiteSettings()]);
  return buildPageMetadata({
    path: "/projects",
    seo: page?.seo,
    title: page?.title ?? FALLBACK_TITLE,
    description: page?.subtitle ?? PROJECTS_DESCRIPTION,
    defaultSeo: site.defaultSeo,
    // A CMS metaTitle is used as written, like the other single types. The fallbacks keep the
    // site name template.
    absoluteTitle: Boolean(page?.seo.metaTitle),
  });
}

export default async function ProjectsPage() {
  const [all, page] = await Promise.all([getAllProjects(), getProjectsPage()]);
  const projects = orderProjects(all, page?.orderedIds ?? []);

  return (
    <>
      <PageTop />
      <main>
        <PageHeader
          title={page?.title ?? FALLBACK_TITLE}
          subtitle={page?.subtitle ?? FALLBACK_SUBTITLE}
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
