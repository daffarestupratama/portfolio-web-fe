import type { Command } from "../terminal-types";
import { shellCommands } from "./shell";
import { personalityCommands } from "./personality";

/** All phase-1 built-in commands. Phase 2 will merge CMS commands via buildRegistry. */
export const builtinCommands: Command[] = [...shellCommands, ...personalityCommands];
