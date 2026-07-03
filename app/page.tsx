import { AmbientBackground } from "@/components/layout/ambient-background";
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/hero/hero";
import { Experiences } from "@/components/sections/experiences";
import { Projects } from "@/components/sections/projects";
import { Tours } from "@/components/sections/tours";
import { Writing } from "@/components/sections/writing";
import {
  getFeaturedArticles,
  getFeaturedExperiences,
  getFeaturedProjects,
  getFeaturedTours,
  getHomePage,
} from "@/content/home";

export default async function Home() {
  const [home, experiences, projects, tours, articles] = await Promise.all([
    getHomePage(),
    getFeaturedExperiences(),
    getFeaturedProjects(),
    getFeaturedTours(),
    getFeaturedArticles(),
  ]);

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <AmbientBackground />
      <Nav />
      <Hero home={home} />
      <Experiences experiences={experiences} />
      <Projects projects={projects} />
      <Tours tours={tours} />
      <Writing articles={articles} />
      <Footer />
    </div>
  );
}
