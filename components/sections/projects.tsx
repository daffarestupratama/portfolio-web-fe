import Link from "next/link";
import type { Project } from "@/content/home";
import { ProjectCard } from "@/components/cards/project-card";
import { ArrowRightIcon } from "@/components/ui/icons";

interface ProjectsProps {
  projects: Project[];
}

export function Projects({ projects }: ProjectsProps) {
  return (
    <section className="relative z-[3] flex justify-center px-[22px] pt-[46px] pb-2.5">
      <div className="w-full max-w-[1180px]">
        <div className="mb-[22px] flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-bold" style={{ fontSize: "clamp(26px,3vw,38px)", letterSpacing: "-0.03em" }}>
            Selected projects
          </h2>
          <Link href="/projects" className="glass-pill gap-[7px] px-[17px] py-[9px] text-[13.5px] font-semibold">
            All projects
            <ArrowRightIcon />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
