import type { Command, Registry } from "./terminal-types";

/**
 * Build the command registry. Built-ins are claimed first and ALWAYS win — a
 * command whose name or any alias is already taken is dropped.
 *
 * PHASE 2 SEAM: pass CMS-fetched commands as `cms`. Because built-ins are claimed
 * before them, a CMS command can only fill an unused name/alias — it can never
 * override a built-in. No CMS fetching happens now; `cms` defaults to [].
 */
export function buildRegistry(builtins: Command[], cms: Command[] = []): Registry {
  const byToken = new Map<string, Command>();
  const unique: Command[] = [];

  const claim = (cmd: Command): void => {
    const tokens = [cmd.name, ...(cmd.aliases ?? [])];
    if (tokens.some((t) => byToken.has(t))) return; // collision → drop
    for (const t of tokens) byToken.set(t, cmd);
    unique.push(cmd);
  };

  for (const cmd of builtins) claim({ ...cmd, source: "builtin" });
  for (const cmd of cms) claim({ ...cmd, source: "cms" });

  return {
    get: (name) => byToken.get(name),
    list: () => unique,
    names: () => [...byToken.keys()],
  };
}
