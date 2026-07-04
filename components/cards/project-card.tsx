"use client";

import Link from "next/link";
import { useTilt } from "@/hooks/use-tilt";
import type { Project } from "@/content/home";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { ArrowRightIcon, DashboardIcon, ExternalLinkIcon, GithubIcon } from "@/components/ui/icons";
import { titleCase } from "@/lib/mappers";

const PROJECT_TYPE_META: Record<string, { label: string; hue: string }> = {
  "data-science": { label: "Data science", hue: "var(--sky)" },
  dashboard: { label: "Dashboard", hue: "var(--teal)" },
  gis: { label: "GIS", hue: "var(--green)" },
};

/** projectType is a free-form Strapi enum — fall back to a title-cased label
 *  with a default sky badge for any value outside our known 3. */
function projectTypeMeta(type: string): { label: string; hue: string } {
  return PROJECT_TYPE_META[type] ?? { label: titleCase(type), hue: "var(--sky)" };
}

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const ref = useTilt<HTMLDivElement>();
  const meta = projectTypeMeta(project.projectType);

  return (
    <div ref={ref} data-tilt className="glass-card p-[15px]">
      <MediaPlaceholder variant="project" label={`${project.title} cover`} className="relative z-[2] aspect-video w-full" />

      <div className="relative z-[2] px-2 pt-4 pb-1.5">
        <div className="flex items-center justify-between gap-2.5">
          <span
            className="badge"
            style={{
              color: `color-mix(in srgb, ${meta.hue} 52%, var(--ink))`,
              background: `color-mix(in srgb, ${meta.hue} 15%, transparent)`,
              borderColor: `color-mix(in srgb, ${meta.hue} 32%, transparent)`,
            }}
          >
            {meta.label}
          </span>
          <span className="mono shrink-0 text-[11px]" style={{ color: "var(--ink-faint)" }}>
            {project.year}
          </span>
        </div>

        <h3 className="mt-[13px] text-[19px] font-bold" style={{ letterSpacing: "-0.025em" }}>
          <Link href={`/projects/${project.slug}`} className="transition-colors hover:text-(--accent-ink)">
            {project.title}
          </Link>
        </h3>
        <p className="mt-[9px] text-[13.5px]" style={{ lineHeight: 1.55, color: "var(--ink-dim)" }}>
          {project.summary}
        </p>

        <div className="mt-[15px] flex flex-wrap gap-[7px]">
          {project.techStack.map((tech) => (
            <span key={tech} className="chip mono px-[9px] py-1 text-[11px]" style={{ borderRadius: 8 }}>
              {tech}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2 pt-[15px]" style={{ borderTop: "1px solid var(--border)" }}>
          {project.githubUrl && (
            <a href={project.githubUrl} aria-label="View source on GitHub" className="glass-icon-btn h-9 w-9" style={{ borderRadius: 10 }}>
              <GithubIcon width={16} height={16} />
            </a>
          )}
          {project.dashboardUrl && (
            <a href={project.dashboardUrl} aria-label="Open dashboard" className="glass-icon-btn h-9 w-9" style={{ borderRadius: 10 }}>
              <DashboardIcon width={16} height={16} />
            </a>
          )}
          <Link
            href={`/projects/${project.slug}`}
            className="inline-flex items-center gap-1 text-[13px] font-semibold transition-colors hover:text-(--accent-ink)"
            style={{ color: "var(--ink-dim)" }}
          >
            Details
            <ArrowRightIcon width={14} height={14} />
          </Link>
          {project.liveDemoUrl && (
            <a href={project.liveDemoUrl} className="btn-gradient ml-auto gap-[7px] px-[15px] py-2 text-[13px]">
              Live demo
              <ExternalLinkIcon />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
