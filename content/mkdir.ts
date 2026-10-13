/**
 * /mkdir CMS terminal commands (phase 2). Fetched at build time (ISR) and passed
 * to the client terminal as plain, serializable data — the client builds each
 * command's run() closure (functions can't cross the server→client boundary).
 * All rows are validated/guarded here so bad data can never crash the terminal.
 */

import { strapiFind } from "@/lib/strapi";
import { TERMINAL_COMMANDS_QUERY } from "@/lib/queries";
import { fixMojibake, toStringArray } from "@/lib/mappers";
import type { StrapiTerminalCommand } from "@/lib/types";
import type { CmsCommandData, CmsOutputType, CommandCategory } from "@/components/mkdir/terminal-types";
import { formatContactText } from "@/components/mkdir/filesystem";
import { DOMAIN } from "@/components/mkdir/config";
import type { SiteSettings } from "@/content/site";

const OUTPUT_TYPES: ReadonlySet<string> = new Set(["text", "ascii", "link"]);
const CMS_CATEGORIES: ReadonlySet<string> = new Set(["custom", "about", "fun", "links", "misc"]);

function clean(value: string | null | undefined): string {
  return value ? fixMojibake(value) : "";
}

/** Validate + normalize one raw row into serializable command data (null → drop). Exported for tests. */
export function mapTerminalCommand(row: StrapiTerminalCommand): CmsCommandData | null {
  const name = String(row.name ?? "").trim().toLowerCase();
  if (!name) return null; // a nameless command can't be registered — drop it

  const aliases = toStringArray(row.aliases)
    .map((a) => a.trim().toLowerCase())
    .filter(Boolean);
  const outputType: CmsOutputType = OUTPUT_TYPES.has(row.outputType ?? "")
    ? (row.outputType as CmsOutputType)
    : "text";
  const category: CommandCategory = CMS_CATEGORIES.has(row.category ?? "")
    ? (row.category as CommandCategory)
    : "misc";

  return {
    name,
    aliases,
    summary: clean(row.summary),
    manText: clean(row.manText),
    category,
    outputType,
    output: clean(row.output),
    linkUrl: row.linkUrl?.trim() || null,
  };
}

/** Published CMS commands as serializable data. Never throws — a CMS
 *  outage degrades to an empty list so the built-in terminal still works. */
export async function getTerminalCommands(): Promise<CmsCommandData[]> {
  try {
    const rows = await strapiFind<StrapiTerminalCommand>("terminal-commands", TERMINAL_COMMANDS_QUERY);
    return rows.flatMap((row) => {
      const mapped = mapTerminalCommand(row);
      return mapped ? [mapped] : [];
    });
  } catch {
    return [];
  }
}

/** `linkedin.com/in/x` from `https://www.linkedin.com/in/x/`, the bare address from `mailto:`. */
function displayUrl(url: string): string {
  return url
    .replace(/^mailto:/i, "")
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/+$/, "");
}

/** The terminal's `about/contact.txt`, from site-setting: the resolved email first, then every
 *  other contactLinks row in CMS order, then the site itself. Plain text, so it crosses to the
 *  client terminal the same way the CMS commands do. */
export function buildContactText(site: SiteSettings): string {
  return formatContactText([
    { key: "email", value: site.email },
    ...site.contactLinks
      .filter((l) => l.linkType !== "email")
      .map((l) => ({ key: l.linkType, value: displayUrl(l.url) })),
    { key: "site", value: DOMAIN },
  ]);
}
