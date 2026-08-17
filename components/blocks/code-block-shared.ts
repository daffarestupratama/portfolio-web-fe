import type { CSSProperties } from "react";

/**
 * Grammars actually available to the highlighter: the 53 that prism-react-renderer vendors,
 * plus the three registered from prismjs in prism-languages.ts.
 *
 * This list is deliberately derived from what EXISTS at runtime. The previous version was
 * copied from Prism's full upstream catalogue and listed bash, java, php, ruby, docker and
 * others that this bundle has never shipped — so those blocks passed the check, reached
 * `<Highlight>`, matched no grammar and silently rendered as plain text.
 */
const AVAILABLE = new Set([
  // vendored by prism-react-renderer
  "markup", "html", "xml", "svg", "rss", "css", "clike", "javascript", "js", "jsx",
  "typescript", "ts", "tsx", "python", "py", "json", "yaml", "yml", "sql", "go", "rust",
  "c", "cpp", "objectivec", "objc", "kotlin", "kt", "kts", "swift", "graphql", "markdown",
  "md", "coffeescript", "actionscript", "reason", "flow", "webmanifest",
  // registered from prismjs (see prism-languages.ts)
  "bash", "sh", "shell", "powershell", "ini", "perl",
]);

/**
 * Spellings that have no grammar of their own but read well under a related one.
 * `clike` is the workhorse: it still colours comments, strings, keywords and numbers, which
 * is a real improvement over the flat single-colour fallback.
 */
const FALLBACKS: Record<string, string> = {
  zsh: "bash",
  console: "bash",
  shellsession: "bash",
  docker: "bash",
  dockerfile: "bash",
  ps: "powershell",
  ps1: "powershell",
  pwsh: "powershell",
  cfg: "ini",
  conf: "ini",
  toml: "ini",
  properties: "ini",
  java: "clike",
  csharp: "clike",
  cs: "clike",
  "c#": "clike",
  php: "clike",
  ruby: "clike",
  rb: "clike",
  scala: "clike",
  dart: "clike",
  groovy: "clike",
};

/** Neutral label for blocks with no language, so the window header is never empty. */
const NEUTRAL_LABEL = "TEXT";

/**
 * Resolves a CMS language string to a grammar that exists, plus the label shown in the
 * window header. The label keeps the author's own spelling (uppercased) even when the
 * grammar is a fallback — a PowerShell block still says POWERSHELL.
 */
export function normalizeLang(language: string | undefined): { lang: string; label: string } {
  const raw = (language || "").trim().toLowerCase();
  if (!raw || raw === "text" || raw === "txt" || raw === "plain" || raw === "plaintext") {
    return { lang: "text", label: NEUTRAL_LABEL };
  }
  const resolved = AVAILABLE.has(raw) ? raw : (FALLBACKS[raw] ?? "text");
  return { lang: resolved, label: raw.toUpperCase() };
}

export interface CodeBlockInnerProps {
  code: string;
  lang: string;
}

/** Shared by the plain fallback and the highlighted version so the two are
 *  metrically identical — only token colours differ, so there is no layout shift. */
export const PRE_CLASS = "mono code-scroll overflow-x-auto p-4 text-[13px] leading-relaxed";

/** nightOwl's `plain` foreground, so the unhighlighted text is already the right colour. */
export const PRE_STYLE: CSSProperties = {
  background: "transparent",
  margin: 0,
  color: "#d6deeb",
};
