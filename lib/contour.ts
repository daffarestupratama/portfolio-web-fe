/**
 * Seeded "contour map" placeholder for projects and articles without a cover: a port of
 * Portfolio 2a's `contour(seed, dark)`. Concentric harmonic blobs in the accent and second
 * accent, seeded by the slug, so a given card always draws the same terrain.
 *
 * Returned as an SVG string for `dangerouslySetInnerHTML` (the same reason as MAP_MARKUP:
 * ~15 `<path>` React elements per card would cost far more render time than one string).
 *
 * Deterministic across engines, not just across renders: 2a calls Math.sin/Math.cos, whose
 * last bits may differ between JS engines, and a single flipped digit would make the server
 * HTML and the client render disagree. `detSin` below uses only + − × ÷, which IEEE 754
 * makes exact everywhere, so Node and every browser produce byte-identical markup. It agrees
 * with Math.sin to ~1e-13, far below the 0.1-unit precision the path data is written at.
 */

const TWO_PI = 2 * Math.PI;
const HALF_PI = Math.PI / 2;

/** sin(x) by range reduction to [-π/2, π/2] and a Taylor polynomial to x^17. */
function detSin(x: number): number {
  let r = x - Math.round(x / TWO_PI) * TWO_PI; // now in [-π, π]
  if (r > HALF_PI) r = Math.PI - r;
  else if (r < -HALF_PI) r = -Math.PI - r;
  const r2 = r * r;
  // Horner form of r − r³/3! + r⁵/5! − … + r¹⁷/17!
  return (
    r *
    (1 +
      r2 *
        (-1 / 6 +
          r2 *
            (1 / 120 +
              r2 *
                (-1 / 5040 +
                  r2 *
                    (1 / 362880 +
                      r2 * (-1 / 39916800 + r2 * (1 / 6227020800 + r2 * (-1 / 1307674368000 + r2 * (1 / 355687428096000)))))))))
  );
}
const detCos = (x: number) => detSin(x + HALF_PI);

/** 2a's PRNG, seeded with an FNV-1a hash of the slug. Integer-only, hence exact. */
function seededRandom(seed: string): () => number {
  let hh = 2166136261;
  for (const ch of seed) {
    hh ^= ch.charCodeAt(0);
    hh = Math.imul(hh, 16777619);
  }
  let sd = hh >>> 0;
  return () => {
    sd = (sd + 0x6d2b79f5) | 0;
    let t = Math.imul(sd ^ (sd >>> 15), 1 | sd);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Harmonic = [k: number, amp: number, phase: number];

const W = 400;
const H = 300;

function blob(cx: number, cy: number, R: number, harm: Harmonic[]): string {
  let d = "";
  for (let i = 0; i <= 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    let r = 1;
    for (const [k, amp, ph] of harm) r += amp * detSin(k * a + ph);
    d += (i ? "L" : "M") + (cx + detCos(a) * R * r).toFixed(1) + " " + (cy + detSin(a) * R * r * 0.8).toFixed(1);
  }
  return d + "Z";
}

function build(seed: string, dark: boolean): string {
  const rnd = seededRandom(seed);
  const base = dark ? "#14171C" : "var(--bg)";
  const mk = (c: string, p: number) => `color-mix(in srgb, ${c} ${p.toFixed(1)}%, ${base})`;
  const stroke = dark ? "rgba(255,255,255,.1)" : "color-mix(in srgb, var(--ink) 12%, transparent)";

  let out = `<rect width="${W}" height="${H}" style="fill:${mk("var(--accent)", dark ? 20 : 7)}"></rect>`;
  // Same evaluation order as 2a: every rnd() call happens in the identical sequence.
  const c0x = W * (0.2 + rnd() * 0.6);
  const c0y = H * (0.25 + rnd() * 0.5);
  const c1x = rnd() < 0.5 ? W * 0.04 : W * 0.96;
  const c1y = rnd() < 0.5 ? H * 0.06 : H * 0.94;
  const centers: [number, number, number, number][] = [
    [c0x, c0y, 9, 290],
    [c1x, c1y, 5, 140],
  ];
  centers.forEach(([cx, cy, L, R0], ci) => {
    const harm: Harmonic[] = [
      [2, 0.08 + rnd() * 0.08, rnd() * 6.28],
      [3, 0.05 + rnd() * 0.06, rnd() * 6.28],
      [5, 0.02 + rnd() * 0.03, rnd() * 6.28],
    ];
    for (let k = 0; k < L; k++) {
      const useB = (k + ci) % 3 === 2;
      const p = dark ? 22 + k * 6 : 7 + k * 4.2;
      const hk = harm.map(([a, b, c]): Harmonic => [a, b * (1 + (rnd() - 0.5) * 0.5), c + (rnd() - 0.5) * 0.4]);
      const bx = cx + (rnd() - 0.5) * 12;
      const by = cy + (rnd() - 0.5) * 12;
      const d = blob(bx, by, R0 * (1 - k / (L + 0.6)), hk);
      const fill = mk(useB ? "var(--accent-b)" : "var(--accent)", useB ? p * 0.85 : p);
      out += `<path d="${d}" style="fill:${fill};stroke:${stroke};stroke-width:1"></path>`;
    }
  });
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" style="display:block;width:100%;height:100%">${out}</svg>`;
}

const cache = new Map<string, string>();

/**
 * Contour markup for a slug. `dark` is 2a's variant for project tiles (a fixed #14171C base,
 * the same in both themes); light is the article thumbnail variant on `var(--bg)`.
 * Memoised per isolate: a slug is built once, then served from the map.
 */
export function contourMarkup(seed: string, dark: boolean): string {
  const key = `${dark ? "d" : "l"}:${seed}`;
  let svg = cache.get(key);
  if (!svg) {
    svg = build(seed, dark);
    cache.set(key, svg);
  }
  return svg;
}
