"use client";

import { useMemo, useState } from "react";
import type { Project } from "@/content/home";
import { ProjectCard } from "@/components/cards/project-card";
import { badgeStyle, projectTypeMeta } from "@/components/cards/project-type-meta";

interface ProjectsFilterProps {
  projects: Project[];
}

const ALL = "__all__";

export function ProjectsFilter({ projects }: ProjectsFilterProps) {
  const types = useMemo(() => Array.from(new Set(projects.map((p) => p.projectType))), [projects]);
  const [active, setActive] = useState<string>(ALL);

  const showFilter = types.length > 1;
  const visible = active === ALL ? projects : projects.filter((p) => p.projectType === active);

  return (
    <>
      {showFilter && (
        <div className="mb-7 flex flex-wrap gap-2" role="group" aria-label="Filter projects by type">
          <button
            type="button"
            onClick={() => setActive(ALL)}
            data-active={active === ALL}
            className="tab-btn"
            style={{ fontSize: "12.5px", padding: "7px 15px" }}
          >
            All
          </button>
          {types.map((type) => {
            const meta = projectTypeMeta(type);
            const isActive = active === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setActive(type)}
                aria-pressed={isActive}
                className="badge cursor-pointer"
                style={{
                  ...badgeStyle(meta.hue),
                  padding: "7px 15px",
                  fontSize: "12.5px",
                  outline: isActive ? "2px solid var(--accent)" : "none",
                  outlineOffset: 2,
                }}
              >
                {meta.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2 lg:grid-cols-3">
        {visible.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </>
  );
}
