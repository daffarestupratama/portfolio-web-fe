import type { Command, CmsCommandData } from "./terminal-types";

const isHttpUrl = (url: string | null): url is string => !!url && /^https?:\/\//i.test(url);

/**
 * Turn serializable CMS command data into runnable Commands. The run() closure is
 * built here (client side) from output/outputType. buildRegistry still enforces
 * precedence — built-ins claim their names first, so any colliding CMS command is
 * dropped and can never be applied here.
 */
export function buildCmsCommands(data: CmsCommandData[]): Command[] {
  return data.map((d) => ({
    name: d.name,
    aliases: d.aliases,
    summary: d.summary || "(custom command)",
    manText: d.manText || d.summary || d.name,
    category: d.category,
    source: "cms" as const,
    run(ctx) {
      if (d.outputType === "link") {
        ctx.print(d.output || "Opening link…");
        if (isHttpUrl(d.linkUrl)) {
          ctx.print(d.linkUrl, "accent");
          window.open(d.linkUrl, "_blank", "noopener,noreferrer");
        }
        return;
      }
      if (!d.output) return; // nothing to print — degrade quietly
      if (d.outputType === "ascii") ctx.printPre(d.output);
      else ctx.print(d.output);
    },
  }));
}
