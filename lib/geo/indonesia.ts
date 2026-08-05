/**
 * Indonesia hero map: geometry (generated at build time) + projected city nodes.
 *
 * The coastline comes from public/indonesia.geojson via `npm run generate:map`, which
 * writes ./indonesia-geometry.ts. Generating rather than importing the GeoJSON keeps the
 * 336 KB source out of the bundle and avoids `fs` at runtime (the homepage is ISR, and
 * there's no filesystem on Cloudflare Workers). Payload after Ramer–Douglas–Peucker
 * simplification: 42 KB of path data, ~16 KB gzipped, from 14,633 → 3,749 points.
 */

import { CITY_EDGES, INDONESIA_CITIES } from "@/components/hero/hero-cities";
import { MAP_BOUNDS, MAP_HEIGHT, MAP_MARKUP, MAP_WIDTH } from "./indonesia-geometry";

/** Minimum on-map distance between two city nodes, in viewBox units (~6 screen px). */
const MIN_NODE_GAP = 14;

const scale = MAP_WIDTH / (MAP_BOUNDS.maxLon - MAP_BOUNDS.minLon);

/** Equirectangular projection — the same one the generated coastline used, so cities and
 *  geometry always align. At Indonesian latitudes cos(lat) ≈ 1, so a linear lon/lat
 *  mapping is accurate to well under a pixel and needs no projection library. */
export function project(lon: number, lat: number): { x: number; y: number } {
  return { x: (lon - MAP_BOUNDS.minLon) * scale, y: (MAP_BOUNDS.maxLat - lat) * scale };
}

export interface CityNode {
  name: string;
  x: number;
  y: number;
  /** Free-form extras — the seam for adding per-city figures later. */
  stats?: Record<string, string>;
}

/** Nudge apart any nodes that would render on top of each other, so two nearby cities
 *  never draw as overlapping circles with colliding popups. */
function separate(nodes: CityNode[], minGap: number): CityNode[] {
  const out = nodes.map((n) => ({ ...n }));
  for (let pass = 0; pass < 6; pass += 1) {
    let moved = false;
    for (let i = 0; i < out.length; i += 1) {
      for (let j = i + 1; j < out.length; j += 1) {
        const a = out[i]!;
        const b = out[j]!;
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let dist = Math.hypot(dx, dy);
        if (dist >= minGap) continue;
        if (dist < 1e-6) {
          // Exactly coincident — pick an arbitrary axis to split them along.
          dx = 1;
          dy = 0;
          dist = 1;
        }
        const push = (minGap - dist) / 2;
        const ux = (dx / dist) * push;
        const uy = (dy / dist) * push;
        a.x -= ux;
        a.y -= uy;
        b.x += ux;
        b.y += uy;
        moved = true;
      }
    }
    if (!moved) break;
  }
  return out.map((n) => ({ ...n, x: Math.round(n.x * 10) / 10, y: Math.round(n.y * 10) / 10 }));
}

export interface IndonesiaMap {
  /** Pre-serialised <path> markup for the whole coastline (injected as one string). */
  markup: string;
  viewBox: string;
  width: number;
  height: number;
  nodes: CityNode[];
  edges: readonly (readonly [number, number])[];
}

/** The finished, client-safe map payload. */
export const indonesiaMap: IndonesiaMap = {
  markup: MAP_MARKUP,
  viewBox: `0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`,
  width: MAP_WIDTH,
  height: MAP_HEIGHT,
  nodes: separate(
    INDONESIA_CITIES.map((city) => {
      const { x, y } = project(city.lon, city.lat);
      return { name: city.name, x, y, stats: city.stats };
    }),
    MIN_NODE_GAP,
  ),
  edges: CITY_EDGES,
};
