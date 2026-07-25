/** Terminal identity + constants. Adjust SITE_LAUNCHED_AT to the real launch date. */

export const USER = "visitor";
export const HOST = "dir";
export const HOME = "/home/visitor";
export const DOMAIN = "daffarestupratama.com";

/** Launch date used by `uptime` and `neofetch` (site uptime, not a fake machine one). */
export const SITE_LAUNCHED_AT = new Date("2026-02-01T00:00:00Z");

/** Curated site tech stack — shown as MOTD "packages" and in neofetch. */
export const STACK = [
  "Next.js 16",
  "React 19",
  "TypeScript",
  "Tailwind v4",
  "Strapi v5",
  "Cloudflare Workers",
  "Python",
  "SQL",
];

export const LOCATION = "Depok / Jakarta, ID";
export const ROLE = "Information Systems Graduate";

/** Collapse an absolute path to the ~-relative form used in the prompt. */
export function tildePath(cwd: string): string {
  if (cwd === HOME) return "~";
  if (cwd.startsWith(HOME + "/")) return "~" + cwd.slice(HOME.length);
  return cwd;
}

export const STORAGE_KEYS = { history: "mkdir:history", seen: "mkdir:seen" } as const;
