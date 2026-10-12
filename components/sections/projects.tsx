import type { Project } from "@/content/home";
import { ProjectCard } from "@/components/cards/project-card";
import { SectionHeader } from "@/components/sections/section-header";

interface ProjectsProps {
  projects: Project[];
}

export function Projects({ projects }: ProjectsProps) {
  return (
    <section className="home-sec home-sec-projects">
      <div className="home-sec-inner">
        <SectionHeader title="Selected projects" href="/projects" linkLabel="All projects" />
        <div className="bento" data-layout="home">
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} layout="home" />
          ))}
        </div>
      </div>
    </section>
  );
}
