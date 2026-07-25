import type { Metadata } from "next";
import { getSiteSettings } from "@/content/site";
import { buildPageMetadata } from "@/lib/seo";
import { getProjectSlugs } from "@/content/projects";
import { getArticleSlugs } from "@/content/articles";
import { getTourSlugs } from "@/content/tours";
import { Terminal } from "@/components/mkdir/terminal";

export const revalidate = 60;

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
  const [projects, articles, tours] = await Promise.all([getProjectSlugs(), getArticleSlugs(), getTourSlugs()]);
  const counts = { projects: projects.length, articles: articles.length, tours: tours.length };

  return (
    <main className="relative z-[3] mx-auto w-full max-w-[1080px] px-[22px] pt-28 pb-16 sm:pt-32">
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

      <Terminal counts={counts} />
    </main>
  );
}
