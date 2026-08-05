import type { CSSProperties } from "react";

/** Languages prism-react-renderer bundles. Anything else renders as plain text. */
const SUPPORTED = new Set([
  "markup", "html", "xml", "svg", "css", "clike", "javascript", "js", "jsx", "typescript", "ts", "tsx",
  "python", "py", "bash", "shell", "sh", "json", "yaml", "yml", "sql", "go", "rust", "java", "c", "cpp",
  "csharp", "php", "ruby", "kotlin", "swift", "r", "graphql", "diff", "markdown", "md", "docker", "toml",
]);

export function normalizeLang(language: string | undefined): { lang: string; label: string } {
  const raw = (language || "text").toLowerCase();
  return { lang: SUPPORTED.has(raw) ? raw : "text", label: raw };
}

export interface CodeBlockInnerProps {
  code: string;
  lang: string;
}

/** Shared by the plain fallback and the highlighted version so the two are
 *  metrically identical — only token colours differ, so there is no layout shift. */
export const PRE_CLASS = "mono overflow-x-auto p-4 text-[13px] leading-relaxed";

/** nightOwl's `plain` foreground, so the unhighlighted text is already the right colour. */
export const PRE_STYLE: CSSProperties = {
  background: "transparent",
  margin: 0,
  color: "#d6deeb",
};
