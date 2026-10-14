/**
 * Plain-text CMS fields (Strapi `text`) carry the editor's line breaks. These helpers turn them
 * into structure without ever treating the text as markup: the result is plain strings, which
 * the renderer (components/ui/plain-text.tsx) passes to React as text, so it is always escaped.
 */

export type PlainBlock = { type: "p"; lines: string[] } | { type: "ul"; items: string[] };

/** A list line: "- " or "• " (marker followed by whitespace), so "-5%" or "a - b" stay text. */
const BULLET = /^\s*[-•]\s+/;

function normalize(text: string): string {
  return text.replace(/\r\n?/g, "\n").trim();
}

/**
 * Paragraphs, line breaks and bulleted lists:
 *  - a blank line (empty or whitespace only) starts a new paragraph;
 *  - a single line break inside a paragraph is kept as a line break;
 *  - consecutive "- " / "• " lines form one bulleted list, marker stripped.
 * Nothing else is interpreted.
 */
export function parsePlainText(text: string): PlainBlock[] {
  const blocks: PlainBlock[] = [];
  // Each blank-line-separated chunk starts fresh, so blocks never continue across a blank line.
  for (const chunk of normalize(text).split(/\n[ \t]*\n\s*/)) {
    let current: PlainBlock | null = null;
    for (const raw of chunk.split("\n")) {
      if (BULLET.test(raw)) {
        const item = raw.replace(BULLET, "").trim();
        if (!item) continue;
        if (current?.type === "ul") current.items.push(item);
        else blocks.push((current = { type: "ul", items: [item] }));
      } else {
        const line = raw.trim();
        if (!line) continue;
        if (current?.type === "p") current.lines.push(line);
        else blocks.push((current = { type: "p", lines: [line] }));
      }
    }
  }
  return blocks;
}

/** Normalises newlines and collapses runs of 3+ newlines (whitespace-only lines count as
 *  empty) to 2, so at most one blank line survives. */
export function collapseBlankLines(text: string): string {
  return normalize(text)
    .replace(/^[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n");
}

/** Line breaks only: the lines of `collapseBlankLines`, an empty string for the blank line. */
export function breakLines(text: string): string[] {
  return collapseBlankLines(text).split("\n");
}

/** One line for metadata and JSON-LD: every run of whitespace, newlines included, to a space. */
export function toSingleLine(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}
