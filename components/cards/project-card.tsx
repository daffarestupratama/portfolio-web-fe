"use client";

import Link from "next/link";
import { useTilt } from "@/hooks/use-tilt";
import type { Project } from "@/content/home";
import { CoverImage } from "@/components/ui/cover-image";
import { ArrowRightIcon, DashboardIcon, ExternalLinkIcon, GithubIcon } from "@/components/ui/icons";
import { badgeStyle, projectTypeMeta } from "@/components/cards/project-type-meta";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const ref = useTilt<HTMLDivElement>();
  const meta = projectTypeMeta(project.projectType);

  return (
    <div ref={ref} data-tilt className="glass-card p-[15px]">
      <CoverImage
        image={project.coverImage}
        variant="project"
        label={`${project.title} cover`}
        className="relative z-[2] aspect-video w-full"
        sizes="(max-width: 768px) 100vw, 560px"
      />

      <div className="relative z-[2] px-2 pt-4 pb-1.5">
        <div className="flex items-center justify-between gap-2.5">
          <span className="badge" style={badgeStyle(meta.hue)}>
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
