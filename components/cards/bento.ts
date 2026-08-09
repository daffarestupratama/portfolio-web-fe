/**
 * Bento tile shaping for the project grids.
 *
 * Each card's span is driven by its cover's aspect ratio (Strapi gives width/height), with
 * a deterministic index tiebreak so the composition is stable across renders and reads as
 * arranged rather than random. Spans only apply from `lg` up — at `md` the grid is a plain
 * two-column layout (wide covers still take the full row) and at `sm` everything collapses
 * to one column at a uniform ratio.
 */

/** Cover-less cards are shaped as "standard" landscape so the grid stays even. */
const DEFAULT_ASPECT = 1.6;

/**
 * Every tile spans at least 2 of the 4 columns (half width). A single-column tile is
 * only a quarter of the layout, which left no room for the title and tech tiles — so the
 * aspect ratio now drives the tile's HEIGHT, not whether it gets squeezed:
 *   - portrait/square cover (ar < 1.3) → 2×2 feature tile (tall image needs the height)
 *   - the lead card                     → 2×2 feature tile (anchors the composition)
 *   - everything else                   → 2×1 compact tile
 */
export function bentoSpan(index: number, aspect: number | null | undefined): string {
  const ar = aspect && Number.isFinite(aspect) && aspect > 0 ? aspect : DEFAULT_ASPECT;
  const base = "md:col-span-2 lg:col-span-2";
  if (ar < 1.3) return `${base} lg:row-span-2`;
  if (ar >= 1.9) return base; // panoramic: wide and short suits the crop
  return index === 0 ? `${base} lg:row-span-2` : base;
}

/** Grid container classes shared by the homepage section and the /projects list. */
export const BENTO_GRID_CLASS =
  "bento grid grid-cols-1 gap-4 md:grid-cols-2 lg:auto-rows-[196px] lg:grid-cols-4 lg:[grid-auto-flow:dense]";

/** True when the tile spans two rows — those have room for a longer hover summary. */
export function isTallSpan(span: string): boolean {
  return span.includes("row-span-2");
}
