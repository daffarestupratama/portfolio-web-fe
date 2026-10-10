/**
 * Bento layouts for the project grids, as Portfolio 2a defines them. Every tile spans two of
 * the four columns; what varies per layout is which tiles take two rows. Spans no longer
 * depend on the cover's aspect ratio — 2a assigns them by position.
 *
 *  - home:     the first tile is 2×2, the rest 2×1. Rows 204px from 900px up; below that
 *              one column of 16:9 tiles.
 *  - projects: a repeating six-step row pattern [2,1,1,1,2,1]. Four columns from 720px up,
 *              one column below; rows are 204px at every width.
 *  - services: every tile 2×1 and no "Details →"; otherwise like home.
 *  - standalone: a single card outside any grid (the article sidebar), 16:9.
 *
 * The grid tracks and breakpoints live in globals.css under `.bento[data-layout]`.
 */
export type BentoLayout = "home" | "projects" | "services" | "standalone";

const PROJECTS_PATTERN = [2, 1, 1, 1, 2, 1] as const;

/** Rows the tile at `index` spans in `layout` (from the layout's multi-column width up). */
export function bentoRows(layout: BentoLayout, index: number): 1 | 2 {
  if (layout === "home") return index === 0 ? 2 : 1;
  if (layout === "projects") return PROJECTS_PATTERN[index % PROJECTS_PATTERN.length]!;
  return 1;
}
