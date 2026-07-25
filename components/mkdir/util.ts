/** Human uptime string ("173 days, 4 hours, 12 mins") from a launch date to now. */
export function formatUptime(from: Date, to: Date = new Date()): string {
  let secs = Math.max(0, Math.floor((to.getTime() - from.getTime()) / 1000));
  const days = Math.floor(secs / 86400);
  secs -= days * 86400;
  const hours = Math.floor(secs / 3600);
  secs -= hours * 3600;
  const mins = Math.floor(secs / 60);
  const parts: string[] = [];
  if (days) parts.push(`${days} day${days === 1 ? "" : "s"}`);
  parts.push(`${hours} hour${hours === 1 ? "" : "s"}`);
  parts.push(`${mins} min${mins === 1 ? "" : "s"}`);
  return parts.join(", ");
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const row = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    let prev = row[0]!;
    row[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = row[j]!;
      row[j] = Math.min(
        row[j]! + 1,
        row[j - 1]! + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      prev = tmp;
    }
  }
  return row[n]!;
}

/** Closest candidate within a small edit distance, for "command not found" hints. */
export function closestMatch(input: string, candidates: string[]): string | null {
  let best: string | null = null;
  let bestDist = Infinity;
  for (const c of candidates) {
    const d = levenshtein(input, c);
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  // Only suggest when reasonably close (≤2 edits, or one char off a short word).
  return best !== null && bestDist <= Math.max(2, Math.floor(input.length / 3)) ? best : null;
}

/** Longest common prefix of a list of strings (for tab completion). */
export function commonPrefix(items: string[]): string {
  if (items.length === 0) return "";
  let prefix = items[0]!;
  for (const item of items.slice(1)) {
    while (!item.startsWith(prefix)) prefix = prefix.slice(0, -1);
    if (!prefix) break;
  }
  return prefix;
}
