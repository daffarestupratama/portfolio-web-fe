/**
 * Hero map city nodes and the network drawn between them.
 * ── EDIT THIS FILE to change which cities appear or how they connect. ──
 * Coordinates are real latitude/longitude (WGS84); they're projected at build time by
 * lib/geo/indonesia.ts using the same projection as the coastline, so they always align.
 */

export interface HeroCity {
  name: string;
  lat: number;
  lon: number;
  /** Optional extras shown in the node popup later (kept empty for now). */
  stats?: Record<string, string>;
}

/** 13 cities. Depok is deliberately omitted: it sits ~0.2° from Jakarta, which projects
 *  to only ~2px at the hero's render width, so the nodes and popups would collide.
 *  (lib/geo/indonesia.ts also separates any pair that still lands too close.) */
export const INDONESIA_CITIES: readonly HeroCity[] = [
  { name: "Medan", lat: 3.5952, lon: 98.6722 },
  { name: "Palembang", lat: -2.9761, lon: 104.7754 },
  { name: "Jakarta", lat: -6.2088, lon: 106.8456 },
  { name: "Bandung", lat: -6.9175, lon: 107.6191 },
  { name: "Semarang", lat: -6.9932, lon: 110.4203 },
  { name: "Yogyakarta", lat: -7.7956, lon: 110.3695 },
  { name: "Surabaya", lat: -7.2575, lon: 112.7521 },
  { name: "Denpasar", lat: -8.6705, lon: 115.2126 },
  { name: "Pontianak", lat: -0.0263, lon: 109.3425 },
  { name: "Balikpapan", lat: -1.2379, lon: 116.8529 },
  { name: "Makassar", lat: -5.1477, lon: 119.4327 },
  { name: "Manado", lat: 1.4748, lon: 124.8421 },
  { name: "Jayapura", lat: -2.5337, lon: 140.7181 },
];

/** Edges as index pairs into INDONESIA_CITIES — a plausible trunk network (Sumatra →
 *  Java corridor → Bali, plus Kalimantan/Sulawesi/Papua links), not every-to-every. */
export const CITY_EDGES: readonly (readonly [number, number])[] = [
  [0, 1], // Medan – Palembang
  [1, 2], // Palembang – Jakarta
  [2, 3], // Jakarta – Bandung
  [3, 4], // Bandung – Semarang
  [4, 5], // Semarang – Yogyakarta
  [4, 6], // Semarang – Surabaya
  [6, 7], // Surabaya – Denpasar
  [2, 8], // Jakarta – Pontianak
  [8, 9], // Pontianak – Balikpapan
  [9, 10], // Balikpapan – Makassar
  [6, 10], // Surabaya – Makassar
  [10, 11], // Makassar – Manado
  [10, 12], // Makassar – Jayapura
];

/** Deterministic 0..1 from an integer (xorshift-style, 32-bit safe via Math.imul).
 *  Deliberately NOT Math.random(): the values are rendered into inline styles, so
 *  server and client must produce identical output or hydration mismatches. */
function hash01(n: number): number {
  let x = Math.imul(n + 1, 2654435761);
  x ^= x >>> 15;
  x = Math.imul(x, 2246822519);
  x ^= x >>> 13;
  x = Math.imul(x, 3266489917);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}

export interface EdgePulse {
  /** Animation duration in seconds (2.4–5.2), unique-ish per edge. */
  duration: number;
  /** NEGATIVE delay so the edge starts already mid-cycle — this is what removes the
   *  "dead" moment where every edge is between pulses. */
  delay: number;
  /** Half the edges start travelling the other way; `alternate` then flips each edge's
   *  direction every cycle, so pulses run both ways over time. */
  reversed: boolean;
}

/** Per-edge pulse timing. Durations are jittered so the network never looks
 *  synchronised, while the delays are spread evenly across each edge's own cycle so
 *  activity is continuous — several edges are always mid-pulse. */
export function edgePulse(index: number, total: number): EdgePulse {
  const duration = 2.4 + hash01(index * 3 + 1) * 2.8;
  const slot = (index / Math.max(total, 1)) * duration;
  const jitter = hash01(index * 3 + 2) * (duration / Math.max(total, 1));
  return {
    duration,
    delay: -(slot + jitter),
    reversed: hash01(index * 3 + 3) < 0.5,
  };
}
