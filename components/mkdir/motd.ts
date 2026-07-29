import type { TermEnv, TermLine } from "./terminal-types";
import { plain, rich } from "./lines";
import { DOMAIN, LOCATION, ROLE } from "./config";
import { formatUptime } from "./util";

const FINGERPRINT = "SHA256:9xK2r7Qw1sVb3nZp0aYtLmEdFcHgJkQwT4uI8oP2sD";

/**
 * Boot output: an SSH-login emulation + an Ubuntu-style MOTD about the site.
 * Every line is `ariaHidden` — the animated type-on must never reach the a11y
 * tree. A single concise "ready" line is announced separately by the engine.
 */
export function buildBootLines(env: TermEnv): TermLine[] {
  const now = new Date();
  const lines: TermLine[] = [];
  const f = (text: string, tone?: Parameters<typeof plain>[1]) =>
    lines.push(plain(text, tone, { ariaHidden: true }));
  const r = (segments: Parameters<typeof rich>[0]) => lines.push(rich(segments, { ariaHidden: true }));
  const kv = (label: string, value: string) =>
    r([
      { text: `   ${label.padEnd(11)}`, tone: "dim" },
      { text: value },
    ]);

  // SSH handshake flavour.
  f(`Connecting to ${env.user}@${DOMAIN}:22 ...`, "dim");
  f(`The authenticity of host '${DOMAIN} (198.51.100.42)' can't be established.`, "dim");
  f(`ED25519 key fingerprint is ${FINGERPRINT}.`, "dim");
  f(`Warning: Permanently added '${DOMAIN}' (ED25519) to the list of known hosts.`, "dim");
  f(`${env.user}@${DOMAIN}'s password: ********`, "dim");
  f("");

  // MOTD.
  f("Welcome to dirOS 1.0 (GNU/Linux 6.8.0-web x86_64)", "green");
  f("");
  f(" * Portfolio of Daffa Ilham Restupratama — data, business & technology.");
  f("");
  f(`   System information as of ${now.toUTCString()}`, "dim");
  f("");
  kv("Role:", ROLE);
  kv("Location:", LOCATION);
  kv("Uptime:", formatUptime(env.launchedAt, now));
  kv("Packages:", `${env.stack.length} installed (${env.stack.slice(0, 4).join(", ")}, …)`);
  r([
    { text: "   Content:   ", tone: "dim" },
    { text: `${env.counts.projects} projects`, tone: "accent" },
    { text: "  ·  " },
    { text: `${env.counts.articles} articles`, tone: "accent" },
    // Tours are omitted while the feature is off (count arrives as 0).
    ...(env.counts.tours > 0
      ? [{ text: "  ·  " }, { text: `${env.counts.tours} tours`, tone: "accent" as const }]
      : []),
  ]);
  f("");
  f(` Last login: ${now.toDateString()} from 203.0.113.7`, "dim");
  f("");
  r([{ text: "Type " }, { text: "help", tone: "accent" }, { text: " to get started." }]);
  return lines;
}

/** Concise, one-shot announcement pushed to the live region when boot finishes. */
export const BOOT_READY_ANNOUNCEMENT = "Terminal ready. Type help and press enter to get started.";
