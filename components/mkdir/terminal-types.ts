import type { ReactNode } from "react";

/** Semantic colour roles inside the always-dark terminal (mapped to --t-* tokens). */
export type Tone = "fg" | "dim" | "green" | "accent" | "red" | "yellow";

export interface TermSegment {
  text: string;
  tone?: Tone;
}

export interface TermLine {
  id: string;
  segments: TermSegment[];
  /** Preserve whitespace / suppress wrapping (ASCII art, neofetch, tree). */
  pre?: boolean;
  /** Boot flavour text is aria-hidden so the type-on never reaches the a11y tree. */
  ariaHidden?: boolean;
}

// ----- fake filesystem -----

export interface FsFile {
  type: "file";
  content: string;
}
export interface FsDir {
  type: "dir";
  children: Record<string, FsNode>;
}
export type FsNode = FsFile | FsDir;

export interface DirEntry {
  name: string;
  node: FsNode;
}

export interface FileSystem {
  home: string;
  /** Resolve an arg against cwd into a normalized absolute path (handles ~, absolute, relative, ., ..). */
  resolve(cwd: string, arg: string | undefined): string;
  node(path: string): FsNode | null;
  isDir(path: string): boolean;
  /** Directory entries (sorted, dirs first), or null when path is not a directory. */
  list(path: string): DirEntry[] | null;
}

// ----- command registry + context -----

export type CommandCategory = "shell" | "filesystem" | "personality" | "system";
export type CommandSource = "builtin" | "cms";

export interface TermEnv {
  user: string;
  host: string;
  launchedAt: Date;
  counts: { projects: number; articles: number; tours: number };
  stack: string[];
}

/** A full-viewport "app" a command can hand the terminal off to (matrix now, a game in phase 3). */
export interface TermApp {
  id: string;
  title: string;
  render(onExit: () => void): ReactNode;
}

export interface CommandContext {
  args: string[];
  raw: string;
  cwd: string;
  setCwd(path: string): void;
  fs: FileSystem;
  env: TermEnv;
  registry: Registry;
  history: string[];
  /** Append plain line(s) — splits on "\n". */
  print(text: string, tone?: Tone): void;
  /** Append preformatted line(s) (whitespace preserved, no wrap). */
  printPre(text: string, tone?: Tone): void;
  /** Append rich multi-segment lines (e.g. neofetch art + info). */
  printRich(lines: TermLine[]): void;
  /** Append a red error line. */
  printError(text: string): void;
  clear(): void;
  runApp(app: TermApp): void;
  navigate(href: string): void;
}

export interface Command {
  name: string;
  aliases?: string[];
  summary: string;
  manText: string;
  category: CommandCategory;
  source?: CommandSource;
  run(ctx: CommandContext): void | Promise<void>;
}

export interface Registry {
  /** Look up by name or alias. */
  get(name: string): Command | undefined;
  /** Unique commands (aliases deduped), for `help`. */
  list(): Command[];
  /** Every invokable token (names + aliases), for tab-completion. */
  names(): string[];
}
