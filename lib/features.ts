/**
 * Site-wide feature flags. Single source of truth for optional features.
 *
 * `tours`: the walking-tours feature. OFF hides Tours from the navbar, the
 * homepage, the sitemap, and the mkdir content count — while keeping the /tours
 * and /tours/[slug] routes fully working (not 404). Walking tours are being moved
 * to a dedicated site later; flip this back to `true` here to restore every
 * surface at once.
 */
export const FEATURES = {
  tours: false,
} as const;
