/**
 * Bento layouts for the project grids, as Portfolio 2a defines them. Every tile spans two of
 * the four columns; which tiles take two rows is decided by position, with one repeating
 * six-step pattern [2,1,1,1,2,1] shared by every grid. Spans no longer depend on the cover's
 * aspect ratio.
 *
 *  - home:     four columns of 204px rows from 900px up; below that one column of 16:9 tiles.
 *  - projects: 204px rows at every width; four columns from 720px up, one column below.
 *  - services: like home, but without "Details →".
 *  - standalone: a single card outside any grid (the article sidebar), 16:9.
 *
 * The grid tracks and breakpoints live in globals.css under `.bento[data-layout]`; the row
 * spans only apply in the multi-column widths.
 */
export type BentoLayout = "home" | "projects" | "services" | "standalone";

const BENTO_PATTERN = [2, 1, 1, 1, 2, 1] as const;

/** Rows the tile at `index` spans in `layout` (from the layout's multi-column width up). */
export function bentoRows(layout: BentoLayout, index: number): 1 | 2 {
  if (layout === "standalone") return 1;
  return BENTO_PATTERN[index % BENTO_PATTERN.length]!;
}
