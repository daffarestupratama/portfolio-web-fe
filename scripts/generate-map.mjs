/**
 * Generates lib/geo/indonesia-geometry.ts from public/indonesia.geojson.
 *
 * Run with:  npm run generate:map
 *
 * Why a generated module instead of importing the GeoJSON directly:
 *  - TypeScript's `resolveJsonModule` only covers `.json`, not `.geojson`.
 *  - Reading it with `fs` at module scope would break under ISR on Cloudflare
 *    Workers (no filesystem at runtime).
 * Generating once keeps the heavy source out of the bundle and costs nothing at
 * runtime. The GeoJSON stays the source of truth — re-run this after changing it.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = resolve(ROOT, "public/indonesia.geojson");
const TARGET = resolve(ROOT, "lib/geo/indonesia-geometry.ts");

/** Simplification tolerance in viewBox units (≈px at MAP_WIDTH). */
const RDP_EPSILON = 1;
/** Rings below this area (px², shoelace) are sub-pixel specks. */
const MIN_RING_AREA = 1;
const MAP_WIDTH = 1000;

/** Ramer–Douglas–Peucker, iterative. */
function simplify(points, epsilon) {
  const n = points.length;
  if (n < 3) return points;
  const keep = new Array(n).fill(false);
  keep[0] = true;
  keep[n - 1] = true;
  const stack = [[0, n - 1]];
  while (stack.length > 0) {
    const [i, j] = stack.pop();
    const [ax, ay] = points[i];
    const [bx, by] = points[j];
    const dx = bx - ax;
    const dy = by - ay;
    const norm = Math.hypot(dx, dy);
    let furthest = -1;
    let index = -1;
    for (let k = i + 1; k < j; k += 1) {
      const [px, py] = points[k];
      const dist = norm > 0 ? Math.abs(dx * (ay - py) - dy * (ax - px)) / norm : Math.hypot(px - ax, py - ay);
      if (dist > furthest) {
        furthest = dist;
        index = k;
      }
    }
    if (furthest > epsilon && index > 0) {
      keep[index] = true;
      stack.push([i, index], [index, j]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

function ringArea(points) {
  let sum = 0;
  for (let i = 0; i < points.length; i += 1) {
    const [x1, y1] = points[i];
    const [x0, y0] = points[(i - 1 + points.length) % points.length];
    sum += x1 * y0 - x0 * y1;
  }
  return Math.abs(sum) / 2;
}

const geo = JSON.parse(readFileSync(SOURCE, "utf8"));
const features = geo.features ?? [];
if (!Array.isArray(features) || features.length === 0) {
  throw new Error(`No features found in ${SOURCE} — is the GeoJSON valid?`);
}

let minLon = Infinity;
let maxLon = -Infinity;
let minLat = Infinity;
let maxLat = -Infinity;
let sourcePoints = 0;
for (const feature of features) {
  for (const polygon of feature.geometry.coordinates) {
    for (const ring of polygon) {
      for (const [lon, lat] of ring) {
        sourcePoints += 1;
        if (lon < minLon) minLon = lon;
        if (lon > maxLon) maxLon = lon;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      }
    }
  }
}

const scale = MAP_WIDTH / (maxLon - minLon);
const height = Math.round((maxLat - minLat) * scale * 10) / 10;
const round1 = (v) => Math.round(v * 10) / 10;

const paths = [];
let keptPoints = 0;
for (const feature of features) {
  for (const polygon of feature.geometry.coordinates) {
    for (const ring of polygon) {
      const projected = ring.map(([lon, lat]) => [(lon - minLon) * scale, (maxLat - lat) * scale]);
      if (projected.length < 4 || ringArea(projected) < MIN_RING_AREA) continue;
      const segments = [];
      let previous = "";
      for (const [x, y] of simplify(projected, RDP_EPSILON)) {
        const point = `${round1(x)},${round1(y)}`;
        if (point === previous) continue;
        previous = point;
        segments.push(point);
      }
      if (segments.length < 3) continue;
      keptPoints += segments.length;
      paths.push(`M${segments.join("L")}Z`);
    }
  }
}

const body = `// GENERATED FILE — do not edit by hand.
// Source: public/indonesia.geojson · regenerate with: npm run generate:map
// ${features.length} province features → ${paths.length} rings, ${keptPoints} points
// (from ${sourcePoints} source points; RDP epsilon ${RDP_EPSILON}, min ring area ${MIN_RING_AREA}px²).

/** Geographic bounds of the source data, for projecting other lon/lat pairs. */
export const MAP_BOUNDS = {
  minLon: ${minLon},
  maxLon: ${maxLon},
  minLat: ${minLat},
  maxLat: ${maxLat},
} as const;

export const MAP_WIDTH = ${MAP_WIDTH};
export const MAP_HEIGHT = ${height};

/**
 * The ${paths.length} coastline rings, pre-serialised as SVG markup and injected in one go via
 * dangerouslySetInnerHTML, in a ${MAP_WIDTH}×${height} equirectangular space.
 *
 * Emitted as a single string rather than an array of path data because rendering
 * ${paths.length} separate React <path> elements measured ~6.3ms of server CPU — a large share
 * of the Cloudflare Workers free-plan 10ms budget — versus ~0.02ms for this string. The
 * cost scales with element count, not payload size. Safe to inject: it is built solely
 * from the rounded numeric coordinates computed above, with no external or user content.
 */
export const MAP_MARKUP = ${JSON.stringify(paths.map((d) => `<path d="${d}"/>`).join(""))};
`;

mkdirSync(dirname(TARGET), { recursive: true });
writeFileSync(TARGET, body, "utf8");

const bytes = paths.join("").length;
console.log(`✓ ${TARGET}`);
console.log(`  features ${features.length} · rings ${paths.length} · points ${sourcePoints} → ${keptPoints}`);
console.log(`  path data ${(bytes / 1024).toFixed(1)} KB · viewBox 0 0 ${MAP_WIDTH} ${height}`);
