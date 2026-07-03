"use client";

import { useTilt } from "@/hooks/use-tilt";
import type { Project, ProjectType } from "@/content/home";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { DashboardIcon, ExternalLinkIcon, GithubIcon } from "@/components/ui/icons";

const PROJECT_TYPE_META: Record<ProjectType, { label: string; hue: string }> = {
  "data-science": { label: "Data science", hue: "var(--sky)" },
  dashboard: { label: "Dashboard", hue: "var(--teal)" },
  gis: { label: "GIS", hue: "var(--green)" },
};

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const ref = useTilt<HTMLDivElement>();
  const meta = PROJECT_TYPE_META[project.projectType];

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
          {project.title}
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
