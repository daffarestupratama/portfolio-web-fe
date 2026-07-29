"use client";

import { Highlight, themes, type Language } from "prism-react-renderer";

// A curated set of languages Prism ships with in prism-react-renderer. Anything
// else falls back to plain text (no highlighting, but still preformatted).
const SUPPORTED = new Set([
  "markup", "html", "xml", "svg", "css", "clike", "javascript", "js", "jsx", "typescript", "ts", "tsx",
  "python", "py", "bash", "shell", "sh", "json", "yaml", "yml", "sql", "go", "rust", "java", "c", "cpp",
  "csharp", "php", "ruby", "kotlin", "swift", "r", "graphql", "diff", "markdown", "md", "docker", "toml",
]);

function normalizeLang(language: string | undefined): { lang: Language; label: string } {
  const raw = (language || "text").toLowerCase();
  return { lang: (SUPPORTED.has(raw) ? raw : "text") as Language, label: raw };
}

interface CodeBlockProps {
  code: string;
  language?: string;
}

/** Syntax-highlighted code block. Uses a single dark surface in BOTH site themes
 *  (code reads better dark and it matches the mkdir terminal). Long lines scroll
 *  horizontally; whitespace is preserved. */
export function CodeBlock({ code, language }: CodeBlockProps) {
  const { lang, label } = normalizeLang(language);
  const source = code.replace(/\n$/, "");

  return (
    <div
      className="relative mt-5 overflow-hidden"
      style={{ borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "#0d1117" }}
    >
      {label !== "text" && (
        <span
          className="mono absolute top-2 right-3 z-[1] text-[10.5px] tracking-wide uppercase select-none"
          style={{ color: "rgba(230,237,243,0.4)" }}
        >
          {label}
        </span>
      )}
      <Highlight theme={themes.nightOwl} code={source} language={lang}>
        {({ style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className="mono overflow-x-auto p-4 text-[13px] leading-relaxed"
            style={{ ...style, background: "transparent", margin: 0 }}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, j) => (
                  <span key={j} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}
