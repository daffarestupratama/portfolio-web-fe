import type { BlocksContent } from "@strapi/blocks-react-renderer";

export interface TocEntry {
  id: string;
  text: string;
  level: number;
}

/** Heading levels included in the table of contents (and given ids by StrapiBlocks). */
export const TOC_LEVELS = [2, 3];

/**
 * Distance below the viewport top where a heading is considered "current" — clears the
 * floating navbar (~80px) with a small gap. Drives BOTH the headings' `scroll-margin-top`
 * and the scroll-spy's reading line, so clicking a TOC entry lands the heading exactly on
 * the line that decides which entry is highlighted. Two separate numbers would make the
 * highlight disagree with the click by their difference.
 */
export const HEADING_SCROLL_OFFSET = 104;

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

/**
 * Single pass over a Strapi blocks body that both builds the TOC and stamps the matching
 * `id` onto each level-2/3 heading node (cloned — the input is never mutated).
 *
 * The renderer's `Block` spreads every node field other than `type`/`children` into the
 * block handler's props, so the heading handler reads its id straight off the node. That
 * is the whole point of doing it here: the previous design walked the body twice (once to
 * build the TOC, once while rendering) and paired the two by a positional counter, which
 * desynced whenever the two walks disagreed — an empty heading, skipped by the TOC but
 * counted by the renderer, shifted every id after it. One walk, one filter, no counter.
 */
export function withHeadingIds(content: BlocksContent | null | undefined): {
  content: BlocksContent;
  toc: TocEntry[];
} {
  if (!Array.isArray(content)) return { content: [] as unknown as BlocksContent, toc: [] };

  const seen = new Map<string, number>();
  const toc: TocEntry[] = [];
  const nodes = (content as HeadingNode[]).map((node) => {
    if (node?.type !== "heading" || typeof node.level !== "number" || !TOC_LEVELS.includes(node.level)) return node;
    const text = headingText(node);
    if (!text) return node;
    const base = slugify(text);
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    const id = count > 1 ? `${base}-${count}` : base;
    toc.push({ id, text, level: node.level });
    return { ...node, id };
  });

  return { content: nodes as unknown as BlocksContent, toc };
}

/** TOC-only view of {@link withHeadingIds}, for callers that don't render the body. */
export function extractToc(content: BlocksContent | null | undefined): TocEntry[] {
  return withHeadingIds(content).toc;
}
