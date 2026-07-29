import type { BlocksContent } from "@strapi/blocks-react-renderer";

export interface TocEntry {
  id: string;
  text: string;
  level: number;
}

/** Heading levels included in the table of contents (and given ids by StrapiBlocks). */
export const TOC_LEVELS = [2, 3];

export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "section"
  );
}

interface HeadingNode {
  type?: string;
  level?: number;
  children?: { text?: string }[];
}

function headingText(node: HeadingNode): string {
  return (node.children ?? []).map((c) => (typeof c.text === "string" ? c.text : "")).join("").trim();
}

/** Build the TOC from a Strapi blocks body: level-2/3 headings, slugified ids with
 *  occurrence-dedup. The returned ids are fed to StrapiBlocks (positionally), so the
 *  anchors and the TOC links always match. */
export function extractToc(content: BlocksContent | null | undefined): TocEntry[] {
  if (!Array.isArray(content)) return [];
  const seen = new Map<string, number>();
  const entries: TocEntry[] = [];
  for (const node of content as HeadingNode[]) {
    if (node?.type !== "heading" || typeof node.level !== "number" || !TOC_LEVELS.includes(node.level)) continue;
    const text = headingText(node);
    if (!text) continue;
    const base = slugify(text);
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    entries.push({ id: count > 1 ? `${base}-${count}` : base, text, level: node.level });
  }
  return entries;
}
