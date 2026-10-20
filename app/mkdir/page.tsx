import type { Metadata } from "next";
import { getSiteSettings } from "@/content/site";
import { buildPageMetadata } from "@/lib/seo";
import { getProjectSlugs } from "@/content/projects";
import { getArticleSlugs } from "@/content/articles";
import { getTourSlugs } from "@/content/tours";
import { buildContactText, getTerminalCommands } from "@/content/mkdir";
import { FEATURES } from "@/lib/features";
import { Terminal } from "@/components/mkdir/terminal";
import { PageTop } from "@/components/layout/page-top";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  return buildPageMetadata({
    path: "/mkdir",
    title: "mkdir — interactive terminal",
    description:
      "An interactive terminal on Daffa Ilham Restupratama's portfolio — explore a small Linux-style shell (dirOS): run help, ls, cd, cat, neofetch and more.",
    defaultSeo: site.defaultSeo,
  });
}

export default async function MkdirPage() {
  // site-setting is the same cached read generateMetadata makes, so it adds no request.
  const [projects, articles, tours, cmsCommands, site] = await Promise.all([
    getProjectSlugs(),
    getArticleSlugs(),
    getTourSlugs(),
    getTerminalCommands(),
    getSiteSettings(),
  ]);
  // Tours are hidden while FEATURES.tours is off — report 0 so neofetch/motd omit them.
  const counts = {
    projects: projects.length,
    articles: articles.length,
    tours: FEATURES.tours ? tours.length : 0,
  };

  return (
    <>
      <PageTop />
      <main className="relative z-[3] term-page">
        {/* Crawlable description — the terminal is client-rendered, so this gives search
            engines and screen readers real content describing the page. */}
        <section className="sr-only">
          <h1>mkdir — an interactive terminal</h1>
          <p>
            mkdir is a playful terminal on Daffa Ilham Restupratama&apos;s portfolio. It emulates a small Linux-style
            shell called dirOS, with built-in commands such as help, ls, cd, cat, tree, neofetch, fortune, and cowsay,
            plus a fake filesystem you can explore. Type <code>help</code> to list every command, or <code>exit</code>{" "}
            to return to the homepage.
          </p>
        </section>

        <Terminal counts={counts} cmsCommands={cmsCommands} contactText={buildContactText(site)} />
      </main>
    </>
  );
}
